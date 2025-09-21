-- Listening Room - Postgres schema (Neon)
-- Safe to run multiple times (IF NOT EXISTS, UPSERT enums)

-- Extensions (optional)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enumerations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
    CREATE TYPE session_status AS ENUM ('waiting', 'active', 'ended', 'cancelled');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE booking_status AS ENUM ('booked', 'cancelled', 'completed');
  END IF;
END $$;

-- Core auth tables (aligned with usage in src/auth.js and API routes)
CREATE TABLE IF NOT EXISTS auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- For credentials provider
CREATE TABLE IF NOT EXISTS auth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,              -- e.g. 'credentials'
  provider TEXT NOT NULL,          -- e.g. 'credentials'
  password TEXT,                   -- bcrypt hash for credentials
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_user ON auth_accounts("userId");

-- User profile metadata
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  user_type TEXT CHECK (user_type IN ('seeker','volunteer','admin')),
  country_name TEXT,
  country_code TEXT,
  timezone TEXT,
  preferred_language TEXT,
  language_preferences TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Volunteer specialization catalog and assignment
CREATE TABLE IF NOT EXISTS volunteer_specializations (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS volunteer_specialization_assignments (
  volunteer_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  specialization_id INT NOT NULL REFERENCES volunteer_specializations(id) ON DELETE CASCADE,
  experience_level INT DEFAULT 0,
  PRIMARY KEY (volunteer_id, specialization_id)
);

-- Volunteer availability state
CREATE TABLE IF NOT EXISTS volunteer_availability_status (
  volunteer_id UUID PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  is_available BOOLEAN NOT NULL DEFAULT FALSE,
  current_active_sessions INT NOT NULL DEFAULT 0,
  max_concurrent_sessions INT NOT NULL DEFAULT 1,
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Live chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_type TEXT DEFAULT 'one_on_one',
  status session_status NOT NULL DEFAULT 'waiting',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  seeker_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  volunteer_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  seeker_language TEXT,
  seeker_country_code TEXT
);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);

-- Scheduled group/1:many sessions
CREATE TABLE IF NOT EXISTS scheduled_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  status session_status NOT NULL DEFAULT 'waiting',
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  max_participants INT NOT NULL DEFAULT 10,
  primary_specialization_id INT REFERENCES volunteer_specializations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_status ON scheduled_sessions(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_datetime ON scheduled_sessions(session_date, start_time);

-- Bookings for scheduled sessions
CREATE TABLE IF NOT EXISTS session_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_session_id UUID NOT NULL REFERENCES scheduled_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  booking_status booking_status NOT NULL DEFAULT 'booked',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_session_bookings_session ON session_bookings(scheduled_session_id);

-- Donations summary
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL, -- 'created','completed','failed','refunded'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_donations_completed_at ON donations(completed_at);

-- Minimal email queue table (if needed later)
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);


