# LedgerLens — Complete Frontend Build Spec
## Framer-Quality UI: Animations, Effects, Landing Page & App Shell
### Place this file at: `apps/web/FRONTEND.md` — read it before every UI session in Cursor

---

## OVERVIEW

This file covers everything needed to build a Framer-quality frontend **for free**, hosted on Vercel. No Framer subscription. No paid templates. No AI tool paywalls.

**The complete tech stack (all free/open source):**
```bash
# Install everything at once from apps/web/
pnpm add motion @shadergradient/react @react-three/fiber three three-stdlib camera-controls
pnpm add @mesh-gradient/react
pnpm add clsx tailwind-merge
pnpm add next-seo        # SEO meta tags
pnpm add next-sitemap    # auto sitemap generation
pnpm add @vercel/analytics  # free analytics on Vercel

# Dev deps
pnpm add -D @types/three
```

**What each package gives you:**
| Package | What it replaces from Framer |
|---|---|
| `motion` (framer-motion v11+) | All Framer Motion animations |
| `@shadergradient/react` | The fluid WebGL mesh gradient backgrounds |
| `@mesh-gradient/react` | Simpler Apple-style mesh gradient (lighter weight) |
| `@react-three/fiber` | 3D/WebGL canvas for backgrounds |
| `next-seo` | Meta tags, OG images, Twitter cards |
| `next-sitemap` | Auto-generated sitemap.xml |
| `@vercel/analytics` | Free page analytics on Vercel |

---

## PART 1 — PROJECT SETUP

### 1.1 File Structure for Frontend

```
apps/web/
├── app/
│   ├── (landing)/              # Landing page route group (public)
│   │   ├── layout.tsx          # Landing layout (no sidebar/topbar)
│   │   ├── page.tsx            # Landing page — assembles all sections
│   │   └── og-image/           # Dynamic OG image route
│   │       └── route.tsx
│   ├── (workspace)/            # App workspace (existing spec)
│   │   └── ...
│   ├── layout.tsx              # Root layout — fonts, analytics, SEO defaults
│   ├── globals.css             # Design tokens + base styles
│   ├── sitemap.ts              # Next.js 15 sitemap
│   └── robots.ts               # robots.txt
├── components/
│   ├── landing/                # Landing page sections
│   │   ├── Navbar.tsx
│   │   ├── HeroSection.tsx
│   │   ├── LogoStrip.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── DataSourcesSection.tsx
│   │   ├── DemoSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── PricingSection.tsx
│   │   ├── CTASection.tsx
│   │   └── Footer.tsx
│   ├── effects/                # Reusable visual effects
│   │   ├── MeshGradient.tsx    # WebGL fluid background
│   │   ├── GridPattern.tsx     # Dot/line grid background
│   │   ├── BorderBeam.tsx      # Animated border glow
│   │   ├── SpotlightCard.tsx   # Mouse-follow spotlight
│   │   ├── GlowButton.tsx      # Animated glow button
│   │   ├── TextReveal.tsx      # Scroll-triggered text animation
│   │   ├── NumberTicker.tsx    # Animated counting numbers
│   │   └── NoiseBg.tsx         # SVG noise texture overlay
│   ├── layout/                 # App shell (existing spec)
│   └── ui/                     # shadcn primitives
├── lib/
│   ├── fonts.ts                # Font configuration
│   └── utils.ts                # cn() utility
└── public/
    ├── fonts/                  # Self-hosted fonts if needed
    └── og-image.png            # Static OG fallback
```

### 1.2 Root Layout with SEO + Fonts + Analytics

```tsx
// apps/web/app/layout.tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://ledgerlens.app'),
  title: {
    default: 'LedgerLens — AI Analyst Workspace for Financial Intelligence',
    template: '%s | LedgerLens',
  },
  description:
    'Grounded financial analysis powered by SEC filings, FRED macro data, and live news. Ask questions, get cited answers. Built for analysts who need precision.',
  keywords: [
    'financial analysis AI',
    'SEC filing analysis',
    'earnings analysis',
    'investment research',
    'FRED macroeconomic data',
    'RAG finance',
  ],
  authors: [{ name: 'LedgerLens' }],
  creator: 'LedgerLens',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ledgerlens.app',
    title: 'LedgerLens — AI Analyst Workspace',
    description: 'Ask anything about any company. Get grounded answers from SEC filings, macro data, and news.',
    siteName: 'LedgerLens',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LedgerLens — AI Financial Analysis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LedgerLens — AI Analyst Workspace',
    description: 'Ask anything about any company. Get grounded answers.',
    images: ['/og-image.png'],
    creator: '@ledgerlens',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body className="bg-[var(--ll-bg-base)] text-[var(--ll-text-primary)] antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 1.3 Sitemap + Robots

```tsx
// apps/web/app/sitemap.ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://ledgerlens.app',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://ledgerlens.app/pricing',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}

