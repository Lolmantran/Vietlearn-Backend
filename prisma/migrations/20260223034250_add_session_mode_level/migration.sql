-- AlterTable
ALTER TABLE "tutor_sessions" ADD COLUMN     "level" TEXT NOT NULL DEFAULT 'A1',
ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'free';
