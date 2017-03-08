<?php
/**
 * Created by PhpStorm.
 * User: Ben
 * Date: 20.12.2016
 * Time: 13:27
 */

namespace BenHx;


class RouteControllerLoggingDecorator extends RouteController
{
    private $container;
    private $controller;
    private $logger;
    private $authenticationService;

    public function __construct($container, $controller)
    {
        $this->controller = $controller;
        $this->logger = $container->get('logger');
        $this->authenticationService = $container->get('authenticationService');
    }

    private function getCurrentUserLoggingString()
    {
        return json_encode($this->authenticationService->getCurrentUser()['username']);
    }

    public function renderPublic($request, $response, $args)
    {
        $this->logger->info("renderPublic() for user " . $this->getCurrentUserLoggingString());
        return $this->controller->renderPublic($request, $response, $args);
    }

    public function renderAdmin($request, $response, $args)
    {
        $this->logger->info("renderAdmin() for user " . $this->getCurrentUserLoggingString());
        return $this->controller->renderAdmin($request, $response, $args);
    }

    public function upload($request, $response, $args)
    {
        $this->logger->info("upload() for user " . $this->getCurrentUserLoggingString());
        return $this->controller->upload($request, $response, $args);
    }

    public function getData($request, $response, $args)
    {
        $this->logger->info("getData() for user " . $this->getCurrentUserLoggingString());
        return $this->controller->getData($request, $response, $args);
    }

    public function putData($request, $response, $args)
    {
        $this->logger->info("putData() for user " . $this->getCurrentUserLoggingString());
        return $this->controller->putData($request, $response, $args);
    }

    public function getToken($request, $response, $args)
    {
        $this->logger->info("getToken for user " . $this->getCurrentUserLoggingString());
        return $this->controller->getToken($request, $response, $args);
    }

    public function changePassword($request, $response, $args)
    {
        $this->logger->info("changePassword for user " . $this->getCurrentUserLoggingString());
        return $this->controller->changePassword($request, $response, $args);
    }

    public function updateMe($request, $response, $args)
    {
        $this->logger->info("updateMe for user " . $this->getCurrentUserLoggingString());
        return $this->controller->updateMe($request, $response, $args);
    }

    public function getMe($request, $response, $args)
    {
        $this->logger->info("getMe for user " . $this->getCurrentUserLoggingString());
        return $this->controller->getMe($request, $response, $args);
    }
}