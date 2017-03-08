'use strict';

var app = angular.module('myApp.error', ['myApp.notification']);

app.provider('errorHandler', function () {

    function decorate($injector, obj, func) {
        return angular.extend(function () {
            var handler = $injector.get('errorHandler');
            return handler.call(func, obj, arguments);
        }, func);
    }

    var decorator = ['$delegate', '$injector', function ($delegate, $injector) {
        for (var prop in $delegate) {
            if (angular.isFunction($delegate[prop])) {
                $delegate[prop] = decorate($injector, $delegate, $delegate[prop]);
            }
        }
        return $delegate;
    }];

    return {
        decorate: function ($provide, services) {
            angular.forEach(services, function (service) {
                $provide.decorator(service, decorator);
            });
        },

        $get: function ($log, NotificationService) {

            var handler = {
                funcError: function (func, err) {
                    $log.info('Caught error: ' + err);
                    NotificationService.pushError(err);
                },
                call: function (func, self, args) {
                    $log.debug('Function called: ', (func.name || func));

                    var result;
                    try {
                        result = func.apply(self, args);
                    } catch (err) {
                        handler.funcError(func, err);
                        throw err;
                    }

                    var promise = result && result.$promise || result;
                    if (promise && angular.isFunction(promise.then) && angular.isFunction(promise['catch'])) {
                        handler.async(func, promise);
                    }
                    return result;
                },
                async: function (func, promise) {
                    promise['catch'](function (err) {
                        handler.funcError(func, err);
                    });
                    return promise;
                }
            };
            return handler;
        }
    };
});

app.service('ErrorTransformer', ['$state', function ($state) {

    function Error(message, code) {
        this.message = message;
        this.code = code;
    }

    Error.build = function (data) {
        return new Error(
            data.message,
            data.code
        );
    };

    return {
        getErrorFromResponse: function (response) {
            return Error.build(response.data.error);
        }
    };
}]);
