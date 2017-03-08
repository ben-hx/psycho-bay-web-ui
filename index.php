<?php

require __DIR__ . '/libs/vendor/autoload.php';

use \BenHx\Factory;

$factory = new Factory(include(__DIR__ . '/config.php'));
$factory->inizialize();
