/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './index.html',
      './src/**/*.{js,ts,jsx,tsx}', // or your structure
    ],
    theme: {
      extend: {
        colors: {
          brand: {
            primary: 'var(--color-brand-primary)',
            secondary: 'var(--color-brand-secondary)',
            tertiary: 'var(--color-brand-tertiary)',
          },
          bg: {
            main: 'var(--color-bg-main)',
            surface: 'var(--color-bg-surface)',
          },
          text: {
            primary: 'var(--color-text-primary)',
            secondary: 'var(--color-text-secondary)',
          },
          accent: 'var(--color-accent)',
        },
        spacing: {
          1: 'var(--spacing-1)',
          2: 'var(--spacing-2)',
          3: 'var(--spacing-3)',
          4: 'var(--spacing-4)',
          5: 'var(--spacing-5)',
          6: 'var(--spacing-6)',
          7: 'var(--spacing-7)',
          8: 'var(--spacing-8)',
        },
        fontSize: {
          sm: 'var(--font-size-sm)',
          md: 'var(--font-size-md)',
          lg: 'var(--font-size-lg)',
          xl: 'var(--font-size-xl)',
        },
      },
    },
    plugins: [],
  };
  