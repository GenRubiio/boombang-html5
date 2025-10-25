<?php

use App\Models\User;
use App\Enums\ColorShadowEnum;
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
        Schema::create('user_shadows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('shadow_color')->default(ColorShadowEnum::USER->key())->comment('User shadow color, default is "user" shadow color');
            $table->timestamps();
        });

        $users = User::all();
        foreach ($users as $user) {
            $user->shadows()->create([
                'shadow_color' => ColorShadowEnum::USER->key(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_shadows');
    }
};
