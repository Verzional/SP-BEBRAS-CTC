/*
  Warnings:

  - You are about to drop the column `code` on the `Question` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Question_code_key";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "code";
