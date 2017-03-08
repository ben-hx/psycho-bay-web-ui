<?php

namespace BenHx;

class RouteController
{
    private $container;

    public function __construct($container)
    {
        $this->container = $container;
    }

    public function renderPublic($request, $response, $args)
    {
        $fileWithPath = $this->container->get('settings')['db']['path'] . $this->container->get('settings')['db']['file'];
        $data = json_decode(file_get_contents($fileWithPath), true);
        return $this->container->get('publicRenderer')->render($response, 'index.html', [
            "data" => $data
        ]);
    }

    public function renderAdmin($request, $response, $args)
    {
        return $this->container->get('adminRenderer')->render($response, 'index.html', $args);
    }

    public function getData($request, $response, $args)
    {
        $fileWithPath = $this->container->get('settings')['db']['path'] . $this->container->get('settings')['db']['file'];
        $data = json_decode(file_get_contents($fileWithPath), true);
        return $response->withJson($data);
    }

    private function recoverData()
    {
        $fileWithPath = $this->container->get('settings')['db']['path'] . $this->container->get('settings')['db']['file'];
        $recoveryFolderPath = $this->container->get('settings')['db']['path'] . $this->container->get('settings')['db']['recoveryFolder'];
        $explodedFileName = explode('.', $this->container->get('settings')['db']['file']);
        $fileName = $explodedFileName[0];
        $fileExt = $explodedFileName[1];
        $recoveryfileWithPath = $recoveryFolderPath . $fileName . "_" . time() . "." . $fileExt;
        if (!is_dir($recoveryFolderPath)) {
            mkdir($recoveryFolderPath);
        }
        rename($fileWithPath, $recoveryfileWithPath);
    }

    public function putData($request, $response, $args)
    {
        $fileWithPath = $this->container->get('settings')['db']['path'] . $this->container->get('settings')['db']['file'];
        $this->recoverData();
        $content = $request->getBody();
        $data = file_put_contents($fileWithPath, $content);
        return $response->withJson(json_decode($content));
    }

    public function upload($request, $response, $args)
    {
        $files = $request->getUploadedFiles();
        $result['files'] = array();

        foreach ($files as $file) {
            $fileName = $this->container->get('fileUploader')->moveAndGetPath($file);
            array_push($result['files'], $fileName);
        }
        return $response->withJson($result);
    }

    public function getToken($request, $response, $args)
    {
        $data['token'] = $this->container->get('authenticationService')->getToken();
        return $response->withJson($data);
    }

    public function changePassword($request, $response, $args)
    {
        $content = json_decode($request->getBody(), true);
        $currentUser = $this->container->get('authenticationService')->getCurrentUser();
        $userRepository = $this->container->get('userRepository');
        $userRepository->changeUserPassword($currentUser, $content['oldPassword'], $content['newPassword']);
        return $response->withJson($userRepository->userToResponse($currentUser));
    }

    public function updateMe($request, $response, $args)
    {
        $content = json_decode($request->getBody(), true);
        $currentUser = $this->container->get('authenticationService')->getCurrentUser();
        $userRepository = $this->container->get('userRepository');
        $updatedUser = $userRepository->updateUser($currentUser, $content);
        return $response->withJson($userRepository->userToResponse($updatedUser));
    }

    public function getMe($request, $response, $args)
    {
        $currentUser = $this->container->get('authenticationService')->getCurrentUser();
        $userRepository = $this->container->get('userRepository');
        return $response->withJson($userRepository->userToResponse($currentUser));
    }
}