// apps/web/app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/workspace/' },
    sitemap: 'https://ledgerlens.app/sitemap.xml',
  }
}
```

### 1.4 Complete CSS Design Tokens

```css
/* apps/web/app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* ── Backgrounds ── */
  --ll-bg-base:        #0a0a0f;
  --ll-bg-surface:     #111118;
  --ll-bg-elevated:    #16161f;
  --ll-bg-overlay:     #1c1c28;

  /* ── Borders ── */
  --ll-border-hairline: rgba(255,255,255,0.06);
  --ll-border-default:  rgba(255,255,255,0.10);
  --ll-border-strong:   rgba(255,255,255,0.18);

  /* ── Text ── */
  --ll-text-primary:   #f0eff8;
  --ll-text-secondary: #9b9aaa;
  --ll-text-tertiary:  #5c5b6e;
  --ll-text-inverse:   #0a0a0f;

  /* ── Single Accent (teal-blue) ── */
  --ll-accent:         #2dd4bf;
  --ll-accent-dim:     rgba(45,212,191,0.12);
  --ll-accent-hover:   #5eead4;
  --ll-accent-border:  rgba(45,212,191,0.30);

  /* ── Semantic ── */
  --ll-positive:  #34d399;
  --ll-negative:  #f87171;
  --ll-warning:   #fbbf24;

  /* ── Source colors ── */
  --ll-source-sec:   #818cf8;
  --ll-source-fred:  #34d399;
  --ll-source-news:  #fbbf24;
  --ll-source-chart: #2dd4bf;

  /* ── Shadows ── */
  --ll-shadow-1: 0 1px 2px rgba(0,0,0,0.5);
  --ll-shadow-2: 0 4px 16px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.4);
  --ll-shadow-3: 0 16px 40px rgba(0,0,0,0.7), 0 4px 10px rgba(0,0,0,0.4);
  --ll-glow-accent: 0 0 0 1px rgba(45,212,191,0.3), 0 0 20px rgba(45,212,191,0.12);
  --ll-glow-card:   0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.4);

  /* ── Radius ── */
  --ll-radius-xs: 2px;
  --ll-radius-sm: 4px;
  --ll-radius-md: 8px;
  --ll-radius-lg: 14px;
  --ll-radius-xl: 20px;

  /* ── Fonts ── */
  --ll-font-ui:   var(--font-geist-sans), system-ui, sans-serif;
  --ll-font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* ── Layout ── */
  --ll-sidebar-width: 220px;
  --ll-topbar-height: 52px;
  --ll-drawer-width:  340px;
}

/* Base resets */
* { box-sizing: border-box; }

body {
  background: var(--ll-bg-base);
  color: var(--ll-text-primary);
  font-family: var(--ll-font-ui);
  font-size: 1rem;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar styling */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--ll-border-default);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover { background: var(--ll-border-strong); }

/* Selection */
::selection {
  background: var(--ll-accent-dim);
  color: var(--ll-text-primary);
}

/* Smooth scroll */
html { scroll-behavior: smooth; }

/* Noise texture overlay utility */
.noise-overlay::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.035;
  pointer-events: none;
  z-index: 1;
}
```

---

## PART 2 — VISUAL EFFECTS COMPONENTS

### 2.1 Fluid Mesh Gradient Background (The Framer Smoke Effect)

This is the exact effect from that Portfolite screenshot — the flowing smoke/fluid background. No image files needed.

```tsx
// apps/web/components/effects/MeshGradient.tsx
'use client'

import { useEffect, useRef } from 'react'

