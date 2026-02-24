CREATE TABLE user_stats
(
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    eye_reminders int NOT NULL DEFAULT 0,
    standing_reminders int NOT NULL DEFAULT 0,
    eye_reminders_dismissed int NOT NULL DEFAULT 0,
    standing_reminders_dismissed int NOT NULL DEFAULT 0,
    total_usage_duration_minutes int NOT NULL DEFAULT 0
);
