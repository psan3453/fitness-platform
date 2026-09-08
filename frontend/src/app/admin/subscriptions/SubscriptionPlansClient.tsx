'use client';

import { useState } from 'react';
import { SubscriptionPlanDetail } from '@/lib/types/subscription';
import { createSubscriptionPlanAction, updateSubscriptionPlanAction } from './actions';

export default function SubscriptionPlansClient({ initialPlans }: { initialPlans: SubscriptionPlanDetail[] }) {
  const [plans] = useState<SubscriptionPlanDetail[]>(initialPlans);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    durationDays: 30,
  });

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({ name: '', description: '', price: 0, durationDays: 30 });
    setIsEditing(null);
    setIsCreating(false);
    setError(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProcessingId('new');

    const result = await createSubscriptionPlanAction({
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      durationDays: Number(formData.durationDays),
    });

    if (result.success) {
      window.location.reload(); // Quick refresh since server components will fetch new list
    } else {
      setError(result.error || 'Failed to create plan');
      setProcessingId(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setError(null);
    setProcessingId(id);

    const result = await updateSubscriptionPlanAction(id, {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      durationDays: Number(formData.durationDays),
    });

    if (result.success) {
      window.location.reload();
    } else {
      setError(result.error || 'Failed to update plan');
      setProcessingId(null);
    }
  };

  const toggleActive = async (plan: SubscriptionPlanDetail) => {
    setProcessingId(plan.id);
    const result = await updateSubscriptionPlanAction(plan.id, {
      isActive: !plan.isActive,
    });
    if (result.success) {
      window.location.reload();
    } else {
      setError(result.error || 'Failed to toggle status');
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Subscription Plans</h2>
        {!isCreating && (
          <button
            onClick={() => { resetForm(); setIsCreating(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
          >
            Create Plan
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isCreating && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">New Subscription Plan</h3>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (INR)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (Days)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processingId !== null}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
              >
                {processingId === 'new' ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
            {isEditing === plan.id ? (
              <form onSubmit={(e) => handleEditSubmit(e, plan.id)} className="space-y-4">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm mb-2"
                />
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm mb-2"
                />
                <div className="flex gap-2 mb-4">
                  <div className="w-1/2">
                    <label className="text-xs text-gray-500">Price (INR)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="text-xs text-gray-500">Duration (Days)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                      className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={resetForm} className="px-3 py-1.5 text-xs font-medium border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={processingId !== null} className="px-3 py-1.5 text-xs font-medium border rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">Save</button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {plan.description && <p className="text-sm text-gray-500 mb-4">{plan.description}</p>}
                  <div className="flex gap-4 mb-4 text-sm font-medium text-gray-700">
                    <div>₹{plan.price}</div>
                    <div className="text-gray-400">•</div>
                    <div>{plan.durationDays} Days</div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setFormData({ name: plan.name, description: plan.description || '', price: plan.price, durationDays: plan.durationDays });
                      setIsEditing(plan.id);
                    }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleActive(plan)}
                    disabled={processingId !== null}
                    className={`text-sm font-medium transition ${plan.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} disabled:opacity-50`}
                  >
                    {processingId === plan.id ? 'Processing...' : (plan.isActive ? 'Deactivate' : 'Activate')}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
