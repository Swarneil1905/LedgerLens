# LedgerLens — Workspace Screens Upgrade
## Screen 2 (Workspace Home) + Screen 3 (Chat Analysis) — Full Code
### Place at: `apps/web/WORKSPACE_SCREENS.md`

---

## WHAT'S WRONG WITH THE CURRENT SCREENS (diagnosis from screenshots)

**Screen 2 — Workspace Home:**
- Flat, static — no animations, no depth, no visual hierarchy beyond text size
- Company cards look like plain divs — no hover effects, no glow, no spotlight
- The sidebar has no visual weight — blends into the background
- Search input is unstyled — looks like a browser default
- Right drawer is empty with placeholder text but no visual treatment
- No background texture — dead flat dark compared to the landing page
- Company letter avatars (A, M) are the right idea but look like raw colored squares

**Screen 3 — Chat Analysis:**
- Source cards in right drawer have color-coded left borders (good!) but are otherwise flat
- The answer text area has no visual framing — just text floating on dark background
- Follow-up question chips are unstyled border boxes
- Query input at bottom is plain textarea
- No animations on source card entrance, no streaming visual treatment
- The topbar breadcrumb is monospace but understyled
- "Save evidence" links are too quiet — need to read as actions

**Principle for both screens:**
Same visual DNA as the landing page — GridPattern background texture, SpotlightCard hover effects,
GlowButton CTAs, motion/react entrance animations. The workspace should feel like a premium
instrument, not an admin panel.

---

## SHARED WORKSPACE COMPONENTS

### WorkspaceShell (Updated Layout)

```tsx
// apps/web/components/layout/WorkspaceShell.tsx
'use client'

import { ReactNode } from 'react'
import { GridPattern } from '@/components/effects/GridPattern'

interface WorkspaceShellProps {
  topbar: ReactNode
  sidebar: ReactNode
  main: ReactNode
  drawer: ReactNode
}

export function WorkspaceShell({ topbar, sidebar, main, drawer }: WorkspaceShellProps) {
  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-[var(--ll-bg-base)]">
      {/* Subtle grid pattern — same texture as landing, much more subtle here */}
      <GridPattern
        dotColor="rgba(255,255,255,0.03)"
        gap={32}
        fade="none"
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Very faint teal radial — top-left, anchors the workspace */}
      <div
        className="fixed top-0 left-0 w-[600px] h-[400px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(45,212,191,0.04) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Topbar — spans full width */}
      <div className="relative z-20 flex-shrink-0 h-[var(--ll-topbar-height)] border-b border-[var(--ll-border-hairline)] bg-[var(--ll-bg-base)]/95 backdrop-blur-xl">
        {topbar}
      </div>

      {/* Below topbar: sidebar + main + drawer */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="
          flex-shrink-0 w-[var(--ll-sidebar-width)]
          border-r border-[var(--ll-border-hairline)]
          bg-[var(--ll-bg-base)]/95
          flex flex-col
          overflow-y-auto
        ">
          {sidebar}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[var(--ll-bg-base)]">
          {main}
        </main>

        {/* Right drawer */}
        <aside className="
          flex-shrink-0 w-[var(--ll-drawer-width)]
          border-l border-[var(--ll-border-hairline)]
          bg-[var(--ll-bg-base)]/95
          flex flex-col
          overflow-y-auto
        ">
          {drawer}
        </aside>
      </div>
    </div>
  )
}
```

### Updated Sidebar

