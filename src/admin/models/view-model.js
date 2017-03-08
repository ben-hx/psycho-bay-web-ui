'use strict';

var app = angular.module('myApp.model');

app.factory('ViewModel', ['$rootScope', 'ApiManagerUtil', function ($rootScope, ApiManagerUtil) {

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
        reset: function () {
            this.model = {};
            this.isDirty = false;
        },
        undo: function () {
            return this.load();
        }
    }
}]);

app.config(function (errorHandlerProvider, $provide) {
    errorHandlerProvider.decorate($provide, ['ViewModel']);
});

app.config(['$provide', function ($provide) {
    $provide.decorator('ViewModel', ['$delegate', 'NotificationService', function ($delegate, NotificationService) {

        var save = $delegate.save;
        $delegate.save = function () {
            return save().then(function (result) {
                NotificationService.pushSuccess({message: 'Erfolgreich gespeichert!'});
                return result;
            });
        };

        var undo = $delegate.undo;
        $delegate.undo = function () {
            return undo().then(function (result) {
                NotificationService.pushSuccess({message: 'Erfolgreich zurückgesetzt!'});
                return result;
            });
        };

        return $delegate;
    }]);
}]);