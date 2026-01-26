# Project Duplication Checklist

Use this checklist to update all project-specific settings when duplicating your Next.js/Prisma/Firebase project.

## 1. Environment Variables (.env)
- [ ] Update DATABASE_URL
- [ ] Update all Firebase keys (apiKey, authDomain, projectId, messagingSenderId, appId, etc.)
- [ ] Update any other API keys or secrets

## 2. config/appConfig.ts
- [ ] Update any hardcoded URLs, API endpoints, or project-specific settings
- [ ] Update Firebase config if present

## 3. Firebase Service Worker (public/firebase-messaging-sw.js)
- [ ] Update messagingSenderId or any project-specific logic
- [ ] Ensure it matches your new Firebase project

## 4. Manifest & Icons
- [ ] Update public/manifest.json:
    - [ ] name
    - [ ] short_name
    - [ ] theme_color
    - [ ] background_color
    - [ ] icons (paths and files)
- [ ] Replace icon files in public/ as needed

## 5. Other Service Workers (public/sw.js, etc.)
- [ ] Check for hardcoded URLs or project-specific logic

## 6. README & Documentation
- [ ] Update project name and description
- [ ] Update setup instructions
- [ ] Update any references to old project or branding

## 7. package.json
- [ ] Update name, description, author, etc.

## 8. Prisma
- [ ] Update schema.prisma if needed
- [ ] Run migrations for new database
- [ ] Seed database if required

## 9. Git Remote Setup
- [ ] Remove old git remote: `git remote remove origin`
- [ ] Add new git remote: `git remote add origin <new-repo-url>`
- [ ] Push to new remote: `git push -u origin main` (or `master` if that's your branch)

---
## 10. DB setup
Run your Prisma migrations to create the necessary tables in your database:

[] npx prisma migrate deploy

[] npx prisma migrate deploy
or, for development:

[] npx prisma migrate dev

After the migration completes, run your seed script again:
[] npm run seed

**Tip:** Search the codebase for the old project name, Firebase project ID, and any URLs to ensure nothing is missed.
