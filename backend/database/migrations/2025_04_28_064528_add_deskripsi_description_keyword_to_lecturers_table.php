<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('lecturers', function (Blueprint $table) {
            $table->string('deskripsi')->nullable()->after('youtube_link');
            $table->string('description')->nullable()->after('deskripsi');
            $table->string('kata_kunci')->nullable()->after('description');
            $table->string('keyword')->nullable()->after('kata_kunci');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lecturers', function (Blueprint $table) {
            $table->dropColumn(['deskripsi', 'description', 'kata_kunci', 'keyword']);
        });
    }
};
