<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('progress_videos', function (Blueprint $table) {
            $table->dropForeign(['progress_research_id']);

            $table->foreign('progress_research_id')->references('id')->on('research_progress')->onDelete('cascade');
        });

        Schema::table('text_editors', function (Blueprint $table) {
            $table->dropForeign(['progress_research_id']);

            $table->foreign('progress_research_id')->references('id')->on('research_progress')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('progress_videos', function (Blueprint $table) {
            $table->dropForeign(['progress_research_id']);

            $table->foreign('progress_research_id')->references('id')->on('research')->onDelete('cascade');
        });

        Schema::table('text_editors', function (Blueprint $table) {
            $table->dropForeign(['progress_research_id']);

            $table->foreign('progress_research_id')->references('id')->on('research')->onDelete('cascade');
        });
    }
};
