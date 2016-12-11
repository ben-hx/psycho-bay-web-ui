'use strict';

var app = angular.module('myApp.modal', []);

app.factory('ModalModelService', ['$q', '$location', '$uibModal', function ($q, $location, $uibModal) {
    var deferredResult = null;

    return {
        open: function () {
            deferredResult = $q.defer();
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'services/modal/modal.html',
                controller: 'LoginCtrl',
                keyboard: false
            });
            modalInstance.result.then(function () {
                deferredResult.resolve();
            }).catch(function (error) {
                deferredResult.reject();
            });
            return deferredResult.promise;
        }
    };

}]);

app.controller('LoginCtrl', ['$scope', '$uibModalInstance', '$uibModal', 'AuthenticationService', function ($scope, $uibModalInstance, $uibModal, AuthenticationService) {

    $scope.dataLoading = false;
    $scope.error = {show: false, message: ""};

    $scope.login = function (formData) {
        $scope.dataLoading = true;
        AuthenticationService.login(formData.email, formData.password).then(function (user) {
            $uibModalInstance.close(user);
        }, function (error) {
            $scope.error.show = true;
            $scope.error.message = error.message;
        }).finally(function () {
            $scope.dataLoading = false;
        });
    };

    $scope.register = function () {
        $uibModalInstance.dismiss('register');
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}]);

app.controller('RegisterCtrl', ['$scope', '$uibModalInstance', 'AuthenticationService', function ($scope, $uibModalInstance, AuthenticationService) {

    $scope.dataLoading = false;
    $scope.error = {show: false, message: ""};

    $scope.login = function (formData) {
        $scope.dataLoading = true;
        AuthenticationService.register(formData.email, formData.password).then(function (user) {
            $uibModalInstance.close(user);
        }, function (error) {
            $scope.error.show = true;
            $scope.error.message = error.message;
        }).finally(function () {
            $scope.dataLoading = false;
        });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}]);