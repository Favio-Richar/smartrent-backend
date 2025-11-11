/*
  Warnings:

  - A unique constraint covering the columns `[userId,plan,status]` on the table `ActiveSubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ActiveSubscription_userId_plan_status_key" ON "ActiveSubscription"("userId", "plan", "status");
