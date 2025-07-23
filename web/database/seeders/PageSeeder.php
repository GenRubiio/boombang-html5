<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('pages')->insert([
            'id' => 1,
            'auth_required' => 0,
            'exists_blade' => 1,
            'template' => 'home',
            'name' => 'Home',
            'title' => '{"es":"Home","en":"Home"}',
            'content' => '{"es":"Home page","en":"Home page"}',
            'extras' => '{"es":{"page_title":null,"breadcrumb":null,"url_canonical":null,"meta_title":null,"meta_description":null,"meta_keywords":null,"og_title":null,"og_description":null,"tw_title":null,"tw_description":null},"en":{"page_title":null,"breadcrumb":null,"url_canonical":null,"meta_title":null,"meta_description":null,"meta_keywords":null,"og_title":null,"og_description":null,"tw_title":null,"tw_description":null}}',
            'extras_no_translatable' => '{"noindex_nofollow":"0","sitemap_indexable":"1","sitemap_priority":"100","sitemap_changefreq":"daily"}',
            'slug' => '{"es":"home","en":"home"}',
            'active' => 1,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        DB::table('pages')->insert([
            'id' => 2,
            'auth_required' => 0,
            'exists_blade' => 1,
            'template' => 'home',
            'name' => 'News',
            'title' => '{"es":"Noticias","en":"News"}',
            'content' => '{"es":"Noticias","en":"News"}',
            'extras' => '{"es":{"page_title":null,"breadcrumb":null,"url_canonical":null,"meta_title":null,"meta_description":null,"meta_keywords":null,"og_title":null,"og_description":null,"tw_title":null,"tw_description":null},"en":{"page_title":null,"breadcrumb":null,"url_canonical":null,"meta_title":null,"meta_description":null,"meta_keywords":null,"og_title":null,"og_description":null,"tw_title":null,"tw_description":null}}',
            'extras_no_translatable' => '{"noindex_nofollow":"0","sitemap_indexable":"1","sitemap_priority":"90","sitemap_changefreq":"daily"}',
            'slug' => '{"es":"noticias","en":"news"}',
            'active' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        DB::table('pages')->insert([
            'id' => 3,
            'auth_required' => 0,
            'exists_blade' => 1,
            'template' => 'auth',
            'name' => 'Login',
            'title' => '{"es":"Login","en":"Login"}',
            'content' => '{"es":"Login","en":"Login"}',
            'extras' => '{"es":{"page_title":null,"breadcrumb":null,"url_canonical":null,"meta_title":null,"meta_description":null,"meta_keywords":null,"og_title":null,"og_description":null,"tw_title":null,"tw_description":null},"en":{"page_title":null,"breadcrumb":null,"url_canonical":null,"meta_title":null,"meta_description":null,"meta_keywords":null,"og_title":null,"og_description":null,"tw_title":null,"tw_description":null}}',
            'extras_no_translatable' => '{"noindex_nofollow":"0","sitemap_indexable":"0","sitemap_priority":"10","sitemap_changefreq":"yearly"}',
            'slug' => '{"es":"login","en":"login"}',
            'active' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        DB::table('pages')->insert([
            'id' => 4,
            'auth_required' => 0,
            'exists_blade' => 1,
            'template' => 'home',
            'name' => 'Contact',
            'title' => '{"es":"Contacto","en":"Contact"}',
            'content' => '{"es":"Contacto","en":"Contact"}',
            'extras' => '{"es":{"page_title":null,"breadcrumb":null,"url_canonical":null,"meta_title":null,"meta_description":null,"meta_keywords":null,"og_title":null,"og_description":null,"tw_title":null,"tw_description":null},"en":{"page_title":null,"breadcrumb":null,"url_canonical":null,"meta_title":null,"meta_description":null,"meta_keywords":null,"og_title":null,"og_description":null,"tw_title":null,"tw_description":null}}',
            'extras_no_translatable' => '{"noindex_nofollow":"0","sitemap_indexable":"1","sitemap_priority":"50","sitemap_changefreq":"weekly"}',
            'slug' => '{"es":"contacto","en":"contact"}',
            'active' => 1,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->command->info('Page home, news and login seeding successful.');
    }
}
