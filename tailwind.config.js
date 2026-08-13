import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Archivo', 'system-ui', 'sans-serif'],
            },
            colors: {
                bg: '#ffffff',
                surface: '#f7f6f5',
                ink: '#131211',
                accent: {
                    DEFAULT: '#F26A21',
                    100: '#fff3ea',
                    200: '#ffe3c9',
                    300: '#ffc99b',
                    400: '#ffa662',
                    500: '#F26A21',
                    600: '#d85a15',
                    700: '#b04710',
                    800: '#7c320c',
                    900: '#4d1f06',
                },
                'accent-2': {
                    DEFAULT: '#F2A93B',
                    100: '#fff8e8',
                    200: '#ffedc2',
                    300: '#ffdf94',
                    400: '#f8c463',
                    500: '#F2A93B',
                    600: '#d38f22',
                    700: '#a86f1a',
                    800: '#785012',
                    900: '#4f350c',
                },
                neutral: {
                    100: '#f7f7f7',
                    200: '#ececec',
                    300: '#d6d6d6',
                    400: '#b3b3b3',
                    500: '#8c8c8c',
                    600: '#6e6e6e',
                    700: '#4f4f4f',
                    800: '#2c2c2c',
                    900: '#111111',
                },
            },
            borderRadius: {
                none: '0',
                DEFAULT: '0',
                sm: '0',
                md: '0',
                lg: '0',
                xl: '0',
                '2xl': '0',
            },
        },
    },

    plugins: [forms],
};
