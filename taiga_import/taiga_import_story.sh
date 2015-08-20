#!/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# -----------------------------------------------------------------------------
# Copyright (C) Business Learning Incorporated (businesslearninginc.com)
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License at <http://www.gnu.org/licenses/> for
# more details.
# -----------------------------------------------------------------------------
#
# A bash script to POST user stories into a Taiga project
#
# Version: 0.1
#
# Requirements:
#
#  --Preexisting Taiga project
#  --Curl (http://curl.haxx.se/) must be installed on host machine
#  --JQ (https://stedolan.github.io/jq/) must be installed on host machine
#
# Inputs:
#
#  --Website URL (e.g., http://www.website.com)
#  --Project slug name (NOT project name)
#  --Input file of user stories to import (tab-delimited)
#  --Username (must have appropriate admin permissions to export project)
#  --Password
#
# Outputs:
#
#  --None: side effects are user stories imported into Taiga project
#  --If failure, causing error message displayed
#

echo "
|
| A bash script to POST user stories into a Taiga project
|
| Usage:
|   export_taiga [options]
|
|   -w, --website          website_url (e.g., http://www.website.com)
|   -n, --projectslugname  project_slug_name (not the project name)
|   -i, --inputfile        input file (CSV-format with columns: title, description, tag1, tag2, tag3)
|   -u, --username         user_name
|   -p, --password         password
|"
echo

# -----------------------------------------------------------------------------
# Functions
#

function quit {
  echo
  exit 1
}

DEBUG=false

# -----------------------------------------------------------------------------
# Scan cmdline for arguments
#
while [[ $# -gt 0 ]]
do
  ARG="$1"

  case $ARG in
    -w|--website)
      ARG_WEBSITE="$2"
      shift # skip argument
      ;;
    -n|--projectslugname)
      ARG_PROJECTSLUG="$2"
      shift # skip argument
      ;;
    -i|--inputfile)
      ARG_INPUTFILE="$2"
      shift # skip argument
      ;;
    -u|--username)
      ARG_USERNAME="$2"
      shift # skip argument
      ;;
    -p|--password)
      ARG_PASSWORD="$2"
      shift # skip argument
      ;;
      *)
      # unknown argument
      ;;
  esac
  shift # skip argument or value
done

# -----------------------------------------------------------------------------
# check for argument completeness
#

ARG_ERROR=false

if [ -z "${ARG_WEBSITE}" ]; then
  echo "Error: website_url argument (-w|--website) missing."
  ARG_ERROR=true
fi

if [ -z "${ARG_PROJECTSLUG}" ]; then
  echo "Error: project_slug_name argument (-n|--projectslugname) missing."
  ARG_ERROR=true
fi

if [ -z "${ARG_INPUTFILE}" ]; then
  echo "Error: inputfile argument (-i|--inputfile) missing."
  ARG_ERROR=true
fi

if [ -z "${ARG_USERNAME}" ]; then
  echo "Error: user_name argument (-u|--username) missing."
  ARG_ERROR=true
fi

if [ -z "${ARG_PASSWORD}" ]; then
  echo "Error: password argument (-p|--password) missing."
  ARG_ERROR=true
fi

if [ "${ARG_ERROR}" = true ]; then
  quit
fi

# -----------------------------------------------------------------------------
# check requirements
#

REQ_ERROR=false

if  ! type "curl" &> /dev/null; then
  echo "Error: curl program not installed."
  REQ_ERROR=true
fi

if ! type "jq" &> /dev/null; then
  echo "Error: jq program not installed."
  REQ_ERROR=true
fi

if [ "${REQ_ERROR}" = true ]; then
  quit
fi

# -----------------------------------------------------------------------------
# Get AUTH_TOKEN
#
USER_AUTH_DETAIL=$( curl -X POST \
                    -H "Content-Type: application/json"\
                    -d '{
                        "type": "normal",
                        "username": "'${ARG_USERNAME}'",
                        "password": "'${ARG_PASSWORD}'"
                        }'\
                    "${ARG_WEBSITE}"/api/v1/auth 2>/dev/null )

AUTH_TOKEN=$( echo "${USER_AUTH_DETAIL}" | jq -r '.auth_token' )

if [ "${DEBUG}" = true ]; then
  echo "AUTH_TOKEN is: ${AUTH_TOKEN}"
fi

# Exit if AUTH_TOKEN is not present (failed login)
#
if [ -z "${AUTH_TOKEN}" ]; then
  echo "Error: Incorrect username and/or password supplied"
  quit
fi

# -----------------------------------------------------------------------------
# Get project ID
#
JSON_PROJECT_ID=$( curl -X GET \
                   -H "Content-Type: application/json"\
                   -H "Authorization: Bearer ${AUTH_TOKEN}"\
                   "${ARG_WEBSITE}"/api/v1/resolver?project="${ARG_PROJECTSLUG}" 2>/dev/null )


PROJECT_ID=$( echo "${JSON_PROJECT_ID}" | jq -r '.project' )

if [ "${DEBUG}" = true ]; then
  echo "PROJECT_ID is: ${PROJECT_ID}"
fi

if [ -z "${PROJECT_ID}" ]; then
  echo "Error: Project ID not found."
  quit
fi

# -----------------------------------------------------------------------------
# POST user stories to Taiga project
#
# NOTE: taiga administrative permissions are required to export project file
#

# verify that ARG_INPUTFILE exists
#
if [ ! -e ${ARG_INPUTFILE} ]; then
  echo "Error: inputfile does not exist."
  quit
fi

# Parse tab-delimited ARG_INPUTFILE and POST stories
#
while IFS=$'\t' read -r FILE_TITLE FILE_DESCRIPTION FILE_TAG1 FILE_TAG2 FILE_TAG3
do

  if [ "${DEBUG}" = true ]; then
    echo "Line parsed: ${FILE_TITLE} || ${FILE_DESCRIPTION} || ${FILE_TAG1} || ${FILE_TAG2} || ${FILE_TAG3}"
  fi

  STORY_POST=$( curl -X POST \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer ${AUTH_TOKEN}" \
                -d '{
                    "project": '${PROJECT_ID}',
                    "subject": "'"${FILE_TITLE}"'",
                    "description": "'"${FILE_DESCRIPTION}"'",
                    "tags": [
                            "'"${FILE_TAG1}"'",
                            "'"${FILE_TAG2}"'",
                            "'"${FILE_TAG3}"'"
                            ]
                     }' \
                "${ARG_WEBSITE}"/api/v1/userstories 2>/dev/null )

  STORY_RESULT=$( echo "${STORY_POST}" | jq -r '.description' )
  STORY_ID=$( echo "${STORY_POST}" | jq -r '.id' )

  if [ "${DEBUG}" = true ]; then
    echo "STORY_RESULT is: ${STORY_RESULT}"
  fi

  if [ -z "${STORY_RESULT}" ]; then
    echo "Error: user story NOT imported."
    quit
  else
    echo "Success: user story #${STORY_ID} imported."
  fi

done < ${ARG_INPUTFILE}

echo
