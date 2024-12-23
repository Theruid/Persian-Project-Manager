/*
  # Add Teams Support

  1. New Tables
    - `teams`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `leader_id` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `team_members`
      - `id` (uuid, primary key) 
      - `team_id` (uuid, references teams)
      - `user_id` (uuid, references profiles)
      - `joined_at` (timestamp)

  2. Changes
    - Add unique constraint to ensure users can only be in one team
    - Add RLS policies for team access
    - Add policies for team leaders to view member activities
*/

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create team members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id) -- Ensures a user can only be in one team
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_teams_leader ON public.teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.teams TO authenticated;
GRANT ALL ON public.team_members TO authenticated;

-- Teams policies
CREATE POLICY "teams_select" ON public.teams 
    FOR SELECT USING (
        leader_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE team_members.team_id = teams.id 
            AND team_members.user_id = auth.uid()
        )
    );

CREATE POLICY "teams_insert" ON public.teams 
    FOR INSERT WITH CHECK (leader_id = auth.uid());

CREATE POLICY "teams_update" ON public.teams 
    FOR UPDATE USING (leader_id = auth.uid());

CREATE POLICY "teams_delete" ON public.teams 
    FOR DELETE USING (leader_id = auth.uid());

-- Team members policies
CREATE POLICY "team_members_select" ON public.team_members 
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE teams.id = team_members.team_id 
            AND teams.leader_id = auth.uid()
        )
    );

CREATE POLICY "team_members_insert" ON public.team_members 
    FOR INSERT WITH CHECK (
        -- Only team leader can add members
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE teams.id = team_id 
            AND teams.leader_id = auth.uid()
        )
    );

CREATE POLICY "team_members_delete" ON public.team_members 
    FOR DELETE USING (
        -- Team leader or the member themselves can remove membership
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE teams.id = team_id 
            AND teams.leader_id = auth.uid()
        )
    );

-- Modify time_entries policies to allow team leaders to view entries
DROP POLICY IF EXISTS "time_entries_select" ON public.time_entries;
CREATE POLICY "time_entries_select" ON public.time_entries 
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.teams 
            JOIN public.team_members ON teams.id = team_members.team_id 
            WHERE teams.leader_id = auth.uid() 
            AND team_members.user_id = time_entries.user_id
        )
    );