'use strict';

var app = angular.module('myApp.model');

app.factory('UserRepository', ['ApiManagerUtil', function (ApiManagerUtil) {

    return {
        changePassword: function (oldPassword, newPassword) {
            var data = {
                oldPassword: oldPassword,
                newPassword: newPassword
            };
            return ApiManagerUtil.put('change_password', data);
        },
        getMe: function () {
            return ApiManagerUtil.get('me');
        },
        updateMe: function (data) {
            return ApiManagerUtil.put('me', data);
        }
    }

}]);

app.config(function (errorHandlerProvider, $provide) {
    errorHandlerProvider.decorate($provide, ['UserRepository']);
});

app.config(['$provide', function ($provide) {
    $provide.decorator('UserRepository', ['$delegate', 'NotificationService', function ($delegate, NotificationService) {

        var changePassword = $delegate.changePassword;
        $delegate.changePassword = function (oldPassword, newPassword) {
            return changePassword(oldPassword, newPassword).then(function (result) {
                NotificationService.pushSuccess({message: 'Passwort geändert!'});
                return result;
            });
        };

        var updateMe = $delegate.updateMe;
        $delegate.updateMe = function (data) {
            return updateMe(data).then(function (result) {
                NotificationService.pushSuccess({message: 'Benutzer geändert!'});
                return result;
            });
        };
        return $delegate;
    }]);
}]);
