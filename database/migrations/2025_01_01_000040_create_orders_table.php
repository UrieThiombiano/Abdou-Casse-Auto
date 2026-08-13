<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('vin');
            $table->foreignId('brand_id')->constrained()->restrictOnDelete();
            $table->string('model')->nullable();
            $table->string('version_provenance')->nullable();
            $table->unsignedSmallInteger('year')->nullable();
            $table->text('comment')->nullable();
            $table->enum('status', ['en_attente', 'traitee', 'annulee'])->default('en_attente');
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
