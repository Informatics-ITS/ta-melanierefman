<?php

use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/sitemap.xml', function () {
    return Sitemap::create()
        // Beranda
        ->add(Url::create('/id'))
        ->add(Url::create('/en'))

        // Tentang / About
        ->add(Url::create('/id/tentang'))
        ->add(Url::create('/en/about'))

        // Penelitian / Research
        ->add(Url::create('/id/penelitian'))
        ->add(Url::create('/en/research'))

        ->toResponse(request());
});
