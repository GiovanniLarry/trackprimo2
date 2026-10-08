-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  weight TEXT NOT NULL,
  ship_date TIMESTAMP NOT NULL,
  expected_delivery TIMESTAMP NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  package_id TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
