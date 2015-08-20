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
# A bash script to GET JSON tasks for a given user in a Taiga project
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
#  --Admin username
#  --Admin password
#  --Username (for whom tasks points will be retrieved)
#  --Output directory to save exported file (absolute path)
#
# Outputs:
#
#  --An exported JSON file if processed successful
#  --If failure, causing error message displayed
#

echo "
|
| A bash script to GET JSON tasks for a given user in a Taiga project
|
| Usage:
|   taiga_tasks_summary [options]
|
|   -w, --website             website_url (e.g., http://www.website.com)
|   -n, --project_slug_name   project slug (not the project name)
|   -u, --admin_username      taiga account username
|   -p, --admin_password      taiga account password
|   -v, --username            user for whom tasks to be retrieved
|   -o, --output_dir          absolute directory path for exported file
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
    -n|--project_slug_name)
      ARG_PROJECTSLUG="$2"
      shift # skip argument
      ;;
    -o|--output_dir)
      ARG_output_dir="$2"
      shift # skip argument
      ;;
    -u|--admin_username)
      ARG_ADMIN_USERNAME="$2"
      shift # skip argument
      ;;
    -p|--admin_password)
      ARG_ADMIN_PASSWORD="$2"
      shift # skip argument
      ;;
    -v|--username)
      ARG_USERNAME="$2"
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
  echo "Error: project_slug_name argument (-n|--project_slug_name) missing."
  quit
fi

if [ -z "${ARG_output_dir}" ]; then
  echo "Error: output_dir argument (-o|--output_dir) missing."
  quit
fi

if [ -z "${ARG_USERNAME}" ]; then
  echo "Error: username argument (-v|--username) missing."
  quit
fi

if [ -z "${ARG_ADMIN_USERNAME}" ]; then
  echo "Error: admin_username argument (-u|--admin_username) missing."
  quit
fi

if [ -z "${ARG_ADMIN_PASSWORD}" ]; then
  echo "Error: admin_password argument (-p|--admin_password) missing."
  quit
fi

# -----------------------------------------------------------------------------
# Get taiga AUTH_TOKEN
#
echo "Getting authorization token..."

