'use strict';

var app = angular.module('myApp.home', ['myApp.model', 'myApp.bottom-bar', 'myApp.landing', 'myApp.about-me', 'myApp.my-work', 'myApp.my-surgery']);

app.config(['$stateProvider', function ($stateProvider) {

    $stateProvider.state('home', {
        url: '/',
        views: {
            '': {
                templateUrl: '/src/admin/sections/home/home.html',
                controller: 'HomeCtrl'
            },
            'bottom-bar@home': {
                templateUrl: '/src/admin/sections/bottom-bar/bottom-bar.html',
                controller: 'BottomBarCtrl'
            },
            'landing@home': {
                templateUrl: '/src/admin/sections/landing/landing.html',
                controller: 'LandingCtrl'
            },
            'about-me@home': {
                templateUrl: '/src/admin/sections/about-me/about-me.html',
                controller: 'AboutMeCtrl'
            },
            'my-work@home': {
                templateUrl: '/src/admin/sections/my-work/my-work.html',
                controller: 'MyWorkCtrl'
            },
            'my-surgery@home': {
                templateUrl: '/src/admin/sections/my-surgery/my-surgery.html',
                controller: 'MySurgeryCtrl'
            },
            'footer@home': {
                templateUrl: '/src/admin/sections/footer/footer.html',
                controller: 'FooterCtrl'
            }
        },
        params: {
            anchor: ''
        }
    });
}]);

app.controller('HomeCtrl', ['$scope', '$rootScope', 'config', function ($scope, $rootScope, config) {
    $rootScope.config = config;
}]);