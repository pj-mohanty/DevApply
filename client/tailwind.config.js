/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },

            code: {
              backgroundColor: '#f3f4f6',  
              color: '#111827',        
              padding: '0.2rem 0.4rem',
              borderRadius: '0.25rem',
              fontWeight: 'normal',
            },

            'pre': {
              backgroundColor: '#DBEAFE',  
              color: '#1E40AF',            
              padding: '1rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            },

            'pre code': {
              backgroundColor: 'transparent', 
              color: 'inherit',
              fontWeight: 'normal',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
