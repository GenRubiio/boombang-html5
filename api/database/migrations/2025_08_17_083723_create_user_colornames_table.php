<?php

use App\Models\User;
use App\Enums\ColorNameEnum;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_colornames', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name_color')->default(ColorNameEnum::USER->key())->comment('User colorname, default is "user" color name');
            $table->timestamps();
        });

        $users = User::all();
        foreach ($users as $user) {
            $user->colornames()->create([
                'name_color' => ColorNameEnum::USER->key(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_colornames');
    }
};
