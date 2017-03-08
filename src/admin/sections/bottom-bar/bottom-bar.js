'use strict';

var app = angular.module('myApp.bottom-bar', ['ui.bootstrap', 'myApp.model', 'myApp.settings', 'myApp.confirmation']);

app.controller('BottomBarCtrl', ['$scope', '$q', '$timeout', 'config', 'AuthenticationService', 'ViewModel', 'SettingsService', 'ConfirmationViewManager', function ($scope, $q, $timeout, config, AuthenticationService, ViewModel, SettingsService, ConfirmationViewManager) {

    $scope.init = function () {
        ViewModel.load();
        $scope.ViewModel = ViewModel;
        $scope.hideSaving = true;
        $scope.isDirty = false;
        $scope.tooltips = {logout: true, onlineOffline: true, settings: true, undo: true, save: true};
    };

    $scope.hideTooltips = function () {
        $scope.tooltips = {logout: false, onlineOffline: false, settings: false, undo: false, save: false};
    };

    $scope.$on('dirtyChanged', function (event, isDirty) {
        if (isDirty) {
            if ($scope.dismissTooltip) {
                $timeout.cancel($scope.dismissTooltip);
            }
            $scope.isDirty = true;
        } else {
            $scope.dismissTooltip = $timeout(function () {
                $scope.isDirty = false;
            }, config.toolTipTimeToDismiss);
        }
    });

    $scope.online = function () {
        ViewModel.model.settings.online = !ViewModel.model.settings.online;
        ViewModel.save().then(function () {
            $scope.hasOnlineSet = true;
            $timeout(function () {
                $scope.hasOnlineSet = false;
            }, config.toolTipTimeToDismiss);
        });
    };

    $scope.settings = function () {
        $scope.settingsIsOpen = true;
        SettingsService.open().then(function () {
            $scope.settingsIsOpen = false;
        });
    };

    $scope.logout = function () {
        if (!ViewModel.isDirty) {
            AuthenticationService.logout();
        } else {
            ConfirmationViewManager.show({
                bodyText: "Vor dem Ausloggen speichern?",
                okCaption: "Ja",
                cancelCaption: "Nein"
            }).then(function () {
                ViewModel.save().then(function () {
                    AuthenticationService.logout();
                });
            }).catch(function () {
                AuthenticationService.logout();
            });
        }
    };

    $scope.save = function () {
        ViewModel.save().then(function () {
            $scope.hasSuccessfullySaved = true;
            $timeout(function () {
                $scope.hasSuccessfullySaved = false;
            }, config.toolTipTimeToDismiss);
        });
    };

    $scope.undo = function () {
        ViewModel.undo().then(function () {
            $scope.hasSuccessfullyUndo = true;
            $timeout(function () {
                $scope.hasSuccessfullyUndo = false;
            }, config.toolTipTimeToDismiss);
        });
    };

}]);