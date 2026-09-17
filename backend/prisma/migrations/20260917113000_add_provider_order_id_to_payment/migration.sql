-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "providerOrderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_providerOrderId_key" ON "Payment"("providerOrderId");
