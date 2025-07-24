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
        Schema::create('documentation', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->nullable()->constrained('members')->onDelete('cascade');
            $table->foreignId('about_id')->nullable()->constrained('about')->onDelete('cascade');
            $table->string('judul')->nullable();
            $table->string('title')->nullable();
            $table->enum('type', ['image', 'video'])->nullable();
            $table->string('image')->nullable();
            $table->string('youtube_link')->nullable();
            $table->string('keterangan')->nullable();
            $table->string('caption')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documentation');
    }
};
