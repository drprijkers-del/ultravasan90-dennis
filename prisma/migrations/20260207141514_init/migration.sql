-- CreateTable
CREATE TABLE "strava_tokens" (
    "id" SERIAL NOT NULL,
    "athlete_id" BIGINT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strava_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" SERIAL NOT NULL,
    "strava_activity_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "distance_m" DOUBLE PRECISION NOT NULL,
    "moving_time_s" INTEGER NOT NULL,
    "elapsed_time_s" INTEGER,
    "average_speed" DOUBLE PRECISION,
    "average_heartrate" DOUBLE PRECISION,
    "max_heartrate" DOUBLE PRECISION,
    "total_elevation_gain" DOUBLE PRECISION,
    "summary_polyline" TEXT,
    "is_long_run" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_stats" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "total_km" DOUBLE PRECISION NOT NULL,
    "run_count" INTEGER NOT NULL,

    CONSTRAINT "weekly_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_stats" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "total_km" DOUBLE PRECISION NOT NULL,
    "run_count" INTEGER NOT NULL,

    CONSTRAINT "monthly_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "race_points" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "accuracy_m" DOUBLE PRECISION,
    "speed_mps" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "race_points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "strava_tokens_athlete_id_key" ON "strava_tokens"("athlete_id");

-- CreateIndex
CREATE UNIQUE INDEX "activities_strava_activity_id_key" ON "activities"("strava_activity_id");

-- CreateIndex
CREATE INDEX "activities_start_date_idx" ON "activities"("start_date");

-- CreateIndex
CREATE INDEX "activities_type_idx" ON "activities"("type");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_stats_year_week_key" ON "weekly_stats"("year", "week");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_stats_year_month_key" ON "monthly_stats"("year", "month");

-- CreateIndex
CREATE INDEX "race_points_timestamp_idx" ON "race_points"("timestamp");
