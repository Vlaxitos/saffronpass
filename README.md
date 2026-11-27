# SaffronPass

Luxury interactive animated web invitations and smart multi-event RSVP platform built for Indian weddings and global celebrations.

## Phase 1 Highlights
- **Luxury Animated Openings**: 60fps mobile-first **Wax-Seal Envelope** and **Royal Palace Doors** covers built with Framer Motion.
- **Strict Sub-Event Privacy**: Unguessable 8-character guest-circle links (`/[slug]/[code]`) validated exclusively on the server so hidden ceremonies (e.g., Haldi) never leak.
- **Etiquette-Aware Per-Event RSVP**: Solo (strict 1 seat), Couple (max 2), and With Family (custom max) per-function attendance with anti-duplicate phone upserts, localStorage edit memory, and Free Preview 5-guest quota.
- **4-Tab Host Command Center**: Basics & Design, Sub-Events Schedule, Smart Category Links, and Live RSVPs with exact confirmed headcounts per ceremony.
- **Hardened Supabase Schema**: Complete idempotent [`supabase/schema.sql`](./supabase/schema.sql) with Row Level Security enabled and zero anonymous table exposure.

## Getting Started
See [`SETUP.md`](./SETUP.md) for the step-by-step Supabase and Vercel deployment instructions.
