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
# A bash script to dump a PostgreSQL database
#
# Version: 0.1
#
# Requirements:
#
#  --Preexisting database
#  --pg_dump (part of a PostgreSQL package install)
#
# Inputs:
#
#  --Host (e.g., www.website.com or IP address)
#  --Username (must have appropriate permissions as PostgreSQL user/role on host)
#  --Password
#  --Database name to dump
#  --Output directory to save dumped file (absolute path)
#
# Outputs:
#
#  --A compressed (gz) dump file
#  --If failure, causing error message displayed
#

echo "
|
| A bash script to dump a PostgreSQL database
|
| Usage:
|   postres_db_dump [options]
|
|   -h, --host       URL (www.website.com) or IP address
|   -u, --username   user name
|   -p, --password   password
|   -d, --database   database name to dump
|   -o, --outputdir  absolute directory path to save dumped file
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
    -h|--host)
      ARG_HOST="$2"
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
    -d|--database)
      ARG_DATABASE="$2"
      shift # skip argument
      ;;
    -o|--outputdir)
      ARG_OUTPUTDIR="$2"
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
if [ -z "${ARG_HOST}" ]; then
  echo "Error: host argument (-h, --host) missing."
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

if [ -z "${ARG_DATABASE}" ]; then
  echo "Error: database name argument (-d, --database) missing."
  quit
fi

if [ -z "${ARG_OUTPUTDIR}" ]; then
  echo "Error: outputdir argument (-o|--outputdir) missing."
  quit
fi

# -----------------------------------------------------------------------------
# check system requirements
#

# pg_dump command
#
if  ! type "pg_dump" &> /dev/null; then
  echo "Error: pg_dump program not installed."
  quit
fi

# -----------------------------------------------------------------------------
# generate dump file
#

mkdir -p "${ARG_OUTPUTDIR}"
RESULTS="${ARG_DATABASE}"-database-"$(date +"%Y%m%d%H%M%S")".gz

echo "Starting pg_dump now... this could take some time depending on database size."
echo

# dump to tmp.out file to catch pg_dump return code (if success, gzip and move file
# else, rm tmp.out file and go home)
#
export PGPASSWORD="${ARG_PASSWORD}"
pg_dump -h "${ARG_HOST}" -U "${ARG_USERNAME}" "${ARG_DATABASE}" > "/tmp/tmp.out"
RETURN_CODE=$?

if [ $RETURN_CODE -ne 0 ]; then
  rm "/tmp/tmp.out"
  echo
  echo "Error: pg_dump exited with error code."
  quit
else
  gzip -q "/tmp/tmp.out"
  mv "/tmp/tmp.out.gz" "${ARG_OUTPUTDIR}/${RESULTS}"
  echo "Success: PostgreSQL dump completed. Results file (${RESULTS}) created in ${ARG_OUTPUTDIR}."
  echo
fi
