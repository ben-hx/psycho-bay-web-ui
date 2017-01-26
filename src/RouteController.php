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
        return $this->container->get('publicRenderer')->render($response, 'public-index.phtml', [
            "data" => $data
        ]);
    }

    public function renderAdmin($request, $response, $args)
    {
        return $this->container->get('adminRenderer')->render($response, 'index.html', $args);
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

    public function getData($request, $response, $args)
    {
        $fileWithPath = $this->container->get('settings')['db']['path'] . $this->container->get('settings')['db']['file'];
        $data = json_decode(file_get_contents($fileWithPath), true);
        return $response->withJson($data);
    }

    private function recoverData()
    {
        $fileWithPath = $this->container->get('settings')['db']['path'] . $this->container->get('settings')['db']['file'];
        $explodedFileName = explode('.', $this->container->get('settings')['db']['file']);
        $fileName = $explodedFileName[0];
        $fileExt = $explodedFileName[1];
        $recoveryfileWithPath = $this->container->get('settings')['db']['path'] . $this->container->get('settings')['db']['recoveryFolder'] . $fileName . "_" . time() . "." . $fileExt;
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

    public function getToken($request, $response, $args)
    {
        $data['token'] = $this->container->get('authenticationService')->getToken();
        return $response->withJson($data);
    }

}