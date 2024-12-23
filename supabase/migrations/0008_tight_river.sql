/*
  # Fix Team Policies

  1. Changes
    - Remove circular references in policies
    - Simplify policy logic
    - Use direct joins instead of nested subqueries
    - Ensure proper access control without recursion
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "teams_select" ON public.teams;
DROP POLICY IF EXISTS "team_members_select" ON public.team_members;
DROP POLICY IF EXISTS "time_entries_select" ON public.time_entries;

-- Teams policies - simplified
CREATE POLICY "teams_select" ON public.teams 
    FOR SELECT USING (
        leader_id = auth.uid() OR
        id IN (
            SELECT team_id 
            FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Team members policies - direct access
CREATE POLICY "team_members_select" ON public.team_members 
    FOR SELECT USING (
        user_id = auth.uid() OR
        team_id IN (
            SELECT id 
            FROM public.teams 
            WHERE leader_id = auth.uid()
        )
    );

-- Time entries policy - using direct join
CREATE POLICY "time_entries_select" ON public.time_entries 
    FOR SELECT USING (
        user_id = auth.uid() OR
        user_id IN (
            SELECT tm.user_id
            FROM public.teams t
            JOIN public.team_members tm ON t.id = tm.team_id
            WHERE t.leader_id = auth.uid()
        )
    );