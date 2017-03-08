<?php

namespace BenHx\Test\Helpers;

class RequestJWTAuthentication
{
    private $token;

    /**
     * RequestJWTAuthentication constructor.
     * @param $token
     */
    public function __construct($token)
    {
        $this->token = $token;
    }

    public function __invoke()
    {
        return array(
            'AUTH_TYPE' => 'Bearer',
            'PHP_AUTH_DIGEST' => $this->token,
            'HTTP_AUTHORIZATION' => 'Bearer ' . $this->token
        );
    }
}