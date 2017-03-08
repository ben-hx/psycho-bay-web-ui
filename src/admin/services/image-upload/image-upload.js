'use strict';

var app = angular.module('myApp.image-upload', ['ngFileUpload']);

app.factory('ImageUploadService', ['$q', '$uibModal', function ($q, $uibModal) {
    var deferredResult = null;

    return {
        open: function (data, scope) {
            deferredResult = $q.defer();
            var modalInstance = $uibModal.open({
                size: 'xl',
                backdrop: 'static',
                animation: true,
                templateUrl: '/src/admin/services/image-upload/image-upload.html',
                controller: 'ImageUploadCtrl',
                keyboard: false,
                scope: scope,
                resolve: {
                    data: function () {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function (result) {
                deferredResult.resolve(result.data);
            }).catch(function (error) {
                deferredResult.reject();
            });
            return deferredResult.promise;
        }
    };

}]);

app.controller('ImageUploadCtrl', ['$scope', '$uibModalInstance', 'Upload', 'data', function ($scope, $uibModalInstance, Upload, data) {

    console.log($scope.ngModel);
    $scope.data = data;
    $scope.dataLoading = false;

    $scope.ok = function (data) {
        $scope.dataLoading = true;
        $uibModalInstance.close({data: data});
        $scope.dataLoading = false;
    };

    $scope.onChange = function () {
        if ($scope.data.onChange) {
            $scope.data.onChange($scope.data.images);
        }
    };

    $scope.removeImage = function (index) {
        $scope.data.images.splice(index, 1);
        $scope.onChange();
    };

    $scope.$watch('form.$dirty', function (newValue, oldValue) {
        if (newValue === true) {
            $scope.onChange();
        }
    }, true);

    $scope.upload = function (file) {
        if (file && !file.$error) {
            Upload.upload({
                url: $scope.data.uploadUrl,
                data: {
                    file: file
                }
            }).then(function (response) {
                $scope.data.images.push({src: response.data.files[0], title: '', alt: ''});
                $scope.onChange();
            }, function (error) {
                if ($scope.data.onError) {
                    $scope.data.onError({error: error});
                }
            }, function (event) {
                $scope.fileUploadValue = parseInt(100.0 * event.loaded / event.total);
                if ($scope.data.onProgress) {
                    $scope.data.onProgress({event: event});
                }
            });
        }
    };

}]);
