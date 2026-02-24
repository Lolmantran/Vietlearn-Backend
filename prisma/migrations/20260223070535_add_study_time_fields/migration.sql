-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "minutesStudiedToday" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "minutesStudiedTodayDate" TIMESTAMP(3);
