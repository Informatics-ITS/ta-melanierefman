<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class MakeResearchIdNullableInPublicationTable extends Migration
{
    public function up(): void
    {
        Schema::table('publication', function (Blueprint $table) {
            $table->string('DOI_link', 255)->nullable()->change();
            $table->foreignId('research_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('publication', function (Blueprint $table) {
            $table->string('DOI_link', 255)->nullable(false)->change();
            $table->foreignId('research_id')->nullable(false)->change();
        });
    }
}
