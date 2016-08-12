#Taiga.io-Scripts
These scripts manage an Agile project management platform currently under development called [Taiga](http://taiga.io "Taiga project management platform"). 
Though in beta, this web-based platform is extremely stable and the RESTful API is thorough and responsive.

These scripts are organized into three categories:

- **Taiga Importers**: bulk import new user stories into an existing Taiga project
- **Taiga Exporters**: export the JSON file that defines an existing Taiga project (useful for backing a project)
- **Taiga Task Activity Reporting**: generate a custom visual report on Taiga tasks on a per-user basis. Several variants of this script are available, including a Javascript solution that does not use bash.

## Developed with a Bash Template (BaT)

The [bash](https://en.wikipedia.org/wiki/Bash_%28Unix_shell%29) scripts in **Taiga.io-Scripts** use a bash template (BaT) called **[A-Bash-Template](https://github.com/richbl/a-bash-template)** designed to make script development and command line argument management more robust, easier to implement, and easier to maintain. Here are a few of those features:

- Dependencies checker: a routine that checks all external program dependencies (*e.g.*, [sshpass](http://linux.die.net/man/1/sshpass) and [jq](https://stedolan.github.io/jq/))
- Arguments and script details--such as script description and syntax--are stored in the [JSON](http://www.json.org/) file format (*i.e.*, `config.json`)
- JSON queries (using [jq](https://stedolan.github.io/jq/)) handled through wrapper functions
- A script banner function automates banner generation, reading directly from `config.json`
- Command line arguments are parsed and tested for completeness using both short and long-format argument syntax (*e.g.*, `-u|--username`)
- Optional command line arguments are permissible and managed through the JSON configuration file
- Template functions organized into libraries to minimize code footprint in the main script

For more details about using a bash template, [check out the BaT prooject here](https://github.com/richbl/a-bash-template).

##Taiga Importers
###Importing User Stories into a Taiga Project
Called `taiga_import_story.sh`, it does what it sounds like: imports a user story into a Taiga project. Actually, the real value of this script is that it can perform a bulk import of many stories from a tab-delimited file provided as input to the script.

This script creates a new story, populating the following fields:

- project ID (determined from project slug name, an argument passed into the script)
- story subject (required)
- story description
- tags (up to three)

> **NOTE:** For technical details about creating a new story in Taiga, see the [Taiga REST API](https://taigaio.github.io/taiga-doc/dist/api.html#user-stories-create).

###User Story File Format
The file format used to define individual user stories is a simple **tab-delimited** structure:

	Column 1	Column 2	Column 3	Column 4	Column 5
	Subject	    Description	[Tag 1]	    [Tag 2]	    [Tag 3]

###Basic Usage
`taiga_import_story.sh` is run through a command line interface, so all of the command options are made available there.

Here's a successful import of a user story into a Taiga project that uses a project slug named called "a-test-project-import":

>**NOTE:** Taiga project slugs are not the same as a Taiga project, but are derived from a Taiga project name. For details on how to determine a Taiga project slug, see the [Taiga REST API](https://taigaio.github.io/taiga-doc/dist/api.html#_projects).

	$ bash taiga_import_story.sh -w https://api.taiga.io -n a-test_project_import -i /home/user/Desktop/bulk_stories -u user@somewhere.com -p pass123
	
	 |
	 |  A bash script to POST user stories into a Taiga project
	 |    0.2.0
	 |
	 |  Usage:
	 |    import_taiga -w website -n project_slug_name -i input_file -u username -p password
	 |
	 |  -w, --website            website IP or URL (e.g., http://www.website.com)
	 |  -n, --project_slug_name  project slug name (not the project name)
	 |  -i, --input_file         tab-delimited input file
	 |  -u, --username           username
	 |  -p, --password           password
	 |
	
	Success: user story #680676 imported.
	Success: user story #680679 imported.


##Taiga Exporters
###Export a Taiga Project into a JSON File
`taiga_export_project.sh` takes a number of command-line parameters, mostly identifying the Taiga project from which to export, and exports the JSON file to a date-and-time-stamped file (particularly useful for a running backup archive).

>**NOTE:** For technical details defining the JSON structure of a Taiga project, see the [Taiga REST API](https://taigaio.github.io/taiga-doc/dist/api.html#export-import-export-dump).

Related to this script, `run_taiga_export_project.sh` is the front-end script that calls into `taiga_export_project.sh` with a predefined set of parameters. This script is used to automate a regular Taiga project backup strategy through the use of Unix-like tools such as *crontab*.

###Basic Usage
`taiga_export_project.sh` is run through a command line interface, so all of the command options are made available there.

Here's a successful export of a Taiga project that uses a project slug named called "a-test-project-import":

	$ bash taiga_export_project.sh -w https://api.taiga.io -n a-test_project_import -o /home/user/Desktop -u user@somewhere.com -p pass123
	
	|
	| A bash script to GET a JSON export file from a Taiga project
	|  0.2.0
	|
	| Usage:
	|   export_taiga -w website -n project_slug_name -o output_dir -u username -p password
	|
	|   -w, --website          website_url (e.g., http://www.website.com)
	|   -n, --projectslugname  project_slug_name (not the project name)
	|   -o, --outputdir        absolute directory path for exported file
	|   -u, --username         user_name
	|   -p, --password         password
	|
	
	Success: JSON export completed. Results file (a-test_project_import-export-20160416211616.json) created in /home/user/Desktop.


>**NOTE**: The Taiga REST API only permits the export of a Taiga project using JSON if the Taiga server is configured to return a HTTP status code of 200. If the server returns 202, a valid export file is not available, and `taiga_export_project.sh` will quit indicating the reason for failure. For technical details, see the [Taiga REST API as it relates to project export](https://taigaio.github.io/taiga-doc/dist/api.html#export-import-export-dump). 

##Taiga Task Activity Reporting
These scripts are used to query into an existing Taiga project, parse user stories by user, perform some calculations against these user stories, and ultimately display the results graphically using [Highcharts](http://www.highcharts.com/ "Highcharts").

![Taiga Tasks Dialog](https://cloud.githubusercontent.com/assets/10182110/17636695/b8276304-6093-11e6-9402-58f8a52308cd.png "Taiga Tasks Dialog")

![Taiga Activity Report](https://raw.githubusercontent.com/richbl/taiga.io-scripts/master/taiga_tasks_activity_report.png "Taiga Activity Report")

These scripts are provided in both bash and JavaScript, and are intended to be run either locally or from a remote server. The organization of the repository should provide some understanding of which scripts are which:

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

##Requirements
###Bash Scripts

 - A preexisting Taiga project
 - An operational [bash](https://en.wikipedia.org/wiki/Bash_%28Unix_shell%29) environment (bash 4.3.2 used during development)
 - Curl (http://curl.haxx.se/) must be installed on host machine
 - JQ (https://stedolan.github.io/jq/) must be installed on host machine, used for parsing the `config.json` file

While this package was written and tested under Linux (Ubuntu 15.10), there should be no reason why this won't work under other Unix-like operating systems.

###JavaScript Scripts
The JavaScript version of the taiga_tasks solution expects JavaScript to be running in the browser. All other requirements are managed remotely through a set of external JavaScript libraries.

## License
This software is released under the GNU GENERAL PUBLIC LICENSE, Version 3. For details, see the license file in this project ([`license.md`](https://github.com/richbl/taiga-scripts/blob/master/LICENSE "License")).
