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

var app = angular.module('taiga.tasks', ['ngAnimate', 'ui.bootstrap']);

app.service('sharedProperties', function() {

  var objectValue = {
    dtStart: '',
    dtEnd: ''
  };

  return {
    setStartDate: function(startDate) {
      objectValue.dtStart = startDate;
    },
    setEndDate: function(endDate) {
      objectValue.dtEnd = endDate;
    },
    getStartDate: function() {
      return objectValue.dtStart;
    },
    getEndDate: function() {
      return objectValue.dtEnd;
    },
  }
});

app.controller('DatepickerCtrl', function($scope, sharedProperties) {

  $scope.today = function() {
    var x = new Date();
    x.setDate(1);
    x.setHours(0, 0, 0, 0);
    x.setMonth(x.getMonth());
    $scope.dtStart = x;

    x = new Date();
    x.setHours(23, 59, 59, 999);
    $scope.dtEnd = x;
  };

  $scope.today();

  $scope.clear = function() {
    $scope.dtStart = null;
    $scope.dtEnd = null;
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };

  $scope.toggleMin();

  $scope.maxDate = new Date(2020, 5, 22);

  $scope.open = function($event, opened) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.status[opened] = true;
  };

  $scope.$watch('dtStart', function() {
    sharedProperties.setStartDate($scope.dtStart);
  });

  $scope.$watch('dtEnd', function() {
    sharedProperties.setEndDate($scope.dtEnd);
  });

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];

  $scope.status = {
    opened: false
  };

});

app.controller('ModalCtrl', function($scope, $modal, $log, sharedProperties) {

  function toTaigaFormat(d) {
    function pad(n) {
      return n < 10 ? '0' + n : n
    }
    return d.getUTCFullYear() + '-' +
      pad(d.getUTCMonth() + 1) + '-' +
      pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) + ':' +
      pad(d.getUTCMinutes()) + ':' +
      pad(d.getUTCSeconds()) + '+' + "0000"
      // pad(d.getUTCMilliseconds())
  };

  $scope.dlgModel = {
    projectname: "",
    username: "",
    password: "",
    radio: 1
  };

  $scope.checkModel = {
    duane: false,
    troje: false,
    bfey: false,
    richbl: false
  };

  var modalInstance = $modal.open({
    backdrop: 'static',
    keyboard: false,
    templateUrl: 'taiga_tasks.html',
    controller: 'ModalInstanceCtrl',
    resolve: {
      checkModel: function() {
        return $scope.checkModel;
      },
      dlgModel: function() {
        return $scope.dlgModel;
      }
    }
  }).result.then(function() {

    var users = [];

    var startDate = toTaigaFormat(sharedProperties.getStartDate());
    var endDate = toTaigaFormat(sharedProperties.getEndDate());

    angular.forEach($scope.checkModel, function(value, key) {
      if (value) {
        users.push(key);
      }

    });

    // this is the interesting call that fires up the Taiga API through a series of Ajax calls into the
    // Taiga project, retrieves and processes the information, and ultimately displays the resulting charts
    //
    getAuthToken({
      website: 'http://public.businesslearninginc.com', // the taiga website to gather tasks
      authToken: '', // session authentication token (derived)
      projectID: '', // project ID (derived)
      projectName: $scope.dlgModel.projectname, // project name
      adminUsername: $scope.dlgModel.username, // project user with admin permissions (to access task details)
      adminPassword: $scope.dlgModel.password, // project user password
      startDate: startDate, // user story start date range
      endDate: endDate, // user story end date range
      showIncompleteTasks: $scope.dlgModel.radio, // whether to include incomplete tasks in results
      users: users, // list of users to gather task summaries
      userName: '', // user name (derived)
      userCount: 0, // count of users passed in (derived)
      userID: '' // user ID of current user (derived)
    });

  });

});

app.controller('ModalInstanceCtrl', function($scope, $modalInstance, checkModel, dlgModel) {

  $scope.checkModel = checkModel;
  $scope.dlgModel = dlgModel;

  $scope.ok = function() {
    $modalInstance.close();
  };

  $scope.reset = function() {
    $scope.dlgModel.username = "";
    $scope.dlgModel.password = "";
    $scope.dlgModel.projectname = "";
    $scope.dlgModel.radio = true;

    $scope.checkModel.duane = false;
    $scope.checkModel.troje = false;
    $scope.checkModel.bfey = false;
    $scope.checkModel.richbl = false;
  };

  $scope.validateDlg = function() {

    // check for no blank fields; if none then enable OK button
    //
    for (var key in $scope.checkModel) {
      if ($scope.checkModel[key]) {
        return !($scope.dlgModel.projectname.length > 0 && $scope.dlgModel.username.length > 0 && $scope.dlgModel.password.length > 0);
        break;
      }
    }
    return true;
  }
});
