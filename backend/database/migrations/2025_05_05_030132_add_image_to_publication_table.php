<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('publication', function (Blueprint $table) {
            $table->string('image')->nullable()->after('article_link');
        });
    }

    public function down(): void
    {
        Schema::table('publication', function (Blueprint $table) {
            $table->dropColumn('image');
        });
    }
};
