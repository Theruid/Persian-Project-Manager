export interface Team {
  id: string;
  name: string;
  leader_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  joined_at: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}