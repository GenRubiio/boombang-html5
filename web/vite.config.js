import laravel from 'laravel-vite-plugin'
import {defineConfig} from 'vite'
import path from 'path';
import autoprefixer from 'autoprefixer';
import purgeIcons from 'vite-plugin-purge-icons';
import purgecss from '@fullhuman/postcss-purgecss';

export default defineConfig({
    plugins: [
        purgeIcons(),
        laravel({
            input: [
                'resources/sass/app.scss',
                'resources/sass/admin.scss',
                'resources/js/app.js',
            ],
            refresh: true,
            postcss: {
                plugins: [
                    autoprefixer({
                        overrideBrowserslist: ['> 0.5%', 'last 2 versions', 'ie > 11', 'iOS >= 10', 'Android >= 5']
                    }),
                ]
            },
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
            }
        },
        postcss: {
            plugins: [
                purgecss({
                    content: ['./resources/**/*.blade.php', './resources/**/*.js'], // Rutas a tus archivos Blade y JS
                    defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
                }),
            ],
        },
    },
    resolve: {
        alias: {
            '@node_modules' : path.resolve(__dirname, './node_modules'),
            '@public' : path.resolve(__dirname, './public'),
        },
    },
});