// Pure CSS/Canvas mesh gradient — no WebGL dependency needed for this version
// Colors tuned for LedgerLens: deep black + subtle teal wisps
export function MeshGradient({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animFrame: number
    let t = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Gradient blobs — positions animate with sin/cos for organic movement
    const blobs = [
      { x: 0.2, y: 0.3, r: 0.45, color: 'rgba(45,212,191,0.07)' },   // teal
      { x: 0.8, y: 0.6, r: 0.50, color: 'rgba(129,140,248,0.06)' },  // violet
      { x: 0.5, y: 0.8, r: 0.40, color: 'rgba(45,212,191,0.04)' },   // teal dim
      { x: 0.1, y: 0.7, r: 0.35, color: 'rgba(52,211,153,0.05)' },   // green
    ]

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // Base background
      ctx.fillStyle = '#0a0a0f'
      ctx.fillRect(0, 0, w, h)

      // Draw animated blobs
      blobs.forEach((blob, i) => {
        const speed = 0.0003 + i * 0.0001
        const px = (blob.x + Math.sin(t * speed + i * 1.5) * 0.15) * w
        const py = (blob.y + Math.cos(t * speed * 0.8 + i * 2.1) * 0.12) * h
        const radius = blob.r * Math.max(w, h)

        const grad = ctx.createRadialGradient(px, py, 0, px, py, radius)
        grad.addColorStop(0, blob.color)
        grad.addColorStop(1, 'transparent')

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fill()
      })

      t++
      animFrame = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animFrame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
```

### 2.2 Dot Grid Background

```tsx
// apps/web/components/effects/GridPattern.tsx
'use client'

import { useEffect, useRef } from 'react'

interface GridPatternProps {
  dotColor?: string
  dotSize?: number
  gap?: number
  className?: string
  // Optional: fade from center, fade from edges
  fade?: 'center' | 'edges' | 'none'
}

export function GridPattern({
  dotColor = 'rgba(255,255,255,0.15)',
  dotSize = 1,
  gap = 28,
  className = '',
  fade = 'edges',
}: GridPatternProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dot-grid"
            x="0"
            y="0"
            width={gap}
            height={gap}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={gap / 2} cy={gap / 2} r={dotSize} fill={dotColor} />
          </pattern>
          {fade !== 'none' && (
            <radialGradient id="dot-fade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity={fade === 'center' ? '1' : '0'} />
              <stop offset="100%" stopColor="white" stopOpacity={fade === 'center' ? '0' : '1'} />
            </radialGradient>
          )}
          {fade !== 'none' && (
            <mask id="dot-mask">
              <rect width="100%" height="100%" fill="url(#dot-fade)" />
            </mask>
          )}
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#dot-grid)"
          mask={fade !== 'none' ? 'url(#dot-mask)' : undefined}
        />
      </svg>
    </div>
  )
}
```

### 2.3 Border Beam (Animated Glow Border)

```tsx
// apps/web/components/effects/BorderBeam.tsx
'use client'

import { CSSProperties } from 'react'

interface BorderBeamProps {
  size?: number
  duration?: number
  delay?: number
  colorFrom?: string
  colorTo?: string
  className?: string
}

export function BorderBeam({
  size = 200,
  duration = 12,
  delay = 0,
  colorFrom = 'transparent',
  colorTo = 'var(--ll-accent)',
  className = '',
}: BorderBeamProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 rounded-[inherit] ${className}`}
      style={
        {
          '--size': size,
          '--duration': duration,
          '--delay': `-${delay}s`,
          '--color-from': colorFrom,
          '--color-to': colorTo,
          'mask': `
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0)
          `,
          'maskComposite': 'exclude',
          'WebkitMaskComposite': 'xor',
          padding: '1px',
        } as CSSProperties
      }
    >
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: `conic-gradient(from calc(var(--angle, 0deg)), var(--color-from) 0%, var(--color-to) 10%, var(--color-from) 20%)`,
          animation: `border-beam-spin calc(var(--duration) * 1s) linear infinite`,
          animationDelay: 'var(--delay)',
        }}
      />
      <style>{`
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes border-beam-spin {
          to { --angle: 360deg; }
        }
      `}</style>
    </div>
  )
}
```

### 2.4 Spotlight Card (Mouse-Follow Glow)

```tsx
// apps/web/components/effects/SpotlightCard.tsx
'use client'

import { useRef, useState, MouseEvent, ReactNode } from 'react'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  spotlightColor?: string
}

export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(45,212,191,0.08)',
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-[var(--ll-radius-lg)]
        border border-[var(--ll-border-default)]
        bg-[var(--ll-bg-elevated)]
        transition-all duration-300
        hover:border-[var(--ll-border-strong)]
        hover:shadow-[var(--ll-glow-card)]
        ${className}`}
    >
      {/* Spotlight overlay */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 60%)`,
        }}
        aria-hidden="true"
      />
      {children}
    </div>
  )
}
```

### 2.5 Glow Button

```tsx
// apps/web/components/effects/GlowButton.tsx
'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'motion/react'

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function GlowButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: GlowButtonProps) {
  const sizeClasses = {
    sm: 'h-8 px-4 text-xs',
    md: 'h-10 px-6 text-sm',
    lg: 'h-12 px-8 text-base',
  }

  const variantClasses = {
    primary: `
      bg-[var(--ll-accent)] text-[var(--ll-text-inverse)] font-semibold
      hover:bg-[var(--ll-accent-hover)]
      shadow-[0_0_20px_rgba(45,212,191,0.25)]
      hover:shadow-[0_0_32px_rgba(45,212,191,0.45)]
    `,
    secondary: `
      bg-transparent border border-[var(--ll-border-default)]
      text-[var(--ll-text-primary)] font-medium
      hover:border-[var(--ll-accent-border)]
      hover:text-[var(--ll-accent)]
      hover:shadow-[var(--ll-glow-accent)]
    `,
    ghost: `
      bg-transparent text-[var(--ll-text-secondary)] font-medium
      hover:text-[var(--ll-text-primary)]
      hover:bg-[var(--ll-bg-elevated)]
    `,
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-[var(--ll-radius-md)]
        font-[var(--ll-font-ui)]
        tracking-[-0.01em]
        transition-all duration-200
        cursor-pointer
        select-none
        outline-none
        focus-visible:ring-2 focus-visible:ring-[var(--ll-accent)] focus-visible:ring-offset-2
        focus-visible:ring-offset-[var(--ll-bg-base)]
        disabled:opacity-40 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  )
}
```

### 2.6 Text Reveal Animation

```tsx
// apps/web/components/effects/TextReveal.tsx
'use client'

import { motion, useInView } from 'motion/react'
import { useRef } from 'react'

interface TextRevealProps {
  children: string
  className?: string
  delay?: number
  duration?: number
  // 'words' splits by word, 'chars' splits by character
  splitBy?: 'words' | 'chars'
}

export function TextReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  splitBy = 'words',
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })

  const units = splitBy === 'words'
    ? children.split(' ')
    : children.split('')

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        className="flex flex-wrap gap-x-[0.25em]"
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={{
          visible: { transition: { staggerChildren: 0.06, delayChildren: delay } },
        }}
      >
        {units.map((unit, i) => (
          <motion.span
            key={i}
            className="inline-block"
            variants={{
              hidden: { y: '110%', opacity: 0 },
              visible: {
                y: '0%',
                opacity: 1,
                transition: { duration, ease: [0.33, 1, 0.68, 1] },
              },
            }}
          >
            {unit === ' ' ? '\u00A0' : unit}
          </motion.span>
        ))}
      </motion.div>
    </div>
  )
}
```

