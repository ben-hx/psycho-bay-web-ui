<?php

namespace BenHx\Exceptions;

class UnauthorizedException extends \Exception
{
    public function __construct($message, $code = 401)
    {
        parent::__construct($message, $code);
    }
}