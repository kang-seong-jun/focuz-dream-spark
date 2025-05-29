
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Modern vibrant colors
				electric: {
					blue: '#0066FF',
					purple: '#8B5CF6',
					pink: '#EC4899',
					cyan: '#06B6D4',
					green: '#10B981',
					yellow: '#F59E0B',
					orange: '#F97316',
					red: '#EF4444',
				},
				neon: {
					blue: '#00D4FF',
					purple: '#A855F7',
					pink: '#F472B6',
					green: '#34D399',
					yellow: '#FBBF24',
					orange: '#FB923C',
				},
				// Enhanced wellness colors with more vibrant options
				wellness: {
					yellow: {
						50: '#FFFEF0',
						100: '#FFF9C2',
						200: '#FFF088',
						300: '#FFE040',
						400: '#FFCC02',
						500: '#FFB800', // More vibrant main yellow
						600: '#E6A500',
						700: '#CC9200',
						800: '#B37F00',
						900: '#996C00',
					},
					blue: {
						50: '#EBF3FF',
						100: '#D6E8FF',
						200: '#A8CFFF',
						300: '#7AB3FF',
						400: '#4D96FF',
						500: '#0066FF', // Electric blue
						600: '#0052CC',
						700: '#003D99',
						800: '#002966',
						900: '#001433',
					},
					purple: {
						50: '#F3F0FF',
						100: '#E6DBFF',
						200: '#D4C2FF',
						300: '#B8A3FF',
						400: '#9B84FF',
						500: '#8B5CF6', // Electric purple
						600: '#7C3AED',
						700: '#6D28D9',
						800: '#5B21B6',
						900: '#4C1D95',
					},
					pink: {
						50: '#FDF2F8',
						100: '#FCE7F3',
						200: '#FBCFE8',
						300: '#F9A8D4',
						400: '#F472B6',
						500: '#EC4899', // Electric pink
						600: '#DB2777',
						700: '#BE185D',
						800: '#9D174D',
						900: '#831843',
					}
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
					'50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' }
				},
				'bounce-subtle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite'
			},
			fontFamily: {
				sans: ['Noto Sans KR', 'sans-serif'],
			},
			backgroundImage: {
				'gradient-primary': 'linear-gradient(135deg, #0066FF 0%, #8B5CF6 100%)',
				'gradient-secondary': 'linear-gradient(135deg, #FFB800 0%, #FF6B6B 100%)',
				'gradient-accent': 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
				'gradient-rainbow': 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 25%, #45B7D1 50%, #96CEB4 75%, #FFEAA7 100%)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
