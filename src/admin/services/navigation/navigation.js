'use strict';

var app = angular.module('myApp.navigation', ['myApp.authentication']);

app.config(['$urlRouterProvider', '$locationProvider', function ($urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise("/login");
    $locationProvider.html5Mode(true);
}]);

app.run(['$rootScope', '$state', '$uibModalStack', 'AuthenticationService', 'NotificationService', function ($rootScope, $state, $uibModalStack, AuthenticationService, NotificationService) {

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if (!AuthenticationService.isLoggedIn() && toState.name != 'login') {
            event.preventDefault();
            $state.go('login');
        }
        $uibModalStack.dismissAll();
        NotificationService.dismissAll();
    });

}]);

app.controller('NavigationCtrl', ['$scope', 'ViewModel', function ($scope, ViewModel) {

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