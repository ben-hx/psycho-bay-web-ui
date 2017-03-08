'use strict';

var app = angular.module('myApp.model');

app.factory('ApiManagerUtil', ['$q', '$http', 'config', 'ErrorTransformer', function ($q, $http, config, ErrorTransformer) {

    var baseUrl = config.apiUrl;
    var authenticationHeader;

    var request = function (data) {
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
    };

    return {
        setDefaultHeaders: function (header) {
            authenticationHeader = header;
            $http.defaults.headers.common.Authorization = header.Authorization;
        },
        get: function (resourceURI, params, options) {
            return request({method: 'GET', resourceURI: resourceURI, params: params, data: {}, options: options});
        },
        post: function (resourceURI, data, options) {
            return request({method: 'POST', resourceURI: resourceURI, params: {}, data: data, options: options});
        },
        put: function (resourceURI, data, options) {
            return request({method: 'PUT', resourceURI: resourceURI, params: {}, data: data, options: options});
        },
        delete: function (resourceURI, data, options) {
            return request({method: 'DELETE', resourceURI: resourceURI, params: {}, data: {}, options: options});
        }
    };
}]);