'use strict';

var app = angular.module('myApp.model');

app.factory('ApiManagerUtil', ['$q', '$http', 'config', 'ErrorTransformer', function ($q, $http, config, ErrorTransformer) {

    var baseUrl = config.apiUrl;
    var authenticationHeader;

    return {
        setDefaultHeaders: function (header) {
            authenticationHeader = header;
            $http.defaults.headers.common.Authorization = header.Authorization;
        },
        request: function (data) {
            var deferred = $q.defer();
            $http({
                method: data.method,
                headers: authenticationHeader,
                data: data.data,
                params: data.params,
                url: baseUrl + '/' + data.resourceURI
            }).then(function (response) {
                deferred.resolve(response.data);
            }, function (error) {
                deferred.reject(ErrorTransformer.getErrorFromResponse(error));
            });
            return deferred.promise;
        },
        get: function (resourceURI, params, options) {
            return this.request({method: 'GET', resourceURI: resourceURI, params: params, data: {}, options: options});
        },
        post: function (resourceURI, data, options) {
            return this.request({method: 'POST', resourceURI: resourceURI, params: {}, data: data, options: options});
        },
        put: function (resourceURI, data, options) {
            return this.request({method: 'PUT', resourceURI: resourceURI, params: {}, data: data, options: options});
        },
        delete: function (resourceURI, data, options) {
            return this.request({method: 'DELETE', resourceURI: resourceURI, params: {}, data: {}, options: options});
        }
    };
}]);

app.config(['$provide', function ($provide) {
    $provide.decorator('ApiManagerUtil', ['$delegate', '$state', '$q', function ($delegate, $state, $q) {

        var request = $delegate.request;
        $delegate.request = function (data) {
            var deferred = $q.defer();
            request(data).then(function (result) {
                deferred.resolve(result);
            }).catch(function (error) {
                if (error.code == 401) {
                    $state.transitionTo('login');
                }
                deferred.reject(error);
            });
            return deferred.promise;
        };

        return $delegate;
    }]);
}]);