-- CreateTable
CREATE TABLE "ProfilePost" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "imagen" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfilePost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileLike" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileComment" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfilePost_userId_idx" ON "ProfilePost"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileLike_userId_postId_key" ON "ProfileLike"("userId", "postId");

-- AddForeignKey
ALTER TABLE "ProfilePost" ADD CONSTRAINT "ProfilePost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileLike" ADD CONSTRAINT "ProfileLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileLike" ADD CONSTRAINT "ProfileLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ProfilePost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileComment" ADD CONSTRAINT "ProfileComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ProfilePost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileComment" ADD CONSTRAINT "ProfileComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
