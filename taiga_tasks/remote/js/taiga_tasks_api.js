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
function getAuthToken(taigaParams) {

   $.ajax({
      method: "POST",
      url: taigaParams.website + '/api/v1/auth',
      data: {
         "type": "normal",
         "username": taigaParams.adminUsername,
         "password": taigaParams.adminPassword
      },
      success: function(json) {
         showSuccessAlert("Taiga authentication succeeded for user " + taigaParams.adminUsername + ".");
         taigaParams.authToken = json.auth_token;
         getProjectID(taigaParams);
      },
      error: function(jqXHR, textStatus, errorThrown) {
         console.log(textStatus, errorThrown);
         showErrorAlert("Taiga authentication failed for user " + taigaParams.adminUsername + " because of incorrect username or password.");
      }
   });
};

/**
 * ----------------------------------------------------------------------------------
 * Get taiga project ID
 */
function getProjectID(taigaParams) {
   $.ajax({
      method: "GET",
      url: taigaParams.website + '/api/v1/resolver?project=' + taigaParams.project,
      beforeSend: function(xhr) {
         xhr.setRequestHeader('Authorization', 'Bearer ' + taigaParams.authToken);
      },
      success: function(json) {
         showSuccessAlert("ProjectID retrieval succeeded.");
         taigaParams.projectID = json.project;
         getProjectName(taigaParams);
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
function getProjectName(taigaParams) {
   $.ajax({
      method: "GET",
      url: taigaParams.website + '/api/v1/projects/' + taigaParams.projectID,
      beforeSend: function(xhr) {
         xhr.setRequestHeader('Authorization', 'Bearer ' + taigaParams.authToken);
      },
      success: function(json) {
         showSuccessAlert("Project name retrieval succeeded.");
         taigaParams.projectName = json.name;
         processUsers(taigaParams);
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
function processUsers(taigaParams) {

   (taigaParams.users).forEach(function(userName, index) {

      // clear all system alerts, as subsequent alerts will be user-specific
      //
      clearAlerts();

      getUserID(taigaParams, {
         userName: userName, // user name
         index: index + 1, // index of user used for displaying into HTML divs
         userID: 0 // user ID
      });
   });

}

/**
 * ----------------------------------------------------------------------------------
 * Get username id
 */
function getUserID(taigaParams, userParams) {
   $.ajax({
      method: "GET",
      url: taigaParams.website + '/api/v1/users?project=' + taigaParams.projectID,
      beforeSend: function(xhr) {
         xhr.setRequestHeader('Authorization', 'Bearer ' + taigaParams.authToken);
      },
      success: function(json) {
         showSuccessAlert("User ID retrieval for " + userParams.userName + " succeeded.", userParams.index);

         var result = $.grep(json, function(element, index) {
            return element.username == userParams.userName;
         });

         userParams.userID = result[0].id;
         getUserStories(taigaParams, userParams, getResults);
      },
      error: function(jqXHR, textStatus, errorThrown) {
         console.log(textStatus, errorThrown);
         showErrorAlert("Unable to retrieve user ID for " + userParams.userName + ".");
      }
   });
};

/**
 * ----------------------------------------------------------------------------------
 * Get user stories
 */
function getUserStories(taigaParams, userParams, callback) {

   // include/exclude incomplete (in progress) tasks in userstories query
   //
   var closedTasks = "";
   if (!taigaParams.showIncompleteTasks) {
      closedTasks = '\&is_closed=true';
   };

   $.ajax({
      method: "GET",
      url: taigaParams.website + '/api/v1/userstories?project=' + taigaParams.projectID + '\&assigned_to=' + userParams.userID + closedTasks,
      beforeSend: function(xhr) {
         xhr.setRequestHeader('Authorization', 'Bearer ' + taigaParams.authToken);
      },
      success: function(json) {
         var newItem = [];
         var callbackCount = json.length;

         showSuccessAlert("User stories retrieval succeeded.", userParams.index);

         // build newItem array from JSON returns
         //
         var json = $.map(json, function(item) {

            // check if story date is within requested date range
            //
            if ((item.modified_date < taigaParams.startDate) || (item.modified_date > taigaParams.endDate)) {
               if (!--callbackCount) {
                  showInfoAlert("No user stories found matching date criteria for user " + userParams.userName + ".", userParams.index);
               }
            } else {

               // get custom fields (actual_points) and include in final JSON return
               // if no attributes_values, then set to null (user didn't set a value)
               //
               getCustomFields(taigaParams, userParams, item.id).done(function(data) {

                  var actualPoints = data.attributes_values[2];

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
                     project_name: taigaParams.projectName
                  });

                  // manage callback counts, given we don't know when all callbacks
                  // have completed... when all callbacks return, continue
                  //
                  if (!--callbackCount) {
                     callback(taigaParams, userParams, newItem);
                  };

               });
            };
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
function getCustomFields(taigaParams, userParams, storyID) {
   return $.ajax({
      method: "GET",
      url: taigaParams.website + '/api/v1/userstories/custom-attributes-values/' + storyID + '?project=' + taigaParams.projectID,
      beforeSend: function(xhr) {
         xhr.setRequestHeader('Authorization', 'Bearer ' + taigaParams.authToken);
      },
      success: function() {
         showSuccessAlert("Custom fields retrieval succeeded.", userParams.index);
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
function getResults(taigaParams, userParams, json) {

   var results = processResults(json);
   hcCategories = createResultsCategories(results);
   hcSeries = createResultsSeries(results);
   hcDate = getDateTime();

   // $('#debug').append('<br>=========Data================<br>' + JSON.stringify(results, null, 4));
   // $('#debug').append('<br>=========Categories==========<br>' + JSON.stringify(hcCategories, null, 4));
   // $('#debug').append('<br>=========Series==============<br>' + JSON.stringify(hcSeries));

   plotChart(taigaParams, userParams, hcCategories, hcSeries, hcDate, results);
};

/**
 * ----------------------------------------------------------------------------------
 * Plot data to highcharts object
 */
function plotChart(taigaParams, userParams, categories, series, date, data) {

   $('#container').append('<div id=chart' + [userParams.index] + '></div><br><br>');
   $('#chart' + [userParams.index]).highcharts({

      title: {
         text: data[0]['project_name'] + ' Project' + '<br>' + 'Task Activity Report for ' + data[0]['full_name']
      },

      subtitle: {
         text: 'Activity Date Range: ' + (new Date(taigaParams.startDate)).toJSON().slice(0, 10) + ' to ' + (new Date(taigaParams.endDate)).toJSON().slice(0, 10) + '<br>' + 'Report Generated on ' + date
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

   clearAlerts(userParams.index);
};

/**
 * ----------------------------------------------------------------------------------
 * Display alerts to browser window
 */

function showSuccessAlert(msg, index) {
   ShowAlert(msg, index, 0);
};

function showErrorAlert(msg, index) {
   ShowAlert(msg, index, 1);
};

function showInfoAlert(msg, index) {
   ShowAlert(msg, index, 2);
};

function ShowAlert(msg, index, type) {

   var msgType = {
      class: "",
      text: ""
   };

   if (typeof index == "undefined") {
      index = 0;
   }

   switch (type) {
      case 0:
         msgType.class = "alert-success";
         msgType.text = "Success";
         break;
      case 1:
         msgType.class = "alert-danger";
         msgType.text = "Error";
         break;
      case 2:
         msgType.class = "alert-warning";
         msgType.text = "Warning";
         break;
      default:
         msgType.class = "alert-info";
         msgType.text = "Information";
   };

   var element = "<div id='alert" + index + "' class='alert " + msgType.class + " fade in' style='margin:20px'><strong>" + msgType.text + ":</strong> " + msg + "</div></div>";

   if ($("#alert" + index).length) {
      $("#alert" + index).replaceWith(element);
   } else {
      $('#alerts').append(element);
   }

};

/**
 * ----------------------------------------------------------------------------------
 * Remove alerts after final chart(s) is rendered
 */
function clearAlerts(index) {

   if (typeof index == "undefined") {
      index = 0;
   }

   $('#alert' + index).remove();
};
