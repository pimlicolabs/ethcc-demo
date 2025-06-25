# ETHCC Demo - Tech Stack

## Framework & Core Technologies

- **Next.js 15** - React framework with App Router, TypeScript, Tailwind CSS,
  and Biome
- **React 18** - Component library with hooks and server components
- **TypeScript** - Static type checking
- **Tailwind CSS** - Utility-first CSS framework

## Development Tools

- **Biome** - Fast formatter, linter, and bundler for JavaScript, TypeScript,
  JSX, and more
  - Version: 2.0.5
  - Features: Linting, formatting, import sorting
  - Configuration: biome.json
  - Commands: `pnpm biome check`, `pnpm biome format`, `pnpm biome lint`
- **PostCSS** - CSS processing
- **Turbopack** - Fast bundler for development (optional)

## Project Structure

- `src/app/` - App Router directory with pages and layouts
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions and shared logic
- `public/` - Static assets

## Package Management

- **pnpm** - Package manager (ALWAYS USE PNPM FOR ALL INSTALLATIONS)
- **pnpm-lock.yaml** - Dependency lock file
- **IMPORTANT**: Always use `pnpm` instead of `npm` or `yarn` for all package
  operations

## Build & Deployment

- Built with Next.js build system
- TypeScript compilation included
- Tailwind CSS processing via PostCSS

## Code Modification Restrictions

- **CRITICAL - DO NOT MODIFY BATUA CODE**: Never change or edit any code under
  the following paths:
  - `@/lib/batua/` - Core batua library directory and all subdirectories
  - `@/lib/batua.ts` - Main batua configuration file
  - `src/lib/batua/` - Alternative reference to batua library
  - `src/lib/batua.ts` - Alternative reference to batua config file
- **READ-ONLY**: These files are core infrastructure and should be treated as
  read-only
- **NO EXCEPTIONS**: Do not modify, refactor, or "improve" any batua-related
  code

## Development Workflow

- **ALWAYS LINT AFTER MAKING CHANGES**: Run `pnpm biome check --write` after any
  code modifications
- **Code Quality**: Biome handles formatting, linting, and import sorting
  automatically
- **Pre-commit**: Ensure all files pass linting before committing changes

## Design Guidelines

- **MOBILE-FIRST DESIGN**: ALL UI components MUST be designed for mobile devices
  first
- **Responsive Layout**: Use Tailwind CSS responsive classes (sm:, md:, lg:,
  xl:)
- **Touch-Friendly**: Buttons and interactive elements must be at least 44px in
  height for touch accessibility
- **Small Screen Optimization**: Design primarily for screens 375px-414px wide
  (iPhone SE to iPhone Pro Max)
- **Flexible Typography**: Use responsive text sizing (text-sm on mobile,
  text-base on larger screens)
- **Spacing**: Use consistent padding and margins optimized for mobile (p-4,
  p-6, gap-4, etc.)
- **CRITICAL**: Never create desktop-first designs - always start with mobile
  and scale up

## UI Component Guidelines

- **MANDATORY - USE SHADCN/UI COMPONENTS**: ALWAYS use shadcn/ui components for ALL UI elements
  - Use Button component from shadcn/ui instead of plain HTML buttons
  - Use Card, Dialog, Alert, and other shadcn/ui components
  - Import components from "@/components/ui/*"
- **COLOR SYSTEM**: NEVER hardcode colors - ALWAYS use shadcn/ui semantic color tokens:
  - Use `primary`, `secondary`, `destructive`, `muted`, `accent` color variants
  - Use `foreground`, `background`, `border`, `ring` for standard elements
  - Example: `text-primary`, `bg-secondary`, `border-muted-foreground`
  - NEVER use hardcoded colors like `gray-950`, `white`, `black`, etc.
- **STYLING CONSISTENCY**: Follow shadcn/ui patterns and conventions throughout the codebase
- **COMPONENT VARIANTS**: Use appropriate shadcn/ui component variants (default, outline, ghost, etc.)

## Component Structure Guidelines

- **ONE COMPONENT PER FILE**: Each React component must be in its own file
- **Component Organization**: Place all components in `src/components/`
- **File Naming**: Use kebab-case for component files (e.g., `deposit-button.tsx`)
- **Export Convention**: Use named exports for components
- **Component Isolation**: Each component should be self-contained with its own imports
- **NO MULTIPLE COMPONENTS**: Never define multiple components in a single file

## Notes

- The term "ultrathink" refers to Claude Code's extended thinking mode, not an
  npm package
- Project initialized with modern React patterns and best practices
- **IMPORTANT**: Always run linting after making code changes to maintain code
  quality
