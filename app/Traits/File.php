<?php

namespace App\Traits;

use Illuminate\Support\Facades\File as FileInstance;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;

trait File
{
    /**
     * File directory.
     * @var string
     */
    private $directory;

    /**
     * Upload the file.
     * @param $file
     * @return array
     */
    public function upload($file): array
    {
        $directory = $this->getDirectory();
        if ($this->isFile($file)) {
            if ($path = $file->store($directory)) {
                $fileName = $this->getFileName($directory, $path);
                $realPath = storage_path( 'app/' . $path);
                if ($this->isImage($realPath)) { // need to create small, middle, avatar images
                    // create an image manager instance with favored driver
                    $this->resizeImage($realPath, $directory, $fileName, $sfx = 'md');
                    $this->resizeImage($realPath, $directory, $fileName, $sfx = 'sm');
                    $this->resizeImage($realPath, $directory, $fileName, $sfx = 'avatar');
                }
                return ['success' => true, 'name' => $fileName];
            }
        }
        return ['success' => false, 'name' => ''];
    }

    /**
     * Delete the file.
     * @param $fileLink
     * @return array
     */
    public function delete($fileLink)
    {
        if (Storage::exists($fileLink)) {
            Storage::delete($fileLink);

            return ['success' => true, 'fileLink' => $fileLink];
        }
        return ['success' => false, 'fileLink' => $fileLink];
    }

    /**
     * @return string
     */
    public function getDirectory()
    {
        return $this->directory;
    }

    /**
     * @param $directory
     */
    public function setDirectory($directory)
    {
        $this->directory = $directory;
    }

    /**
     * @param $file
     * @return string
     */
    private function isFile($file)
    {
        return FileInstance::isFile($file);
    }

    /**
     * @param $file
     * @return string
     */
    private function isImage($file)
    {
        $allowedMimeTypes = ['image/jpeg','image/png'];
        $contentType = mime_content_type($file);
        if(in_array($contentType, $allowedMimeTypes) ){
            return true;
        }

        return false;
    }

    /**
     * @param $realPath
     * @param $directory
     * @param $fileName
     * @param string $sfx
     */
    private function resizeImage($realPath, $directory, $fileName, $sfx = 'md')
    {
        try {
            // create an image manager instance with favored driver
            $manager = new ImageManager(array('driver' => 'imagick'));
            $img = $manager->make($realPath);
            switch ($sfx) {
                case 'md':
                    $width = env('IMAGE_MIDDLE_WIDTH', 238);
                    break;
                case 'sm':
                    $width = env('IMAGE_SMALL_WIDTH', 150);
                    break;
                case 'avatar':
                    $width = env('IMAGE_AVATAR_WIDTH', 40);
                    break;
                default:
                    $width = env('IMAGE_MIDDLE_WIDTH', 238);
            }
            $img->resize($width, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
            $newFileName = str_replace('.', '_' . $sfx . '.', $fileName);
            // finally we save the image as a new file
            $img->save(storage_path('app/' . $directory . $newFileName));
        } catch (\Exception $exception) {
            \Log::error($exception->getMessage());
        }
    }

    /**
     * @param $directory
     * @param $path
     * @return string
     */
    private function getFileName($directory, $path)
    {
        return str_replace($directory, '', $path);
    }
}
