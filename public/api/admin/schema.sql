-- CRM schema for Burch Contracting leads.
-- Run this once via phpMyAdmin (or `mysql < schema.sql`) against the
-- database created in hPanel — see public/api/admin/README.md for the
-- full setup sequence. Not web-accessible (blocked in .htaccess).

CREATE TABLE IF NOT EXISTS leads (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('new', 'contacted', 'quoted', 'won', 'lost') NOT NULL DEFAULT 'new',
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address VARCHAR(500) DEFAULT NULL,
  zip_code VARCHAR(20) DEFAULT NULL,
  service_type VARCHAR(100) DEFAULT NULL,
  budget_range VARCHAR(100) DEFAULT NULL,
  timeframe VARCHAR(100) DEFAULT NULL,
  referral_source VARCHAR(100) DEFAULT NULL,
  description TEXT NOT NULL,
  attachment_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- One row per note or automatic status-change entry — a single append-only
-- timeline per lead, shown newest-first on the lead detail page.
CREATE TABLE IF NOT EXISTS lead_activity (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  note TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  INDEX idx_lead_id (lead_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
