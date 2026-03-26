-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "form1_submissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "consultation_type" TEXT NOT NULL,
    "preferred_time" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version_number" INTEGER NOT NULL,
    "feishu_record_id" TEXT,
    "feishu_sync_status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "form1_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "form2_submissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "form_data" TEXT NOT NULL,
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version_number" INTEGER NOT NULL,
    "feishu_record_id" TEXT,
    "feishu_sync_status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "form2_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "form1_submissions_user_id_idx" ON "form1_submissions"("user_id");

-- CreateIndex
CREATE INDEX "form1_submissions_feishu_sync_status_idx" ON "form1_submissions"("feishu_sync_status");

-- CreateIndex
CREATE INDEX "form1_submissions_submitted_at_idx" ON "form1_submissions"("submitted_at");

-- CreateIndex
CREATE INDEX "form2_submissions_user_id_idx" ON "form2_submissions"("user_id");

-- CreateIndex
CREATE INDEX "form2_submissions_feishu_sync_status_idx" ON "form2_submissions"("feishu_sync_status");

-- CreateIndex
CREATE INDEX "form2_submissions_submitted_at_idx" ON "form2_submissions"("submitted_at");
