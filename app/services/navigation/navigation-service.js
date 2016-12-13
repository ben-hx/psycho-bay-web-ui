'use strict';

var app = angular.module('myApp.navigation');

app.config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.otherwise("/");
    //$locationProvider.html5Mode(true);

}]);

app.run(['$rootScope', '$state', 'AuthenticationService', function ($rootScope, $state, AuthenticationService) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

    });
}]);

app.factory('NavigationElement', function () {

    function NavigationElement(data) {
        this.name = data.name;
        this.caption = data.caption;
        if (data.anchor) {
            this.anchor = data.anchor;
        }
        this.goToState = data.goToState;
        this.clickHandler = data.clickHandler;
    }

    NavigationElement.prototype.changeRoute = function () {
        return (this.goToState ? true : false);
    };

    NavigationElement.build = function (data) {
        return new NavigationElement(data);
    };

    return NavigationElement;
});


app.factory('NavigationService', ['$state', '$location', '$anchorScroll', 'NavigationElement', 'AuthenticationService', function ($state, $location, $anchorScroll, NavigationElement, AuthenticationService) {

    var aboutMe = NavigationElement.build({
        name: 'about-me',
        caption: 'Über mich',
        goToState: 'home',
        anchor: 'about-me',
        clickHandler: function () {
            $state.go('home').then(function () {
                $location.hash('about-me');
                $anchorScroll();
            });
        }
    });

    var myWork = NavigationElement.build({
        name: 'my-work',
        caption: 'Meine Arbeit',
        goToState: 'home',
        anchor: 'my-work',
        clickHandler: function () {
            $state.go('home').then(function () {
                $location.hash('my-work');
                $anchorScroll();
            });
        }
    });

    var mySurgery = NavigationElement.build({
        name: 'my-surgery',
        caption: 'Praxis',
        goToState: 'home',
        anchor: 'my-surgery',
        clickHandler: function () {
            $state.go('home').then(function () {
                $location.hash('my-surgery');
                $anchorScroll();
            });
        }
    });

    var getNavigationElements = function () {
        return [
            aboutMe,
            myWork,
            mySurgery
        ];

        /*
         if (AuthenticationService.isLoggedIn()) {
         return [
         aboutMe,
         myWork,
         mySurgery
         ];
         } else {
         return [loginElement]
         }
         */
    };

    return {
        navigationElements: getNavigationElements
    };

}]);


app.controller('NavigationCtrl', ['$scope', '$state', 'NavigationService', function ($scope, $state, NavigationService) {

    $scope.navigationElements = NavigationService.navigationElements;

}]);