```tsx
// apps/web/components/layout/Sidebar.tsx
'use client'

import { motion } from 'motion/react'
import { usePathname } from 'next/navigation'
import {
  Home, Bookmark, Save, Building2, TrendingUp
} from 'lucide-react'

const NAV_ITEMS = [
  { icon: Home,      label: 'Home',      href: '/work' },
  { icon: Save,      label: 'Saved',     href: '/work/saved' },
  { icon: Bookmark,  label: 'Bookmarks', href: '/work/bookmarks' },
  { icon: Building2, label: 'Company',   href: '/work/company' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full py-4">
      {/* Brand mark */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="
            w-6 h-6 rounded-[var(--ll-radius-sm)]
            bg-[var(--ll-accent-dim)] border border-[var(--ll-accent-border)]
            flex items-center justify-center flex-shrink-0
          ">
            <TrendingUp size={12} className="text-[var(--ll-accent)]" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[var(--ll-text-tertiary)] uppercase tracking-[0.1em]">
              LedgerLens
            </p>
            <p className="text-sm font-bold text-[var(--ll-text-primary)] tracking-[-0.02em] leading-none mt-0.5">
              Workspace
            </p>
          </div>
        </div>
      </div>

      {/* Nav section label */}
      <p className="px-4 mb-2 text-[10px] font-semibold text-[var(--ll-text-tertiary)] uppercase tracking-[0.1em]">
        Navigate
      </p>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map((item, i) => {
          const isActive = pathname === item.href
          return (
            <motion.a
              key={item.label}
              href={item.href}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`
                flex items-center gap-2.5 h-9
                rounded-[var(--ll-radius-md)]
                text-sm font-medium
                transition-all duration-150
                group relative
                ${isActive
                  ? 'bg-[var(--ll-bg-elevated)] text-[var(--ll-text-primary)] pl-[10px] pr-3 border-l-2 border-[var(--ll-accent)]'
                  : 'px-3 text-[var(--ll-text-secondary)] hover:bg-[var(--ll-bg-elevated)] hover:text-[var(--ll-text-primary)]'
                }
              `}
            >
              <item.icon
                size={15}
                className={isActive ? 'text-[var(--ll-accent)]' : 'text-[var(--ll-text-tertiary)] group-hover:text-[var(--ll-text-secondary)]'}
              />
              {item.label}

              {/* Active glow dot */}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--ll-accent)] shadow-[0_0_6px_var(--ll-accent)]" />
              )}
            </motion.a>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer hint */}
      <div className="px-4 pb-2">
        <p className="text-[10px] text-[var(--ll-text-tertiary)] leading-relaxed">
          v0.1.0 beta
        </p>
      </div>
    </div>
  )
}
```

### Updated TopBar

```tsx
// apps/web/components/layout/TopBar.tsx
'use client'

import { motion } from 'motion/react'
import { Search, BarChart2, Bell, ChevronRight } from 'lucide-react'

interface TopBarProps {
  breadcrumb?: { label: string; href?: string }[]
  actions?: React.ReactNode
}

export function TopBar({ breadcrumb = [], actions }: TopBarProps) {
  return (
    <div className="h-full flex items-center justify-between px-6">
      {/* Left: breadcrumb */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-1.5"
      >
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} className="text-[var(--ll-text-tertiary)]" />}
            <span className={`
              text-sm font-mono tracking-[-0.01em]
              ${i === breadcrumb.length - 1
                ? 'text-[var(--ll-text-primary)] font-semibold'
                : 'text-[var(--ll-text-tertiary)] font-medium'
              }
            `}>
              {crumb.label}
            </span>
          </span>
        ))}
      </motion.div>

      {/* Right: action buttons */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center gap-2"
      >
        {actions ?? (
          <>
            <TopBarButton icon={Search} label="SOURCES" />
            <TopBarButton icon={BarChart2} label="1Y" />
            <TopBarButton icon={Bell} label="SIGNALS" />
          </>
        )}
      </motion.div>
    </div>
  )
}

function TopBarButton({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button className="
      flex items-center gap-1.5 h-8 px-3
      rounded-[var(--ll-radius-md)]
      border border-[var(--ll-border-default)]
      bg-[var(--ll-bg-elevated)]
      text-[10px] font-semibold text-[var(--ll-text-secondary)]
      tracking-[0.07em] uppercase
      hover:border-[var(--ll-border-strong)]
      hover:text-[var(--ll-text-primary)]
      hover:bg-[var(--ll-bg-overlay)]
      transition-all duration-150
      cursor-pointer
    ">
      <Icon size={12} />
      {label}
    </button>
  )
}
```

### Right Drawer (Shared)

