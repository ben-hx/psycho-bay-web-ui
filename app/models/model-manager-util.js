var app = angular.module('myApp.model');

app.factory('RepositoryMapper', ['$cookieStore', '$q', '$http', function ($cookieStore, $q, $http) {

    function loadFromServer(key) {
        return $http.get(' http://localhost:8000/db/data.json')
            .then(function (data) {
                return data.data[key];
            });
    }

    function saveToServer(key) {
        return $http.post(' http://localhost:8000/db/data.json')
            .then(function (data) {
                return data.data[key];
            });
    }

    function RepositoryMapper(key) {
        this.key = key;
    }

    RepositoryMapper.prototype.save = function (data) {
        var deferred = $q.defer();
        $cookieStore.put(this.key, data);
        deferred.resolve(data);
        return deferred.promise;
    };

    RepositoryMapper.prototype.load = function () {
        var data = $cookieStore.get(this.key);
        if (!data) {
            return loadFromServer(this.key);
        } else {
            var deferred = $q.defer();
            deferred.resolve(data);
            return deferred.promise;
        }
    };

    return RepositoryMapper;
}]);