'use strict';

var app = angular.module('myApp.model');

app.factory('ViewModel', ['$q', '$rootScope', 'Repository', function ($q, $rootScope, Repository) {

    var repo = new Repository();

    return {
        isDirty: false,
        model: {},
        setDirty: function (value) {
            this.isDirty = value;
            $rootScope.$broadcast('dirtyChanged', this.isDirty);
        },
        load: function () {
            var self = this;
            return repo.load().then(function (data) {
                self.model = data;
                self.setDirty(false);
                return data;
            });
        },
        save: function () {
            var self = this;
            return repo.save(self.model).then(function (data) {
                self.model = data;
                self.setDirty(false);
                return data;
            });
        },
        undo: function () {
            return this.load();
        }
    }

}]);