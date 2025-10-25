<?php

use App\Models\User;
use App\Enums\ColorFichaEnum;
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
        Schema::create('user_fichas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('ficha_color')->default(ColorFichaEnum::USER->key())->comment('User ficha, default is "user" ficha is avatar frame');
            $table->timestamps();
        });

        $users = User::all();
        foreach ($users as $user) {
            $user->fichas()->create([
                'ficha_color' => ColorFichaEnum::USER->key(),
            ]);
            $user->fichas()->create([
                'ficha_color' => ColorFichaEnum::BETA->key(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_fichas');
    }
};
