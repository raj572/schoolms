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
        // Notices/Announcements Table
        Schema::create('notices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('school_id');
            $table->string('title');
            $table->text('content');
            $table->enum('type', ['notice', 'announcement', 'event', 'holiday', 'urgent'])->default('notice');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');

            // Target audience
            $table->json('target_roles')->nullable(); // ['student', 'teacher', 'parent', 'all']
            $table->json('target_classes')->nullable(); // [1, 2, 3] class IDs

            $table->date('publish_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->boolean('is_active')->default(true);

            // Attachments
            $table->string('attachment_url')->nullable();

            // Creator
            $table->unsignedBigInteger('created_by');
            $table->string('created_by_role')->nullable(); // principal, teacher, etc.

            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });

        // Notice Reads Table (Track who has read the notice)
        Schema::create('notice_reads', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('notice_id');
            $table->morphs('reader'); // reader_id + reader_type (student, teacher, parent, user)
            $table->timestamp('read_at');
            $table->timestamps();

            $table->foreign('notice_id')->references('id')->on('notices')->onDelete('cascade');

            // Ensure one read record per user per notice
            $table->unique(['notice_id', 'reader_id', 'reader_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notice_reads');
        Schema::dropIfExists('notices');
    }
};


