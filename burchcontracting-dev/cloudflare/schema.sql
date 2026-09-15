-- Cloudflare D1 schema for Burch Contracting leads.
-- Run once: wrangler d1 execute burchcontracting-leads --file=cloudflare/schema.sql
-- Mirrors the MySQL schema in public/api/admin/schema.sql exactly.

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','contacted','quoted','won','lost')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  zip_code TEXT,
  service_type TEXT,
  budget_range TEXT,
  timeframe TEXT,
  referral_source TEXT,
  description TEXT NOT NULL,
  attachment_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

CREATE TABLE IF NOT EXISTS lead_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT (datetime('now')),
  note TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activity_lead_id ON lead_activity(lead_id);
