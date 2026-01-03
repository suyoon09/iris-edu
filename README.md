# Iris Edu - 유학 컨설팅 관리 시스템

Korean Study Abroad Consulting Management System for managing student applications to US universities.

## Features

- **Multi-student Dashboard**: Counselors can manage all assigned students from a single dashboard
- **Student Management**: Complete CRUD operations with comprehensive academic profiles
- **Counselor Authentication**: Secure login with NextAuth.js credentials provider
- **University Knowledge Base**: 50 top US universities with Korean-specific insights
- **AI Analysis Engine**: Claude API integration for admission analysis and strategy
- **Progress Timeline**: Track student progress with visual timeline

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js (credentials provider)
- **Database**: Netlify Blobs
- **AI**: Anthropic Claude API

## Deploy to Netlify

### Step 1: Import from GitHub

1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Select the `iris-edu` repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

### Step 2: Set Environment Variables

In Netlify dashboard, go to **Site settings → Environment variables** and add:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | Random secret for sessions | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Netlify URL | `https://your-site.netlify.app` |
| `ANTHROPIC_API_KEY` | Claude API key | Get from [console.anthropic.com](https://console.anthropic.com) |
| `SEED_SECRET` | Secret for database seeding | `iris-edu-seed-2024` |

### Step 3: Deploy

Click "Deploy site" and wait for the build to complete.

### Step 4: Seed the Database

After deployment, seed the database by calling:

```bash
curl -X POST https://your-site.netlify.app/api/seed \
  -H "Authorization: Bearer iris-edu-seed-2024"
```

Or visit the URL in your browser with proper headers using a tool like Postman.

## Test Credentials

After seeding, use these accounts to log in:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@irisedu.com | admin123 |
| Counselor | sarah.park@irisedu.com | counselor123 |
| Counselor | james.kim@irisedu.com | counselor123 |

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
iris-edu/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Login/register pages
│   ├── dashboard/         # Main dashboard
│   ├── students/          # Student management
│   ├── counselors/        # Counselor management
│   └── universities/      # University browser
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   └── dashboard/        # Dashboard-specific components
├── lib/                   # Utilities and database layer
├── types/                 # TypeScript interfaces
└── prompts/              # AI prompt templates
```

## License

MIT
