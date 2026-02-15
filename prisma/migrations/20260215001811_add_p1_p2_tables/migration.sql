-- CreateTable
CREATE TABLE "ModuleVersion" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "changelog" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModuleVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticQuestion" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "relatedModuleId" TEXT,

    CONSTRAINT "DiagnosticQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,

    CONSTRAINT "DiagnosticAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagnosticAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeaknessMap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeaknessMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxMembers" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyRoomMember" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'member',

    CONSTRAINT "StudyRoomMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyRoomMessage" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyRoomMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModuleVersion_moduleId_idx" ON "ModuleVersion"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleVersion_moduleId_version_key" ON "ModuleVersion"("moduleId", "version");

-- CreateIndex
CREATE INDEX "DiagnosticQuestion_category_idx" ON "DiagnosticQuestion"("category");

-- CreateIndex
CREATE INDEX "DiagnosticQuestion_difficulty_idx" ON "DiagnosticQuestion"("difficulty");

-- CreateIndex
CREATE INDEX "DiagnosticAttempt_userId_idx" ON "DiagnosticAttempt"("userId");

-- CreateIndex
CREATE INDEX "DiagnosticAnswer_attemptId_idx" ON "DiagnosticAnswer"("attemptId");

-- CreateIndex
CREATE INDEX "DiagnosticAnswer_questionId_idx" ON "DiagnosticAnswer"("questionId");

-- CreateIndex
CREATE INDEX "WeaknessMap_userId_idx" ON "WeaknessMap"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WeaknessMap_userId_category_key" ON "WeaknessMap"("userId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "StudyRoom_ownerId_idx" ON "StudyRoom"("ownerId");

-- CreateIndex
CREATE INDEX "StudyRoomMember_roomId_idx" ON "StudyRoomMember"("roomId");

-- CreateIndex
CREATE INDEX "StudyRoomMember_userId_idx" ON "StudyRoomMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudyRoomMember_roomId_userId_key" ON "StudyRoomMember"("roomId", "userId");

-- CreateIndex
CREATE INDEX "StudyRoomMessage_roomId_createdAt_idx" ON "StudyRoomMessage"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "StudyRoomMessage_userId_idx" ON "StudyRoomMessage"("userId");

-- AddForeignKey
ALTER TABLE "ModuleVersion" ADD CONSTRAINT "ModuleVersion_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticQuestion" ADD CONSTRAINT "DiagnosticQuestion_relatedModuleId_fkey" FOREIGN KEY ("relatedModuleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticAttempt" ADD CONSTRAINT "DiagnosticAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticAnswer" ADD CONSTRAINT "DiagnosticAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "DiagnosticAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticAnswer" ADD CONSTRAINT "DiagnosticAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "DiagnosticQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeaknessMap" ADD CONSTRAINT "WeaknessMap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyRoom" ADD CONSTRAINT "StudyRoom_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyRoomMember" ADD CONSTRAINT "StudyRoomMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "StudyRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyRoomMember" ADD CONSTRAINT "StudyRoomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyRoomMessage" ADD CONSTRAINT "StudyRoomMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "StudyRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyRoomMessage" ADD CONSTRAINT "StudyRoomMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
