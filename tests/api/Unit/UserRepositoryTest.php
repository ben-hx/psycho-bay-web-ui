<?php

namespace BenHx\Test;

use BenHx;

class UserRepositoryTest extends \PHPUnit\Framework\TestCase
{
    private $filePath = __DIR__ . '/../Assets/example-users.json';
    private $recoveryFilePath = __DIR__ . '/../Assets/example-users-recovery.json';

    /**
     * @before
     */
    public function setUp()
    {
        file_put_contents($this->filePath, file_get_contents($this->recoveryFilePath));
    }

    private function getUserReposiory()
    {
        return new BenHx\UserRepository($this->filePath);
    }

    private function getDecodedFile()
    {
        return json_decode(file_get_contents($this->filePath), true);
    }

    /**
     * @covers UserRepository::findUserByUsername()
     */
    public function testThatFindUserByUsernameReturnsTheUserWithUsername()
    {
        $userReposiory = $this->getUserReposiory();
        $file = $this->getDecodedFile();
        $this->assertEquals($userReposiory->findUserByUsername('user1'), $file[0]);
    }

    /**
     * @covers UserRepository::findUserByUsername()
     */
    public function testThatFindUserByUsernameReturnsNullIfUserIsNotFound()
    {
        $userReposiory = $this->getUserReposiory();
        $this->assertNull($userReposiory->findUserByUsername('invalidUser'));
    }

    /**
     * @covers UserRepository::changeUserPassword()
     */
    public function testThatChangeUserPasswordChangesTheUserPassword()
    {
        $userReposiory = $this->getUserReposiory();
        $user1 = $userReposiory->findUserByUsername('user1');
        $newPassword = "asdf";
        $userReposiory->changeUserPassword($user1, $user1['password'], $newPassword);
        $file = $this->getDecodedFile();
        $this->assertEquals($userReposiory->findUserByUsername('user1')['password'], $file[0]['password']);
    }

    /**
     * @covers UserRepository::changeUserPassword()
     * @expectedException Exception
     */
    public function testThatChangeUserPasswordThrowsExceptionIfUserNotFound()
    {
        $userReposiory = $this->getUserReposiory();
        $invalidUser = array(
            "username" => "invalidUser",
            "password" => "test",
        );
        $userReposiory->changeUserPassword($invalidUser, 'test', 'test2');
    }

    /**
     * @covers UserRepository::updateUser()
     */
    public function testThatUpdateUserUpdatesTheUser()
    {
        $userReposiory = $this->getUserReposiory();
        $user1 = $userReposiory->findUserByUsername('user1');
        $userData = array(
            "username" => "userUpdatedUsername",
        );
        $userReposiory->updateUser($user1, $userData);
        $file = $this->getDecodedFile();
        $this->assertEquals($userReposiory->findUserByUsername('userUpdatedUsername'), $file[0]);
    }

    /**
     * @covers UserRepository::changeUserPassword()
     * @expectedException Exception
     */
    public function testThatUpdateUserThrowsExceptionIfUserNotFound()
    {
        $userReposiory = $this->getUserReposiory();
        $invalidUser = array(
            "username" => "invalidUser",
            "passwort" => "test",
        );
        $userReposiory->updateUser($invalidUser, $invalidUser);
    }

    /**
     * @covers UserRepository::updateUser()
     */
    public function testThatUpdateUserDoesNotUpdateThePassword()
    {
        $userReposiory = $this->getUserReposiory();
        $user1 = $userReposiory->findUserByUsername('user1');
        $oldPassword = $user1['password'];
        $userData = array(
            "password" => "newUserPassword",
        );
        $userReposiory->updateUser($user1, $userData);
        $this->assertEquals($userReposiory->findUserByUsername('user1')['password'], $oldPassword);
    }

    /**
     * @covers UserRepository::verifyUserPassword()
     */
    public function testThatVerifyUserPasswordReturnsTrueIfPasswordIsCorrect()
    {
        $userReposiory = $this->getUserReposiory();
        $user1 = $userReposiory->findUserByUsername('user1');
        $this->assertTrue($userReposiory->verifyUserPassword($user1, $user1['password']));
    }

    /**
     * @covers UserRepository::verifyUserPassword()
     */
    public function testThatVerifyUserPasswordReturnsFalseIfPasswordIsNotCorrect()
    {
        $userReposiory = $this->getUserReposiory();
        $user1 = $userReposiory->findUserByUsername('user1');
        $this->assertFalse($userReposiory->verifyUserPassword($user1, 'falsePassword'));
    }
}