'use strict';

angular.module('myApp', [
    'ngAnimate',
    'duScroll',
    'ui.router',
    'angular-loading-bar',
    'myApp.directives',
    'myApp.authentication',
    'myApp.navigation',
    'myApp.progress',
    'myApp.loadingIndicator',
    'myApp.services',
    'myApp.login',
    'myApp.home',
    'myApp.footer',
    'myApp.config'
]).config(['$qProvider', 'cfpLoadingBarProvider', function ($qProvider, cfpLoadingBarProvider) {
    $qProvider.errorOnUnhandledRejections(false);
    cfpLoadingBarProvider.includeSpinner = false;
}]).run(['$rootScope', 'cfpLoadingBar', 'AuthenticationService', 'ProgressService', function ($rootScope, cfpLoadingBar, AuthenticationService, ProgressService) {

    $rootScope.$on('cfpLoadingBar:loading', function (object) {
        ProgressService.pushProgress();
    });

    $rootScope.$on('cfpLoadingBar:loaded', function (object) {
        ProgressService.popProgress();
    });

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        ProgressService.pushProgress();
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        ProgressService.popProgress();
    });

    AuthenticationService.initialize();
    cfpLoadingBar.start();
}]);
