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
#  --output directory to save JSON file
#  --username (must have appropriate site admin permissions to export project)
#  --password
#
# outputs:
#  --notification of script success/failure
#  --side effect: an exported JSON file
#

# -----------------------------------------------------------------------------
# script declarations
#
shopt -s extglob
EXEC_DIR="$(dirname "$0")"
. ${EXEC_DIR}/lib/args

ARGS_FILE="${EXEC_DIR}/data/config.json"

declare -a REQ_PROGRAMS=('jq' 'curl')
DEBUG=false

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
# Export JSON file
#

# determine if the Taiga server is configured to permit the return of an
# exported JSON project object (HTML status code must be 200)
#
# For details, see Taiga REST API documentation:
# https://taigaio.github.io/taiga-doc/dist/api.html#export-import-export-dump
#
HTML_STATUS_CODE=$( curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json"\
            -H "Authorization: Bearer ${AUTH_TOKEN}"\
            "$(get_config_arg_value website)"/api/v1/exporter/"${PROJECT_ID}" 2>/dev/null )

if [ "${DEBUG}" = true ]; then
  printf "%s\n" "HTML_STATUS_CODE is: ${HTML_STATUS_CODE}"
fi

if [ ${HTML_STATUS_CODE} -ne 200 ]; then
  printf "%s\n" "Taiga server returned HTTP status code: ${HTML_STATUS_CODE}. Status code must be 200 to proceed."
  quit
fi

JSON_URL=$( curl -X GET -H "Content-Type: application/json"\
            -H "Authorization: Bearer ${AUTH_TOKEN}"\
            "$(get_config_arg_value website)"/api/v1/exporter/"${PROJECT_ID}" 2>/dev/null )

if [ "${DEBUG}" = true ]; then
  printf "%s\n" "JSON_URL is: ${JSON_URL}"
fi

JSON_FILE=$(printf "%s" "${JSON_URL}" | jq -r '.url')

if [ "${DEBUG}" = true ]; then
  printf "%s\n" "JSON_FILE is: ${JSON_FILE}"
fi

# Exit if JSON_FILE is not acquired
#
if [ "${JSON_FILE}" == "null" ]; then
  printf "%s\n" "Error: JSON export failed."
  quit
fi

# Save JSON_FILE to directory specified
#
mkdir -p "$(get_config_arg_value 'output directory')"
RESULTS="$(get_config_arg_value 'project slug name')"-export-"$(date +"%Y%m%d%H%M%S")".json
curl -s "${JSON_FILE}" > "$(get_config_arg_value 'output directory')/${RESULTS}"
printf "%s\n\n" "Success: JSON export completed. Results file (${RESULTS}) created in $(get_config_arg_value 'output directory')."
