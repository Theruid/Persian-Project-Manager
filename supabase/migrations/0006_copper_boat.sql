/*
  # Fix Team Policies

  1. Changes
    - Simplify team policies to prevent infinite recursion
    - Update time entries policy to use simpler join logic
    - Maintain security while avoiding circular dependencies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "teams_select" ON public.teams;
DROP POLICY IF EXISTS "time_entries_select" ON public.time_entries;

-- Simplified team policies
CREATE POLICY "teams_select" ON public.teams 
    FOR SELECT USING (
        -- User can see teams they lead or are a member of
        leader_id = auth.uid() OR
        id IN (
            SELECT team_id 
            FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Simplified time entries policy
CREATE POLICY "time_entries_select" ON public.time_entries 
    FOR SELECT USING (
        -- User can see their own entries or entries of their team members
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 
            FROM public.teams t
            WHERE t.leader_id = auth.uid() 
            AND EXISTS (
                SELECT 1 
                FROM public.team_members tm 
                WHERE tm.team_id = t.id 
                AND tm.user_id = time_entries.user_id
            )
        )
    );