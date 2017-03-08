<?php

namespace BenHx\Test\Helpers;

use BenHx\ApiResponse;
use Slim\App;
use Slim\Http\Environment;
use Slim\Http\Headers;
use Slim\Http\Request;
use Slim\Http\RequestBody;
use Slim\Http\Response;
use Slim\Http\Uri;

class TestClient
{
    public $app;

    public $request;

    public $response;
    private $cookies = array();

    public function __construct(App $slim)
    {
        $this->app = $slim;
    }

    public function __call($method, $arguments)
    {
        throw new \BadMethodCallException(strtoupper($method) . ' is not supported');
    }

    public function get($path, $data = array(), $options = array())
    {
        return $this->request('get', $path, $data, $options);
    }

    public function post($path, $data = array(), $options = array())
    {
        return $this->request('post', $path, $data, $options);
    }

    public function patch($path, $data = array(), $options = array())
    {
        return $this->request('patch', $path, $data, $options);
    }

    public function put($path, $data = array(), $options = array())
    {
        return $this->request('put', $path, $data, $options);
    }

    public function delete($path, $data = array(), $options = array())
    {
        return $this->request('delete', $path, $data, $options);
    }

    public function head($path, $data = array(), $options = array())
    {
        return $this->request('head', $path, $data, $options);
    }

    public function options($path, $data = array(), $options = array())
    {
        return $this->request('options', $path, $data, $options);
    }

    private function request($method, $path, $data = array(), $options = array())
    {
        $method = strtoupper($method);
        $envOptions = array(
            'REQUEST_METHOD' => $method,
            'REQUEST_URI' => $path
        );
        if (array_key_exists('authentication', $options)) {
            $envOptions = array_merge($envOptions, $options['authentication']());
        }
        if ($method === 'GET') {
            $envOptions['QUERY_STRING'] = http_build_query($data);
        } else {
            $params = json_encode($data);
        }

        $env = Environment::mock(array_merge($envOptions, $options));
        $uri = Uri::createFromEnvironment($env);
        $headers = Headers::createFromEnvironment($env);
        $cookies = $this->cookies;
        $serverParams = $env->all();
        $body = new RequestBody();
        if (isset($params)) {
            $headers->set('Content-Type', 'application/json;charset=utf8');
            $body->write($params);
        }
        $this->request = new Request($method, $uri, $headers, $cookies, $serverParams, $body);
        $app = $this->app;
        $this->response = $app->process($this->request, new ApiResponse());
        return $this->response;
    }

    public function setCookie($name, $value)
    {
        $this->cookies[$name] = $value;
    }

}