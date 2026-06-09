export async function register() {
  // Run in Node.js runtime only — skip for edge runtime if it ever runs here
  if (process.env.NEXT_RUNTIME === "edge") return;
  {
    const url = process.env.DATABASE_URL;
    if (!url) {
      console.warn("[db] DATABASE_URL not set — skipping schema initialization");
      return;
    }

    const postgres = (await import("postgres")).default;
    const sql = postgres(url, { max: 1, connect_timeout: 15 });

    try {
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          password_hash TEXT NOT NULL,
          salt TEXT NOT NULL,
          is_verified BOOLEAN NOT NULL DEFAULT FALSE,
          verified_at TEXT,
          plan TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS verification_tokens (
          id SERIAL PRIMARY KEY,
          token TEXT UNIQUE NOT NULL,
          email TEXT NOT NULL,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          used_at TEXT
        );

        CREATE TABLE IF NOT EXISTS subscriptions (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          plan_code TEXT,
          status TEXT NOT NULL DEFAULT 'none',
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS user_profiles (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL DEFAULT '',
          email TEXT NOT NULL DEFAULT '',
          dietary_preference TEXT NOT NULL DEFAULT 'normal',
          intolerances TEXT[] NOT NULL DEFAULT '{}',
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS monitoring_entries (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_email TEXT NOT NULL,
          date TEXT NOT NULL,
          meal_time TEXT,
          consumed_foods TEXT[] NOT NULL DEFAULT '{}',
          symptoms TEXT[] NOT NULL DEFAULT '{}',
          symptoms_intensity INTEGER NOT NULL DEFAULT 0,
          reaction_latency_minutes INTEGER,
          wellbeing INTEGER NOT NULL,
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS user_problems (
          id TEXT PRIMARY KEY,
          user_email TEXT NOT NULL,
          symptoms JSONB NOT NULL DEFAULT '[]',
          triggers JSONB NOT NULL DEFAULT '[]',
          meal_patterns JSONB NOT NULL DEFAULT '[]',
          severity INTEGER NOT NULL DEFAULT 5,
          successful_adjustments JSONB NOT NULL DEFAULT '[]',
          improvement_notes TEXT NOT NULL DEFAULT '',
          source TEXT NOT NULL DEFAULT 'ai_derived',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS guidance_history (
          id TEXT PRIMARY KEY,
          user_email TEXT NOT NULL,
          generated_at TEXT NOT NULL,
          source TEXT NOT NULL DEFAULT 'ai',
          request_fingerprint TEXT NOT NULL,
          prompt TEXT NOT NULL DEFAULT '',
          monitoring_entries JSONB NOT NULL DEFAULT '[]',
          result JSONB NOT NULL
        );

        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id SERIAL PRIMARY KEY,
          token TEXT UNIQUE NOT NULL,
          email TEXT NOT NULL,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          used_at TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_vt_email ON verification_tokens(email);
        CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);
        CREATE INDEX IF NOT EXISTS idx_profiles_user_email ON user_profiles(user_email);
        CREATE INDEX IF NOT EXISTS idx_monitoring_user_email ON monitoring_entries(user_email);
        CREATE INDEX IF NOT EXISTS idx_monitoring_date ON monitoring_entries(date);
        CREATE INDEX IF NOT EXISTS idx_guidance_user_email ON guidance_history(user_email);
        CREATE INDEX IF NOT EXISTS idx_user_problems_user_email ON user_problems(user_email);
      `);
      console.log("[db] Schema ready");
    } catch (err) {
      console.error("[db] Schema initialization failed:", err);
    } finally {
      await sql.end();
    }
  }
}