```tsx
// apps/web/components/layout/RightDrawer.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FileText, BarChart3 } from 'lucide-react'

interface RightDrawerProps {
  sourcesContent: React.ReactNode
  chartsContent?: React.ReactNode
}

export function RightDrawer({ sourcesContent, chartsContent }: RightDrawerProps) {
  const [activeTab, setActiveTab] = useState<'sources' | 'charts'>('sources')

  return (
    <div className="flex flex-col h-full">
      {/* Tab strip */}
      <div className="flex-shrink-0 border-b border-[var(--ll-border-hairline)]">
        <div className="flex">
          {[
            { id: 'sources', icon: FileText, label: 'Sources' },
            { id: 'charts',  icon: BarChart3, label: 'Charts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-1.5 flex-1 h-10 px-4
                text-xs font-semibold uppercase tracking-[0.07em]
                transition-all duration-150 cursor-pointer relative
                ${activeTab === tab.id
                  ? 'text-[var(--ll-text-primary)]'
                  : 'text-[var(--ll-text-tertiary)] hover:text-[var(--ll-text-secondary)]'
                }
              `}
            >
              <tab.icon size={12} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="drawer-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--ll-accent)]"
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            {activeTab === 'sources' ? sourcesContent : (chartsContent ?? <EmptyCharts />)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function EmptyCharts() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
      <BarChart3 size={28} className="text-[var(--ll-text-tertiary)]" />
      <p className="text-sm font-semibold text-[var(--ll-text-secondary)]">No charts yet</p>
      <p className="text-xs text-[var(--ll-text-tertiary)] leading-relaxed max-w-[180px]">
        Run a query that returns macro data to see charts here.
      </p>
    </div>
  )
}
```

---

## SCREEN 2 — WORKSPACE HOME (Full Upgrade)

```tsx
// apps/web/app/(workspace)/work/page.tsx
import { WorkspaceShell }    from '@/components/layout/WorkspaceShell'
import { Sidebar }           from '@/components/layout/Sidebar'
import { TopBar }            from '@/components/layout/TopBar'
import { RightDrawer }       from '@/components/layout/RightDrawer'
import { WorkspaceHomeMain } from '@/components/workspace/WorkspaceHomeMain'
import { EmptySourcesDrawer } from '@/components/workspace/EmptySourcesDrawer'

export default function WorkspacePage() {
  return (
    <WorkspaceShell
      topbar={
        <TopBar breadcrumb={[{ label: 'LedgerLens' }, { label: 'Workspace home' }]} />
      }
      sidebar={<Sidebar />}
      main={<WorkspaceHomeMain />}
      drawer={<RightDrawer sourcesContent={<EmptySourcesDrawer />} />}
    />
  )
}
```

```tsx
// apps/web/components/workspace/EmptySourcesDrawer.tsx
import { FileSearch } from 'lucide-react'

export function EmptySourcesDrawer() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
      {/* Animated icon container */}
      <div className="
        relative w-14 h-14 rounded-[var(--ll-radius-lg)]
        bg-[var(--ll-bg-elevated)]
        border border-[var(--ll-border-default)]
        flex items-center justify-center
      ">
        <div className="absolute inset-0 rounded-[var(--ll-radius-lg)] bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.06),transparent)]" />
        <FileSearch size={22} className="text-[var(--ll-text-tertiary)]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--ll-text-secondary)] mb-1">
          No sources in view
        </p>
        <p className="text-xs text-[var(--ll-text-tertiary)] leading-relaxed max-w-[190px]">
          Run an analysis query. Retrieved evidence will land here with SEC, macro, and news context.
        </p>
      </div>
    </div>
  )
}
```

```tsx
// apps/web/components/workspace/WorkspaceHomeMain.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, ArrowRight } from 'lucide-react'
import { SpotlightCard } from '@/components/effects/SpotlightCard'
import { BorderBeam }    from '@/components/effects/BorderBeam'

// ─── Mock data — replace with real API calls ───────────────────────────────
const RECENT_COMPANIES = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology Hardware',
    latestFiling: '2026-01-30',
    savedItems: 0,
    initial: 'A',
    color: 'var(--ll-accent)',
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft',
    sector: 'Software',
    latestFiling: '2026-01-30',
    savedItems: 0,
    initial: 'M',
    color: 'var(--ll-source-sec)',
  },
]

const SEARCH_RESULTS = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology Hardware' },
]

