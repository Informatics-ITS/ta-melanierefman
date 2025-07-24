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
        Schema::create('members_education', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->references('id')->on('members')->onDelete('cascade')->constrained();
            $table->string('degree');
            $table->string('major');
            $table->string('university');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('members_education');
    }
};
