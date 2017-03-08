<?php

namespace BenHx\Test;

use BenHx;

class RoutesTest extends BenHx\Test\Helpers\IntegrationBaseTestCase
{
    private $user;

    /**
     * @before
     */
    public function setUpUser()
    {
        $this->user = array(
            "id" => "0",
            "username" => "test",
            "password" => "test",
        );
    }

    public function testThatGetRootReturnsIndexRoot()
    {
        $response = self::$client->get('/');
        $this->assertSame($response->getStatusCode(), 200);
    }

    public function testThatGetAdminReturnsIndexAdmin()
    {
        $response = self::$client->get('/admin');
        $this->assertSame($response->getStatusCode(), 200);
    }

    public function testThatGetTokenReturnsTokenIfAuthenticationIsOk()
    {
        $response = self::$client->get('/api/token', array(), array('authentication' => self::$util->getBasicAuthenticationForUser($this->user)));
        $this->assertTokenResponse(array(
            "statusCode" => 200,
            "token" => array("sub" => $this->user['id'])
        ), $response);
    }

    public function testThatGetTokenReturns401IfAuthenticationFails()
    {
        $response = self::$client->get('/api/token', array(), array('authentication' => self::$util->getBasicAuthenticationForUser(array(
            "username" => "wrongUser",
            "password" => "wrongPassword",
        ))));
        $this->assertErrorResponse(array(
            "statusCode" => 401
        ), $response);
    }

    public function testThatGetDataReturnsData()
    {
        $response = self::$client->get('/api/data', array(), array('authentication' => self::$util->getJWTAuthenticationForUser($this->user)));
        $this->assertEquals(200, $response->getStatusCode());
        $jsonResponse = json_decode($response->getBody(), true);
        $this->assertArrayHasKey('meta', $jsonResponse);
    }

    public function testThatGetDataReturns401IfAuthenticationFails()
    {
        $response = self::$client->get('/api/data', array(), array('authentication' => self::$util->getJWTAuthenticationForToken("someWrongToken")));
        $this->assertErrorResponse(array(
            "statusCode" => 401
        ), $response);
    }

    public function testThatPutDataReturnsData()
    {
        $changedMetaValue = "changedValue";
        $authentication = self::$util->getJWTAuthenticationForUser($this->user);
        $response = self::$client->get('/api/data', array(), array('authentication' => $authentication));
        $jsonResponse = json_decode($response->getBody(), true);
        $jsonResponse['meta'] = $changedMetaValue;
        $response = self::$client->put('/api/data', $jsonResponse, array('authentication' => $authentication));
        $this->assertEquals(200, $response->getStatusCode());
        $jsonResponse = json_decode($response->getBody(), true);
        $this->assertEquals($changedMetaValue, $jsonResponse['meta']);
    }

    public function testThatPutDataRecoversFile()
    {
        $authentication = self::$util->getJWTAuthenticationForUser($this->user);
        $response = self::$client->get('/api/data', array(), array('authentication' => $authentication));
        $jsonResponse = json_decode($response->getBody(), true);
        $oldMetaValue = $jsonResponse['meta'];
        $jsonResponse['meta'] = "changedValue";
        self::$client->put('/api/data', $jsonResponse, array('authentication' => $authentication));
        $recoveryFolder = $this->getRecoveryFolder();
        $this->assertTrue(is_dir($recoveryFolder));
        $files = scandir($recoveryFolder);
        $firstFile = $recoveryFolder . $files[2];
        $jsonFile = json_decode(file_get_contents($firstFile), true);
        $this->assertEquals($oldMetaValue, $jsonFile['meta']);
    }

    public function testThatPutDataReturns401IfAuthenticationFails()
    {
        $response = self::$client->put('/api/data', array(), array('authentication' => self::$util->getJWTAuthenticationForToken("someWrongToken")));
        $this->assertErrorResponse(array(
            "statusCode" => 401
        ), $response);
    }

