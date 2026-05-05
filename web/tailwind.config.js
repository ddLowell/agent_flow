/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主色调 - 明亮蓝色系，提高对比度
        primary: {
          50: '#e0f7ff',
          100: '#b3ecff',
          200: '#7dd3ff',
          300: '#4db8ff',
          400: '#0095ff',
          500: '#0066cc',
          600: '#004499',
          700: '#003366',
          800: '#002244',
          900: '#001122',
        },
        // 辅助色 - 明亮青绿色
        accent: {
          50: '#e0f9ff',
          100: '#b3f0ff',
          200: '#7de6ff',
          300: '#4dcbff',
          400: '#00b3ff',
          500: '#0099cc',
          600: '#007799',
          700: '#005566',
          800: '#003344',
          900: '#002222',
        },
        // 背景色 - 更明亮的基础
        background: {
          50: '#ffffff',
          100: '#f8faff',
          200: '#f0f2ff',
          300: '#e8eaff',
          400: '#d8e0ff',
          500: '#c8d0e8',
          600: '#b8c0d8',
          700: '#a8b0c8',
          800: '#98a0b8',
          900: '#8890a8',
        },
        // 文字颜色 - 提高对比度
        text: {
          50: '#001133',
          100: '#002266',
          200: '#003388',
          300: '#0044aa',
          400: '#0055bb',
          500: '#0066cc',
          600: '#112233',
          700: '#223344',
          800: '#334455',
          900: '#445566',
        },
        // 玻璃效果 - 减少模糊，提高清晰度
        glass: {
          50: 'rgba(255, 255, 255, 0.95)',
          100: 'rgba(255, 255, 255, 0.9)',
          200: 'rgba(255, 255, 255, 0.85)',
          300: 'rgba(255, 255, 255, 0.8)',
        },
        // 深色玻璃效果
        'glass-dark': {
          50: 'rgba(0, 20, 40, 0.95)',
          100: 'rgba(0, 20, 40, 0.9)',
          200: 'rgba(0, 20, 40, 0.85)',
          300: 'rgba(0, 20, 40, 0.8)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #4db8ff 0%, #0095ff 50%, #0066cc 100%)',
        'gradient-accent': 'linear-gradient(135deg, #4dcbff 0%, #00b3ff 100%)',
        'gradient-clean': 'linear-gradient(135deg, #f8faff 0%, #ffffff 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 150, 255, 0.4)',
        'glow-lg': '0 0 40px rgba(0, 150, 255, 0.5)',
        'shadow-soft': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'shadow-medium': '0 6px 12px rgba(0, 0, 0, 0.15)',
        'shadow-strong': '0 8px 20px rgba(0, 0, 0, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 20, 40, 0.25)',
      },
      backdropBlur: {
        'xs': '4px',
        'sm': '8px',
      },
    },
  },
  plugins: [],
}