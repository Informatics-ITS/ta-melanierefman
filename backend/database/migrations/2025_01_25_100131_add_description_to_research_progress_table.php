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
        Schema::table('research_progress', function (Blueprint $table) {
            $table->longText('deskripsi')->nullable();
            $table->longText('description')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('research_progress', function (Blueprint $table) {
            $table->dropColumn('deskripsi');
            $table->dropColumn('description');
        });
    }
};
