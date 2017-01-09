'use strict';

var app = angular.module('myApp.error');

app.service('ErrorHandler', ['$state', function ($state) {
    var UNEXPECTED_STATUS = -1;

    return {
        getErrorFromResponse: function (response) {
            if (response.status == 401) {
                $state.transitionTo('login');
            }
            return response;
        }
    };
}]);