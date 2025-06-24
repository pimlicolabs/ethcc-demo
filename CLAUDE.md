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

## Notes

- The term "ultrathink" refers to Claude Code's extended thinking mode, not an
  npm package
- Project initialized with modern React patterns and best practices
- **IMPORTANT**: Always run linting after making code changes to maintain code
  quality
