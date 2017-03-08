var app = angular.module('myApp.loadingIndicator', []);

app.controller('LoadingIndicatorCtrl', ['$scope', '$rootScope', '$timeout', 'ProgressService', function ($scope, $rootScope, $timeout, ProgressService) {

    $scope.ProgressService = ProgressService;

    var splashScreenDisplayTime = 500;

    $rootScope.$on('progressPushed', function (args, hasProgresses) {
        $scope.hideScreen = false;
    });

    $rootScope.$on('progressPopped', function (args, hasProgresses) {
        if (!hasProgresses) {
            $timeout(function () {
                $scope.hideScreen = true;
            }, splashScreenDisplayTime);
        }
    });

}]);