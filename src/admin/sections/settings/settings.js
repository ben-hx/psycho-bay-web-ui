'use strict';

var app = angular.module('myApp.settings', []);

app.factory('SettingsService', ['$q', '$uibModal', function ($q, $uibModal) {
    var deferredResult = null;

    return {
        open: function (data) {
            deferredResult = $q.defer();
            var modalInstance = $uibModal.open({
                size: 'lg',
                backdrop: 'static',
                animation: true,
                templateUrl: '/src/admin/sections/settings/settings.html',
                controller: 'SettingsCtrl',
                keyboard: false
            });
            modalInstance.result.then(function (result) {
                deferredResult.resolve(result);
            }).catch(function (error) {
                deferredResult.reject();
            });
            return deferredResult.promise;
        }
    };

}]);

app.controller('SettingsCtrl', ['$scope', '$uibModalInstance', 'ViewModel', function ($scope, $uibModalInstance, ViewModel) {

    $scope.ViewModel = ViewModel;

    $scope.ok = function (data) {
        $uibModalInstance.close("ok");
    };

}]);

app.controller('SeoCtrl', ['$scope', 'ViewModel', function ($scope, ViewModel) {

    $scope.ViewModel = ViewModel;

    $scope.$on('dirtyChanged', function (event, isDirty) {
        if (!isDirty) {
            $scope.seoForm.$setPristine();
        }
    });

    $scope.$watch('seoForm.$dirty', function (newValue, oldValue) {
        ViewModel.setDirty($scope.seoForm.$dirty);
    }, true);

}]);

app.controller('UpdateUserInfoCtrl', ['$scope', 'UserRepository', function ($scope, UserRepository) {

    UserRepository.getMe().then(function (result) {
        $scope.user = result;
    });

    $scope.updateUser = function (user) {
        UserRepository.updateMe(user).then(function () {
            $scope.updateUserForm.$setPristine();
        });
    }

}]);

app.controller('ChangePasswordCtrl', ['$scope', 'UserRepository', function ($scope, UserRepository) {

    $scope.changePassword = function (oldPassword, newPassword) {
        UserRepository.changePassword(oldPassword, newPassword).then(function () {
            $scope.changePasswordForm.$setPristine();
        });
    }

}]);
