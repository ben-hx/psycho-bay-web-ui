'use strict';

var app = angular.module('myApp.my-work', ['ui.bootstrap']);

app.controller('MyWorkCtrl', ['$scope', '$timeout', 'MyWorkRepository', function ($scope, $timeout, MyWorkRepository) {

    $scope.hasSuccessfullySaved = false;

    $scope.load = function () {
        return MyWorkRepository.load().then(function (model) {
            $scope.model = model;
            console.log($scope.model);
        });
    };
    $scope.load();

    $scope.save = function () {
        MyWorkRepository.save($scope.model).then(function (model) {
            $scope.model = model;
            $scope.form.$setPristine();
            $scope.hasSuccessfullySaved = true;
            $timeout(function () {
                $scope.hasSuccessfullySaved = false;
            }, 3000);
        });
    };

    $scope.undo = function () {
        $scope.load().then(function () {
            $scope.form.$setPristine();
            $scope.hasSuccessfullyUndo = true;
            $timeout(function () {
                $scope.hasSuccessfullyUndo = false;
            }, 3000);
        });

    };

    $scope.removeTextItem = function (itemIndex) {
        $scope.form.$setDirty();
        $scope.model.textItems.splice(itemIndex, 1);
    };

    $scope.addTextItem = function () {
        if ($scope.model.textItems.length < 4) {
            $scope.model.textItems.push({text: "", icon: ""});
        }
    };

    $scope.takeTextItemIcon = function (item, iconClass) {
        item.icon = iconClass;
    };


    $scope.tooltipSuccess = function (tooltipOpenValue) {

    };


    console.log("AboutMe");
}]);