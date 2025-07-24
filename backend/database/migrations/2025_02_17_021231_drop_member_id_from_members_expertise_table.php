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
        Schema::table('members_expertise', function (Blueprint $table) {
            $table->dropForeign(['member_id']); // Hapus foreign key jika ada
            $table->dropColumn('member_id'); // Hapus kolom member_id
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members_expertise', function (Blueprint $table) {
            $table->foreignId('member_id')->nullable()->constrained('members')->onDelete('cascade');
        });
    }
};