USER_AUTH_DETAIL=$( curl -X POST -H "Content-Type: application/json"\
                    -d '{ "type": "normal", "username": "'${ARG_ADMIN_USERNAME}'", "password": "'${ARG_ADMIN_PASSWORD}'" }'\
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
# Get taiga project ID
#
echo "Getting project id..."

JSON_PROJECT_ID=$( curl -X GET -H "Content-Type: application/json"\
                   -H "Authorization: Bearer ${AUTH_TOKEN}"\
                   "${ARG_WEBSITE}"/api/v1/resolver?project="${ARG_PROJECTSLUG}" 2>/dev/null )

PROJECT_ID=$( echo "${JSON_PROJECT_ID}" | jq -r '.project' )

if [ "${DEBUG}" = true ]; then
  echo "JSON_PROJECT_ID is: ${JSON_PROJECT_ID}"
  echo "PROJECT_ID is: ${PROJECT_ID}"
fi

if [ -z "${PROJECT_ID}" ]; then
  echo "Error: Project ID not found."
  quit
fi

# -----------------------------------------------------------------------------
# Get project name from PROJECT_ID
#
echo "Getting project name..."

JSON_PROJECT_NAME=$( curl -X GET -H "Content-Type: application/json"\
                   -H "Authorization: Bearer ${AUTH_TOKEN}"\
                   "${ARG_WEBSITE}"/api/v1/projects/"${PROJECT_ID}" 2>/dev/null )

PROJECT_NAME=$( echo "${JSON_PROJECT_NAME}" | jq -r '.name' )

if [ "${DEBUG}" = true ]; then
 echo "JSON_PROJECT_NAME is: ${JSON_PROJECT_NAME}"
 echo "PROJECT_NAME is: ${PROJECT_NAME}"
fi

if [ -z "${PROJECT_NAME}" ]; then
 echo "Error: project name not found."
 quit
fi

# -----------------------------------------------------------------------------
# Get user id from ARG_USERNAME
#
echo "Getting user identification..."

JSON_PROJECT_USER_ID=$( curl -X GET -H "Content-Type: application/json"\
                   -H "Authorization: Bearer ${AUTH_TOKEN}"\
                   "${ARG_WEBSITE}"/api/v1/users?project="${PROJECT_ID}" 2>/dev/null )

PROJECT_USER_ID=$( echo "${JSON_PROJECT_USER_ID}" | jq -r '.[] | select(.username=="'${ARG_USERNAME}'") | .id' )

if [ "${DEBUG}" = true ]; then
  echo "JSON_PROJECT_USER_ID is: ${JSON_PROJECT_USER_ID}"
  echo "PROJECT_USER_ID is: ${PROJECT_USER_ID}"
fi

if [ -z "${PROJECT_USER_ID}" ]; then
  echo "Error: PROJECT_USER_ID not found."
  quit
fi

# -----------------------------------------------------------------------------
# Get user stories filtered by task status (is_closed=true) and user id
#
echo "Getting user stories..."

JSON_PROJECT_STORIES=$( curl -X GET -H "Content-Type: application/json"\
                   -H "Authorization: Bearer ${AUTH_TOKEN}"\
                   "${ARG_WEBSITE}"/api/v1/userstories?project="${PROJECT_ID}"\&assigned_to=${PROJECT_USER_ID} 2>/dev/null )

PROJECT_STORIES=$( echo "${JSON_PROJECT_STORIES}" | jq -r '[.[] | {estimated_points: .total_points, subject: .subject, story_id: .id, full_name: .assigned_to_extra_info.full_name_display, finish_date: .finish_date, project_name: "'"${PROJECT_NAME}"'" }]' )

if [ "${DEBUG}" = true ]; then
  echo "JSON_PROJECT_STORIES is: ${JSON_PROJECT_STORIES}"
  echo "PROJECT_STORIES is: ${PROJECT_STORIES}"
fi

if [ -z "${JSON_PROJECT_STORIES}" ]; then
  echo "Error: JSON_PROJECT_STORIES not found."
  quit
fi

STORY_COUNT=$(echo "${PROJECT_STORIES}" | jq -r 'length' )
((STORY_COUNT-=1))

if [ "${DEBUG}" = true ]; then
  echo "STORY_COUNT is: ${STORY_COUNT}"
fi

JSON_FILE="["

# iterate through all user stories by user and add custom attribute to resulting file (JSON_FILE)
#
until [ $STORY_COUNT -lt 0 ]; do

  STORY_ID=$(echo "${PROJECT_STORIES}" | jq -r '.['"${STORY_COUNT}"'] .story_id ')

  if [ "${DEBUG}" = true ]; then
    echo "STORY_ID is: ${STORY_ID}"
  fi

  # get custom attributes (specifically "actual_points field")
  #
  JSON_PROJECT_STORY_ATTRIBUTES_VALUE=$( curl -X GET -H "Content-Type: application/json"\
                     -H "Authorization: Bearer ${AUTH_TOKEN}"\
                     "${ARG_WEBSITE}"/api/v1/userstories/custom-attributes-values/"${STORY_ID}"?project="${PROJECT_ID}" 2>/dev/null )

  if [ "${DEBUG}" = true ]; then
   echo "JSON_PROJECT_STORY_ATTRIBUTES_VALUE is: ${JSON_PROJECT_STORY_ATTRIBUTES_VALUE}"
  fi

  if [ -z "${JSON_PROJECT_STORY_ATTRIBUTES_VALUE}" ]; then
   echo "Error: JSON_PROJECT_STORY_ATTRIBUTES_VALUE not found."
   quit
  fi

  PROJECT_STORY_ATTRIBUTES_VALUE=$(echo "${JSON_PROJECT_STORY_ATTRIBUTES_VALUE}" | jq -r '.attributes_values | .[]')

  if [ "${DEBUG}" = true ]; then
   echo "PROJECT_STORY_ATTRIBUTES_VALUE is: ${PROJECT_STORY_ATTRIBUTES_VALUE}"
  fi

  # if null value in PROJECT_STORY_ATTRIBUTES_VALUE, not an issue (user did not enter a number), so just ignore story and move on
  #
  if [ -z "${PROJECT_STORY_ATTRIBUTES_VALUE}" ]; then
    echo "Warning: PROJECT_STORY_ATTRIBUTES_VALUE not found."
    AMMENDED_STORY=$(echo "${PROJECT_STORIES}" | jq -r '.['"${STORY_COUNT}"'] | .actual_points=null')
  else
    AMMENDED_STORY=$(echo "${PROJECT_STORIES}" | jq -r '.['"${STORY_COUNT}"'] | .actual_points='"${PROJECT_STORY_ATTRIBUTES_VALUE}"'')
  fi

  if [ "${DEBUG}" = true ]; then
    echo "AMMENDED_STORY is: ${AMMENDED_STORY}"
  fi

  if [ -z "${AMMENDED_STORY}" ]; then
   echo "Error: AMMENDED_STORY not found."
   quit
 fi

  # build results array, adding JSON separator (,) between elements
  #
  JSON_FILE+=${AMMENDED_STORY}

  if [ ${STORY_COUNT} -gt 0 ]; then
    JSON_FILE+=","
  fi

  ((STORY_COUNT-=1))

done

JSON_FILE+="]"

if [ "${DEBUG}" = true ]; then
  echo "JSON_FILE is: ${JSON_FILE}"
fi

# -----------------------------------------------------------------------------
# generate results file (JSON)
#
echo "Creating results file (JSON)..."

mkdir -p "${ARG_output_dir}"

RESULTS="${ARG_USERNAME}"-"${ARG_PROJECTSLUG}"-activities-export.json

echo "${JSON_FILE}" > "${ARG_output_dir}/${RESULTS}"

echo
echo "Success: JSON export completed. Results file (${RESULTS}) created in ${ARG_output_dir}."
echo

# # -----------------------------------------------------------------------------
# # Get user stories custom attributes (currently assuming custom attribute ids are known)
# #   (needed to identify all existing custom attributes in a given project)
# #
# JSON_PROJECT_STORY_ATTRIBUTES=$( curl -X GET -H "Content-Type: application/json"\
#                    -H "Authorization: Bearer ${AUTH_TOKEN}"\
#                    "${ARG_WEBSITE}"/api/v1/userstory-custom-attributes?project="${PROJECT_ID}" 2>/dev/null )
#
# # GET subject, total_points,
#
# if [ "${DEBUG}" = true ]; then
#   echo "JSON_PROJECT_STORY_ATTRIBUTES is: ${JSON_PROJECT_STORY_ATTRIBUTES}"
# fi
#
# if [ -z "${JSON_PROJECT_STORY_ATTRIBUTES}" ]; then
#   echo "Error: JSON_PROJECT_STORY_ATTRIBUTES not found."
#   quit
# fi
