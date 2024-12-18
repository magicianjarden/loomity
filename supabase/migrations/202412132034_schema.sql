-- Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Teams Table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create User_Teams Table
CREATE TABLE user_teams (
  user_id UUID REFERENCES users(id),
  team_id UUID REFERENCES teams(id),
  role TEXT CHECK (role IN ('Owner', 'Admin', 'Member', 'Guest')),
  PRIMARY KEY (user_id, team_id)
);

-- Create Workspaces Table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team_id UUID REFERENCES teams(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies
CREATE POLICY "Allow individual access" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Team members can view" ON teams
FOR SELECT USING (EXISTS (
  SELECT 1 FROM user_teams
  WHERE user_teams.team_id = teams.id
  AND user_teams.user_id = auth.uid()
));

CREATE POLICY "Allow access to own team memberships" ON user_teams
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Team members can view workspaces" ON workspaces
FOR SELECT USING (EXISTS (
  SELECT 1 FROM user_teams
  WHERE user_teams.team_id = workspaces.team_id
  AND user_teams.user_id = auth.uid()
));