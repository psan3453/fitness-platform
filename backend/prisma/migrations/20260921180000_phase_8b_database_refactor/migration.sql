-- Safe data normalization for Trainer specialization
UPDATE "Trainer"
SET "specialization" = UPPER("specialization")
WHERE "specialization" IS NOT NULL;

-- In-place type conversion of Trainer.specialization to LiveClassCategory
ALTER TABLE "Trainer"
ALTER COLUMN "specialization" TYPE "LiveClassCategory"
USING ("specialization"::"LiveClassCategory");

-- Add nullable trainerId to SubscriptionPlan
ALTER TABLE "SubscriptionPlan" ADD COLUMN "trainerId" TEXT;

-- CreateIndex
CREATE INDEX "SubscriptionPlan_trainerId_idx" ON "SubscriptionPlan"("trainerId");

-- AddForeignKey
ALTER TABLE "SubscriptionPlan" ADD CONSTRAINT "SubscriptionPlan_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add nullable trainerId to DietPlan
ALTER TABLE "DietPlan" ADD COLUMN "trainerId" TEXT;

-- CreateIndex
CREATE INDEX "DietPlan_trainerId_idx" ON "DietPlan"("trainerId");

-- AddForeignKey
ALTER TABLE "DietPlan" ADD CONSTRAINT "DietPlan_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
