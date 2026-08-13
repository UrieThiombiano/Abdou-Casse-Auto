<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('category', ['neuf', 'occasion']);
            $table->foreignId('brand_id')->constrained()->restrictOnDelete();
            $table->string('model')->nullable();
            $table->unsignedSmallInteger('year_from')->nullable();
            $table->unsignedSmallInteger('year_to')->nullable();
            $table->string('version_provenance')->nullable();
            $table->string('item_condition')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category', 'brand_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
