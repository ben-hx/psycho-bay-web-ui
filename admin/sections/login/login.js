'use strict';

var app = angular.module('myApp.login', ['ui.bootstrap']);

app.config(['$stateProvider', function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: './sections/login/login.html',
        controller: 'LoginCtrl'
    });
}]);

app.controller('LoginCtrl', ['$scope', '$state', 'AuthenticationService', function ($scope, $state, AuthenticationService) {

    $scope.login = function (username, password) {
        AuthenticationService.login(username, password).then(function (result) {
            $state.transitionTo('home');
        });
    }

}]);