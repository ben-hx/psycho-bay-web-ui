<?php

namespace BenHx;

use BenHx\Exceptions\UnauthorizedException;
use \Slim\Middleware\HttpBasicAuthentication\AuthenticatorInterface;
use Firebase\JWT\JWT;

class AuthenticationService implements AuthenticatorInterface
{
    private $currentUser;
    private $userRepository;
    private $jwtAuthentication;

    public function __construct($userRepository, $jwtAuthentication)
    {
        $this->userRepository = $userRepository;
        $this->jwtAuthentication = $jwtAuthentication;
    }

    private function setCurrentUser($user)
    {
        $this->currentUser = $user;
    }

    private function authenticateByUserNameAndPassword($username, $password)
    {
        $user = $this->userRepository->findUserByUsername($username);
        if ($user !== null && $this->userRepository->verifyUserPassword($user, $password)) {
            $this->setCurrentUser($user);
            return true;
        }
        return false;
    }

    public function __invoke(array $arguments)
    {
        return $this->authenticateByUserNameAndPassword($arguments['user'], $arguments['password']);
    }

    public function tokenAuthenticate($decodedToken)
    {
        $user = $this->userRepository->findUserById($decodedToken->sub);
        if ($user !== null) {
            $this->setCurrentUser($user);
            return true;
        }
        return false;
    }

    public function getToken()
    {
        if (is_null($this->currentUser)) {
            throw new UnauthorizedException('No user authenticated!');
        }
        $now = new \DateTime();
        $future = new \DateTime("now +2 hours");
        $jti = base64_encode(random_bytes(16));
        $payload = [
            "iat" => $now->getTimeStamp(),
            "exp" => $future->getTimeStamp(),
            "jti" => $jti,
            "sub" => $this->currentUser['id'],
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