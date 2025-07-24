<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('publication', function (Blueprint $table) {
            $table->string('page_new')->nullable()->after('volume');
        });

        DB::statement('UPDATE publication SET page_new = CAST(page AS CHAR)');

        Schema::table('publication', function (Blueprint $table) {
            $table->dropColumn('page');
            $table->renameColumn('page_new', 'page');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('publication', function (Blueprint $table) {
            $table->integer('page_new')->nullable();
        });

        DB::statement('UPDATE publication SET page_new = CAST(page AS SIGNED)');

        Schema::table('publication', function (Blueprint $table) {
            $table->dropColumn('page');
            $table->renameColumn('page_new', 'page');
        });
    }
};
