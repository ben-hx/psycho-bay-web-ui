'use strict';

var app = angular.module('myApp.model');

app.factory('Repository', ['$http', '$q', function ($http, $q) {

    function loadFromServer() {
        return $http.get('http://localhost:8000/db/data.json')
            .then(function (data) {
                return data.data;
            });
    }

    function saveToServer() {
        return $http.post('http://localhost:8000/db/data.json')
            .then(function (data) {
                return data.data[key];
            });
    }

    function Repository() {
    }

    Repository.prototype.save = function (data) {
        var deferred = $q.defer();
        //$cookieStore.put(this.key, data);
        deferred.resolve(data);
        return deferred.promise;
    };

    Repository.prototype.load = function () {
        return loadFromServer();
    };

    return Repository;

}]);

