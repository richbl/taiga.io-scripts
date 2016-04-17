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
# version: 0.2.0
#
# requirements:
#  --preexisting Taiga project
#  --jq program (https://stedolan.github.io/jq/) installed: used to parse /data/config.json
#  --curl program (http://curl.haxx.se/)
#
# inputs:
#  --website URL (e.g., http://www.website.com)
#  --project slug name (different than project name)
#  --input file of user stories to import (tab-delimited)
#  --username (must have appropriate site admin permissions to export project)
#  --password
#
# outputs:
#  --notification of script success/failure
#  --side effect: user stories imported into Taiga project
#

# -----------------------------------------------------------------------------
# script declarations
#
shopt -s extglob
EXEC_DIR="$(dirname "$0")"
. ${EXEC_DIR}/lib/args

ARGS_FILE="${EXEC_DIR}/data/config.json"

declare -a REQ_PROGRAMS=('jq' 'curl')
DEBUG=true

# -----------------------------------------------------------------------------
# perform script configuration, arguments parsing, and validation
#
check_program_dependencies "REQ_PROGRAMS[@]"
display_banner
scan_for_args "$@"
check_for_args_completeness

# -----------------------------------------------------------------------------
# Get AUTH_TOKEN
#
USER_AUTH_DETAIL=$( curl -X POST \
                    -H "Content-Type: application/json"\
                    -d '{
                        "type": "normal",
                        "username": "'$(get_config_arg_value username)'",
                        "password": "'$(get_config_arg_value password)'"
                        }'\
                    "$(get_config_arg_value website)"/api/v1/auth 2>/dev/null )

AUTH_TOKEN=$( printf "%s" "${USER_AUTH_DETAIL}" | jq -r '.auth_token' )

if [ "${DEBUG}" = true ]; then
  printf "%s\n" "AUTH_TOKEN is: ${AUTH_TOKEN}"
fi

# Exit if AUTH_TOKEN is not present (failed login)
#
if [ -z "${AUTH_TOKEN}" ]; then
  printf "%s\n" "Error: Incorrect username and/or password supplied"
  quit
fi

# -----------------------------------------------------------------------------
# Get project ID
#
JSON_PROJECT_ID=$( curl -X GET \
                   -H "Content-Type: application/json"\
                   -H "Authorization: Bearer ${AUTH_TOKEN}"\
                   "$(get_config_arg_value website)"/api/v1/resolver?project="$(get_config_arg_value 'project slug name')" 2>/dev/null )

PROJECT_ID=$( printf "%s" "${JSON_PROJECT_ID}" | jq -r '.project' )

if [ "${DEBUG}" = true ]; then
  printf "%s\n" "PROJECT_ID is: ${PROJECT_ID}"
fi

if [ -z "${PROJECT_ID}" ]; then
  printf "%s\n" "Error: Project ID not found."
  quit
fi

# -----------------------------------------------------------------------------
# POST user stories to Taiga project
#
# NOTE: taiga administrative permissions are required to export project file
#

# verify that ARG_INPUTFILE exists
#
if [ ! -e $(get_config_arg_value 'input file') ]; then
  printf "%s\n" "Error: inputfile does not exist."
  quit
fi

# Parse tab-delimited ARG_INPUTFILE and POST stories
#
while IFS=$'\t' read -r FILE_TITLE FILE_DESCRIPTION FILE_TAG1 FILE_TAG2 FILE_TAG3
do

  if [ "${DEBUG}" = true ]; then
    printf "%s\n" "Line parsed: ${FILE_TITLE} || ${FILE_DESCRIPTION} || ${FILE_TAG1} || ${FILE_TAG2} || ${FILE_TAG3}"
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
                "$(get_config_arg_value website)"/api/v1/userstories 2>/dev/null )

  STORY_RESULT=$( printf "%s" "${STORY_POST}" | jq -r '.description' )
  STORY_ID=$( printf "%s" "${STORY_POST}" | jq -r '.id' )

  if [ "${DEBUG}" = true ]; then
    printf "%s\n" "STORY_RESULT is: ${STORY_RESULT}"
  fi

  if [ -z "${STORY_RESULT}" ]; then
    printf "%s\n" "Error: user story NOT imported."
    quit
  else
    printf "%s\n" "Success: user story #${STORY_ID} imported."
  fi

done < $(get_config_arg_value 'input file')
