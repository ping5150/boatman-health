-- CreateTable
CREATE TABLE "sleep_surveys" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "order_no" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "submitted_by" TEXT NOT NULL,
    "bedtime" TEXT,
    "sleep_latency" TEXT,
    "wake_time" TEXT,
    "sleep_duration_hours" INTEGER,
    "sleep_duration_minutes" INTEGER,
    "cant_fall_asleep_30min" TEXT,
    "wake_up_early" TEXT,
    "get_up_toilet" TEXT,
    "breathing_discomfort" TEXT,
    "cough_snore" TEXT,
    "feel_cold" TEXT,
    "feel_hot" TEXT,
    "nightmares" TEXT,
    "pain" TEXT,
    "other_sleep_issues" TEXT,
    "sleep_quality_rating" TEXT,
    "sleep_medication" TEXT,
    "stay_awake_difficulty" TEXT,
    "task_completion_difficulty" TEXT,
    "sleep_partner" TEXT,
    "snoring" TEXT,
    "breathing_pause" TEXT,
    "leg_twitch" TEXT,
    "disorientation" TEXT,
    "other_restless_sleep" TEXT,
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "version_number" INTEGER NOT NULL,
    "feishu_record_id" TEXT,
    "feishu_sync_status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "sleep_surveys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "nutrition_surveys" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "order_no" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "submitted_by" TEXT NOT NULL,
    "consultation_reason" TEXT,
    "nutritionist_support_goals" TEXT,
    "height" REAL,
    "weight" REAL,
    "weight_change" TEXT,
    "chronic_diseases" TEXT,
    "medications_supplements" TEXT,
    "daily_meals" TEXT,
    "breakfast_habit" TEXT,
    "common_snacks" TEXT,
    "food_sources" TEXT,
    "food_allergies" TEXT,
    "disliked_foods" TEXT,
    "diet_plan_type" TEXT,
    "typical_diet_workday" TEXT,
    "typical_diet_weekend" TEXT,
    "typical_diet_description" TEXT,
    "drink_water" TEXT,
    "drink_coffee" TEXT,
    "drink_tea" TEXT,
    "drink_milk" TEXT,
    "drink_plant_milk" TEXT,
    "drink_milk_tea" TEXT,
    "drink_sugar_free" TEXT,
    "drink_sugary" TEXT,
    "drink_energy" TEXT,
    "drink_other" TEXT,
    "high_salt_sweat" TEXT,
    "diet_satisfaction" TEXT,
    "exercise_level" TEXT,
    "exercise_types" TEXT,
    "exercise_duration" TEXT,
    "exercise_frequency" TEXT,
    "exercise_time" TEXT,
    "exercise_motivation" TEXT,
    "exercise_challenges" TEXT,
    "exercise_goals" TEXT,
    "has_exercise_partner" TEXT,
    "exercise_partner_detail" TEXT,
    "stress_level" TEXT,
    "is_smoker" TEXT,
    "smoking_detail" TEXT,
    "is_drinker" TEXT,
    "drinking_detail" TEXT,
    "weekday_wake_time" TEXT,
    "weekday_sleep_time" TEXT,
    "morning_state" TEXT,
    "screen_time_tv" TEXT,
    "screen_time_reading" TEXT,
    "screen_time_electronics" TEXT,
    "social_activities" TEXT,
    "social_activities_other" TEXT,
    "other_feedback" TEXT,
    "freq_rice" TEXT,
    "freq_noodles_bread" TEXT,
    "freq_whole_grains" TEXT,
    "freq_fresh_fruit" TEXT,
    "freq_fruit_juice" TEXT,
    "freq_dried_fruit" TEXT,
    "freq_leafy_vegetables" TEXT,
    "freq_starchy_vegetables" TEXT,
    "freq_other_vegetables" TEXT,
    "freq_eggs" TEXT,
    "freq_poultry" TEXT,
    "freq_fish_seafood" TEXT,
    "freq_beans_soy" TEXT,
    "freq_red_meat" TEXT,
    "freq_milk_dairy" TEXT,
    "freq_yogurt" TEXT,
    "freq_cheese" TEXT,
    "freq_non_dairy_alternatives" TEXT,
    "freq_nuts_seeds" TEXT,
    "freq_cookies_cake" TEXT,
    "freq_chocolate_candy" TEXT,
    "freq_salty_snacks" TEXT,
    "uploaded_diet_files" TEXT,
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "version_number" INTEGER NOT NULL,
    "feishu_record_id" TEXT,
    "feishu_sync_status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "nutrition_surveys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "sleep_surveys_order_no_key" ON "sleep_surveys"("order_no");

-- CreateIndex
CREATE INDEX "sleep_surveys_user_id_idx" ON "sleep_surveys"("user_id");

-- CreateIndex
CREATE INDEX "sleep_surveys_feishu_sync_status_idx" ON "sleep_surveys"("feishu_sync_status");

-- CreateIndex
CREATE INDEX "sleep_surveys_submitted_at_idx" ON "sleep_surveys"("submitted_at");

-- CreateIndex
CREATE INDEX "sleep_surveys_order_no_idx" ON "sleep_surveys"("order_no");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_surveys_order_no_key" ON "nutrition_surveys"("order_no");

-- CreateIndex
CREATE INDEX "nutrition_surveys_user_id_idx" ON "nutrition_surveys"("user_id");

-- CreateIndex
CREATE INDEX "nutrition_surveys_feishu_sync_status_idx" ON "nutrition_surveys"("feishu_sync_status");

-- CreateIndex
CREATE INDEX "nutrition_surveys_submitted_at_idx" ON "nutrition_surveys"("submitted_at");

-- CreateIndex
CREATE INDEX "nutrition_surveys_order_no_idx" ON "nutrition_surveys"("order_no");
