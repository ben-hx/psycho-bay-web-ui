<?php

namespace BenHx;

use BenHx\Exceptions\NotFoundException;
use BenHx\Exceptions\ValidationException;

class UserRepository
{
    private $filePath;
    private $users;

    public function __construct($userFilePath)
    {
        $this->filePath = $userFilePath;
        $this->load();
    }

    private function load()
    {
        $file = file_get_contents($this->filePath);
        if ($file === false) {
            throw new \Exception("Error while reading file!");
        }
        $this->users = json_decode($file, true);
    }

    private function save()
    {
        file_put_contents($this->filePath, json_encode($this->users));
    }

    private function indexByUser($otherUser)
    {
        return array_search($otherUser, $this->users);
    }

    public function findUserByUsername($username)
    {
        foreach ($this->users ? $this->users : [] as $user) {
            if ($user['username'] == $username) {
                return $user;
            }
        }
        return null;
    }

    public function findUserById($id)
    {
        foreach ($this->users ? $this->users : [] as $user) {
            if ($user['id'] == $id) {
                return $user;
            }
        }
        return null;
    }

    public function verifyUserPassword($user, $password)
    {
        return $user['password'] == $password;
    }

    public function changeUserPassword($user, $oldPassword, $newPassword)
    {
        $index = $this->indexByUser($user);
        if ($index === false) {
            throw new NotFoundException("User not Found!");
        }
        if (!$this->verifyUserPassword($user, $oldPassword)) {
            throw new ValidationException("Password does not match!");
        }
        $this->users[$index]['password'] = $newPassword;
        $this->save();
    }

    public function updateUser($user, $data)
    {
        $index = $this->indexByUser($user);
        if ($index === false) {
            throw new NotFoundException("User not Found!");
        }
        foreach ($data as $key => $value) {
            if ($key != 'password') {
                $this->users[$index][$key] = $value;
            }
        }
        $this->save();
        return $this->users[$index];
    }

    public function userToResponse($user)
    {
        return array(
            'username' => $user['username']
        );
    }
}