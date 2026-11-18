-- Interactive demos and richer project imagery.
-- Hand-written to match prisma/schema.prisma (2026-11-17). Additive only:
-- existing rows keep working and get the defaults below.

-- AlterTable: which interactive demo (/demos/<key>) belongs to a project.
ALTER TABLE "Project" ADD COLUMN "demoKey" TEXT;

-- AlterTable: software screenshots are shown separately from photos.
ALTER TABLE "ProjectImage" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'GALLERY';

-- AlterTable: where an image came from (UPLOAD | AI_GENERATED | ILLUSTRATION).
ALTER TABLE "Media" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'UPLOAD';
