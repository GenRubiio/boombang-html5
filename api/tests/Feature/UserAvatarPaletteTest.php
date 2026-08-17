<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\UserAvatarPaletteService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

/**
 * DatabaseTransactions (not RefreshDatabase): this repo's shared dev database is not reset
 * between test runs (see ExampleTest.php's commented-out RefreshDatabase import) — each test
 * here runs inside its own rolled-back transaction against the already-migrated
 * `user_avatar_palettes` table instead of dropping/rebuilding schema.
 */
class UserAvatarPaletteTest extends TestCase
{
    use DatabaseTransactions;

    private function service(): UserAvatarPaletteService
    {
        return new UserAvatarPaletteService();
    }

    /**
     * PAL4: per-(user, avatar) scoping — two avatars' palettes don't clobber each other.
     */
    public function test_two_avatars_palettes_do_not_clobber_each_other(): void
    {
        $user = User::factory()->create(['username' => 'palette_test_' . uniqid()]);
        $service = $this->service();

        $service->changePalette($user, 12, ['color1' => '#111111']);
        $service->changePalette($user, 5, ['color1' => '#222222']);

        $this->assertSame(['color1' => '#111111'], $service->getPalette($user, 12));
        $this->assertSame(['color1' => '#222222'], $service->getPalette($user, 5));
    }

    /**
     * PAL4: switching avatars/updating one avatar's palette must not overwrite another's.
     */
    public function test_one_avatars_palette_is_not_overwritten_by_another(): void
    {
        $user = User::factory()->create(['username' => 'palette_test_' . uniqid()]);
        $service = $this->service();

        $service->changePalette($user, 12, ['color1' => '#aaaaaa']);
        $service->changePalette($user, 5, ['color1' => '#bbbbbb']);
        $service->changePalette($user, 5, ['color2' => '#cccccc']);

        $this->assertSame(['color1' => '#aaaaaa'], $service->getPalette($user, 12));
        $this->assertSame(
            ['color1' => '#bbbbbb', 'color2' => '#cccccc'],
            $service->getPalette($user, 5)
        );
    }

    /**
     * longText JSON round-trip: setPaletteAttribute encodes, getPaletteAttribute decodes,
     * exactly as PublicScene.php:163-175.
     */
    public function test_palette_survives_a_longtext_json_round_trip(): void
    {
        $user = User::factory()->create(['username' => 'palette_test_' . uniqid()]);
        $service = $this->service();

        $original = ['color1' => '#123456', 'colorGuante' => '#ee4724'];
        $service->changePalette($user, 12, $original);

        $raw = \App\Models\UserAvatarPalette::where('user_id', $user->id)
            ->where('avatar_id', 12)
            ->first();

        $this->assertIsString($raw->getRawOriginal('palette'));
        $this->assertSame($original, json_decode($raw->getRawOriginal('palette'), true));
        $this->assertSame($original, $service->getPalette($user, 12));
    }

    /**
     * A missing palette resolves to an empty array (the client falls back to manifest
     * defaults for anything not present here — PAL5).
     */
    public function test_missing_palette_resolves_to_empty_array(): void
    {
        $user = User::factory()->create(['username' => 'palette_test_' . uniqid()]);
        $this->assertSame([], $this->service()->getPalette($user, 12));
    }
}
