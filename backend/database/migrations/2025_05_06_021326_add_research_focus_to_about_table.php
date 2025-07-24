<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddResearchFocusToAboutTable extends Migration
{
    public function up()
    {
        Schema::table('about', function (Blueprint $table) {
            $table->text('fokus_penelitian')->nullable()->after('about');
            $table->text('research_focus')->nullable()->after('fokus_penelitian');
        });
    }

    public function down()
    {
        Schema::table('about', function (Blueprint $table) {
            $table->dropColumn(['fokus_penelitian', 'research_focus']);
        });
    }
}
