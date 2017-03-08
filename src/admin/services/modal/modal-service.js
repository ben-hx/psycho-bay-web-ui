'use strict';

var app = angular.module('myApp.modal', []);

app.factory('ModalModelService', ['$q', '$uibModal', function ($q, $uibModal) {
    var deferredResult = null;
    var viewSettings = {
        showToolBar: false
    };

    return {
        open: function (data) {
            deferredResult = $q.defer();
            var modalInstance = $uibModal.open({
                size: 'lg',
                backdrop: 'static',
                animation: true,
                templateUrl: '/src/admin/services/modal/modal.html',
                controller: 'ModalCtrl',
                keyboard: false,
                resolve: {
                    data: function () {
                        return data;
                    },
                    viewSettings: function () {
                        return viewSettings;
                    }
                }
            });
            modalInstance.result.then(function (result) {
                viewSettings = result.viewSettings;
                deferredResult.resolve(result.data);
            }).catch(function (error) {
                deferredResult.reject();
            });
            return deferredResult.promise;
        }
    };

}]);

app.controller('ModalCtrl', ['$scope', '$uibModalInstance', 'data', 'viewSettings', function ($scope, $uibModalInstance, data, viewSettings) {

    $scope.data = data;
    $scope.dataLoading = false;
    $scope.viewSettings = viewSettings;

    $scope.ok = function (data) {
        $scope.dataLoading = true;
        $uibModalInstance.close({data: data, viewSettings: $scope.viewSettings});
        $scope.dataLoading = false;
    };

}]);
