# Deployment Guide

## Vercel (Recommended)

### Setup

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` - Production PostgreSQL URL (e.g., Supabase, Neon, Railway)
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your production URL (e.g., https://csviz.vercel.app)
   - `GOOGLE_CLIENT_ID` - Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET` - Google OAuth secret
3. Deploy

### Database Setup

Use a managed PostgreSQL provider:
- **Supabase**: Free tier, auto-backups
- **Neon**: Serverless PostgreSQL, generous free tier
- **Railway**: Simple PostgreSQL hosting

After setting `DATABASE_URL`:
```bash
npx prisma db push
npx prisma db seed
```

### Build Settings

Vercel auto-detects Next.js. No custom build settings needed.

## Docker (Self-hosted)

```bash
# Build and start all services
docker-compose up -d

# Run migrations
npx prisma db push

# Seed data
npx prisma db seed
```

## Post-Deploy Checklist

- [ ] Database connection works
- [ ] Auth (Google OAuth) redirects correctly
- [ ] All 3 session visualizations load
- [ ] API rate limiting is active
- [ ] Environment variables are set
