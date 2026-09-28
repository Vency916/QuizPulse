<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('database.default') === 'sqlite') {
            try {
                \Illuminate\Support\Facades\DB::statement('PRAGMA journal_mode = WAL;');
                \Illuminate\Support\Facades\DB::statement('PRAGMA busy_timeout = 5000;');
                \Illuminate\Support\Facades\DB::statement('PRAGMA synchronous = NORMAL;');
            } catch (\Throwable $e) {
                // Ignore if in-memory or unsupported
            }
        }
    }
}
