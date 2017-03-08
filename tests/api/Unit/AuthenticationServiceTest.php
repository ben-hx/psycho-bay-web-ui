<?php

namespace BenHx\Test;

use BenHx;
use Firebase\JWT\JWT;

class AuthenticationServiceTest extends \PHPUnit\Framework\TestCase
{
    private $jwtSecret = 'mySecret';
    private $jwtAlgorithm = 'HS256';

    private function getJWTAuthenticationMock()
    {
        $result = $this->createMock(\Slim\Middleware\JwtAuthentication::class);
        $result->method('getSecret')->willReturn($this->jwtSecret);
        $result->method('getAlgorithm')->willReturn($this->jwtAlgorithm);
        return $result;
    }

    private function getAuthenticationServiceForUser($user)
    {
        return new BenHx\AuthenticationService($this->getUserReposioryMock($user), $this->getJWTAuthenticationMock());
    }

    /**
     * @covers AuthenticationService::__invoke(), AuthenticationService::getCurrentUser()
     */
    public function testThatInvokeReturnsTrueAndSetsTheCurrentUser()
    {
        $authenticatedUser = array(
            "username" => "user1",
            "password" => "test",
        );
        $userRepositoryMock = $this->createMock(BenHx\UserRepository::class);
        $userRepositoryMock->method('findUserByUsername')->willReturn($authenticatedUser);
        $userRepositoryMock->method('verifyUserPassword')->willReturn(true);
        $jwtAuthenticationMock = $this->getJWTAuthenticationMock();
        $authenticationService = new BenHx\AuthenticationService($userRepositoryMock, $jwtAuthenticationMock);
        $result = $authenticationService(array(
            "user" => $authenticatedUser['username'],
            "password" => $authenticatedUser['password'],
        ));
        $this->assertTrue($result);
        $this->assertEquals($authenticationService->getCurrentUser(), $authenticatedUser);
    }

    /**
     * @covers AuthenticationService::__invoke(), AuthenticationService::getCurrentUser()
     */
    public function testThatInvokeReturnsFalseAndDoesNotSetTheCurrentUser()
    {
        $authenticatedUser = array(
            "username" => "user1",
            "password" => "test",
        );
        $notAuthenticatedUser = array(
            "username" => "user2",
            "password" => "test2",
        );
        $userRepositoryMock = $this->createMock(BenHx\UserRepository::class);
        $userRepositoryMock->method('findUserByUsername')->willReturn($authenticatedUser);
        $userRepositoryMock->method('verifyUserPassword')->willReturn(false);
        $jwtAuthenticationMock = $this->getJWTAuthenticationMock();
        $authenticationService = new BenHx\AuthenticationService($userRepositoryMock, $jwtAuthenticationMock);
        $result = $authenticationService(array(
            "user" => $authenticatedUser['username'],
            "password" => $authenticatedUser['password'],
        ));
        $this->assertFalse($result);
        $this->assertNull($authenticationService->getCurrentUser());
    }

    /**
     * @covers AuthenticationService::tokenAuthenticate(), AuthenticationService::getCurrentUser()
     */
    public function testThatTokenAuthenticateReturnsTrueAndSetsCurrentUserIfUsernameIsTokenSub()
    {
        $authenticatedUser = array(
            "username" => "user1",
            "password" => "test",
        );
        $decodedToken = array(
            "sub" => $authenticatedUser['username']
        );
        $userRepositoryMock = $this->createMock(BenHx\UserRepository::class);
        $userRepositoryMock->method('findUserByUsername')->willReturn($authenticatedUser);
        $userRepositoryMock->method('verifyUserPassword')->willReturn(false);
        $jwtAuthenticationMock = $this->getJWTAuthenticationMock();
        $authenticationService = new BenHx\AuthenticationService($userRepositoryMock, $jwtAuthenticationMock);
        $result = $authenticationService->tokenAuthenticate($decodedToken);
        $this->assertTrue($result);
        $this->assertEquals($authenticationService->getCurrentUser(), $authenticatedUser);
    }

    /**
     * @covers AuthenticationService::tokenAuthenticate(), AuthenticationService::getCurrentUser()
     */
    public function testThatTokenAuthenticateReturnsFalseAndDoesNotSetTheCurrentUser()
    {
        $authenticatedUser = array(
            "username" => "user1",
            "password" => "test",
        );
        $decodedToken = array(
            "sub" => 'otherUserName'
        );
        $userRepositoryMock = $this->createMock(BenHx\UserRepository::class);
        $userRepositoryMock->method('findUserByUsername')->willReturn(null);
        $userRepositoryMock->method('verifyUserPassword')->willReturn(false);
        $jwtAuthenticationMock = $this->getJWTAuthenticationMock();
        $authenticationService = new BenHx\AuthenticationService($userRepositoryMock, $jwtAuthenticationMock);
        $result = $authenticationService->tokenAuthenticate($decodedToken);
        $this->assertFalse($result);
        $this->assertNull($authenticationService->getCurrentUser());
    }

    /**
     * @covers AuthenticationService::getToken()
     */
    public function testThatGetTokenReturnsAValidJWTIfCurrentUserIsSet()
    {
        $authenticatedUser = array(
            "username" => "user1",
            "password" => "test",
        );
        $userRepositoryMock = $this->createMock(BenHx\UserRepository::class);
        $userRepositoryMock->method('findUserByUsername')->willReturn($authenticatedUser);
        $userRepositoryMock->method('verifyUserPassword')->willReturn(true);
        $jwtAuthenticationMock = $this->getJWTAuthenticationMock();
        $authenticationService = new BenHx\AuthenticationService($userRepositoryMock, $jwtAuthenticationMock);
        $authenticationService(array(
            "user" => $authenticatedUser['username'],
            "password" => $authenticatedUser['password'],
        ));
        $tokenDecoded = JWT::decode($authenticationService->getToken(), $this->jwtSecret, array($this->jwtAlgorithm));
        $this->assertEquals($tokenDecoded->sub, $authenticatedUser['username']);
    }

    /**
     * @covers AuthenticationService::getToken()
     * @expectedException Exception
     */
    public function testThatGetTokenThrowsExceptionIfCurrentUserIsNotSet()
    {
        $userRepositoryMock = $this->createMock(BenHx\UserRepository::class);
        $jwtAuthenticationMock = $this->getJWTAuthenticationMock();
        $authenticationService = new BenHx\AuthenticationService($userRepositoryMock, $jwtAuthenticationMock);
        $authenticationService->getToken();
    }

}