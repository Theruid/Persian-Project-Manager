import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, Briefcase, Calendar, TrendingUp, Timer } from 'lucide-react';
import { usePersianFormat } from '../hooks/usePersianFormat';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { useProjects } from '../hooks/useProjects';

interface Stats {
  totalProjects: number;
  totalHours: number;
  activeProjects: number;
  completedProjects: number;
  averageHoursPerDay: number;
  totalTimeEntries: number;
  mostActiveProject: {
    title: string;
    hours: number;
  } | null;
  recentActivity: Array<{
    id: string;
    type: string;
    project: string;
    time: string;
  }>;
}

export default function Dashboard() {
  const { formatDate } = usePersianFormat();
  const { timeEntries, fetchTimeEntries } = useTimeEntries();
  const { projects } = useProjects();
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalHours: 0,
    activeProjects: 0,
    completedProjects: 0,
    averageHoursPerDay: 0,
    totalTimeEntries: 0,
    mostActiveProject: null,
    recentActivity: []
  });

  useEffect(() => {
    fetchStats();
  }, [timeEntries, projects]);

  const fetchStats = async () => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return;

    // Fetch projects
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId);

    // Fetch time entries
    const { data: timeEntries } = await supabase
      .from('time_entries')
      .select('*, projects(title)')
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    if (!projects || !timeEntries) return;

    // Calculate total hours
    const totalHours = timeEntries.reduce((acc, entry) => {
      if (entry.end_time) {
        const duration = new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime();
        return acc + (duration / (1000 * 60 * 60));
      }
      return acc;
    }, 0);

    // Calculate active and completed projects
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;

    // Calculate average hours per day
    const firstEntry = timeEntries[timeEntries.length - 1];
    const lastEntry = timeEntries[0];
    const totalDays = firstEntry && lastEntry
      ? Math.ceil((new Date(lastEntry.start_time).getTime() - new Date(firstEntry.start_time).getTime()) / (1000 * 60 * 60 * 24))
      : 1;
    const averageHoursPerDay = totalHours / (totalDays || 1);

    // Find most active project
    const projectHours = timeEntries.reduce((acc: { [key: string]: { title: string, hours: number } }, entry) => {
      if (entry.end_time && entry.project_id && entry.projects?.title) {
        const duration = (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / (1000 * 60 * 60);
        if (!acc[entry.project_id]) {
          acc[entry.project_id] = { title: entry.projects.title, hours: 0 };
        }
        acc[entry.project_id].hours += duration;
      }
      return acc;
    }, {});

    const mostActiveProject = Object.values(projectHours).reduce((max, current) => 
      !max || current.hours > max.hours ? current : max
    , null);

    // Get recent activity
    const recentActivity = timeEntries.slice(0, 5).map(entry => ({
      id: entry.id,
      type: entry.end_time ? 'completed' : 'started',
      project: entry.projects?.title || 'Unknown Project',
      time: formatDate(entry.start_time)
    }));

    setStats({
      totalProjects: projects.length,
      totalHours,
      activeProjects,
      completedProjects,
      averageHoursPerDay,
      totalTimeEntries: timeEntries.length,
      mostActiveProject,
      recentActivity
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-8">
        {/* Total Projects */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">کل پروژه‌ها</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.totalProjects}</p>
            </div>
            <div className="bg-primary-50 p-2 sm:p-3 rounded-lg sm:rounded-xl">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs sm:text-sm">
            <div>
              <span className="text-gray-600">فعال: </span>
              <span className="font-medium text-gray-900">{stats.activeProjects}</span>
            </div>
            <div>
              <span className="text-gray-600">تکمیل شده: </span>
              <span className="font-medium text-gray-900">{stats.completedProjects}</span>
            </div>
          </div>
        </div>

        {/* Total Hours */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">کل ساعات کاری</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                {stats.totalHours.toFixed(1)} ساعت
              </p>
            </div>
            <div className="bg-primary-50 p-2 sm:p-3 rounded-lg sm:rounded-xl">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm">
            <span className="text-gray-600">میانگین روزانه: </span>
            <span className="font-medium text-gray-900">
              {stats.averageHoursPerDay.toFixed(1)} ساعت
            </span>
          </div>
        </div>

        {/* Most Time Spent Project */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">بیشترین زمان صرف شده</p>
              <p className="text-lg font-bold text-gray-900 mt-1 truncate">
                {stats.mostActiveProject?.title || 'بدون پروژه'}
              </p>
            </div>
            <div className="bg-primary-50 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0 mr-3">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm">
            <span className="text-gray-600">ساعات کار: </span>
            <span className="font-medium text-gray-900">
              {stats.mostActiveProject?.hours.toFixed(1) || 0} ساعت
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">فعالیت‌های اخیر</h2>
        <div className="space-y-3 sm:space-y-4">
          {stats.recentActivity.map(activity => (
            <div key={activity.id} className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className={`p-1.5 sm:p-2 rounded-lg ${
                  activity.type === 'completed' ? 'bg-green-50' : 'bg-blue-50'
                }`}>
                  <Timer className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    activity.type === 'completed' ? 'text-green-600' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.project}</p>
                  <p className="text-xs text-gray-500">
                    {activity.type === 'completed' ? 'اتمام کار' : 'شروع کار'}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}