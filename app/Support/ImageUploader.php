<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;

/**
 * Redimensionne et compresse les photos d'annonces a l'upload (exigence
 * performance §8 du cahier des charges : images legeres pour la 3G).
 */
class ImageUploader
{
    public static function storeCompressed(UploadedFile $file, string $directory, int $maxWidth = 1600, int $quality = 80): string
    {
        $manager = new ImageManager(new Driver);

        $image = $manager->decode($file->getRealPath());
        $image->scaleDown(width: $maxWidth);
        $encoded = $image->encode(new WebpEncoder(quality: $quality));

        $relativePath = trim($directory, '/').'/'.Str::uuid()->toString().'.webp';

        Storage::disk('public')->put($relativePath, (string) $encoded);

        return $relativePath;
    }
}
