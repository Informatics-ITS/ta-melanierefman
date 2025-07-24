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
        Schema::create('research_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_id')->references('id')->on('research')->onDelete('cascade')->constrained();
            $table->string('judul_progres');
            $table->string('title_progress');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_progress');
    }
};
