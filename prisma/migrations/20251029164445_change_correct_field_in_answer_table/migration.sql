/*
  Warnings:

  - You are about to drop the column `isCorrect` on the `Answer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "isCorrect",
ADD COLUMN     "correct" BOOLEAN NOT NULL DEFAULT false;
