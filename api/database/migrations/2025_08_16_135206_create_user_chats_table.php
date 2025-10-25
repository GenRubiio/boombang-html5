<?php

use App\Models\User;
use App\Enums\ColorChatEnum;
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
        Schema::create('user_chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('chat_color')->default(ColorChatEnum::USER->key())->comment('User chat, default is "user" chat color');
            $table->timestamps();
        });

        $users = User::all();
        foreach ($users as $user) {
            $user->chats()->create([
                'chat_color' => ColorChatEnum::USER->key(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_chats');
    }
};
