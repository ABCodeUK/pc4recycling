<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddForeignKeyToUsersStaffTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users_staff', function (Blueprint $table) {
            $table->foreign('role_id')
                ->references('id')
                ->on('users_roles')
                ->onDelete('restrict'); // Prevent deletion of roles in use
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users_staff', function (Blueprint $table) {
            $table->dropForeign(['role_id']); // Drop the foreign key if the migration is rolled back
        });
    }
}