import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project } from '../types/project';
import toast from 'react-hot-toast';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('id, title');

    if (error) {
      toast.error('خطا در دریافت پروژه‌ها');
      return;
    }

    setProjects(data || []);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects };
}