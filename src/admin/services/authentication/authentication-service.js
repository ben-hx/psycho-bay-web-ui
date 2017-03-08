'use strict';

var app = angular.module('myApp.authentication', ['ngCookies', 'myApp.model', 'myApp.error', 'myApp.notification']);

app.service('AuthenticationService', ['$cookieStore', '$q', 'ApiManagerUtil', function ($cookieStore, $q, ApiManagerUtil) {
    var token = null;
    var currentUserCookieKey = "CurrentUser";

    var saveToken = function (newToken) {
        token = newToken;
        $cookieStore.put(currentUserCookieKey, {token: token});
        changeHeader(token);
    };

    var changeHeader = function (token) {
        ApiManagerUtil.setDefaultHeaders({Authorization: 'Bearer ' + token});
    };

    var clear = function () {
        token = null;
        $cookieStore.remove(currentUserCookieKey);
        ApiManagerUtil.setDefaultHeaders({});
    };

    return {
        login: function (username, password) {
            var deferred = $q.defer();
            ApiManagerUtil.setDefaultHeaders({Authorization: 'Basic ' + btoa(username + ':' + password)});
            ApiManagerUtil.get('token').then(function (result) {
                saveToken(result.token);
                deferred.resolve(result.token);
            }, function (error) {
                clear();
                deferred.reject(error);
            });
            return deferred.promise;
        },
        isLoggedIn: function () {
            return token != null;
        },
        logout: clear,
        initialize: function () {
            var storageObject = $cookieStore.get(currentUserCookieKey);
            if (storageObject) {
                saveToken(storageObject.token);
            }
        }
    };
}]);

app.config(function (errorHandlerProvider, $provide) {
    errorHandlerProvider.decorate($provide, ['AuthenticationService']);
});

app.config(['$provide', function ($provide) {
    $provide.decorator('AuthenticationService', ['$delegate', '$state', 'ViewModel', function ($delegate, $state, ViewModel) {

        var login = $delegate.login;
        $delegate.login = function (username, password) {
            return login(username, password).then(function (result) {
                return ViewModel.load().then(function () {
                    return result;
                });
            });
        };

        var logout = $delegate.logout;
        $delegate.logout = function () {
            logout();
            ViewModel.reset();
            $state.transitionTo('login');
        };

        return $delegate;
    }]);
}]);