<?php

namespace BenHx;

use BenHx\Exceptions\UnauthorizedException;
use Slim\Http\Headers;
use Monolog\Logger;
use Monolog\Processor\UidProcessor;
use Monolog\Handler\StreamHandler;

class Factory
{
    private $app;
    private $config;

    private function getEnv($name)
    {
        $prefix = 'REDIRECT_';
        $result = getenv($name);
        if (!$result) {
            $result = getenv($prefix . $name);
        }
        return $result;
    }

    private function getSettings()
    {
        $result = array(
            'displayErrorDetails' => true,
            'addContentLengthHeader' => false,
            'logger' => [
                'name' => 'slim-admin',
                'path' => __DIR__ . '/../../logs/app.log',
                'level' => \Monolog\Logger::DEBUG,
            ],
            'db' => [
                'path' => __DIR__ . '/../../db/',
                'recoveryFolder' => 'recovery/',
                'file' => 'data.json',
            ],
            'users' => [
                'path' => __DIR__ . '/../../db/users.json',
            ],
            'jwt' => [
                'algorithm' => $this->getEnv('JWT_ALGORITHM'),
                'secret' => $this->getEnv('JWT_SECRET'),
            ],
            'img' => [
                'path' => __DIR__ . '/../../assets/imgs/',
            ],
            'adminRenderer' => [
                'path' => __DIR__ . '/../../src/admin/'
            ],
            'publicRenderer' => [
                'path' => __DIR__ . '/../../src/public/'
            ],
            'maintenanceRenderer' => [
                'path' => __DIR__ . '/../../src/maintenance/'
            ],

        );
        $result = array_merge($result, $this->config);
        return array('settings' => $result);
    }

    private function getRendererForPath($path)
    {
        $c = $this->app->getContainer();
        $view = new \Slim\Views\Twig($path);
        $basePath = rtrim(str_ireplace('index.php', '', $c['request']->getUri()->getBasePath()), '/');
        $view->addExtension(new \Slim\Views\TwigExtension($c['router'], $basePath));
        return $view;
    }

    private function isOnline()
    {
        $container = $this->app->getContainer();
        $fileWithPath = $container->get('settings')['db']['path'] . $container->get('settings')['db']['file'];
        $data = json_decode(file_get_contents($fileWithPath), true);
        return $data['settings']['online'];
    }

    public function __construct($config)
    {
        $this->config = $config;
        $this->app = new \Slim\App($this->getSettings());
    }

    private function unauthorizedErrorHandler($request, $response, $arguments)
    {
        $container = $this->app->getContainer();
        $container["errorService"]->responseFromException($request, $response, new UnauthorizedException(implode(",", $arguments)));
    }

    public function inizializeContainerDI()
    {
        $container = $this->app->getContainer();

        $container['logger'] = function ($c) {
            $settings = $c->get('settings')['logger'];
            $logger = new Logger($settings['name']);
            $logger->pushProcessor(new UidProcessor());
            $logger->pushHandler(new StreamHandler($settings['path'], $settings['level']));
            return $logger;
        };

        $container['errorHandler'] = function ($c) {
            return function ($request, $response, $exception) use ($c) {
                return $c["errorService"]->responseFromException($request, $response, $exception);
            };
        };

        $container['errorService'] = function ($c) {
            return new ErrorService();
        };

        $container['response'] = function ($container) {
            $headers = new Headers();
            $response = new ApiResponse();
            return $response->withProtocolVersion($container->get('settings')['httpVersion']);
        };

        $container['jwtAuthentication'] = function ($c) {
            return new \Slim\Middleware\JwtAuthentication([
                "secure" => false,
                "secret" => $c->get('settings')['jwt']['secret'],
                "algorithm" => $c->get('settings')['jwt']['algorithm'],
                "path" => ["/api"],
                "logger" => $c["logger"],
                "passthrough" => ["/api/token"],
                "callback" => function ($request, $response, $arguments) use ($c) {
                    $c["authenticationService"]->tokenAuthenticate($arguments["decoded"]);
                },
                "error" => function ($request, $response, $arguments) {
                    $this->unauthorizedErrorHandler($request, $response, $arguments);
                }
            ]);
        };

        $container['basicAuthentication'] = function ($c) {
            return new \Slim\Middleware\HttpBasicAuthentication([
                "secure" => false,
                "path" => "/api/token",
                "logger" => $c["logger"],
                "authenticator" => $c["authenticationService"],
                "environment" => "REDIRECT_HTTP_AUTHORIZATION",
                "error" => function ($request, $response, $arguments) {
                    $this->unauthorizedErrorHandler($request, $response, $arguments);
                }
            ]);
        };

        $container["userRepository"] = function ($c) {
            return new UserRepository($c->get('settings')['users']['path']);
        };

        $container["authenticationService"] = function ($c) {
            return new AuthenticationService($c['userRepository'], $c['jwtAuthentication']);
        };

        $container['routeController'] = function ($c) {
            return new RouteControllerLoggingDecorator($c, new RouteController($c));
        };

        $container['publicRenderer'] = function ($c) {
            if (!$this->isOnline()) {
                return $this->getRendererForPath($c->get('settings')['maintenanceRenderer']['path']);
            }
            return $this->getRendererForPath($c->get('settings')['publicRenderer']['path']);
        };

        $container['adminRenderer'] = function ($c) {
            $view = new \Slim\Views\Twig($c->get('settings')['adminRenderer']['path']);
            $basePath = rtrim(str_ireplace('index.php', '', $c['request']->getUri()->getBasePath()), '/');
            $view->addExtension(new \Slim\Views\TwigExtension($c['router'], $basePath));
            return $view;
        };

        $container['fileUploader'] = function ($c) {
            $settings = $c->get('settings')['img'];
            return new ImageUploader($settings['path']);
        };
    }

    public function getApp()
    {
        return $this->app;
    }

    public function inizializeMiddleware()
    {
        $container = $this->app->getContainer();
        $this->app->add($container["jwtAuthentication"]);
        $this->app->add($container["basicAuthentication"]);
    }

    public function inizializeRoutes()
    {
        $this->app->get('/', 'routeController:renderPublic');
        $this->app->get('/admin[/{params:.*}]', 'routeController:renderAdmin');
        $this->app->get('/api/data', 'routeController:getData');
        $this->app->put('/api/data', 'routeController:putData');
        $this->app->get('/api/token', 'routeController:getToken');
        $this->app->post('/api/upload', 'routeController:upload');
        $this->app->put('/api/change_password', 'routeController:changePassword');
        $this->app->get('/api/me', 'routeController:getMe');
        $this->app->put('/api/me', 'routeController:updateMe');
    }

    public function inizialize()
    {
        $this->inizializeContainerDI();
        $this->inizializeMiddleware();
        $this->inizializeRoutes();
        $this->app->run();
    }
}