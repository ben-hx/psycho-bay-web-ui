'use strict';

var app = angular.module('myApp.authentication', ['ngCookies', 'myApp.model']);

app.service('AuthenticationService', ['$cookieStore', '$q', 'ApiManagerUtil', function ($cookieStore, $q, ApiManagerUtil) {
    var token = null;
    var currentUserCookieKey = "CurrentUser";

    var changeLoggedInUser = function (token) {
        token = token;
        $cookieStore.put(currentUserCookieKey, {token: token});
        changeHeader(token);
    };

    var changeHeader = function (token) {
        ApiManagerUtil.setDefaultHeaders({Authorization: 'Bearer ' + token});
    };

    var clearLoggedInUser = function () {
        token = null;
        $cookieStore.remove(currentUserCookieKey);
        ApiManagerUtil.setDefaultHeaders({});
    };

    return {
        login: function (username, password) {
            var deferred = $q.defer();
            ApiManagerUtil.setDefaultHeaders({Authorization: 'Basic ' + btoa(username + ':' + password)});
            ApiManagerUtil.get('token').then(function (result) {
                changeLoggedInUser(result.token);
                deferred.resolve(result.token);
            }, function (error) {
                clearLoggedInUser();
                deferred.reject(error);
            });
            return deferred.promise;
        },
        isLoggedIn: function () {
            return token != null;
        },
        logout: clearLoggedInUser,
        initialize: function () {
            var storageObject = $cookieStore.get(currentUserCookieKey);
            if (storageObject) {
                changeLoggedInUser(storageObject.token);
            }
        }
    };
}]);