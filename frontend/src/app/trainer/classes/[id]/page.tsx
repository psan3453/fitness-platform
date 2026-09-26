'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTrainerClassAction, updateTrainerClassAction } from '../actions';
import { TrainerClass, LiveClassCategory } from '@/lib/types/classes';

export default function TrainerClassEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [liveClass, setLiveClass] = useState<TrainerClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'YOGA' as LiveClassCategory,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    capacity: 20,
    meetingUrl: '',
  });

  useEffect(() => {
    async function loadClass() {
      try {
        const result = await getTrainerClassAction(id);
        if (!result.success || !result.class) {
          setError(result.error || 'Failed to load class details');
          setIsLoading(false);
          return;
        }
        const c = result.class;
        setLiveClass(c);
        const start = new Date(c.startTime);
        const end = new Date(c.endTime);
        const formatTime = (d: Date) => d.toTimeString().substring(0, 5);
        const formatDate = (d: Date) => {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        setFormData({
          title: c.title,
          description: c.description || '',
          category: c.category,
          startDate: formatDate(start),
          startTime: formatTime(start),
          endDate: formatDate(end),
          endTime: formatTime(end),
          capacity: c.capacity,
          meetingUrl: c.meetingUrl || '',
        });
      } catch (err: unknown) {
        console.error('Failed to load class:', err);
        setError(err instanceof Error ? err.message : 'Failed to load class details');
      } finally {
        setIsLoading(false);
      }
    }
    loadClass();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00`).toISOString();
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}:00`).toISOString();

      if (new Date(endDateTime) <= new Date(startDateTime)) {
        setError('End time must be after start time.');
        setIsSaving(false);
        return;
      }

      const result = await updateTrainerClassAction(id, {
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        startTime: startDateTime,
        endTime: endDateTime,
        capacity: formData.capacity,
        meetingUrl: formData.meetingUrl || null,
      });

      if (result.success) {
        setSuccessMsg('Class updated successfully.');
        router.refresh();
      } else {
        setError(result.error || 'An error occurred while updating the class.');
      }
    } catch (err: unknown) {
      console.error('Failed to update class:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating the class.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center pt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !liveClass) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Class Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/trainer/classes" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
              Back to Classes
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/trainer/classes" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Classes
          </Link>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-6 py-8 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Class</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage details for {liveClass?.title}
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                liveClass?.status === 'SCHEDULED' ? 'bg-green-100 text-green-800' :
                liveClass?.status === 'LIVE' ? 'bg-red-100 text-red-800' :
                liveClass?.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {liveClass?.status}
              </span>
            </div>
          </div>

          <div className="px-6 py-6">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {successMsg && (
              <div className="mb-6 rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Success</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{successMsg}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Class Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  maxLength={200}
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    disabled
                    value={formData.category}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-700 shadow-sm sm:text-sm p-2 border cursor-not-allowed"
                  >
                    <option value={formData.category}>{formData.category}</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Locked to your verified trainer specialization ({formData.category}).
                  </p>
                </div>

                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    id="capacity"
                    required
                    min={1}
                    max={1000}
                    value={formData.capacity}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    id="startTime"
                    required
                    value={formData.startTime}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    id="endTime"
                    required
                    value={formData.endTime}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="meetingUrl" className="block text-sm font-medium text-gray-700">
                  Meeting URL
                </label>
                <input
                  type="url"
                  name="meetingUrl"
                  id="meetingUrl"
                  value={formData.meetingUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-4">
                <Link
                  href="/trainer/classes"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
