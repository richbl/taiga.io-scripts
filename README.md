##Some Taiga Scripts
These are a set of bash scripts used to manage an Agile project management platform currently under development called [Taiga](http://taiga.io "Taiga project management platform"). 
Though in beta, this web-based platform is stable and the RESTful API is thorough and responsive.

These scripts are loosely organized into two categories:
- Taiga importers
- Taiga exporters

> **Note:** Both sets of scripts currently assume the existence of a Taiga project. If you don't yet have a project created, these scripts will be useless to you.

###Taiga Importers
####taiga_import_story.sh
There's currently one import script available. Called `taiga_import_story.sh`, it does what it sounds like it does: imports a story into a Taiga project. Actually, this script does a bulk import of many stories from a tab-delimited file provided as input to the script.

As implemented, this initial version of the script creates a story, populating the following fields:
* project ID (required)
* subject (required)
* description
* tags (up to three)

###Taiga Exporters
There are two export scripts available, however one is really a script used for backup that calls into the other.
####taiga_export_project.sh
`taiga_export_project.sh` takes a number of command-line parameters, mostly identifying the Taiga project from which to export, and exports the JSON file to a date-and-time-stamped file. 
####run_taiga_export_project.sh
`run_taiga_export_project.sh` is really just a front-end script that calls into `taiga_export_projecct.sh` with defined sets of parameters. This script is used to help automate a regular Taiga project backup strategy through the use of Unix-like tools such as *crontab*.

###Requirements
Beyond the obvious need to be running the Bash shell, there are a few additional requirements needed to run these scripts (these requirements are also documented in the scripts themselves):
* A preexisting Taiga project
* Curl (http://curl.haxx.se/) must be installed on host machine
* JQ (https://stedolan.github.io/jq/) must be installed on host machine

> **Note:** While not so much a script requirements, their actions require administrative privileges as a Taiga user on the project(s) of interest.

###About Bash
Yes, these scripts are written in [Bash](https://www.gnu.org/software/bash/ "Bash"). They've only ever been run and tested in Bash (under Ubuntu 14.04 LTS). Some day, it'd be a fine exercise to refactor these into something a bit more platform-agnostic like Python or Go. Until then, know that these scripts are bash scripts.

## License
This software is released under the GNU GENERAL PUBLIC LICENSE, Version 3. For details, see the license file in this project ([`license.md`](https://github.com/richbl/taiga-scripts/blob/master/LICENSE "License")).
