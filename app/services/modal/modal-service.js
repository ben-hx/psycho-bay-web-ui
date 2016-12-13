'use strict';

var app = angular.module('myApp.modal', []);

app.factory('ModalModelService', ['$q', '$location', '$uibModal', function ($q, $location, $uibModal) {
    var deferredResult = null;

    return {
        open: function (data) {
            deferredResult = $q.defer();
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'services/modal/modal.html',
                controller: 'ModalCtrl',
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

app.controller('ModalCtrl', ['$scope', '$uibModalInstance', '$uibModal', 'AuthenticationService', function ($scope, $uibModalInstance, $uibModal, AuthenticationService) {

    $scope.dataLoading = false;
    $scope.error = {show: false, message: ""};

    $scope.ok = function (formData) {
        $scope.dataLoading = true;
        $uibModalInstance.close(formData);
        $scope.dataLoading = false;
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}]);
