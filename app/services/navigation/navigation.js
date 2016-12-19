'use strict';

var app = angular.module('myApp.navigation', ['myApp.authentication']);

app.config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.otherwise("/");
    //$locationProvider.html5Mode(true);
}]);

app.controller('NavigationCtrl', ['$scope', '$state', 'ViewModel', function ($scope, $state, ViewModel) {

    $scope.ViewModel = ViewModel;
    $scope.navigationSections = ['aboutMe', 'myWork', 'mySurgery'];

    $scope.$on('dirtyChanged', function (event, isDirty) {
        if (!isDirty) {
            $scope.form.$setPristine();
        }
    });

    $scope.$watch('form.$dirty', function (newValue, oldValue) {
        ViewModel.setDirty($scope.form.$dirty);
    }, true);

}]);