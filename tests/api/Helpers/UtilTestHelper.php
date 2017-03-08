<?php

namespace BenHx\Test\Helpers;

use BenHx;

class UtilTestHelper
{
    private $client;

    public function __construct($client)
    {
        $this->client = $client;
    }

    public function getBasicAuthenticationForUser($user)
    {
        return new BenHx\Test\Helpers\RequestBasicAuthentication($user['username'], $user['password']);
    }

    public function getJWTAuthenticationForToken($token)
    {
        return new BenHx\Test\Helpers\RequestJWTAuthentication($token);
    }

    public function getJWTAuthenticationForUser($user)
    {
        $token = $this->getTokenForUser($user);
        return new BenHx\Test\Helpers\RequestJWTAuthentication($token);
    }

    public function getTokenForUser($user)
    {
        $response = $this->client->get('/api/token', array(), array('authentication' => $this->getBasicAuthenticationForUser($user)));
        $jsonResponse = json_decode($response->getBody(), true);
        return $jsonResponse['token'];
    }

}