<?php

namespace BenHx\Test\Helpers;

class RequestBasicAuthentication
{
    private $username;
    private $password;

    /**
     * RequestBasicAuthentication constructor.
     * @param $username
     * @param $password
     */
    public function __construct($username, $password)
    {
        $this->username = $username;
        $this->password = $password;
    }

    public function __invoke()
    {
        return array(
            'PHP_AUTH_USER' => $this->username,
            'PHP_AUTH_PW' => $this->password
        );
    }
}