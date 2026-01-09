# C-Think Competition Web Application

C-Think is a logic competition for Middle School & High School students hosted by Universitas Ciputra Surabaya. This repository contains the source code for the C-Think competition web application.

## Features

### Competition Management
- **Contest Control**: Real-time management of contest status and timing.
- **Live Leaderboard**: Real-time ranking of participating teams.
- **Round Management**: Support for different competition rounds (Preliminary, etc.).
- **Post/Station System**: Management of physical or virtual stations for the competition.
- **School & Team Management**: Organization of participants by school and team.

### Content & Assessment
- **Question Bank**: Rich text and image-based logic questions with difficulty levels.
- **Scoring System**: Automatic and manual scoring capabilities.
- **QR Code Scanning**: Quick verification and interaction at competition posts.
- **Real-time Updates**: Live synchronization using Pusher.

### User Roles & Access Control
- **Master Admin**: Full system control including contest flow, resetting data, and account generation.
- **Admin**: Manages competition resources (questions, posts, rounds), participants, and performs verification via QR scanning.
- **Judge**: Dedicated interface for evaluating team performance and inputting scores.
- **Team (User)**: Participant dashboard for viewing questions, submitting answers, and tracking progress.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth.js v5
- **UI Components**: Tailwind CSS & Shadcn/ui
- **Real-time**: Pusher & Soketi
- **Media**: Cloudinary for image management
- **Utilities**: QR Code generation/scanning, Zod validation