    public function testThatPutChangePasswordChangesThePassword()
    {
        $authentication = self::$util->getJWTAuthenticationForUser($this->user);
        $newPassword = "newPassword";
        $requestBody = array(
            'oldPassword' => $this->user['password'],
            'newPassword' => $newPassword
        );
        $response = self::$client->put('/api/change_password', $requestBody, array('authentication' => $authentication));
        $this->assertEquals(200, $response->getStatusCode());
        $jsonResponse = json_decode($response->getBody(), true);
        $this->assertEquals($this->user['username'], $jsonResponse['username']);
        $jsonFile = json_decode(file_get_contents(self::$config['users']['path']), true);
        $this->assertEquals($newPassword, $jsonFile[0]['password']);
    }

    public function testThatPutChangePasswordDoesNotChangeThePasswordIfOldPasswordIsWrong()
    {
        $authentication = self::$util->getJWTAuthenticationForUser($this->user);
        $newPassword = "newPassword";
        $requestBody = array(
            'oldPassword' => 'wrongPassword',
            'newPassword' => $newPassword
        );
        $response = self::$client->put('/api/change_password', $requestBody, array('authentication' => $authentication));
        $this->assertErrorResponse(array(
            "statusCode" => 400
        ), $response);
        $jsonFile = json_decode(file_get_contents(self::$config['users']['path']), true);
        $this->assertEquals($this->user['password'], $jsonFile[0]['password']);
    }

    public function testThatPutChangePasswordReturns401IfAuthenticationFails()
    {
        $response = self::$client->put('/api/change_password', array(), array('authentication' => self::$util->getJWTAuthenticationForToken("someWrongToken")));
        $this->assertErrorResponse(array(
            "statusCode" => 401
        ), $response);
    }

    public function testThatPutUpdateMeUpdatesTheUser()
    {
        $authentication = self::$util->getJWTAuthenticationForUser($this->user);
        $requestBody = array(
            'username' => 'newUserName',
        );
        $response = self::$client->put('/api/me', $requestBody, array('authentication' => $authentication));
        $this->assertEquals(200, $response->getStatusCode());
        $jsonResponse = json_decode($response->getBody(), true);
        $this->assertEquals($requestBody['username'], $jsonResponse['username']);
        $jsonFile = json_decode(file_get_contents(self::$config['users']['path']), true);
        $this->assertEquals($requestBody['username'], $jsonFile[0]['username']);
    }

    public function testThatPutUpdateMeDoesNotChangeThePassword()
    {
        $authentication = self::$util->getJWTAuthenticationForUser($this->user);
        $requestBody = array(
            'username' => 'newUserName',
            'password' => 'newPassword',
        );
        self::$client->put('/api/me', $requestBody, array('authentication' => $authentication));
        $jsonFile = json_decode(file_get_contents(self::$config['users']['path']), true);
        $this->assertEquals($this->user['password'], $jsonFile[0]['password']);
    }

    public function testThatPutUpdateMeReturns401IfAuthenticationFails()
    {
        $response = self::$client->put('/api/me', array(), array('authentication' => self::$util->getJWTAuthenticationForToken("someWrongToken")));
        $this->assertErrorResponse(array(
            "statusCode" => 401
        ), $response);
    }

    public function testThatGetMeReturnsTheCurrentUser()
    {
        $authentication = self::$util->getJWTAuthenticationForUser($this->user);
        $response = self::$client->get('/api/me', array(), array('authentication' => $authentication));
        $this->assertEquals(200, $response->getStatusCode());
        $jsonResponse = json_decode($response->getBody(), true);
        $this->assertEquals($this->user['username'], $jsonResponse['username']);
    }

    public function testThatGetMeReturns401IfAuthenticationFails()
    {
        $response = self::$client->get('/api/me', array(), array('authentication' => self::$util->getJWTAuthenticationForToken("someWrongToken")));
        $this->assertErrorResponse(array(
            "statusCode" => 401
        ), $response);
    }
}