### 2.7 Number Ticker (Animated Count-Up)

```tsx
// apps/web/components/effects/NumberTicker.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'

interface NumberTickerProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
}

export function NumberTicker({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2000,
  className = '',
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let startTime: number
    let animFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(eased * value)
      if (progress < 1) animFrame = requestAnimationFrame(animate)
    }

    animFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrame)
  }, [isInView, value, duration])

  return (
    <span ref={ref} className={`tabular-nums font-[var(--ll-font-mono)] ${className}`}>
      {prefix}{current.toFixed(decimals)}{suffix}
    </span>
  )
}
```

---

## PART 3 — LANDING PAGE SECTIONS

### 3.1 Landing Layout

```tsx
// apps/web/app/(landing)/layout.tsx
import type { ReactNode } from 'react'

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="noise-overlay relative min-h-screen bg-[var(--ll-bg-base)] overflow-x-hidden">
      {children}
    </div>
  )
}
```

```tsx
// apps/web/app/(landing)/page.tsx
import { Navbar }             from '@/components/landing/Navbar'
import { HeroSection }        from '@/components/landing/HeroSection'
import { LogoStrip }          from '@/components/landing/LogoStrip'
import { FeaturesSection }    from '@/components/landing/FeaturesSection'
import { HowItWorksSection }  from '@/components/landing/HowItWorksSection'
import { DataSourcesSection } from '@/components/landing/DataSourcesSection'
import { DemoSection }        from '@/components/landing/DemoSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { PricingSection }     from '@/components/landing/PricingSection'
import { CTASection }         from '@/components/landing/CTASection'
import { Footer }             from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <LogoStrip />
        <FeaturesSection />
        <HowItWorksSection />
        <DataSourcesSection />
        <DemoSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
```

### 3.2 Navbar

```tsx
// apps/web/components/landing/Navbar.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, TrendingUp } from 'lucide-react'
import { GlowButton } from '@/components/effects/GlowButton'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Data sources', href: '#data-sources' },
  { label: 'Pricing', href: '#pricing' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          ${scrolled
            ? 'bg-[var(--ll-bg-base)]/90 backdrop-blur-xl border-b border-[var(--ll-border-hairline)]'
            : 'bg-transparent'
          }
        `}
      >
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="
              w-8 h-8 rounded-[var(--ll-radius-md)]
              bg-[var(--ll-accent-dim)]
              border border-[var(--ll-accent-border)]
              flex items-center justify-center
              group-hover:bg-[var(--ll-accent)]
              transition-colors duration-200
            ">
              <TrendingUp size={16} className="text-[var(--ll-accent)] group-hover:text-[var(--ll-text-inverse)]" />
            </div>
            <span className="
              font-semibold text-[var(--ll-text-primary)]
              tracking-[-0.02em] text-[1.05rem]
            ">
              LedgerLens
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="
                  px-4 py-2 rounded-[var(--ll-radius-md)]
                  text-sm font-medium text-[var(--ll-text-secondary)]
                  hover:text-[var(--ll-text-primary)]
                  hover:bg-[var(--ll-bg-elevated)]
                  transition-all duration-150
                "
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/workspace"
              className="text-sm font-medium text-[var(--ll-text-secondary)] hover:text-[var(--ll-text-primary)] transition-colors"
            >
              Sign in
            </a>
            <GlowButton variant="primary" size="sm" onClick={() => {}}>
              Start free →
            </GlowButton>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-[var(--ll-text-secondary)] hover:text-[var(--ll-text-primary)]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="
              fixed top-16 inset-x-0 z-40
              bg-[var(--ll-bg-surface)]/95 backdrop-blur-xl
              border-b border-[var(--ll-border-hairline)]
              p-4 flex flex-col gap-1 md:hidden
            "
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="
                  px-4 py-3 rounded-[var(--ll-radius-md)]
                  text-sm font-medium text-[var(--ll-text-secondary)]
                  hover:text-[var(--ll-text-primary)] hover:bg-[var(--ll-bg-elevated)]
                  transition-all duration-150
                "
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-[var(--ll-border-hairline)] mt-1">
              <GlowButton variant="primary" size="md" className="w-full">
                Start free →
              </GlowButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

### 3.3 Hero Section

