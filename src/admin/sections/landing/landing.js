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
        ViewModel.model.landing.image.src = response.files[0];
        $scope.form.$setDirty();
    };

}]);