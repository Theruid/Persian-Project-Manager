import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Team, TeamMember } from '../types/team';
import toast from 'react-hot-toast';

export function useTeam() {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLeader, setIsLeader] = useState(false);

  const fetchTeamAndMembers = async () => {
    try {
      // First check if user is a team leader
      const { data: leaderTeam } = await supabase
        .from('teams')
        .select('*')
        .eq('leader_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (leaderTeam) {
        setTeam(leaderTeam);
        setIsLeader(true);
      } else {
        // Check if user is a team member
        const { data: memberTeam } = await supabase
          .from('team_members')
          .select('teams(*)')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (memberTeam?.teams) {
          setTeam(memberTeam.teams);
          setIsLeader(false);
        }
      }

      // Fetch team members if we found a team
      if (team) {
        const { data: teamMembers } = await supabase
          .from('team_members')
          .select(`
            *,
            profiles (
              email,
              full_name
            )
          `)
          .eq('team_id', team.id);

        if (teamMembers) {
          setMembers(teamMembers);
        }
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  const createTeam = async (name: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('teams')
        .insert([{ name, leader_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Team created successfully');
      await fetchTeamAndMembers();
      return data;
    } catch (error) {
      toast.error('Failed to create team');
      throw error;
    }
  };

  const addMember = async (email: string) => {
    try {
      if (!team) throw new Error('No team found');

      // First get the user ID from the email
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (!userProfile) {
        toast.error('User not found');
        return;
      }

      // Check if user is already in a team
      const { data: existingMembership } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', userProfile.id)
        .single();

      if (existingMembership) {
        toast.error('User is already in a team');
        return;
      }

      const { error } = await supabase
        .from('team_members')
        .insert([{ team_id: team.id, user_id: userProfile.id }]);

      if (error) throw error;

      toast.success('Member added successfully');
      await fetchTeamAndMembers();
    } catch (error) {
      toast.error('Failed to add member');
      throw error;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Member removed successfully');
      await fetchTeamAndMembers();
    } catch (error) {
      toast.error('Failed to remove member');
      throw error;
    }
  };

  const leaveTeam = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Left team successfully');
      setTeam(null);
      setMembers([]);
      setIsLeader(false);
    } catch (error) {
      toast.error('Failed to leave team');
      throw error;
    }
  };

  useEffect(() => {
    fetchTeamAndMembers();
  }, []);

  return {
    team,
    members,
    isLeader,
    createTeam,
    addMember,
    removeMember,
    leaveTeam,
    refreshTeam: fetchTeamAndMembers
  };
}