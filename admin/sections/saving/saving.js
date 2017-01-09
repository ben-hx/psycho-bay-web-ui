'use strict';

var app = angular.module('myApp.saving', ['ui.bootstrap', 'myApp.model']);

app.controller('SavingCtrl', ['$scope', '$q', '$timeout', 'config', 'ViewModel', function ($scope, $q, $timeout, config, ViewModel) {

    ViewModel.load();
    $scope.hideSaving = true;
    $scope.isDirty = false;

    $scope.$on('dirtyChanged', function (event, isDirty) {
        $scope.isDirty = isDirty;
    });

    $scope.save = function () {
        ViewModel.save().then(function () {
            $scope.hasSuccessfullySaved = true;
            $timeout(function () {
                $scope.hasSuccessfullySaved = false;
            }, config.toolTipTimeToDismiss);
        });
    };

    $scope.undo = function () {
        ViewModel.undo().then(function () {
            $scope.hasSuccessfullyUndo = true;
            $timeout(function () {
                $scope.hasSuccessfullyUndo = false;
            }, config.toolTipTimeToDismiss);
        });
    };

}]);