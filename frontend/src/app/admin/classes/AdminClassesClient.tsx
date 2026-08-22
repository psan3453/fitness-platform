'use client';

import { useState } from 'react';
import { AdminLiveClass } from '@/lib/types/classes';
import { cancelClassAction } from './actions';

export default function AdminClassesClient({ initialClasses }: { initialClasses: AdminLiveClass[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this class?')) {
      return;
    }

    setError(null);
    setSuccess(null);
    setProcessingId(id);

    try {
      const result = await cancelClassAction(id);
      if (result.success) {
        setSuccess('Class has been successfully cancelled.');
      } else {
        setError(result.error || 'Failed to cancel the class.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trainer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialClasses.map((cls) => {
                const trainerName = cls.trainer.user.profile
                  ? `${cls.trainer.user.profile.firstName} ${cls.trainer.user.profile.lastName || ''}`
                  : 'No Profile';
                const startTime = new Date(cls.startTime);
                const endTime = new Date(cls.endTime);

                return (
                  <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cls.title}</div>
                      {cls.meetingUrl && (
                        <a href={cls.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                          Meeting Link
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{trainerName}</div>
                      <div className="text-xs text-gray-500">{cls.trainer.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {cls.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{startTime.toLocaleDateString('en-US')}</div>
                      <div className="text-xs text-gray-500">
                        {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cls.capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cls.status === 'SCHEDULED'
                            ? 'bg-blue-100 text-blue-800'
                            : cls.status === 'LIVE'
                            ? 'bg-green-100 text-green-800'
                            : cls.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {cls.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {cls.status === 'SCHEDULED' ? (
                        <button
                          onClick={() => handleCancel(cls.id)}
                          disabled={processingId !== null}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          {processingId === cls.id ? 'Processing...' : 'Cancel'}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs italic">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
