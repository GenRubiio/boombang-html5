<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SchemeSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('settings')->insert([
            'key' => 'phone',
            'type' => 'text',
            'name' => 'Teléfono',
            'description' => 'Número de teléfono de contacto',
            'value' => null,
            'field' => '{"name":"value","label":"Value","type":"text"}',
            'active' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        DB::table('settings')->insert([
            'key' => 'has_address',
            'type' => 'radio',
            'name' => '¿Tiene dirección?',
            'description' => 'Indica si la empresa tiene una dirección física',
            'value' => null,
            'field' => '{"name":"value","label":"Value","type":"radio","options":{"1":"S\u00ed","0":"No"},"default":0,"inline":true}',
            'active' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        DB::table('settings')->insert([
            'key' => 'address_street',
            'type' => 'text',
            'name' => 'Calle',
            'description' => 'Calle de la dirección',
            'value' => null,
            'field' => '{"name":"value","label":"Value","type":"text"}',
            'active' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        DB::table('settings')->insert([
            'key' => 'address_city',
            'type' => 'text',
            'name' => 'Ciudad',
            'description' => 'Ciudad de la dirección',
            'value' => null,
            'field' => '{"name":"value","label":"Value","type":"text"}',
            'active' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        DB::table('settings')->insert([
            'key' => 'address_region',
            'type' => 'text',
            'name' => 'Región',
            'description' => 'Región de la dirección',
            'value' => null,
            'field' => '{"name":"value","label":"Value","type":"text"}',
            'active' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        DB::table('settings')->insert([
            'key' => 'address_postal_code',
            'type' => 'text',
            'name' => 'Código Postal',
            'description' => 'Código Postal de la dirección',
            'value' => null,
            'field' => '{"name":"value","label":"Value","type":"text"}',
            'active' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        DB::table('settings')->insert([
            'key' => 'address_country',
            'type' => 'text',
            'name' => 'País',
            'description' => 'País de la dirección ("ES")',
            'value' => null,
            'field' => '{"name":"value","label":"Value","type":"text"}',
            'active' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        DB::table('settings')->insert([
            'key' => 'opening_hours',
            'type' => 'text',
            'name' => 'Horario de Apertura',
            'description' => 'Horario de apertura de la empresa ("Mo-Fr 09:00-18:00")',
            'value' => null,
            'field' => '{"name":"value","label":"Value","type":"text"}',
            'active' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        DB::table('settings')->insert([
            'key' => 'price_range',
            'type' => 'text',
            'name' => 'Rango de Precios',
            'description' => 'Rango de precios de los productos ("€€")',
            'value' => null,
            'field' => '{"name":"value","label":"Value","type":"text"}',
            'active' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->command->info('Settings seeding successful.');
    }
}
