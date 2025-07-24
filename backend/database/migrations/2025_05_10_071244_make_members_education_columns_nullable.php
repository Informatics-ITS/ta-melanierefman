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
        Schema::table('members_education', function (Blueprint $table) {
            $table->string('degree')->nullable()->change();
            $table->string('major')->nullable()->change();
            $table->string('university')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members_education', function (Blueprint $table) {
            $table->string('degree')->nullable(false)->change();
            $table->string('major')->nullable(false)->change();
            $table->string('university')->nullable(false)->change();
        });
    }
};
