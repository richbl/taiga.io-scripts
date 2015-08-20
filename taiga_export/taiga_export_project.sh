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
# A bash script to GET a JSON export file from a Taiga project
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
#  --Project slug name (based on project name)
#  --Output directory to save exported file (absolute path)
#  --Username (must have appropriate admin permissions to export project)
#  --Password
#
# Outputs:
#
#  --An exported JSON file if processed successful
#  --If failure, causing error message displayed
#

echo "
|
| A bash script to GET a JSON export file from a Taiga project
|
| Usage:
|   export_taiga [options]
|
|   -w, --website          website_url (e.g., http://www.website.com)
|   -n, --projectslugname  project_slug_name (not the project name)
|   -o, --outputdir        absolute directory path for exported file
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
    -o|--outputdir)
      ARG_OUTPUTDIR="$2"
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
# check argument completeness
#
if [ -z "${ARG_WEBSITE}" ]; then
  echo "Error: website_url argument (-w|--website) missing."
  quit
fi

if [ -z "${ARG_PROJECTSLUG}" ]; then
  echo "Error: project_slug_name argument (-n|--projectslugname) missing."
  quit
fi

if [ -z "${ARG_OUTPUTDIR}" ]; then
  echo "Error: outputdir argument (-o|--outputdir) missing."
  quit
fi

if [ -z "${ARG_USERNAME}" ]; then
  echo "Error: user_name argument (-u|--username) missing."
  quit
fi

if [ -z "${ARG_PASSWORD}" ]; then
  echo "Error: password argument (-p|--password) missing."
  quit
fi

# -----------------------------------------------------------------------------
# check requirements
#
if  ! type "curl" &> /dev/null; then
  echo "Error: curl program not installed."
  quit
fi

if ! type "jq" &> /dev/null; then
  echo "Error: jq program not installed."
  quit
fi

# -----------------------------------------------------------------------------
# Get AUTH_TOKEN
#
USER_AUTH_DETAIL=$( curl -X POST -H "Content-Type: application/json"\
                    -d '{ "type": "normal", "username": "'${ARG_USERNAME}'", "password": "'${ARG_PASSWORD}'" }'\
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
JSON_PROJECT_ID=$( curl -X GET -H "Content-Type: application/json"\
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
# Export JSON file
#
# NOTE: taiga administrative permissions are required to export project file
#
JSON_URL=$( curl -X GET -H "Content-Type: application/json"\
            -H "Authorization: Bearer ${AUTH_TOKEN}"\
            "${ARG_WEBSITE}/api/v1/exporter/${PROJECT_ID}" 2>/dev/null )

if [ "${DEBUG}" = true ]; then
  echo "JSON_URL is: ${JSON_URL}"
fi

JSON_FILE=$( echo "${JSON_URL}" | jq -r '.url' )

if [ "${DEBUG}" = true ]; then
  echo "JSON_FILE is: ${JSON_FILE}"
fi

# Exit if JSON_FILE is not gotten
#
if [ -z "${JSON_FILE}" ]; then
  echo "${JSON_URL}"
  echo "Error: JSON export failed."
  quit
fi

# Save JSON_FILE to directory specified
#
mkdir -p "${ARG_OUTPUTDIR}"

RESULTS="${ARG_PROJECTSLUG}"-export-"$(date +"%Y%m%d%H%M%S")".json

curl -s "${JSON_FILE}" > "${ARG_OUTPUTDIR}/${RESULTS}"

echo "Success: JSON export completed. Results file (${RESULTS}) created in ${ARG_OUTPUTDIR}."
echo
