-- CreateEnum
CREATE TYPE "RoundType" AS ENUM ('PRELIMINARY', 'FINAL');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "roundType" "RoundType" NOT NULL DEFAULT 'PRELIMINARY';
