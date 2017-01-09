<?php

namespace BenHx;

use \Slim\Middleware\HttpBasicAuthentication\AuthenticatorInterface;
use Firebase\JWT\JWT;

class AuthenticationService implements AuthenticatorInterface
{
    private $users;
    private $currentUser;
    private $jwtAuthentication;

    public function __construct($userFilePath, $jwtAuthentication)
    {
        $this->users = json_decode(file_get_contents($userFilePath), true);
        $this->jwtAuthentication = $jwtAuthentication;
    }

    public function __invoke(array $arguments)
    {
        return $this->authenticateByUserNameAndPassword($arguments['user'], $arguments['password']);
    }

    public function tokenAuthenticate($request, $response, $arguments)
    {
        $this->currentUser = $this->findByUsername($arguments["decoded"]->sub);
    }

    private function findByUsername($username)
    {
        foreach ($this->users as $user) {
            if ($user['username'] == $username) {
                return $user;
            }
        }
        return null;
    }

    private function setCurrentUser($user)
    {
        $this->currentUser = $user;
    }

    private function verifyPassword($user, $password)
    {
        return $user['password'] == $password;
    }

    private function authenticateByUserNameAndPassword($username, $password)
    {
        $user = $this->findByUsername($username);
        if ($user !== null && $this->verifyPassword($user, $password)) {
            $this->setCurrentUser($user);
            return true;
        }
        return false;
    }

    public function getToken()
    {
        $now = new \DateTime();
        $future = new \DateTime("now +2 hours");
        $jti = base64_encode(random_bytes(16));
        $payload = [
            "iat" => $now->getTimeStamp(),
            "exp" => $future->getTimeStamp(),
            "jti" => $jti,
            "sub" => $this->currentUser['username'],
        ];
        $secret = $this->jwtAuthentication->getSecret();
        $algorithm = $this->jwtAuthentication->getAlgorithm();
        return JWT::encode($payload, $secret, $algorithm);
    }

    public function getCurrentUser()
    {
        return $this->currentUser;
    }
}