'use strict';

var app = angular.module('myApp.body', ['ui.bootstrap']);

app.controller('BodyCtrl', ['$scope', '$q', '$timeout', 'config', 'Repositories', function ($scope, $q, $timeout, config, Repositories) {

    $scope.repositories = Repositories;
    $scope.model = {sections: {}};

    $scope.$watch('form.$dirty', function (newValue, oldValue) {
        Repositories.setDirty($scope.form.$dirty);
    }, true);

    $scope.load = function () {

        function loadModelFromRepository(repoName, repository) {
            return repository.load().then(function (model) {
                $scope.model.sections[repoName] = model || {};
            });
        }

        var promises = [];
        for (var repoName in Repositories.sections) {
            var repository = Repositories.sections[repoName];
            promises.push(loadModelFromRepository(repoName, repository));
        }

        promises.push(Repositories.landing.load().then(function (model) {
            $scope.model.landing = model || {};
        }));

        return $q.all(promises);
    };
    $scope.load();

    $scope.save = function () {
        var promises = [];
        for (var key in $scope.model.sections) {
            var repository = Repositories.sections[key];
            if (repository) {
                promises.push(repository.save($scope.model.sections[key]));
            }
        }
        promises.push(Repositories.landing.save($scope.model.landing));
        $q.all(promises).then(function () {
            $scope.hasSuccessfullySaved = true;
            $timeout(function () {
                $scope.form.$setPristine();
                $scope.hasSuccessfullySaved = false;
            }, config.toolTipTimeToDismiss);
        });
    };

    $scope.undo = function () {
        $scope.load().then(function () {
            $scope.hasSuccessfullyUndo = true;
            $timeout(function () {
                $scope.form.$setPristine();
                $scope.hasSuccessfullyUndo = false;
            }, config.toolTipTimeToDismiss);
        });

    };

    $scope.onImageUploadSuccess = function (response, model) {
        console.log("transform response to model");
        $timeout(function () {
            $scope.fileUploadValue = undefined;
            $scope.form.$setDirty();
        }, config.toolTipTimeToDismiss);
    };

    $scope.onImageUploadProgress = function (event) {
        $scope.fileUploadValue = parseInt(100.0 * event.loaded / event.total);
    };

    $scope.changeIcon = function (model, iconClass) {
        model.icon = iconClass;
        $scope.form.$setDirty();
    };

    $scope.removeItem = function (model, itemIndex) {
        $scope.form.$setDirty();
        model.textItemsOverview.splice(itemIndex, 1);
    };

    $scope.addTextItem = function (model) {
        if (model.textItemsOverview.length < 4) {
            model.textItemsOverview.push({text: ""});
        }
    };

    $scope.openMore = function (model) {
        ModalModelService.open();
    };

}]);