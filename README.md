##Some Taiga Scripts
These scripts manage an Agile project management platform currently under development called [Taiga](http://taiga.io "Taiga project management platform"). 
Though in beta, this web-based platform is extremely stable and the RESTful API is thorough and responsive.

These scripts are loosely organized into three categories:

Taiga importers (bash script):

 - taiga_import_story.sh
 
Taiga exporters (bash scripts):

- taiga_export_project.sh
- run_taiga_export_project.sh

Taiga task activities reporting (bash scripts or HTML/JavaScript):

- taiga_tasks.html


> **Note:** These scripts assume the existence of a Taiga project. If you don't yet have a project created, these scripts are pretty useless to you.

###Taiga Importers
####taiga_import_story.sh
There's currently one import script available. Called `taiga_import_story.sh`, it does what it sounds like: imports a story into a Taiga project. Actually, the real value of this script is that it can perform a bulk import of many stories from a tab-delimited file provided as input to the script.

As implemented, this initial version of the script creates a story, populating the following fields:

- project ID (required)
- subject (required)
- description
- tags (up to three)

###Taiga Exporters
There are four export scripts available, however two are really scripts used as front-ends (scripts prepended with `run_`) that call into their respective back-end scripts.
####taiga_export_project.sh
`taiga_export_project.sh` takes a number of command-line parameters, mostly identifying the Taiga project from which to export, and exports the JSON file to a date-and-time-stamped file (particularly useful for a running backup archive).
####run_taiga_export_project.sh
`run_taiga_export_project.sh` is the front-end script that calls into `taiga_export_project.sh` with a predefined set of parameters. This script is used to help automate a regular Taiga project backup strategy through the use of Unix-like tools such as *crontab*.

###Taiga Task Activity Reporting
These scripts are used to query into an existing Taiga project, parse user stories by user, perform some calculations against these user stories, and ultimately display the results graphically using [Highcharts](http://www.highcharts.com/ "Highcharts").

These scripts are written in both bash and JavaScript, and are intended to be run either locally or from a remote server. The organization of the repository should provide some understanding of which scripts are which:

- bash folder containing:
	- `taiga_tasks.sh`
	- `run_taiga_tasks.sh`
- local folder containing:
	- `taiga_tasks.html`
- remote folder containing:
	- `taiga_tasks.html`
	- `favicon.ico`
	- img folder containing:
		- `logo.png`
	- js folder containing:
		- `taiga_tasks_dlg.js`
		- `taiga_tasks_api.js`

The scripts contained in the bash and the local folders are useful for running these applications from a local machine, while the scripts in the remote folder are intended to be installed and run from a remote web-server.

###Requirements
####Bash Scripts
Beyond the obvious need to be running the Bash shell, there are a few additional requirements needed to run these scripts (these requirements are also documented in the scripts themselves):

- A preexisting Taiga project (for those scripts using Taiga, of course)
- Curl (http://curl.haxx.se/) must be installed on host machine
- JQ (https://stedolan.github.io/jq/) must be installed on host machine

####JavaScript Scripts
The JavaScript version of the taiga_tasks solution expects JavaScript to be running in the browser. All other requirements are managed remotely through a set of external JavaScript libraries.

> **Note:** While not so much a script requirements, these scripts sometimes require the administrative privileges of a Taiga user on the project(s) of interest.

## License
This software is released under the GNU GENERAL PUBLIC LICENSE, Version 3. For details, see the license file in this project ([`license.md`](https://github.com/richbl/taiga-scripts/blob/master/LICENSE "License")).