export function WorkspaceHomeMain() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  const showResults = query.length > 1 && SEARCH_RESULTS.length > 0

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        className="px-8 pt-10 pb-8"
      >
        {/* Eyebrow */}
        <p className="text-xs font-semibold text-[var(--ll-text-tertiary)] uppercase tracking-[0.1em] mb-3">
          Home
        </p>
        <h1 className="text-3xl font-bold text-[var(--ll-text-primary)] tracking-[-0.03em] leading-tight">
          Start with a company,
          <br />
          <span className="text-[var(--ll-accent)]">not a prompt.</span>
        </h1>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="px-8 pb-6"
      >
        <p className="text-[10px] font-semibold text-[var(--ll-text-tertiary)] uppercase tracking-[0.1em] mb-3">
          Company Search
        </p>

        <div className="relative">
          {/* Search input container */}
          <div className={`
            relative rounded-[var(--ll-radius-lg)] overflow-hidden
            border transition-all duration-200
            ${focused
              ? 'border-[var(--ll-accent-border)] shadow-[var(--ll-glow-accent)]'
              : 'border-[var(--ll-border-default)]'
            }
            bg-[var(--ll-bg-elevated)]
          `}>
            {focused && <BorderBeam colorTo="var(--ll-accent)" duration={6} size={120} />}

            <div className="flex items-center gap-3 px-4 h-12">
              <Search
                size={16}
                className={`flex-shrink-0 transition-colors duration-150 ${
                  focused ? 'text-[var(--ll-accent)]' : 'text-[var(--ll-text-tertiary)]'
                }`}
              />
              <input
                type="text"
                placeholder="Search by company name or ticker..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                className="
                  flex-1 bg-transparent outline-none border-none
                  text-sm text-[var(--ll-text-primary)]
                  placeholder:text-[var(--ll-text-tertiary)]
                  font-[var(--ll-font-ui)]
                "
              />
              {query && (
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded border border-[var(--ll-border-default)] text-[10px] text-[var(--ll-text-tertiary)]">
                  ↵ Select
                </kbd>
              )}
            </div>
          </div>

          {/* Dropdown results */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="
                  absolute top-[calc(100%+4px)] left-0 right-0 z-30
                  rounded-[var(--ll-radius-lg)]
                  border border-[var(--ll-border-default)]
                  bg-[var(--ll-bg-elevated)]
                  shadow-[var(--ll-shadow-3)]
                  overflow-hidden
                "
              >
                {SEARCH_RESULTS.map((result) => (
                  <a
                    key={result.ticker}
                    href={`/chat/new?ticker=${result.ticker}`}
                    className="
                      flex items-center justify-between px-4 py-3.5
                      hover:bg-[var(--ll-bg-overlay)]
                      transition-colors duration-100
                      group
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div className="
                        w-8 h-8 rounded-[var(--ll-radius-md)]
                        bg-[var(--ll-accent-dim)] border border-[var(--ll-accent-border)]
                        flex items-center justify-center
                        text-xs font-bold text-[var(--ll-accent)]
                      ">
                        {result.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--ll-text-primary)]">
                          {result.name}
                        </p>
                        <p className="text-xs text-[var(--ll-text-tertiary)] font-mono mt-0.5">
                          {result.ticker} · {result.sector}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-[var(--ll-text-tertiary)] group-hover:text-[var(--ll-accent)] transition-colors"
                    />
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Divider */}
      <div className="mx-8 mb-6 h-px bg-[var(--ll-border-hairline)]" />

      {/* Recent workspaces */}
      <div className="px-8 flex-1">
        <p className="text-[10px] font-semibold text-[var(--ll-text-tertiary)] uppercase tracking-[0.1em] mb-4">
          Recent workspaces
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {RECENT_COMPANIES.map((company, i) => (
            <motion.div
              key={company.ticker}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
            >
              <SpotlightCard
                spotlightColor={`${company.color}10`}
                className="p-5 cursor-pointer group"
              >
                <a href={`/chat/new?ticker=${company.ticker}`} className="block">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-base font-bold text-[var(--ll-text-primary)] tracking-[-0.02em]">
                        {company.name}
                      </p>
                      <p className="text-xs text-[var(--ll-text-tertiary)] font-mono mt-1">
                        {company.ticker} · {company.sector}
                      </p>
                    </div>

                    {/* Company initial avatar */}
                    <div
                      className="
                        w-10 h-10 rounded-[var(--ll-radius-md)]
                        flex items-center justify-center
                        text-sm font-bold
                        flex-shrink-0
                        transition-all duration-200
                        group-hover:scale-105
                      "
                      style={{
                        background: `${company.color}18`,
                        border: `1px solid ${company.color}35`,
                        color: company.color,
                      }}
                    >
                      {company.initial}
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--ll-border-hairline)]">
                    <div>
                      <p className="text-[11px] text-[var(--ll-text-tertiary)] mb-0.5">
                        Latest filing
                      </p>
                      <p className="text-xs font-mono text-[var(--ll-text-secondary)] font-medium">
                        {company.latestFiling}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-[var(--ll-text-tertiary)] mb-0.5">
                        Saved evidence
                      </p>
                      <p className="text-xs font-mono text-[var(--ll-text-secondary)] font-medium">
                        {company.savedItems} items
                      </p>
                    </div>
                  </div>

                  {/* Hover CTA */}
                  <div className="
                    flex items-center gap-1.5 mt-3
                    text-xs font-medium
                    text-[var(--ll-text-tertiary)]
                    group-hover:text-[var(--ll-accent)]
                    transition-colors duration-150
                  ">
                    <ArrowRight size={12} />
                    Open workspace
                  </div>
                </a>
              </SpotlightCard>
            </motion.div>
          ))}

          {/* Add new workspace card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + RECENT_COMPANIES.length * 0.08 }}
          >
            <button className="
              w-full p-5 rounded-[var(--ll-radius-lg)]
              border border-dashed border-[var(--ll-border-default)]
              bg-transparent
              hover:border-[var(--ll-accent-border)]
              hover:bg-[var(--ll-accent-dim)]
              transition-all duration-200
              group cursor-pointer
              flex flex-col items-center justify-center gap-2
              min-h-[140px]
              text-center
            ">
              <div className="
                w-8 h-8 rounded-[var(--ll-radius-md)]
                border border-dashed border-[var(--ll-border-strong)]
                group-hover:border-[var(--ll-accent-border)]
                flex items-center justify-center
                transition-colors duration-200
              ">
                <span className="text-lg text-[var(--ll-text-tertiary)] group-hover:text-[var(--ll-accent)] leading-none">+</span>
              </div>
              <p className="text-xs font-medium text-[var(--ll-text-tertiary)] group-hover:text-[var(--ll-accent)] transition-colors">
                New workspace
              </p>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
```

---

## SCREEN 3 — CHAT ANALYSIS (Full Upgrade)

```tsx
// apps/web/app/(workspace)/chat/[id]/page.tsx
import { WorkspaceShell }     from '@/components/layout/WorkspaceShell'
import { Sidebar }            from '@/components/layout/Sidebar'
import { TopBar }             from '@/components/layout/TopBar'
import { RightDrawer }        from '@/components/layout/RightDrawer'
import { ChatMain }           from '@/components/chat/ChatMain'
import { ChatSourcesDrawer }  from '@/components/chat/ChatSourcesDrawer'

// Mock data — replace with real params + API
const MOCK_TICKER = 'AAPL'

export default function ChatPage({ params }: { params: { id: string } }) {
  return (
    <WorkspaceShell
      topbar={
        <TopBar
          breadcrumb={[
            { label: MOCK_TICKER },
            { label: 'Analysis session' },
            { label: MOCK_TICKER },
          ]}
        />
      }
      sidebar={<Sidebar />}
      main={<ChatMain ticker={MOCK_TICKER} sessionId={params.id} />}
      drawer={
        <RightDrawer
          sourcesContent={<ChatSourcesDrawer ticker={MOCK_TICKER} />}
        />
      }
    />
  )
}
```

### Chat Main Panel

```tsx
// apps/web/components/chat/ChatMain.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Send, FileText, TrendingUp, Newspaper } from 'lucide-react'
import { BorderBeam } from '@/components/effects/BorderBeam'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  sources?: { id: number; label: string; type: 'filing' | 'news' | 'macro' }[]
  followUps?: string[]
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    type: 'user',
    content: 'What changed in the latest filing versus the prior quarter?',
  },
  {
    id: '2',
    type: 'assistant',
    content: `For AAPL, addressing the latest filing versus the prior quarter: The indexed evidence spans filings, macro, and news where available.`,
    sources: [
      { id: 1, label: 'SEC EDGAR (filing)', type: 'filing' },
      { id: 2, label: 'Reuters (news)', type: 'news' },
      { id: 3, label: 'FRED (macro)', type: 'macro' },
    ],
    followUps: [
      'Which filing section changed most versus the prior quarter?',
      'Which macro series is most correlated with demand in this narrative?',
      'Which headlines are most material to the stock?',
    ],
  },
]

const SOURCE_TYPE_ICON = {
  filing: FileText,
  news: Newspaper,
  macro: TrendingUp,
} as const

const SOURCE_TYPE_COLOR = {
  filing: 'var(--ll-source-sec)',
  news:   'var(--ll-source-news)',
  macro:  'var(--ll-source-fred)',
} as const

interface ChatMainProps {
  ticker: string
  sessionId: string
}

export function ChatMain({ ticker, sessionId }: ChatMainProps) {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim()) return
    // In real impl: POST to /api/chat/query, stream response
    setInputValue('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message thread — scrollable */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-2">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <ChatMessage key={msg.id} message={msg} index={i} />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Query input — sticky bottom */}
      <div className="flex-shrink-0 px-8 py-5 border-t border-[var(--ll-border-hairline)] bg-[var(--ll-bg-base)]/95 backdrop-blur-xl">
        {/* Source filter strip */}
        <div className="flex items-center gap-2 mb-3">
          {[
            { label: 'SEC', color: 'var(--ll-source-sec)' },
            { label: 'FRED', color: 'var(--ll-source-fred)' },
            { label: 'NEWS', color: 'var(--ll-source-news)' },
          ].map((src) => (
            <button
              key={src.label}
              className="
                flex items-center gap-1.5 h-6 px-2.5
                rounded-[var(--ll-radius-xs)]
                border border-[var(--ll-border-default)]
                bg-[var(--ll-bg-elevated)]
                text-[10px] font-semibold tracking-[0.07em]
                transition-all duration-150 cursor-pointer
              "
              style={{ color: src.color }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: src.color }}
              />
              {src.label}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-[var(--ll-text-tertiary)] font-mono">
            Grounded on SEC, FRED, and news where indexed for {ticker}
          </span>
        </div>

        {/* Input row */}
        <div className={`
          relative rounded-[var(--ll-radius-lg)] overflow-hidden
          border transition-all duration-200
          ${inputFocused
            ? 'border-[var(--ll-accent-border)] shadow-[var(--ll-glow-accent)]'
            : 'border-[var(--ll-border-default)]'
          }
          bg-[var(--ll-bg-elevated)]
        `}>
          {inputFocused && <BorderBeam colorTo="var(--ll-accent)" duration={8} size={150} />}

          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={`Ask about filings, macro, or news…`}
            rows={2}
            className="
              w-full bg-transparent outline-none border-none resize-none
              px-4 pt-3 pb-10
              text-sm text-[var(--ll-text-primary)]
              placeholder:text-[var(--ll-text-tertiary)]
              font-[var(--ll-font-ui)]
              leading-relaxed
            "
          />

          {/* Bottom row inside textarea */}
          <div className="absolute bottom-2 right-2 flex items-center gap-2">
            <span className="text-[10px] text-[var(--ll-text-tertiary)]">
              ⏎ Send · ⇧⏎ Newline
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="
                w-8 h-8 rounded-[var(--ll-radius-md)]
                flex items-center justify-center
                bg-[var(--ll-accent)]
                text-[var(--ll-text-inverse)]
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-150 cursor-pointer
                shadow-[0_0_12px_rgba(45,212,191,0.3)]
                hover:shadow-[0_0_20px_rgba(45,212,191,0.5)]
              "
            >
              <Send size={13} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Individual message ────────────────────────────────────────────────────

function ChatMessage({ message, index }: { message: Message; index: number }) {
  if (message.type === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-end"
      >
        <div className="
          max-w-[80%] px-5 py-3 ml-12
          rounded-[var(--ll-radius-lg)] rounded-br-[var(--ll-radius-xs)]
          border border-[var(--ll-border-default)]
          bg-[var(--ll-bg-elevated)]
        ">
          {/* Label */}
          <p className="text-[10px] font-semibold text-[var(--ll-text-tertiary)] uppercase tracking-[0.08em] mb-2">
            User Query
          </p>
          <p className="text-sm text-[var(--ll-text-secondary)] leading-relaxed">
            {message.content}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-0"
    >
      {/* Answer label row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="
            w-5 h-5 rounded-[var(--ll-radius-xs)]
            bg-[var(--ll-accent)] flex items-center justify-center
          ">
            <TrendingUp size={11} className="text-[var(--ll-text-inverse)]" />
          </div>
          <p className="text-[10px] font-semibold text-[var(--ll-text-tertiary)] uppercase tracking-[0.08em]">
            LedgerLens Answer
          </p>
        </div>
        {message.sources && (
          <p className="text-[10px] text-[var(--ll-text-tertiary)] font-mono">
            {message.sources.length} sources linked
          </p>
        )}
      </div>

      {/* Answer body */}
      <div className="
        rounded-[var(--ll-radius-lg)]
        border border-[var(--ll-border-default)]
        bg-[var(--ll-bg-elevated)]
        overflow-hidden
      ">
        {/* Answer text */}
        <div className="px-5 py-4">
          <p className="text-sm text-[var(--ll-text-primary)] leading-[1.75]">
            {message.content}
            {' '}
            {message.sources?.map((src) => (
              <sup
                key={src.id}
                className="
                  text-[var(--ll-accent)] font-mono text-[10px]
                  cursor-pointer hover:text-[var(--ll-accent-hover)]
                  transition-colors ml-0.5
                "
                title={src.label}
              >
                [{src.id}]
              </sup>
            ))}
          </p>
        </div>

        {/* Source inline chips */}
        {message.sources && (
          <div className="
            px-5 py-3
            border-t border-[var(--ll-border-hairline)]
            flex items-center gap-2 flex-wrap
          ">
            {message.sources.map((src) => {
              const Icon = SOURCE_TYPE_ICON[src.type]
              const color = SOURCE_TYPE_COLOR[src.type]
              return (
                <div
                  key={src.id}
                  className="
                    flex items-center gap-1.5 px-2.5 py-1
                    rounded-[var(--ll-radius-sm)]
                    border border-[var(--ll-border-default)]
                    bg-[var(--ll-bg-overlay)]
                  "
                >
                  <Icon size={11} style={{ color }} />
                  <span className="text-[11px] text-[var(--ll-text-secondary)] font-medium">
                    {src.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Follow-up questions */}
        {message.followUps && (
          <div className="
            px-5 py-3
            border-t border-[var(--ll-border-hairline)]
          ">
            <p className="text-[10px] font-semibold text-[var(--ll-text-tertiary)] uppercase tracking-[0.08em] mb-2.5">
              Follow-up Questions
            </p>
            <div className="flex gap-2 flex-wrap">
              {message.followUps.map((q, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: 0.3 + i * 0.07 }}
                  className="
                    px-3 py-1.5 rounded-[var(--ll-radius-md)]
                    border border-[var(--ll-border-default)]
                    bg-[var(--ll-bg-overlay)]
                    text-xs text-[var(--ll-text-secondary)] font-medium
                    hover:border-[var(--ll-accent-border)]
                    hover:text-[var(--ll-text-primary)]
                    hover:bg-[var(--ll-accent-dim)]
                    transition-all duration-150 cursor-pointer
                    text-left
                  "
                >
                  {q}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
```

### Chat Sources Drawer (Right Panel — Screen 3)

```tsx
// apps/web/components/chat/ChatSourcesDrawer.tsx
'use client'

import { motion } from 'motion/react'
import { FileText, Newspaper, TrendingUp, Bookmark, ExternalLink } from 'lucide-react'

interface Source {
  id: string
  type: 'filing' | 'news' | 'macro'
  label: string
  provider: string
  date: string
  title: string
  snippet: string
  sourceAvailable: boolean
}

const MOCK_SOURCES: Source[] = [
  {
    id: '1',
    type: 'filing',
    label: 'SEC Filing',
    provider: 'SEC EDGAR',
    date: '2026-01-30',
    title: 'Apple Q1 2026 10-Q',
    snippet: 'Management reiterated services strength and FX pressure.',
    sourceAvailable: false,
  },
  {
    id: '2',
    type: 'news',
    label: 'News',
    provider: 'Reuters',
    date: '2026-04-17',
    title: 'Apple suppliers point to steadier demand',
    snippet: 'Supplier checks suggest tighter inventory and stable premium demand.',
    sourceAvailable: false,
  },
  {
    id: '3',
    type: 'macro',
    label: 'Macro Data',
    provider: 'FRED',
    date: '2026-04-01',
    title: 'Federal Funds Effective Rate',
    snippet: 'Policy rate remains restrictive versus pre-2022 levels.',
    sourceAvailable: false,
  },
]

const SOURCE_CONFIG = {
  filing: { icon: FileText,   color: 'var(--ll-source-sec)',  bg: 'rgba(129,140,248,0.1)',  border: 'rgba(129,140,248,0.25)' },
  news:   { icon: Newspaper,  color: 'var(--ll-source-news)', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.22)' },
  macro:  { icon: TrendingUp, color: 'var(--ll-source-fred)', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.22)' },
}

export function ChatSourcesDrawer({ ticker }: { ticker: string }) {
  return (
    <div className="p-3 space-y-2">
      {MOCK_SOURCES.map((source, i) => (
        <SourceCard key={source.id} source={source} index={i} />
      ))}
    </div>
  )
}

function SourceCard({ source, index }: { source: Source; index: number }) {
  const config = SOURCE_CONFIG[source.type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.08,
        ease: [0.33, 1, 0.68, 1],
      }}
      className="
        group rounded-[var(--ll-radius-lg)] overflow-hidden
        border border-[var(--ll-border-default)]
        bg-[var(--ll-bg-elevated)]
        hover:border-[var(--ll-border-strong)]
        hover:shadow-[var(--ll-shadow-2)]
        transition-all duration-200
      "
      style={{
        borderLeft: `3px solid ${config.color}`,
      }}
    >
      <div className="px-3 py-3">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {/* Type badge */}
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--ll-radius-xs)] text-[10px] font-semibold uppercase tracking-[0.06em]"
              style={{
                background: config.bg,
                border: `1px solid ${config.border}`,
                color: config.color,
              }}
            >
              <Icon size={9} />
              {source.label}
            </span>
          </div>
          {/* Date — mono */}
          <span className="text-[10px] font-mono text-[var(--ll-text-tertiary)]">
            {source.date}
          </span>
        </div>

        {/* Provider */}
        <p className="text-[10px] font-medium text-[var(--ll-text-tertiary)] uppercase tracking-[0.07em] mb-1.5">
          {source.provider}
        </p>

        {/* Title */}
        <p className="text-sm font-semibold text-[var(--ll-text-primary)] leading-snug mb-2 line-clamp-1">
          {source.title}
        </p>

        {/* Snippet */}
        <p className="text-xs text-[var(--ll-text-secondary)] leading-relaxed line-clamp-2 mb-3">
          {source.snippet}
        </p>

        {/* Actions row */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--ll-border-hairline)]">
          <button className="
            flex items-center gap-1.5 text-xs font-medium
            text-[var(--ll-text-tertiary)]
            hover:text-[var(--ll-accent)]
            transition-colors duration-150 cursor-pointer
          ">
            <Bookmark size={11} />
            Save evidence
          </button>

          {source.sourceAvailable ? (
            <a
              href="#"
              className="
                flex items-center gap-1 text-xs font-medium
                text-[var(--ll-accent)]
                hover:text-[var(--ll-accent-hover)]
                transition-colors duration-150
              "
            >
              View source
              <ExternalLink size={10} />
            </a>
          ) : (
            <span className="text-[10px] text-[var(--ll-text-tertiary)] italic">
              Link unavailable
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
```

---

## ANIMATION SUMMARY — WHAT EACH SCREEN NOW HAS

### Screen 2 — Workspace Home
| Element | Animation |
|---|---|
| Page header + H1 | `y: 16 → 0`, `opacity: 0 → 1`, 400ms, ease spring |
| Teal word "not a prompt." | Same color as landing hero accent |
| Search input | BorderBeam glow on focus, border color transition |
| Search results dropdown | Scale + fade entrance, 150ms |
| Company cards | Staggered `y: 16 → 0` entrance, 80ms delay each |
| SpotlightCard hover | Mouse-follow radial glow |
| Company avatar | `scale: 1 → 1.05` on card hover |
| New workspace button | Dashed border → accent border + teal fill on hover |
| Active nav item | Glowing teal dot indicator |

### Screen 3 — Chat Analysis
| Element | Animation |
|---|---|
| User query bubble | `y: 10 → 0`, `opacity: 0 → 1`, 300ms |
| Answer block | `y: 12 → 0`, `opacity: 0 → 1`, 400ms, 100ms delay |
| Inline citation superscripts | Color hover transition to lighter teal |
| Source type chips | Fade in with answer |
| Follow-up chips | Staggered scale+fade, 70ms delay each, 300ms base delay |
| Source cards in right drawer | `x: 16 → 0`, `opacity: 0 → 1`, staggered 80ms |
| Query input focus | BorderBeam + glow-accent shadow |
| Send button | `scale: 1.05` hover, `scale: 0.95` tap, glow intensifies |
| Tab indicator (Sources/Charts) | Framer Motion `layoutId` slide |
| Drawer tab content | Fade + `y: 6 → 0` on tab switch |

---

## CURSOR PROMPT TO USE THESE FILES

```
Read both FRONTEND.md and WORKSPACE_SCREENS.md before writing any code.

Build [WorkspaceHomeMain / ChatMain / ChatSourcesDrawer / SourceCard].

This is an upgrade to screens that already render but look flat.
The goal is visual consistency with the landing page:
- Same GridPattern background texture (very subtle in workspace — dotColor 0.03 opacity)
- Same SpotlightCard hover effects on all cards
- Same BorderBeam on focused inputs
- Same motion/react entrance animations (y offset, stagger, ease spring)
- Same color token system — var(--ll-*) everywhere

Do NOT add full-page background effects in the workspace — only use:
1. GridPattern (very faint, fixed position)
2. Single teal radial gradient (top-left, fixed, very low opacity)
3. BorderBeam on focused interactive elements only

Keep animations purposeful — source cards slide in from right,
page elements fade up, chips stagger in after answer appears.
```

---

*LedgerLens Workspace Screens Spec — v1.0 — April 2026*
*Companion: FRONTEND.md (landing), CURSOR.md (engineering), .cursor/rules/ui-design.mdc (design tokens)*
*Place at: apps/web/WORKSPACE_SCREENS.md*
