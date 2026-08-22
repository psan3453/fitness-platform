'use client';

import { useState } from 'react';
import { AdminTrainerApplication } from '@/lib/types/admin';
import { approveTrainerApplicationAction, rejectTrainerApplicationAction } from './actions';

export default function TrainerApplicationsClient({
  initialApplications,
}: {
  initialApplications: AdminTrainerApplication[];
}) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setError(null);
    setSuccess(null);
    setProcessingId(id);
    try {
      const result = await approveTrainerApplicationAction(id);
      if (result.success) {
        setSuccess('Application approved successfully.');
      } else {
        setError(result.error || 'Failed to approve application.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required.');
      return;
    }
    setError(null);
    setSuccess(null);
    setProcessingId(id);
    try {
      const result = await rejectTrainerApplicationAction(id, rejectionReason);
      if (result.success) {
        setSuccess('Application rejected successfully.');
        setRejectingId(null);
        setRejectionReason('');
      } else {
        setError(result.error || 'Failed to reject application.');
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
        <ul className="divide-y divide-gray-100">
          {initialApplications.map((app) => (
            <li key={app.id} className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {app.user?.profile?.firstName} {app.user?.profile?.lastName}
                    </h3>
                    <span className="text-sm text-gray-500">({app.user?.email})</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        app.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : app.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <span className="font-semibold block text-gray-900">Specialization</span>
                      {app.specialization}
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-900">Submitted On</span>
                      {new Date(app.createdAt).toLocaleDateString('en-US')}
                    </div>

                    {app.experience && (
                      <div className="sm:col-span-2">
                        <span className="font-semibold block text-gray-900">Experience</span>
                        {app.experience}
                      </div>
                    )}

                    {app.certifications && (
                      <div className="sm:col-span-2">
                        <span className="font-semibold block text-gray-900">Certifications</span>
                        {app.certifications}
                      </div>
                    )}

                    {app.bio && (
                      <div className="sm:col-span-2">
                        <span className="font-semibold block text-gray-900">Bio</span>
                        <p className="mt-1 text-gray-600 whitespace-pre-wrap">{app.bio}</p>
                      </div>
                    )}

                    {app.status === 'REJECTED' && app.rejectionReason && (
                      <div className="sm:col-span-2 mt-2 p-3 bg-red-50 rounded-md border border-red-100">
                        <span className="font-semibold block text-red-800">Rejection Reason</span>
                        <p className="mt-1 text-red-700">{app.rejectionReason}</p>
                        {app.reviewedAt && (
                          <p className="mt-2 text-xs text-red-600">
                            Reviewed on: {new Date(app.reviewedAt).toLocaleString('en-US')}
                          </p>
                        )}
                      </div>
                    )}

                    {app.status === 'APPROVED' && app.reviewedAt && (
                      <div className="sm:col-span-2 mt-2 p-3 bg-green-50 rounded-md border border-green-100">
                        <p className="text-sm text-green-800">
                          Approved on: {new Date(app.reviewedAt).toLocaleString('en-US')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {app.status === 'PENDING' && (
                  <div className="flex flex-col space-y-3 min-w-[250px]">
                    {rejectingId === app.id ? (
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700">
                          Reason for rejection
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border"
                          rows={3}
                          placeholder="Please explain why..."
                          disabled={processingId === app.id}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleReject(app.id)}
                            disabled={processingId === app.id || !rejectionReason.trim()}
                            className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            {processingId === app.id ? 'Saving...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectionReason('');
                            }}
                            disabled={processingId === app.id}
                            className="flex-1 bg-white text-gray-700 border border-gray-300 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleApprove(app.id)}
                          disabled={processingId !== null}
                          className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === app.id ? 'Processing...' : 'Approve Application'}
                        </button>
                        <button
                          onClick={() => setRejectingId(app.id)}
                          disabled={processingId !== null}
                          className="w-full bg-white text-red-600 border border-red-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Reject Application
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
