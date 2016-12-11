'use strict';

var app = angular.module('myApp.home', ['myApp.model', 'myApp.landing', 'myApp.about-me', 'myApp.my-work', 'myApp.my-surgery']);

app.config(['$stateProvider', function ($stateProvider) {

    $stateProvider.state('home', {
        url: '/',
        views: {
            '': {
                templateUrl: 'sections/home/home.html',
                controller: 'HomeCtrl'
            },
            'landing@home': {
                templateUrl: '/sections/landing/landing.html',
                controller: 'LandingCtrl'
            },
            'about-me@home': {
                templateUrl: '/sections/about-me/about-me.html',
                controller: 'AboutMeCtrl'
            },
            'my-work@home': {
                templateUrl: '/sections/my-work/my-work.html',
                controller: 'MyWorkCtrl'
            },
            'my-surgery@home': {
                templateUrl: '/sections/my-surgery/my-surgery.html',
                controller: 'MySurgeryCtrl'
            },
            'footer@home': {
                templateUrl: '/sections/footer/footer.html',
                controller: 'FooterCtrl'
            }
        },
        params: {
            anchor: '#test'
        }
    });
}]);

app.controller('HomeCtrl', ['$scope', '$state', '$window', function ($scope, $state, $window) {

}]);