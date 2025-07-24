import laravel from 'laravel-vite-plugin'
import {defineConfig, loadEnv} from 'vite';
import path from 'path';
import autoprefixer from 'autoprefixer';
import Icons from 'unplugin-icons/vite'
import purgecss from '@fullhuman/postcss-purgecss';

export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd());

    return {
        plugins: [
            Icons({
                autoInstall: true, // instala los iconos necesarios automáticamente
                compiler: 'vue3', // aunque uses Blade, esto es obligatorio por el plugin, y no afecta
            }),
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
                '@node_modules': path.resolve(__dirname, './node_modules'),
                '@vendor': path.resolve(__dirname, './vendor'),
                '@public': path.resolve(__dirname, './public'),
            },
        }
    };
});
