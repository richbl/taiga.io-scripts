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

angular.module('ui.bootstrap.demo', ['ngAnimate', 'ui.bootstrap']);
angular.module('ui.bootstrap.demo').controller('ModalDemoCtrl', function($scope, $modal, $log) {

   $scope.checkModel = {
      duane: false,
      troje: false,
      bfey: false,
      richbl: false
   };

   $scope.dlgModel = {
      username: "",
      password: ""
   };

   var modalInstance = $modal.open({
      backdrop: 'static',
      keyboard: false,
      templateUrl: 'myModalContent.html',
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

      checkResults = [];

      angular.forEach($scope.checkModel, function(value, key) {
         if (value) {
            checkResults.push(key);
         }

      });

      // this is the interesting call that fires up the Taiga API through a series of Ajax calls into the
      // Taiga project, retrieves and processes the information, and ultimately displays the resulting charts
      //
      getAuthToken(
         'http://www.website.com', // the taiga website to gather tasks
         'project_slug', // the taiga project slug (not project name)
         $scope.dlgModel.username, // project user with admin permissions (to access task details)
         $scope.dlgModel.password, // project user password
         checkResults // users to gather task summaries
      );

   });

});

angular.module('ui.bootstrap.demo').controller('ModalInstanceCtrl', function($scope, $modalInstance, checkModel, dlgModel) {

   $scope.checkModel = checkModel;
   $scope.dlgModel = dlgModel;

   $scope.ok = function() {
      $modalInstance.close();
   };

   $scope.reset = function() {
      $scope.dlgModel.username = "";
      $scope.dlgModel.password = "";

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
            return !($scope.dlgModel.username.length > 0 && $scope.dlgModel.password.length > 0);
            break;
         }
      }
      return true;
   }
});
