'use strict';

var app = angular.module('myApp.about-me', ['ui.bootstrap', 'myApp.modal']);

app.controller('AboutMeCtrl', ['$scope', '$timeout', 'config', 'ViewModel', 'ModalModelService', function ($scope, $timeout, config, ViewModel, ModalModelService) {
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
            model.texts.push({overview: "Hier kommt ein neuer Text!", detail: "Hier kommt ein neuer Text!"});
        }
    };

    $scope.openMore = function (textModel) {
        ModalModelService.open(textModel.detail).then(function (data) {
            if (textModel.detail != data) {
                textModel.detail = data;
                $scope.form.$setDirty();
            }
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

}]);