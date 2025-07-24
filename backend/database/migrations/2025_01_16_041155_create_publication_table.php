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
        Schema::create('publication', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_id')->references('id')->on('research')->onDelete('cascade')->constrained();
            $table->string('title');
            $table->string('author');
            $table->integer('year');
            $table->string('name_journal');
            $table->integer('volume')->nullable();
            $table->integer('page')->nullable();
            $table->string('DOI_link');
            $table->string('article_link')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('publication');
    }
};
