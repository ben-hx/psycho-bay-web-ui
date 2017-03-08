'use strict';

var app = angular.module('myApp.my-work', ['ui.bootstrap']);

app.controller('MyWorkCtrl', ['$scope', '$timeout', 'config', 'ViewModel', 'ModalModelService', function ($scope, $timeout, config, ViewModel, ModalModelService) {

    $scope.ViewModel = ViewModel;

    $scope.$on('dirtyChanged', function (event, isDirty) {
        if (!isDirty) {
            $scope.form.$setPristine();
        }
    });

    $scope.$watch('form.$dirty', function (newValue, oldValue) {
        ViewModel.setDirty($scope.form.$dirty);
    }, true);

    $scope.removeItem = function (model, itemIndex) {
        $scope.form.$setDirty();
        model.texts.splice(itemIndex, 1);
    };

    $scope.addTextItem = function (model) {
        if (model.texts.length < 4) {
            var textItemDefault = {
                overview: {text: config.textPlaceholder},
                detail: {show: true, text: config.textPlaceholder}
            };
            model.texts.push(textItemDefault);
        }
    };

    $scope.onImagesChange = function () {
        $scope.form.$setDirty();
    };

}]);