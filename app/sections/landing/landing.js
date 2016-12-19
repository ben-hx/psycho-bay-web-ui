'use strict';

var app = angular.module('myApp.landing', ['ui.bootstrap']);

app.controller('LandingCtrl', ['$scope', '$q', '$timeout', 'config', 'ViewModel', function ($scope, $q, $timeout, config, ViewModel) {

    $scope.ViewModel = ViewModel;
    $scope.navigationSections = ['aboutMe', 'myWork', 'mySurgery', 'location'];

    $scope.$on('dirtyChanged', function (event, isDirty) {
        if (!isDirty) {
            $scope.form.$setPristine();
        }
    });

    $scope.$watch('form.$dirty', function (newValue, oldValue) {
        ViewModel.setDirty($scope.form.$dirty);
    }, true);

    $scope.onImageUploadSuccess = function (response, model) {
        console.log("transform response to model");
        $timeout(function () {
            $scope.fileUploadValue = undefined;
            $scope.form.$setDirty();
        }, config.toolTipTimeToDismiss);
    };

    $scope.onImageUploadProgress = function (event) {
        $scope.fileUploadValue = parseInt(100.0 * event.loaded / event.total);
    };

    $scope.changeIcon = function (model, iconClass) {
        model.icon = iconClass;
        $scope.form.$setDirty();
    };

}]);