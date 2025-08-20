-- Alternative: Recreate users table without problematic constraints
-- BACKUP: Only run this if dropping the constraint doesn't work

-- 1. First backup any existing data (should be empty anyway)
CREATE TABLE users_backup AS SELECT * FROM users;

-- 2. Drop the problematic table
DROP TABLE IF EXISTS users CASCADE;

-- 3. Recreate users table with proper structure
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('ADMIN', 'CUSTOMER')),
    customer_code INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    company_name TEXT,
    contact_name TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT
);

-- 4. Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- 5. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Insert admin user
INSERT INTO users (
    email, 
    role, 
    company_name,
    contact_name,
    is_active
) VALUES (
    'admin@roasterordering.com',
    'ADMIN',
    'Roaster Ordering Admin',
    'Admin User',
    true
);

-- 7. Verify it worked
SELECT id, email, role, company_name, created_at 
FROM users 
WHERE email = 'admin@roasterordering.com';
