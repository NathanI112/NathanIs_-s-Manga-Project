-- Drop existing policies for the users table
DROP POLICY IF EXISTS "Public users access" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Auth service can create users" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;

-- Allow authenticated users to read their own data
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid()::text = uuid::text);

-- Allow authenticated users to update their own data
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = uuid::text);

-- Allow anyone to insert users (we'll control this at the application level)
CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (true);

-- Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'users';

