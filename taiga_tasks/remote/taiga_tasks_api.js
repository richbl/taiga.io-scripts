/**
---------------------------------------------------------------------------------------------------
#
# Copyright (C) Business Learning Incorporated (www.businesslearninginc.com)
#
# This program is free software: you can redistribute it and/or modify it under the terms of the
# GNU General Public License as published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
# without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See
# the GNU General Public License at <http://www.gnu.org/licenses/> for more details.
#
---------------------------------------------------------------------------------------------------
*/

/**
 * ----------------------------------------------------------------------------------
 * Get taiga AUTH_TOKEN used in all subsequent taiga API calls
 */
function getAuthToken(website, project, adminUsername, adminPassword, users) {

   $.ajax({
      method: "POST",
      url: website + '/api/v1/auth',
      data: {
         "type": "normal",
         "username": adminUsername,
         "password": adminPassword
      },
      success: function(json) {
         showSuccessAlert("Taiga authentication succeeded for user " + adminUsername + ".");
         getProjectID(website, project, json.auth_token, users);
      },
      error: function(jqXHR, textStatus, errorThrown) {
         console.log(textStatus, errorThrown);
         showErrorAlert("Taiga authentication failed for user " + adminUsername + " because of incorrect username or password.");
      }
   });
};

/**
 * ----------------------------------------------------------------------------------
 * Get taiga project ID
 */
function getProjectID(website, project, authToken, users) {
   $.ajax({
      method: "GET",
      url: website + '/api/v1/resolver?project=' + project,
      beforeSend: function(xhr) {
         xhr.setRequestHeader('Authorization', 'Bearer ' + authToken);
      },
      success: function(json) {
         showSuccessAlert("ProjectID retrieval succeeded.");
         getProjectName(website, authToken, json.project, users);
      },
      error: function(jqXHR, textStatus, errorThrown) {
         console.log(textStatus, errorThrown);
         showErrorAlert("Unable to retrieve project ID.");
      }
   });
};

/**
 * ----------------------------------------------------------------------------------
 * Get taiga project name
 */
function getProjectName(website, authToken, projectID, users) {
   $.ajax({
      method: "GET",
      url: website + '/api/v1/projects/' + projectID,
      beforeSend: function(xhr) {
         xhr.setRequestHeader('Authorization', 'Bearer ' + authToken);
      },
      success: function(json) {
         showSuccessAlert("Project name retrieval succeeded.");
         processUsers(website, authToken, projectID, json.name, users);
      },
      error: function(jqXHR, textStatus, errorThrown) {
         console.log(textStatus, errorThrown);
         showErrorAlert("Unable to retrieve project name.");
      }
   });
};

/**
 * ----------------------------------------------------------------------------------
 * Get taiga user(s)
 */
function processUsers(website, authToken, projectID, projectName, users) {

   users.forEach(function(element, i) {
      $('#container').append('<div id=chart' + [i] + '></div><br><br>');
      getUserID(website, authToken, projectID, projectName, element, i);
   });

}

/**
 * ----------------------------------------------------------------------------------
 * Get username id
 */
function getUserID(website, authToken, projectID, projectName, username, divIndex) {
   $.ajax({
      method: "GET",
      url: website + '/api/v1/users?project=' + projectID,
      beforeSend: function(xhr) {
         xhr.setRequestHeader('Authorization', 'Bearer ' + authToken);
      },
      success: function(json) {
         showSuccessAlert("User ID retrieval for " + username + " succeeded.");

         var result = $.grep(json, function(element, index) {
            return element.username == username;
         });
         getUserStories(website, authToken, projectID, projectName, result[0].id, divIndex, getResults);
      },
      error: function(jqXHR, textStatus, errorThrown) {
         console.log(textStatus, errorThrown);
         showErrorAlert("Unable to retrieve user ID for " + username + ".");
      }
   });
};

/**
 * ----------------------------------------------------------------------------------
 * Get user stories
 */
function getUserStories(website, authToken, projectID, projectName, userID, divIndex, callback) {
   $.ajax({
      method: "GET",
      url: website + '/api/v1/userstories?project=' + projectID + '\&assigned_to=' + userID,
      beforeSend: function(xhr) {
         xhr.setRequestHeader('Authorization', 'Bearer ' + authToken);
      },
      success: function(json) {
         var newItem = [];
         var callbackCount = json.length;

         showSuccessAlert("User stories retrieval succeeded.");

         // build newItem array from JSON returns
         //
         var json = $.map(json, function(item) {

            // get custom fields (actual_points) and include in final JSON return
            //   if no attributes_values, then set to null (user didn't set a value)
            //
            getCustomFields(website, authToken, projectID, item.id).done(function(data) {

               var actualPoints = data.attributes_values[1];

               if (actualPoints === undefined) {
                  actualPoints = null;
               }

               newItem.push({
                  estimated_points: item.total_points,
                  subject: item.subject,
                  story_id: item.id,
                  full_name: item.assigned_to_extra_info.full_name_display,
                  finish_date: item.finish_date,
                  actual_points: actualPoints,
                  project_name: projectName
               });

               // manage callback counts, given we don't know when all callbacks
               // have completed... when all callbacks return, continue
               //
               if (!--callbackCount) {
                  callback(newItem, divIndex);
               };

            });
         });
      },
      error: function(jqXHR, textStatus, errorThrown) {
         console.log(textStatus, errorThrown);
         showErrorAlert("Unable to retrieve user stories.");
      }
   });
};

/**
 * ----------------------------------------------------------------------------------
 * Get user story custom fields (e.g,. actual_points field)
 */
