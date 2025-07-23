-- Migration: Add Teams System (Simplified)
-- Teams with shared points only, no individual tracking

-- Teams table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    leader_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    max_members INTEGER DEFAULT 5,
    current_members INTEGER DEFAULT 1,
    team_avatar VARCHAR(255),
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Team members (simplified - just membership, no individual stats)
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'member')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id) -- One team per user
);

-- Team invitations (only leaders can invite)
CREATE TABLE team_invitations (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    invited_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    invited_by_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    UNIQUE(team_id, invited_user_id)
);

-- Team exercise attempts (team-based, no individual tracking)
CREATE TABLE team_exercise_attempts (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
    started_by_id INTEGER REFERENCES users(id),
    is_completed BOOLEAN DEFAULT FALSE,
    points_earned INTEGER DEFAULT 0,
    total_time INTEGER, -- team's total time
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    final_answer TEXT,
    UNIQUE(team_id, exercise_id)
);

-- Indexes for performance
CREATE INDEX idx_teams_leader ON teams(leader_id);
CREATE INDEX idx_teams_points ON teams(total_points DESC);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_invitations_user ON team_invitations(invited_user_id);
CREATE INDEX idx_team_invitations_status ON team_invitations(status);
CREATE INDEX idx_team_attempts_team ON team_exercise_attempts(team_id);
CREATE INDEX idx_team_attempts_exercise ON team_exercise_attempts(exercise_id);

-- Update triggers for teams
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update team member count
CREATE OR REPLACE FUNCTION update_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE teams 
        SET current_members = (SELECT COUNT(*) FROM team_members WHERE team_id = NEW.team_id)
        WHERE id = NEW.team_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE teams 
        SET current_members = (SELECT COUNT(*) FROM team_members WHERE team_id = OLD.team_id)
        WHERE id = OLD.team_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger to automatically update member count
CREATE TRIGGER update_team_member_count_trigger
    AFTER INSERT OR DELETE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_team_member_count();

-- Function to prevent users from being in multiple teams
CREATE OR REPLACE FUNCTION check_single_team_membership()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM team_members WHERE user_id = NEW.user_id AND team_id != NEW.team_id) THEN
        RAISE EXCEPTION 'User can only be a member of one team at a time';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to enforce single team membership
CREATE TRIGGER check_single_team_membership_trigger
    BEFORE INSERT OR UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION check_single_team_membership();