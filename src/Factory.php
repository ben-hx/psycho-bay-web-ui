<?php

namespace BenHx;

use Slim\Views\PhpRenderer;
use Monolog\Logger;
use Monolog\Processor\UidProcessor;
use Monolog\Handler\StreamHandler;

class Factory
{
    private $app;

    private function getSettings()
    {
        return [
            'settings' => [
                'displayErrorDetails' => true,
                'addContentLengthHeader' => false,
                'renderer' => [
                    'template_path' => __DIR__ . '/../templates/',
                ],
                'logger' => [
                    'name' => 'slim-admin',
                    'path' => __DIR__ . '/../logs/app.log',
                    'level' => \Monolog\Logger::DEBUG,
                ],
                'db' => [
                    'path' => __DIR__ . '/../db/',
                    'recoveryFolder' => 'recovery/',
                    'file' => 'data.json',
                ],
                'users' => [
                    'path' => __DIR__ . '/../db/users.json',
                ],
                'jwt' => [
                    'algorithm' => 'HS256',
                    'secret' => getenv("JWT_SECRET"),
                ],
                'img' => [
                    'path' => __DIR__ . '/../assets/img/',
                ],
                'admin' => [
                    'path' => __DIR__ . '/../admin/',
                ],
            ],
        ];
    }

    public function __construct()
    {
        $this->app = new \Slim\App($this->getSettings());
    }

    public function inizializeContainerDI()
    {
        $container = $this->app->getContainer();

        $container['renderer'] = function ($c) {
            $settings = $c->get('settings')['renderer'];
            return new PhpRenderer($settings['template_path']);
        };

        $container['logger'] = function ($c) {
            $settings = $c->get('settings')['logger'];
            $logger = new Logger($settings['name']);
            $logger->pushProcessor(new UidProcessor());
            $logger->pushHandler(new StreamHandler($settings['path'], $settings['level']));
            return $logger;
        };

        $container['jwtAuthentication'] = function ($c) {
            return new \Slim\Middleware\JwtAuthentication([
                "secret" => $c->get('settings')['jwt']['secret'],
                "algorithm" => $c->get('settings')['jwt']['algorithm'],
                "path" => ["/api"],
                "passthrough" => ["/api/token"],
                "callback" => function ($request, $response, $arguments) use ($c) {
                    $c["authenticationService"]->tokenAuthenticate($request, $response, $arguments);
                }
            ]);
        };

        $container['basicAuthentication'] = function ($c) {
            return new \Slim\Middleware\HttpBasicAuthentication([
                "path" => "/api/token",
                "authenticator" => $c["authenticationService"]
            ]);
        };

        $container["authenticationService"] = function ($c) {
            $settings = $c->get('settings');
            return new AuthenticationService($settings['users']['path'], $c['jwtAuthentication']);
        };

        $container['routeController'] = function ($c) {
            return new RouteControllerLoggingDecorator($c, new RouteController($c));
        };

        $container['renderer'] = function ($c) {
            $settings = $c->get('settings')['renderer'];
            return new PhpRenderer($settings['template_path']);
        };

        $container['adminRenderer'] = function ($c) {
            return new PhpRenderer($c->get('settings')['admin']['path']);
        };

        $container['fileUploader'] = function ($c) {
            $settings = $c->get('settings')['img'];
            return new ImageUploader($settings['path']);
        };
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
        $this->app->put('/api/data', 'routeController:putData');
        $this->app->get('/api/data', 'routeController:getData');
        $this->app->get('/api/token', 'routeController:getToken');
        $this->app->post('/api/upload', 'routeController:upload');
    }

    public function inizialize()
    {
        $this->inizializeContainerDI();
        $this->inizializeMiddleware();
        $this->inizializeRoutes();
        $this->app->run();
    }
}