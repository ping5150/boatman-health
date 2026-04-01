/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `order_no` to the `form1_submissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferred_date` to the `form1_submissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submitted_by` to the `form1_submissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `form1_submissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `form2_submissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_no` to the `form2_submissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `form2_submissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submitted_by` to the `form2_submissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `form2_submissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_form1_submissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "order_no" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "consultation_type" TEXT NOT NULL,
    "preferred_date" TEXT NOT NULL,
    "preferred_time" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "submitted_by" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "cancelled_at" DATETIME,
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "version_number" INTEGER NOT NULL,
    "feishu_record_id" TEXT,
    "feishu_sync_status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "form1_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_form1_submissions" ("brief", "consultation_type", "feishu_record_id", "feishu_sync_status", "id", "name", "phone", "preferred_time", "submitted_at", "user_id", "version_number") SELECT "brief", "consultation_type", "feishu_record_id", "feishu_sync_status", "id", "name", "phone", "preferred_time", "submitted_at", "user_id", "version_number" FROM "form1_submissions";
DROP TABLE "form1_submissions";
ALTER TABLE "new_form1_submissions" RENAME TO "form1_submissions";
CREATE UNIQUE INDEX "form1_submissions_order_no_key" ON "form1_submissions"("order_no");
CREATE INDEX "form1_submissions_user_id_idx" ON "form1_submissions"("user_id");
CREATE INDEX "form1_submissions_feishu_sync_status_idx" ON "form1_submissions"("feishu_sync_status");
CREATE INDEX "form1_submissions_submitted_at_idx" ON "form1_submissions"("submitted_at");
CREATE INDEX "form1_submissions_order_no_idx" ON "form1_submissions"("order_no");
CREATE TABLE "new_form2_submissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "order_no" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "submitted_by" TEXT NOT NULL,
    "form_data" TEXT NOT NULL,
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "version_number" INTEGER NOT NULL,
    "feishu_record_id" TEXT,
    "feishu_sync_status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "form2_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_form2_submissions" ("feishu_record_id", "feishu_sync_status", "form_data", "id", "submitted_at", "user_id", "version_number") SELECT "feishu_record_id", "feishu_sync_status", "form_data", "id", "submitted_at", "user_id", "version_number" FROM "form2_submissions";
DROP TABLE "form2_submissions";
ALTER TABLE "new_form2_submissions" RENAME TO "form2_submissions";
CREATE UNIQUE INDEX "form2_submissions_order_no_key" ON "form2_submissions"("order_no");
CREATE INDEX "form2_submissions_user_id_idx" ON "form2_submissions"("user_id");
CREATE INDEX "form2_submissions_feishu_sync_status_idx" ON "form2_submissions"("feishu_sync_status");
CREATE INDEX "form2_submissions_submitted_at_idx" ON "form2_submissions"("submitted_at");
CREATE INDEX "form2_submissions_order_no_idx" ON "form2_submissions"("order_no");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "gender" TEXT,
    "birth_date" TEXT,
    "emergency_name" TEXT,
    "emergency_relation" TEXT,
    "emergency_phone" TEXT,
    "feishu_record_id" TEXT,
    "feishu_sync_status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("created_at", "id", "password_hash", "phone", "role", "username") SELECT "created_at", "id", "password_hash", "phone", "role", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
CREATE INDEX "users_phone_idx" ON "users"("phone");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_feishu_sync_status_idx" ON "users"("feishu_sync_status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
