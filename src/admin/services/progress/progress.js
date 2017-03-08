'use strict';

var app = angular.module('myApp.progress', []);

app.service('ProgressService', ['$rootScope', function ($rootScope) {
    var progressesCount = 0;

    return {
        pushProgress: function () {
            progressesCount++;
            $rootScope.$broadcast('progressPushed', this.hasProgresses());
        },
        popProgress: function () {
            progressesCount--;
            $rootScope.$broadcast('progressPopped', this.hasProgresses());
        },
        hasProgresses: function () {
            return progressesCount > 0;
        }
    }
}]);