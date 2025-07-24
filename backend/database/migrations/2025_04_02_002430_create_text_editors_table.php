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
        Schema::create('text_editors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('progress_research_id')->constrained('research')->onDelete('cascade');
            $table->longText('text_editor_id');
            $table->longText('text_editor_en');
            $table->unsignedInteger('index_order');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('text_editors');
    }
};
