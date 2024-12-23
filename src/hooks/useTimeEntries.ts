import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TimeEntry } from '../types/timeEntry';
import toast from 'react-hot-toast';

export function useTimeEntries() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);

  const fetchTimeEntries = async () => {
    const { data, error } = await supabase
      .from('time_entries')
      .select(`
        *,
        projects (
          title
        )
      `)
      .order('start_time', { ascending: false });

    if (error) {
      toast.error('خطا در دریافت زمان‌ها');
      return;
    }

    setTimeEntries(data || []);
    const active = data?.find(entry => !entry.end_time);
    setActiveEntry(active || null);
  };

  const resetAllTimeEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('لطفا دوباره وارد شوید');
        return false;
      }

      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        toast.error('خطا در پاک کردن زمان‌ها');
        return false;
      }

      toast.success('تمام زمان‌ها پاک شدند');
      await fetchTimeEntries();
      return true;
    } catch (error) {
      toast.error('خطا در عملیات');
      return false;
    }
  };

  const startTimer = async (projectId: string, description: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('لطفا دوباره وارد شوید');
        return;
      }

      const { error } = await supabase
        .from('time_entries')
        .insert([{
          project_id: projectId,
          description,
          start_time: new Date().toISOString(),
          user_id: user.id
        }]);

      if (error) {
        toast.error('خطا در شروع تایمر');
        return;
      }

      toast.success('تایمر شروع شد');
      await fetchTimeEntries();
      return true;
    } catch (error) {
      toast.error('خطا در عملیات');
      return false;
    }
  };

  const stopTimer = async () => {
    if (!activeEntry) return;

    const { error } = await supabase
      .from('time_entries')
      .update({ end_time: new Date().toISOString() })
      .eq('id', activeEntry.id);

    if (error) {
      toast.error('خطا در توقف تایمر');
      return;
    }

    toast.success('تایمر متوقف شد');
    await fetchTimeEntries();
  };

  const updateTimeEntry = async (id: string, data: Partial<TimeEntry>) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .update(data)
        .eq('id', id);

      if (error) {
        toast.error('خطا در بروزرسانی');
        return false;
      }

      toast.success('با موفقیت بروزرسانی شد');
      await fetchTimeEntries();
      return true;
    } catch (error) {
      toast.error('خطا در عملیات');
      return false;
    }
  };

  const deleteTimeEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('خطا در حذف');
        return false;
      }

      toast.success('با موفقیت حذف شد');
      await fetchTimeEntries();
      return true;
    } catch (error) {
      toast.error('خطا در عملیات');
      return false;
    }
  };

  useEffect(() => {
    fetchTimeEntries();
  }, []);

  return {
    timeEntries,
    activeEntry,
    startTimer,
    stopTimer,
    updateTimeEntry,
    deleteTimeEntry,
    resetAllTimeEntries,
    fetchTimeEntries
  };
}