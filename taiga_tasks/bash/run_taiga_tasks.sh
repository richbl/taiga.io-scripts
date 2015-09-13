#!/bin/bash

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
# A bash script front-end to call taiga_tasks.sh
#
# Version: 0.1
#
# Requirements:
#
#  --Access to taiga_tasks.sh
#
# Inputs:
#
#  --None (runs with no inputs)
#
# Outputs:
#
#  --None (side effect is the completion of the called script)
#

# SORCE Migration project
#
/bin/bash /home/user/taiga_tasks.sh -w http://www.website.com -n taiga_project -u user -p 'password' -v username -o .
