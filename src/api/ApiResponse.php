<?php

namespace BenHx;

use Slim\Http\Response;

class ApiResponse extends Response
{
    public function withClosure($closure)
    {
        return $this->withData($closure());
    }

    public function withApiSerializeable($serializeable)
    {
        return $this->withData($serializeable);
    }

    public function withException($exception)
    {
        $result = [];
        $result['success'] = $this->isSuccessful();
        $result['error']['code'] = $exception->getCode();
        $result['error']['message'] = $exception->getMessage();
        $body = $this->getBody();
        $body->rewind();
        $body->write($json = json_encode($result));

        if ($json === false) {
            throw new \RuntimeException(json_last_error_msg(), json_last_error());
        }
        $clone = clone $this;
        $clone->headers->remove('WWW-Authenticate');
        return $clone;
    }

    private function withData($data)
    {
        $result = [];
        $result['success'] = $this->isSuccessful();
        $result['data'] = $data;
        $body = $this->getBody();
        $body->rewind();
        $body->write($json = json_encode($result));
        
        if ($json === false) {
            throw new \RuntimeException(json_last_error_msg(), json_last_error());
        }
        $clone = clone $this;
        return $clone;
    }

}