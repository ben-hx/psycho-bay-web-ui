'use strict';

var app = angular.module('myApp.model');

app.factory('Repositories', ['RepositoryMapper', function (RepositoryMapper) {

    var isDirty = false;

    return {
        landing: new RepositoryMapper('landing'),
        footer: new RepositoryMapper('footer'),
        sections: {
            aboutMe: new RepositoryMapper('about-me'),
            myWork: new RepositoryMapper('my-work'),
            mySurgery: new RepositoryMapper('my-surger'),
            location: new RepositoryMapper('location'),
        },
        setDirty: function (value) {
            isDirty = value;
        }
    }

}]);


app.factory('AboutMeRepository', ['RepositoryMapper', function (RepositoryMapper) {

    return new RepositoryMapper('about-me');

}]);

app.factory('MyWorkRepository', ['RepositoryMapper', function (RepositoryMapper) {

    return new RepositoryMapper('my-work');

}]);

app.factory('MySurgeryRepository', ['RepositoryMapper', function (RepositoryMapper) {

    return new RepositoryMapper('my-surgery');

}]);

