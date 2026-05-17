CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100),
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failure')),
  message TEXT,
  request_payload JSONB,
  response_payload JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS provider_schedule (
  id SERIAL PRIMARY KEY,
  patient_fhir_id VARCHAR(100) NOT NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  visit_type VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'checked-in', 'completed', 'cancelled', 'no-show')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_provider_schedule_date
ON provider_schedule (scheduled_date);

CREATE INDEX IF NOT EXISTS idx_provider_schedule_patient
ON provider_schedule (patient_fhir_id);
