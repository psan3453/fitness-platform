'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createTrainerClassAction, getTrainerSpecializationAction } from '../actions';
import { LiveClassCategory } from '@/lib/types/classes';

export default function CreateClassPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    async function loadSpecialization() {
      const res = await getTrainerSpecializationAction();
      if (res.success && res.specialization) {
        setFormData(prev => ({ ...prev, category: res.specialization as LiveClassCategory }));
      }
    }
    loadSpecialization();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Construct ISO strings
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00`).toISOString();
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}:00`).toISOString();

      if (new Date(endDateTime) <= new Date(startDateTime)) {
        setError('End time must be after start time.');
        setIsSubmitting(false);
        return;
      }

      const result = await createTrainerClassAction({
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        startTime: startDateTime,
        endTime: endDateTime,
        capacity: formData.capacity,
        meetingUrl: formData.meetingUrl || null,
      });

      if (result.success) {
        router.push('/trainer/classes');
        router.refresh();
      } else {
        setError(result.error || 'An error occurred while creating the class.');
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      console.error('Failed to create class:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the class.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/trainer/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-6 py-8 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Create Live Class</h1>
            <p className="mt-1 text-sm text-gray-500">
              Schedule a new live class for your students.
            </p>
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
                  placeholder="e.g. Morning Yoga Flow"
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
                  placeholder="Describe what students will learn..."
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
                  placeholder="https://zoom.us/j/..."
                />
                <p className="mt-1 text-xs text-gray-500">Optional. You can add this later.</p>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-4">
                <Link
                  href="/trainer/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