```tsx
// apps/web/components/landing/HeroSection.tsx
'use client'

import { motion } from 'motion/react'
import { MeshGradient } from '@/components/effects/MeshGradient'
import { GridPattern }  from '@/components/effects/GridPattern'
import { GlowButton }   from '@/components/effects/GlowButton'
import { BorderBeam }   from '@/components/effects/BorderBeam'
import { ArrowRight, FileText, TrendingUp, Newspaper } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Backgrounds — layered */}
      <MeshGradient className="opacity-100" />
      <GridPattern dotColor="rgba(255,255,255,0.06)" gap={32} fade="edges" />

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(45,212,191,0.06),transparent)]" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[var(--ll-bg-base)] to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 mb-8"
        >
          <span className="
            px-3 py-1 rounded-full
            border border-[var(--ll-accent-border)]
            bg-[var(--ll-accent-dim)]
            text-[var(--ll-accent)] text-xs font-medium
            tracking-[0.04em]
          ">
            Now in beta — SEC · FRED · News
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
          className="
            text-5xl md:text-7xl font-bold
            text-[var(--ll-text-primary)]
            tracking-[-0.03em] leading-[1.05]
            mb-6
          "
        >
          Ask anything about
          <br />
          <span className="text-[var(--ll-accent)]">any company.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="
            text-lg md:text-xl text-[var(--ll-text-secondary)]
            max-w-2xl mx-auto mb-10
            leading-relaxed
          "
        >
          Grounded answers from SEC filings, FRED macro data, and live news —
          all in one workspace. Every claim is cited. Nothing is fabricated.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <GlowButton variant="primary" size="lg">
            Start for free
            <ArrowRight size={16} />
          </GlowButton>
          <GlowButton variant="secondary" size="lg">
            Watch demo
          </GlowButton>
        </motion.div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-6 text-xs text-[var(--ll-text-tertiary)]"
        >
          No credit card required · Free tier includes 50 queries/month
        </motion.p>

        {/* Mock terminal preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.33, 1, 0.68, 1] }}
          className="
            relative mt-16 mx-auto max-w-3xl
            rounded-[var(--ll-radius-xl)]
            border border-[var(--ll-border-default)]
            bg-[var(--ll-bg-surface)]
            overflow-hidden
            shadow-[var(--ll-shadow-3)]
          "
        >
          <BorderBeam colorTo="var(--ll-accent)" duration={10} />

          {/* Window chrome */}
          <div className="
            flex items-center gap-2 px-4 py-3
            border-b border-[var(--ll-border-hairline)]
            bg-[var(--ll-bg-elevated)]
          ">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-xs text-[var(--ll-text-tertiary)] font-mono">
              ledgerlens — AAPL workspace
            </span>
          </div>

          {/* Mock content */}
          <div className="p-6 text-left space-y-4">
            {/* User query */}
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-[var(--ll-accent-dim)] border border-[var(--ll-accent-border)] flex-shrink-0 flex items-center justify-center">
                <span className="text-[10px] text-[var(--ll-accent)] font-bold">U</span>
              </div>
              <p className="text-sm text-[var(--ll-text-secondary)] leading-relaxed">
                What changed in Apple's latest 10-K? Focus on revenue mix and new risk factors.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-[var(--ll-border-hairline)]" />

            {/* AI answer */}
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-[var(--ll-radius-sm)] bg-[var(--ll-accent)] flex-shrink-0 flex items-center justify-center">
                  <TrendingUp size={12} className="text-[var(--ll-text-inverse)]" />
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-sm text-[var(--ll-text-primary)] leading-relaxed">
                    Apple's FY2024 10-K shows revenue of <span className="font-mono text-[var(--ll-accent)]">$391.0B</span>,
                    a <span className="text-[var(--ll-positive)]">+2.1%</span> increase YoY.
                    Services revenue grew <span className="text-[var(--ll-positive)]">+13%</span> to
                    <span className="font-mono text-[var(--ll-accent)]"> $96.2B</span>, now representing
                    24.6% of total revenue
                    <sup className="text-[var(--ll-accent)] font-mono text-[10px] ml-0.5 cursor-pointer">[1]</sup>.
                  </p>
                  <p className="text-sm text-[var(--ll-text-primary)] leading-relaxed">
                    New risk factors include EU Digital Markets Act compliance costs and
                    DOJ antitrust scrutiny of App Store practices
                    <sup className="text-[var(--ll-accent)] font-mono text-[10px] ml-0.5">[2]</sup>.
                  </p>
                </div>
              </div>

              {/* Source chips */}
              <div className="flex gap-2 flex-wrap ml-9">
                {[
                  { icon: FileText, label: 'AAPL 10-K 2024', type: 'sec' },
                  { icon: Newspaper, label: 'Reuters · Apr 12', type: 'news' },
                ].map((source) => (
                  <div
                    key={source.label}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--ll-radius-sm)]
                      bg-[var(--ll-bg-overlay)] border border-[var(--ll-border-default)]"
                  >
                    <source.icon size={11} style={{ color: source.type === 'sec' ? 'var(--ll-source-sec)' : 'var(--ll-source-news)' }} />
                    <span className="text-[11px] text-[var(--ll-text-secondary)] font-medium">
                      {source.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

### 3.4 Logo Strip

```tsx
// apps/web/components/landing/LogoStrip.tsx
'use client'

import { motion } from 'motion/react'

const LOGOS = [
  'SEC EDGAR', 'FRED', 'Reuters', 'Bloomberg', 'S&P 500',
  'Nasdaq', 'FactSet', 'Refinitiv', 'Morningstar', 'Pitchbook',
]

