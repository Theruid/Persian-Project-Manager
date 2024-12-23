import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { usePersianFormat } from '../hooks/usePersianFormat';
import ConfirmModal from '../components/shared/ConfirmModal';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const { formatDate } = usePersianFormat();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('خطا در دریافت پروژه‌ها');
      return;
    }

    setProjects(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('لطفا دوباره وارد شوید');
        return;
      }

      if (editingId) {
        const { error } = await supabase
          .from('projects')
          .update({ title, description })
          .eq('id', editingId);

        if (error) {
          toast.error('خطا در بروزرسانی پروژه');
          return;
        }
        toast.success('پروژه با موفقیت بروزرسانی شد');
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([{ 
            title, 
            description,
            user_id: user.id 
          }]);

        if (error) {
          toast.error('خطا در ایجاد پروژه');
          return;
        }
        toast.success('پروژه با موفقیت ایجاد شد');
      }

      setShowModal(false);
      setTitle('');
      setDescription('');
      setEditingId(null);
      fetchProjects();
    } catch (error) {
      toast.error('خطا در عملیات');
    }
  };

  const handleEdit = (project: Project) => {
    setTitle(project.title);
    setDescription(project.description);
    setEditingId(project.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('خطا در حذف پروژه');
      return;
    }

    toast.success('پروژه با موفقیت حذف شد');
    setShowConfirmModal(false);
    setProjectToDelete(null);
    fetchProjects();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">پروژه‌ها</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setTitle('');
            setDescription('');
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 ml-2" />
          پروژه جدید
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عنوان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  توضیحات
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاریخ ایجاد
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{project.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{project.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 text-left" dir="ltr">
                      {formatDate(project.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEdit(project)}
                        className="text-primary-600 hover:text-primary-800 p-1"
                        title="ویرایش"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setProjectToDelete(project.id);
                          setShowConfirmModal(true);
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          <div className="divide-y divide-gray-200">
            {projects.map((project) => (
              <div key={project.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-500">{project.description}</p>
                  </div>
                  <div className="flex gap-2 mr-4">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-primary-600 hover:text-primary-800 p-1"
                      title="ویرایش"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setProjectToDelete(project.id);
                        setShowConfirmModal(true);
                      }}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="حذف"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500" dir="ltr">
                  {formatDate(project.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? 'ویرایش پروژه' : 'پروژه جدید'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setTitle('');
                  setDescription('');
                  setEditingId(null);
                }}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors"
                  required
                  placeholder="عنوان پروژه را وارد کنید..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors"
                  rows={3}
                  placeholder="توضیحات پروژه را وارد کنید..."
                />
              </div>
            </form>

            <div className="flex justify-end items-center gap-3 p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setTitle('');
                  setDescription('');
                  setEditingId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={handleSubmit}
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                {editingId ? 'بروزرسانی' : 'ایجاد'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="حذف پروژه"
        message="آیا از حذف این پروژه اطمینان دارید؟"
        onConfirm={() => projectToDelete && handleDelete(projectToDelete)}
        onCancel={() => {
          setShowConfirmModal(false);
          setProjectToDelete(null);
        }}
      />
    </div>
  );
}