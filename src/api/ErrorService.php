<?php

namespace BenHx;

use BenHx\Exceptions\NotFoundException;
use BenHx\Exceptions\UnauthorizedException;
use BenHx\Exceptions\ValidationException;

class ErrorService
{
    public function responseFromException($request, $response, $exception)
    {
        switch (true) {
            case $exception instanceof ValidationException:
                return $response->withStatus(HttpStatusCode::BAD_REQUEST)->withException($exception);
                break;
            case $exception instanceof NotFoundException:
                return $response->withStatus(HttpStatusCode::NOT_FOUND)->withException($exception);
                break;
            case $exception instanceof UnauthorizedException:
                return $response->withStatus(HttpStatusCode::UNAUTHORIZED)->withException($exception);
                break;
            default:
                return $response->withStatus(HttpStatusCode::INTERNAL_SERVER_ERROR)->withException($exception);
        }
    }
}