<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateConnectionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('connections', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Connection name (e.g., Aitken, ChatGPT, IceCat)
            $table->string('host')->nullable(); // Host for database connections
            $table->integer('port')->nullable(); // Port for database connections
            $table->string('username')->nullable(); // Username for database connections
            $table->string('password')->nullable(); // Password for database connections
            $table->string('database')->nullable(); // Database name for Aitken
            $table->string('api_key')->nullable(); // API Key for ChatGPT/IceCat
            $table->boolean('connected')->default(false); // Whether the connection is active
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('connections');
    }
}
