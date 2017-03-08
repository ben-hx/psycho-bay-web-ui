<?php

namespace BenHx\Test\Helpers;

use Firebase\JWT\JWT;

abstract class IntegrationBaseTestCase extends \PHPUnit\Framework\TestCase
{
    protected static $client;
    protected static $config;
    protected static $jwt;
    protected static $util;

    private function deleteFolder($target)
    {
        if (is_dir($target)) {
            $files = glob($target . '*', GLOB_MARK);

            foreach ($files as $file) {
                $this->deleteFolder($file);
            }

            rmdir($target);
        } elseif (is_file($target)) {
            unlink($target);
        }
    }


    function copyFolder($src, $dst)
    {
        $dir = opendir($src);
        @mkdir($dst);
        while (false !== ($file = readdir($dir))) {
            if (($file != '.') && ($file != '..')) {
                if (is_dir($src . '/' . $file)) {
                    $this->copyFolder($src . '/' . $file, $dst . '/' . $file);
                } else {
                    copy($src . '/' . $file, $dst . '/' . $file);
                }
            }
        }
        closedir($dir);
    }

    private function deleteRecovery()
    {
        $this->deleteFolder($this->getRecoveryFolder());
    }

    private function recoverData()
    {
        $this->copyFolder(self::$config['db']['recoveryPath'], self::$config['db']['path']);
    }

    protected function getRecoveryFolder()
    {
        return self::$config['db']['path'] . self::$config['db']['recoveryFolder'];
    }

    private function initClient()
    {
        self::$config = include(__DIR__ . '/config.php');
        self::$jwt = array(
            'secret' => 'myTestSecret',
            'algorithm' => 'HS256'
        );
        putenv("JWT_SECRET=" . self::$jwt['secret']);
        putenv("JWT_ALGORITHM=" . self::$jwt['algorithm']);
        $factory = new \BenHx\Factory(self::$config);
        $factory->inizialize();
        self::$client = new TestClient($factory->getApp());
        self::$util = new UtilTestHelper(self::$client);
    }

    /**
     * @before
     */
    public function setUpBefore()
    {
        $this->initClient();
        $this->recoverData();
        $this->deleteRecovery();
    }

    /**
     * @after
     */
    public function tearDownAfter()
    {
        $this->deleteRecovery();
        $this->recoverData();
    }

    protected function postToken($user)
    {
        return self::$client->post('/token', [
            'auth' => [
                $user['username'],
                $user['password']
            ]
        ]);
    }

    protected function getToken($user)
    {
        $response = $this->postToken($user);
        $jsonResponse = json_decode($response->getBody(), true);
        return $jsonResponse['data']['token'];
    }

    protected function assertErrorResponse($expectedResponse, $actualResponse)
    {
        $jsonResponse = json_decode($actualResponse->getBody(), true);
        $this->assertEquals($expectedResponse['statusCode'], $actualResponse->getStatusCode());
    }

    protected function assertTokenResponse($expectedResponse, $actualResponse)
    {
        $jsonResponse = json_decode($actualResponse->getBody(), true);
        $this->assertArrayHasKey('token', $jsonResponse);
        $this->assertEquals($expectedResponse['statusCode'], $actualResponse->getStatusCode());
        $decoded = JWT::decode($jsonResponse['token'], self::$jwt['secret'], array(self::$jwt['algorithm']));
        $this->assertEquals($expectedResponse['token']['sub'], $decoded->sub);
    }
}