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
        Schema::create('staff_messages', function (Blueprint $table) {
            $table->id();
            $table->tinyInteger('to_type')->comment('0:個人、1:グループ');
            $table->unsignedBigInteger('to');
            $table->string('title');
            $table->string('detail',400);
            $table->string('file_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_messages');
    }
};
