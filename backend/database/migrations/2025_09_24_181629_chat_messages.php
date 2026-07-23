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
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_room_id')->constrained('chat_rooms')->onDelete('cascade');
            $table->morphs('sender'); // sender_id + sender_type
            $table->string('subject')->nullable();
            $table->text('message');
            $table->string('attachment_url', 500)->nullable();
            $table->enum('message_type', ['text', 'image', 'file', 'video', 'audio'])->default('text');
            $table->enum('status', ['sent', 'delivered', 'seen'])->default('sent');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
