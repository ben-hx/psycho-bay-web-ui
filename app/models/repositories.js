'use strict';

var app = angular.module('myApp.model');

app.factory('AboutMeRepository', ['RepositoryMapper', function (RepositoryMapper) {

    return new RepositoryMapper('about-me');

}]);

app.factory('MyWorkRepository', ['RepositoryMapper', function (RepositoryMapper) {

    return new RepositoryMapper('my-work');

}]);

app.factory('MySurgeryRepository', ['RepositoryMapper', function (RepositoryMapper) {

    return new RepositoryMapper('my-surgery');

}]);