function getCustomFields(website, authToken, projectID, storyID) {
   return $.ajax({
      method: "GET",
      url: website + '/api/v1/userstories/custom-attributes-values/' + storyID + '?project=' + projectID,
      beforeSend: function(xhr) {
         xhr.setRequestHeader('Authorization', 'Bearer ' + authToken);
      },
      success: function() {
         showSuccessAlert("Custom fields retrieval succeeded.");
      },
      error: function(jqXHR, textStatus, errorThrown) {
         console.log(textStatus, errorThrown);
         showErrorAlert("Unable to retrieve user story custom fields.");
      }
   });
};

/**
 * ----------------------------------------------------------------------------------
 * Process JSON results for highcharts
 */
function processResults(data) {

   // sort tasks by completion date
   //
   data.sort(function(obj1, obj2) {
      var MAX_TIMESTAMP = 8640000000000000;

      // if finish_date is null, task is still in works, so assign it max value timestamp
      // so task ends up last (right-most) in list
      //
      !obj1.finish_date ? a_date = new Date(MAX_TIMESTAMP) : a_date = new Date(obj1.finish_date);
      !obj2.finish_date ? b_date = new Date(MAX_TIMESTAMP) : b_date = new Date(obj2.finish_date);
      return b_date < a_date ? 1 : -1;
   });

   return data;
};

/**
 * ----------------------------------------------------------------------------------
 * Create highcharts categories from JSON results
 */
function createResultsCategories(data) {

   var arrayLength = data.length;
   var categories = [];

   for (var i = 0; i < arrayLength; i++) {

      if (!data[i]['finish_date']) {
         categories[i] = data[i]['subject'] + "<br>[In Progress]";
      } else {
         categories[i] = data[i]['subject'] + "<br>[Done]";
      };

   };
   return categories;
}

/**
 * ----------------------------------------------------------------------------------
 * Create highcharts series from JSON results
 */
function createResultsSeries(data) {

   var arrayLength = data.length;

   var estimatedPoints = [];
   var actualPoints = [];
   var diffPoints = [];
   var cumDiffPoints = [];
   var cumPoints = [];

   for (var i = 0; i < arrayLength; i++) {

      estimatedPoints[i] = parseInt(data[i]['estimated_points']) || null;
      actualPoints[i] = parseInt(data[i]['actual_points']) || null;

      diffPoints[i] = actualPoints[i] - estimatedPoints[i];

      cumDiffPoints[i] = diffPoints[i];
      cumPoints[i] = actualPoints[i];

      if (i > 0) {
         cumDiffPoints[i] = cumDiffPoints[i - 1] + diffPoints[i];
         cumPoints[i] = cumPoints[i - 1] + actualPoints[i];
      }
   };

   return ([{
      name: 'Estimated (h)',
      data: estimatedPoints
   }, {
      name: 'Actual (h)',
      data: actualPoints

   }, {
      name: 'Diff (h)',
      data: diffPoints

   }, {
      name: 'Cum. Diff (h)',
      data: cumDiffPoints

   }, {
      name: 'Total (h)',
      data: cumPoints
   }]);

}

/**
 * ----------------------------------------------------------------------------------
 * Datetime formatter
 */
function getDateTime() {
   var local = new Date();
   local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
   return local.toJSON().slice(0, 10) + " at " + local.toJSON().slice(11, 19);
}

/**
 * ----------------------------------------------------------------------------------
 * Get and process the resultng JSON file for highcharts (hc)
 */
function getResults(json, divIndex) {

   var results = processResults(json);
   hcCategories = createResultsCategories(results);
   hcSeries = createResultsSeries(results);
   hcDate = getDateTime();

   // $('#debug').append('<br>=========Data================<br>' + JSON.stringify(results, null, 4));
   // $('#debug').append('<br>=========Categories==========<br>' + JSON.stringify(hcCategories, null, 4));
   // $('#debug').append('<br>=========Series==============<br>' + JSON.stringify(hcSeries));

   plotChart(results, hcCategories, hcSeries, hcDate, divIndex);
};

/**
 * ----------------------------------------------------------------------------------
 * Plot data to highcharts object
 */
function plotChart(data, categories, series, date, count) {

   $('#chart' + [count]).highcharts({

      title: {
         text: data[0]['full_name'] + ' : Task Activity Report'
      },

      subtitle: {
         text: data[0]['project_name'] + ' Project<br>' + 'Generated on ' + date
      },

      xAxis: {
         gridLineWidth: 1,
         crosshair: true,
         categories: categories
      },
      yAxis: {
         gridLineWidth: 1,
         title: {
            text: 'Hours (h)',
         }
      },

      plotOptions: {
         line: {
            dataLabels: {
               enabled: true
            },
         },
      },

      series: series
   });

   clearAlerts(count);

};

/**
 * ----------------------------------------------------------------------------------
 * Display alerts to browser window
 */

function showSuccessAlert(msg) {
   ShowAlert(msg, 0);
};

function showErrorAlert(msg) {
   ShowAlert(msg, 1);
};

function ShowAlert(msg, type) {

   msgType = {
      class: "",
      text: ""
   };

   switch (type) {
      case 0:
         msgType.class = "alert-success";
         msgType.text = "Success";
         break;
      case 1:
         msgType.class = "alert-danger";
         msgType.text = "Error";
         break;
      default:
         msgType.class = "alert-info";
         msgType.text = "Info";
   };

   $('#alerts').html("<div id='alert' class='alert " + msgType.class + " fade in' style='margin:20px'><strong>" + msgType.text + ":</strong> " + msg + "</div></div>");

};

/**
 * ----------------------------------------------------------------------------------
 * Remove alerts after final chart is rendered
 */
function clearAlerts(count) {

   if ($("div[id^='chart']").length - 1 == count) {
      $('#alert').remove();
   };

};
