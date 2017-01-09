'use strict';

var app = angular.module('myApp.model');

app.factory('ViewModel', ['$q', '$rootScope', 'ApiManagerUtil', function ($q, $rootScope, ApiManagerUtil) {

    return {
        isDirty: false,
        model: {},
        setDirty: function (value) {
            this.isDirty = value;
            $rootScope.$broadcast('dirtyChanged', this.isDirty);
        },
        load: function () {
            var self = this;
            return ApiManagerUtil.get('data').then(function (data) {
                self.model = data;
                self.setDirty(false);
                return data;
            });
        },
        save: function () {
            var self = this;
            return ApiManagerUtil.put('data', self.model).then(function (data) {
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