export function LogoStrip() {
  return (
    <section className="py-16 border-y border-[var(--ll-border-hairline)] overflow-hidden">
      <p className="text-center text-xs text-[var(--ll-text-tertiary)] uppercase tracking-[0.1em] mb-8">
        Data sourced from trusted providers
      </p>
      <div className="relative flex">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[var(--ll-bg-base)] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[var(--ll-bg-base)] to-transparent z-10" />

        <motion.div
          className="flex gap-16 items-center"
          animate={{ x: [0, -50 * LOGOS.length] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <span
              key={i}
              className="whitespace-nowrap text-sm font-semibold text-[var(--ll-text-tertiary)]
                tracking-[0.06em] uppercase select-none"
            >
              {logo}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
```

### 3.5 Features Section

```tsx
// apps/web/components/landing/FeaturesSection.tsx
'use client'

import { motion } from 'motion/react'
import { SpotlightCard } from '@/components/effects/SpotlightCard'
import {
  FileSearch, BarChart3, Newspaper, Brain,
  BookMarked, Zap
} from 'lucide-react'

const FEATURES = [
  {
    icon: FileSearch,
    title: 'SEC Filing Analysis',
    description: 'Instantly surface what changed between 10-K and 10-Q filings. Risk factors, revenue mix, management commentary — all searchable.',
    color: 'var(--ll-source-sec)',
  },
  {
    icon: BarChart3,
    title: 'FRED Macro Context',
    description: 'Every answer is automatically contextualized with relevant macro indicators — interest rates, CPI, employment, industrial output.',
    color: 'var(--ll-source-fred)',
  },
  {
    icon: Newspaper,
    title: 'Live News Synthesis',
    description: 'Three independent news sources cross-referenced against filing data. Breaking developments surface before they hit consensus.',
    color: 'var(--ll-source-news)',
  },
  {
    icon: Brain,
    title: 'Grounded Answers Only',
    description: 'Every claim is cited. The model cannot fabricate — it can only synthesize from retrieved evidence. Citation superscripts link to sources.',
    color: 'var(--ll-accent)',
  },
  {
    icon: BookMarked,
    title: 'Persistent Workspaces',
    description: 'Save company workspaces, bookmark key answers, and resume sessions. Your research persists across logins.',
    color: 'var(--ll-source-sec)',
  },
  {
    icon: Zap,
    title: 'Real-time Streaming',
    description: 'Answers stream token by token. Sources populate as they\'re retrieved. No waiting for a full response before you start reading.',
    color: 'var(--ll-source-fred)',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-xs text-[var(--ll-accent)] font-medium tracking-[0.1em] uppercase mb-3"
          >
            Built for analysts
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-[var(--ll-text-primary)] tracking-[-0.03em] mb-4"
          >
            Everything in one workspace
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-lg text-[var(--ll-text-secondary)] max-w-xl mx-auto"
          >
            Stop switching between Bloomberg, EDGAR, and news tabs.
            LedgerLens brings it all into one grounded AI workspace.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <SpotlightCard
                spotlightColor={`${feature.color}14`}
                className="p-6 h-full"
              >
                <div
                  className="w-10 h-10 rounded-[var(--ll-radius-md)] flex items-center justify-center mb-4"
                  style={{
                    background: `${feature.color}18`,
                    border: `1px solid ${feature.color}35`,
                  }}
                >
                  <feature.icon size={20} style={{ color: feature.color }} />
                </div>
                <h3 className="text-base font-semibold text-[var(--ll-text-primary)] mb-2 tracking-[-0.01em]">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--ll-text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### 3.6 How It Works Section

```tsx
// apps/web/components/landing/HowItWorksSection.tsx
'use client'

import { motion } from 'motion/react'
import { Search, Database, Sparkles, FileCheck } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    icon: Search,
    title: 'Choose a company',
    description: 'Search any public company by name or ticker. LedgerLens immediately indexes all available filings, macro context, and news.',
  },
  {
    num: '02',
    icon: Database,
    title: 'Sources are retrieved',
    description: 'Your question triggers a semantic search across SEC filings, FRED series, and three news providers. Top evidence is assembled.',
  },
  {
    num: '03',
    icon: Sparkles,
    title: 'Grounded answer streams',
    description: 'The model synthesizes only from retrieved evidence. Every factual claim gets an inline citation you can click to verify.',
  },
  {
    num: '04',
    icon: FileCheck,
    title: 'Save and follow up',
    description: 'Save the workspace, bookmark key answers, and ask follow-up questions. Session memory keeps context across the conversation.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-32 px-6 relative">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-[var(--ll-bg-surface)] opacity-40" />

      <div className="relative mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-[var(--ll-text-primary)] tracking-[-0.03em] mb-4"
          >
            How it works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-lg text-[var(--ll-text-secondary)]"
          >
            From question to grounded answer in seconds.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="
                flex gap-5 p-6
                rounded-[var(--ll-radius-lg)]
                border border-[var(--ll-border-default)]
                bg-[var(--ll-bg-elevated)]
                hover:border-[var(--ll-border-strong)]
                transition-colors duration-200
              "
            >
              <div className="flex-shrink-0">
                <span className="
                  font-mono text-xs font-semibold
                  text-[var(--ll-accent)] tracking-[0.06em]
                ">
                  {step.num}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <step.icon size={16} className="text-[var(--ll-accent)]" />
                  <h3 className="text-base font-semibold text-[var(--ll-text-primary)] tracking-[-0.01em]">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm text-[var(--ll-text-secondary)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### 3.7 Stats / Social Proof Strip

```tsx
// apps/web/components/landing/StatsSection.tsx
'use client'

import { motion } from 'motion/react'
import { NumberTicker } from '@/components/effects/NumberTicker'

const STATS = [
  { value: 35, suffix: 'M+', label: 'SEC filing chunks indexed' },
  { value: 500, suffix: 'K+', label: 'FRED series available' },
  { value: 99.5, suffix: '%', label: 'Answer grounding accuracy', decimals: 1 },
  { value: 3, suffix: 's', label: 'Median time to first token' },
]

export function StatsSection() {
  return (
    <section className="py-20 px-6 border-y border-[var(--ll-border-hairline)]">
      <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="text-center"
          >
            <div className="
              text-3xl md:text-4xl font-bold
              text-[var(--ll-text-primary)]
              tracking-[-0.03em] mb-1
              font-[var(--ll-font-mono)]
            ">
              <NumberTicker
                value={stat.value}
                suffix={stat.suffix}
                decimals={stat.decimals ?? 0}
              />
            </div>
            <p className="text-xs text-[var(--ll-text-tertiary)] uppercase tracking-[0.07em]">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
```

### 3.8 Pricing Section

```tsx
// apps/web/components/landing/PricingSection.tsx
'use client'

import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { BorderBeam } from '@/components/effects/BorderBeam'
import { GlowButton } from '@/components/effects/GlowButton'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'For individual analysts getting started.',
    features: [
      '50 queries per month',
      '5 company workspaces',
      'SEC + FRED sources',
      '7-day chat history',
      'Community support',
    ],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For analysts who need unlimited depth.',
    features: [
      'Unlimited queries',
      'Unlimited workspaces',
      'SEC + FRED + 3 news sources',
      'Unlimited chat history',
      'Priority retrieval',
      'Export to PDF/memo',
      'Email support',
    ],
    cta: 'Start Pro trial',
    highlighted: true,
  },
  {
    name: 'Team',
    price: '$199',
    period: '/month',
    description: 'For research teams and fund analysts.',
    features: [
      'Everything in Pro',
      'Up to 10 seats',
      'Shared workspaces',
      'Team bookmarks',
      'API access (beta)',
      'Slack integration',
      'Dedicated support',
    ],
    cta: 'Contact sales',
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-32 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-[var(--ll-text-primary)] tracking-[-0.03em] mb-4"
          >
            Simple pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-lg text-[var(--ll-text-secondary)]"
          >
            Start free. Upgrade when you need more.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`
                relative rounded-[var(--ll-radius-xl)] p-6 flex flex-col
                ${plan.highlighted
                  ? 'border border-[var(--ll-accent-border)] bg-[var(--ll-bg-elevated)] shadow-[var(--ll-glow-card)]'
                  : 'border border-[var(--ll-border-default)] bg-[var(--ll-bg-surface)]'
                }
              `}
            >
              {plan.highlighted && <BorderBeam colorTo="var(--ll-accent)" duration={8} />}

              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="
                    px-3 py-1 rounded-full
                    bg-[var(--ll-accent)] text-[var(--ll-text-inverse)]
                    text-xs font-semibold tracking-[0.04em]
                  ">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm font-semibold text-[var(--ll-text-secondary)] uppercase tracking-[0.07em] mb-2">
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-[var(--ll-text-primary)] tracking-[-0.03em] font-mono">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[var(--ll-text-tertiary)]">{plan.period}</span>
                </div>
                <p className="text-sm text-[var(--ll-text-secondary)]">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      size={14}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: plan.highlighted ? 'var(--ll-accent)' : 'var(--ll-positive)' }}
                    />
                    <span className="text-sm text-[var(--ll-text-secondary)]">{feature}</span>
                  </li>
                ))}
              </ul>

              <GlowButton
                variant={plan.highlighted ? 'primary' : 'secondary'}
                size="md"
                className="w-full"
              >
                {plan.cta}
              </GlowButton>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### 3.9 CTA Section

```tsx
// apps/web/components/landing/CTASection.tsx
'use client'

import { motion } from 'motion/react'
import { MeshGradient } from '@/components/effects/MeshGradient'
import { GlowButton } from '@/components/effects/GlowButton'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <MeshGradient className="opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(45,212,191,0.06),transparent)]" />

      <div className="relative mx-auto max-w-3xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold text-[var(--ll-text-primary)] tracking-[-0.03em] mb-6 leading-[1.05]"
        >
          Stop guessing.
          <br />
          <span className="text-[var(--ll-accent)]">Start knowing.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-lg text-[var(--ll-text-secondary)] mb-10 max-w-lg mx-auto leading-relaxed"
        >
          Every answer is grounded in evidence. Every claim is cited.
          Start your analysis in seconds — free, no card required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <GlowButton variant="primary" size="lg">
            Get started free
            <ArrowRight size={16} />
          </GlowButton>
        </motion.div>
      </div>
    </section>
  )
}
```

### 3.10 Footer

```tsx
// apps/web/components/landing/Footer.tsx
import { TrendingUp } from 'lucide-react'

const FOOTER_LINKS = {
  Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  Data: ['SEC EDGAR', 'FRED', 'News sources', 'Data policy'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--ll-border-hairline)] py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-[var(--ll-radius-sm)] bg-[var(--ll-accent-dim)] border border-[var(--ll-accent-border)] flex items-center justify-center">
                <TrendingUp size={14} className="text-[var(--ll-accent)]" />
              </div>
              <span className="font-semibold text-[var(--ll-text-primary)] tracking-[-0.02em]">
                LedgerLens
              </span>
            </div>
            <p className="text-xs text-[var(--ll-text-tertiary)] leading-relaxed max-w-[180px]">
              AI analyst workspace for finance professionals.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-[var(--ll-text-tertiary)] uppercase tracking-[0.08em] mb-4">
                {group}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[var(--ll-text-tertiary)] hover:text-[var(--ll-text-primary)] transition-colors duration-150"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[var(--ll-border-hairline)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--ll-text-tertiary)]">
            © 2026 LedgerLens. All rights reserved.
          </p>
          <p className="text-xs text-[var(--ll-text-tertiary)]">
            Not financial advice. For informational purposes only.
          </p>
        </div>
      </div>
    </footer>
  )
}
```

---

## PART 4 — IMAGE GENERATION MCP SETUP

For any custom images/graphics needed (hero illustrations, OG images, blog assets):

### Option A — `mcp-image` (Recommended — Free Gemini tier)

```json
// .cursor/mcp.json — add this server
{
  "mcpServers": {
    "mcp-image": {
      "command": "npx",
      "args": ["-y", "mcp-image"],
      "env": {
        "GEMINI_API_KEY": "YOUR_GEMINI_API_KEY_HERE",
        "IMAGE_OUTPUT_DIR": "C:/Users/Swarneil Pradhan/ledgerlens/apps/web/public/generated"
      }
    }
  }
}
```

Once connected, tell Cursor:
```
Generate an OG image for LedgerLens:
- 1200x630px
- Dark background (#0a0a0f)
- Abstract financial data visualization
- Teal (#2dd4bf) accent color
- Clean, minimal, professional
- No text needed (we'll overlay text in code)
Save to public/og-image.png
```

### Option B — Replicate (Pay-per-image, no GPU needed)

```json
{
  "mcpServers": {
    "image-gen": {
      "command": "npx",
      "args": ["@gongrzhe/image-gen-server"],
      "env": {
        "REPLICATE_API_TOKEN": "YOUR_REPLICATE_TOKEN"
      }
    }
  }
}
```

---

## PART 5 — CURSOR PROMPTING TEMPLATES FOR THIS SPEC

### Building a landing section from scratch:
```
Build the [SectionName] section for LedgerLens landing page.
Read FRONTEND.md before writing any code.

Rules:
- All colors via var(--ll-*) tokens only
- Use motion/react for all animations
- Entry animations: whileInView with once:true, viewport margin -10%
- Stagger children by 0.07-0.1s delay
- Use SpotlightCard for interactive cards
- Use GlowButton for all CTAs
- Use GridPattern or MeshGradient for background texture
- No images — use Lucide icons and CSS effects only
- Mobile-first, responsive at sm/md/lg breakpoints
- No hardcoded colors, no inline hex values
```

### Building an effect component:
```
Build the [EffectName] component for LedgerLens.
It goes in apps/web/components/effects/[EffectName].tsx.

Requirements:
- 'use client' directive
- TypeScript strict, named export
- Takes className prop for positioning flexibility
- aria-hidden="true" on purely decorative elements
- Cleanup all event listeners and animation frames on unmount
- No external dependencies beyond motion/react
- Under 80 lines
```

### Generating OG image dynamically:
```
Build a dynamic OG image route at apps/web/app/(landing)/og-image/route.tsx
using Next.js ImageResponse.

Design:
- 1200x630px
- Background: #0a0a0f
- Left side: LedgerLens logo + tagline
- Right side: abstract teal (#2dd4bf) gradient shape
- Font: system-ui bold for heading, system-ui regular for tagline
- Accept ?title= query param to customize the heading per page
```

---

## PART 6 — DEPLOYMENT CHECKLIST

Before going live on Vercel:

```
□ NEXT_PUBLIC_SITE_URL set to production domain
□ og-image.png exists in public/ (1200×630)
□ favicon.ico, apple-touch-icon.png, favicon-16x16.png in public/
□ site.webmanifest in public/
□ @vercel/analytics installed and <Analytics /> in root layout
□ sitemap.ts and robots.ts return correct production URLs
□ All <Image /> components use Next.js Image with width/height or fill
□ No console.log() in production code
□ All useEffect cleanups verified (no memory leaks)
□ Lighthouse score: Performance >90, Accessibility >95, SEO 100
□ Test on mobile (375px), tablet (768px), desktop (1280px)
□ Test with keyboard navigation — all interactive elements reachable
□ Test with prefers-reduced-motion — animations should respect it
```

### Reduced Motion Support (add to every animated component):

```tsx
// Add this hook to respect prefers-reduced-motion
import { useReducedMotion } from 'motion/react'

// Inside component:
const shouldReduceMotion = useReducedMotion()

// Then use:
transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
```

---

*LedgerLens Frontend Complete Spec — v1.0 — April 2026*
*Companion files: CURSOR.md (engineering), .cursor/rules/ui-design.mdc (design system)*
*Place this file at: apps/web/FRONTEND.md*
