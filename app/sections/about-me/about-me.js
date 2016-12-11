'use strict';

var app = angular.module('myApp.about-me', ['ui.bootstrap', 'myApp.modal']);

app.controller('AboutMeCtrl', ['$scope', '$timeout', 'config', 'Repositories', 'ModalModelService', function ($scope, $timeout, config, Repositories, ModalModelService) {

    $scope.hasSuccessfullySaved = false;

    $scope.load = function () {
        return Repositories.sections.aboutMe.load().then(function (model) {
            $scope.model = model;
        });
    };
    $scope.load();

    $scope.save = function () {
        Repositories.sections.aboutMe.save($scope.model).then(function (model) {
            $scope.model = model;
            $scope.form.$setPristine();
            $scope.hasSuccessfullySaved = true;
            $timeout(function () {
                $scope.hasSuccessfullySaved = false;
            }, config.toolTipTimeToDismiss);
        });
    };

    $scope.undo = function () {
        $scope.load().then(function () {
            $scope.form.$setPristine();
            $scope.hasSuccessfullyUndo = true;
            $timeout(function () {
                $scope.hasSuccessfullyUndo = false;
            }, config.toolTipTimeToDismiss);
        });

    };

    $scope.removeItem = function (itemIndex) {
        $scope.form.$setDirty();
        $scope.model.textItemsOverview.splice(itemIndex, 1);
    };

    $scope.addTextItem = function () {
        if ($scope.model.textItemsOverview.length < 4) {
            $scope.model.textItemsOverview.push({text: ""});
        }
    };

    $scope.openMore = function (model) {
        ModalModelService.open();
    };

    $scope.changeIcon = function (model, iconClass) {
        model.icon = iconClass;
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

}]);