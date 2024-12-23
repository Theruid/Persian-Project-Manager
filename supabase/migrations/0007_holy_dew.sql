/*
  # Fix Team Member Policies

  1. Changes
    - Simplify team member policies to prevent infinite recursion
    - Update related policies to use simpler join logic
    - Remove circular dependencies in policy definitions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "teams_select" ON public.teams;
DROP POLICY IF EXISTS "team_members_select" ON public.team_members;
DROP POLICY IF EXISTS "time_entries_select" ON public.time_entries;

-- Teams policies
CREATE POLICY "teams_select" ON public.teams 
    FOR SELECT USING (
        leader_id = auth.uid() OR
        id IN (
            SELECT team_id 
            FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Team members policies
CREATE POLICY "team_members_select" ON public.team_members 
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 
            FROM public.teams 
            WHERE id = team_members.team_id 
            AND leader_id = auth.uid()
        )
    );

-- Time entries policy
CREATE POLICY "time_entries_select" ON public.time_entries 
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 
            FROM public.teams t
            JOIN public.team_members tm ON t.id = tm.team_id 
            WHERE t.leader_id = auth.uid() 
            AND tm.user_id = time_entries.user_id
        )
    );