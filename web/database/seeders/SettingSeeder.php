<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('settings')->insert([
            'key' => 'name',
            'type' => 'text',
            'name' => 'Nombre del proyecto',
            'description' => 'Se utilizará en metas, títulos, etc.',
            'value' => 'BasetisBackpackBase',
            'field' => '{"name":"value","label":"Value","type":"text"}',
            'active' => 1,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        DB::table('settings')->insert([
            'key' => 'description',
            'type' => 'text',
            'name' => 'Descripción del proyecto',
            'description' => 'Explicación corta en caso de que no haya metas activos.',
            'value' => null,
            'field' => '{"name":"value","label":"Value","type":"text"}',
            'active' => 1,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        DB::table('settings')->insert([
            'key' => 'logo',
            'type' => 'image',
            'name' => 'Logo',
            'description' => 'Logo del proyecto',
            'value' => null,
            'field' => '{"label":"Value","name":"value","filename":"image_filename","type":"base64_image","src":null}',
            'active' => 1,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        DB::table('settings')->insert([
            'key' => 'twitter_creator',
            'type' => 'text',
            'name' => 'Cuenta de Twitter',
            'description' => 'Nombre de la cuenta @empresa de twitter.',
            'value' => '@basetis',
            'field' => '{"name":"value","label":"Value","type":"text"}',
            'active' => 1,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        DB::table('settings')->insert([
            'key' => 'geo_placename',
            'type' => 'text',
            'name' => 'Geo: Nombre del lugar',
            'description' => 'Nombre en el que aparecerá posicionado en el mapa.',
            'value' => null,
            'field' => '{"name":"value","label":"Value","type":"text"}',
            'active' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        DB::table('settings')->insert([
            'key' => 'geo_position',
            'type' => 'text',
            'name' => 'Geo: Coordenadas',
            'description' => 'Coordenadas para posicionar en el mapa (separadas por coma)',
            'value' => null,
            'field' => '{"name":"value","label":"Value","type":"text"}',
            'active' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        DB::table('settings')->insert([
            'key' => 'geo_icbm',
            'type' => 'text',
            'name' => 'Geo: ICBM',
            'description' => 'Coordenadas para posicionar en el mapa (separadas por punto y coma)',
            'value' => null,
            'field' => '{"name":"value","label":"Value","type":"text"}',
            'active' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        DB::table('settings')->insert([
            'key' => 'geo_region',
            'type' => 'text',
            'name' => 'Geo: Region',
            'description' => 'Código de país.',
            'value' => null,
            'field' => '{"name":"value","label":"Value","type":"text"}',
            'active' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        DB::table('settings')->insert([
            'key' => 'latitude',
            'type' => 'text',
            'name' => 'Latitude',
            'description' => 'Latitud',
            'value' => null,
            'field' => '{"name":"value","label":"Value","type":"text"}',
            'active' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        DB::table('settings')->insert([
            'key' => 'longitude',
            'type' => 'text',
            'name' => 'Longitude',
            'description' => 'Longitud',
            'value' => null,
            'field' => '{"name":"value","label":"Value","type":"text"}',
            'active' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->command->info('Settings seeding successful.');
    }
}
