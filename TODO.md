- [x] Fix import path in app/store/dashboard/page.tsx for StoreSopViewer
- [x] Add required Next.js/Vercel scripts to package.json (dev, build, start, vercel-build)
- [x] Identify current failing build stage and error details
- [x] Update lib/prisma.ts Prisma client initialization to avoid build-time PrismaClientOptions validation error
- [x] Run npm run vercel-build and confirm successful build
- [x] Mark TODO checklist complete

## Planogram Feature (New)
- [x] Create PlanogramDirective model with image URLs, dates, fixtures
- [x] Create PlanogramCompliance model for store submissions
- [x] Create corporate side (/app/corp/merchandising/create) for uploading reference images
- [x] Create store side (/app/store/merchandising/execute) with camera interface
- [x] Add imageProcessor.ts for client-side compression before S3 upload
- [x] Add API routes for planogram CRUD and image upload