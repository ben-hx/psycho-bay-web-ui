<?php

namespace BenHx;

class ImageUploader
{
    private $dir;

    public function __construct($dir)
    {
        $this->dir = $dir;
    }

    public function moveAndGetPath($file)
    {
        if ($file->getError()) {
            throw new Exception("Error while Uploading the file");
        }
        $randString = md5(time());
        $splitName = explode(".", $file->getClientFilename());
        $fileExt = end($splitName);
        $newFile = $this->dir . strtolower($randString . '.' . $fileExt);
        $file->moveTo($newFile);

        return str_replace("\\", "/", (str_replace(realpath('.'), "", realpath($newFile))));
    }
}