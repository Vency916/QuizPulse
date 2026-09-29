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
        // Safe key length for all MySQL / MariaDB versions on cPanel
        \Illuminate\Support\Facades\Schema::defaultStringLength(191);

        // Force HTTPS URLs in production or behind SSL proxies (cPanel / Cloudflare)
        if (config('app.env') === 'production' || request()->server('HTTP_X_FORWARDED_PROTO') === 'https') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

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
