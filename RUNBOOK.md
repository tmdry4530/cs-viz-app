# Runbook

## Common Issues

### Database Connection Failed

**Symptom**: API routes return 500, Prisma errors in logs
**Fix**:
1. Check `DATABASE_URL` is correct
2. Verify PostgreSQL is running: `docker-compose ps`
3. Restart: `docker-compose restart postgres`
4. Regenerate client: `npx prisma generate`

### Build Fails

**Symptom**: `npm run build` exits with errors
**Fix**:
1. Clear cache: `rm -rf .next`
2. Reinstall: `rm -rf node_modules && npm install --legacy-peer-deps`
3. Check TypeScript: `npx tsc --noEmit`
4. Check for port conflicts on 3000

### Auth Not Working

**Symptom**: Login redirects fail, session errors
**Fix**:
1. Verify `NEXTAUTH_SECRET` is set
2. Verify `NEXTAUTH_URL` matches actual URL
3. For Google OAuth: check client ID/secret, authorized redirect URIs
4. Check browser cookies are not blocked

### Middleware Deprecation Warning

**Symptom**: Build warns about middleware convention
**Note**: This is a Next.js 16 warning about middleware -> proxy migration. Not blocking.

## Monitoring

### Health Check

- Homepage loads: `GET /`
- API responds: `GET /api/community`

### Key Metrics

- Build time (target: <5s compilation)
- Page load time (target: <2s)
- API response time (target: <200ms for reads)

## Emergency Procedures

### Rollback

```bash
# Vercel: revert to previous deployment in dashboard
# Self-hosted: git checkout <previous-tag> && npm run build
```

### Database Reset (Dev Only)

```bash
npx prisma db push --force-reset
npx prisma db seed
```
