'use strict';

var app = angular.module('myApp.model');

app.factory('ViewModel', ['$q', '$rootScope', 'Repositories', function ($q, $rootScope, Repositories) {

    var model = {
        landing: {},
        sections: {
            aboutMe: {}
        }
    };

    return {
        isDirty: false,
        model: model,
        setDirty: function (value) {
            this.isDirty = value;
            $rootScope.$broadcast('dirtyChanged', this.isDirty);
        },
        load: function () {
            var self = this;
            var promises = [];
            promises.push(Repositories.sections.aboutMe.load().then(function (value) {
                model.sections.aboutMe = value || {};
            }));
            promises.push(Repositories.sections.myWork.load().then(function (value) {
                model.sections.myWork = value || {};
            }));

            promises.push(Repositories.sections.mySurgery.load().then(function (value) {
                model.sections.mySurgery = value || {};
            }));

            promises.push(Repositories.sections.location.load().then(function (value) {
                model.sections.location = value || {};
            }));

            promises.push(Repositories.landing.load().then(function (value) {
                model.landing = value || {};
            }));

            promises.push(Repositories.footer.load().then(function (value) {
                model.footer = value || {};
            }));

            return $q.all(promises).then(function () {
                self.setDirty(false);
            });
        },
        save: function () {
            var self = this;
            var promises = [];
            for (var key in model.sections) {
                var repository = Repositories.sections[key];
                if (repository) {
                    promises.push(repository.save(model.sections[key]));
                }
            }
            promises.push(Repositories.landing.save(model.landing));
            promises.push(Repositories.footer.save(model.footer));
            return $q.all(promises).then(function () {
                self.setDirty(false);
            });
        },
        undo: function () {
            return this.load();
        }
    }

}]);