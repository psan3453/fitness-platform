'use client';

import { useState } from 'react';
import { DietPlan, DietPlanItem, DietGoal } from '@/lib/types/diet-plan';
import { createDietPlanAction, updateDietPlanAction } from './actions';

export default function DietPlansClient({ initialPlans }: { initialPlans: DietPlan[] }) {
  const [plans] = useState<DietPlan[]>(initialPlans);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    goal: 'GENERAL_FITNESS' as DietGoal,
    description: '',
    items: [] as Partial<DietPlanItem>[],
  });

  const resetForm = () => {
    setFormData({ title: '', goal: 'GENERAL_FITNESS', description: '', items: [] });
    setIsEditing(null);
    setIsCreating(false);
    setError(null);
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          mealType: '',
          mealName: '',
          description: '',
          quantity: '',
          displayOrder: prev.items.length + 1,
        },
      ],
    }));
  };

  const handleItemChange = (index: number, field: keyof DietPlanItem, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    // Update display orders
    newItems.forEach((item, i) => {
      item.displayOrder = i + 1;
    });
    setFormData({ ...formData, items: newItems });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProcessingId('new');

    const result = await createDietPlanAction({
      title: formData.title,
      goal: formData.goal,
      description: formData.description,
      items: formData.items as DietPlanItem[],
    });

    if (result.success) {
      window.location.reload();
    } else {
      setError(result.error || 'Failed to create plan');
      setProcessingId(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setError(null);
    setProcessingId(id);

    const result = await updateDietPlanAction(id, {
      title: formData.title,
      goal: formData.goal,
      description: formData.description,
      items: formData.items as DietPlanItem[],
    });

    if (result.success) {
      window.location.reload();
    } else {
      setError(result.error || 'Failed to update plan');
      setProcessingId(null);
    }
  };

  const toggleActive = async (plan: DietPlan) => {
    setProcessingId(plan.id);
    const result = await updateDietPlanAction(plan.id, {
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
        <h2 className="text-xl font-semibold text-gray-900">Diet Plans</h2>
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">New Diet Plan</h3>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Goal</label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value as DietGoal })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                  <option value="WEIGHT_LOSS">Weight Loss</option>
                  <option value="WEIGHT_GAIN">Weight Gain</option>
                  <option value="MUSCLE_GAIN">Muscle Gain</option>
                  <option value="GENERAL_FITNESS">General Fitness</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-900">Meals</h4>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition"
                >
                  + Add Meal
                </button>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-4 items-start bg-white p-4 rounded-md border border-gray-200 mb-3">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Meal Type (e.g. Breakfast)"
                        required
                        value={item.mealType}
                        onChange={(e) => handleItemChange(index, 'mealType', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Meal Name (e.g. Oatmeal)"
                        required
                        value={item.mealName}
                        onChange={(e) => handleItemChange(index, 'mealName', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Quantity (e.g. 1 bowl)"
                        value={item.quantity || ''}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    ×
                  </button>
                </div>
              ))}
              {formData.items.length === 0 && (
                <p className="text-sm text-gray-500 italic">No meals added yet.</p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
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

      <div className="grid grid-cols-1 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {isEditing === plan.id ? (
              <div className="p-6">
                <form onSubmit={(e) => handleEditSubmit(e, plan.id)} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Goal</label>
                      <select
                        value={formData.goal}
                        onChange={(e) => setFormData({ ...formData, goal: e.target.value as DietGoal })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                      >
                        <option value="WEIGHT_LOSS">Weight Loss</option>
                        <option value="WEIGHT_GAIN">Weight Gain</option>
                        <option value="MUSCLE_GAIN">Muscle Gain</option>
                        <option value="GENERAL_FITNESS">General Fitness</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-900">Meals</h4>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition"
                      >
                        + Add Meal
                      </button>
                    </div>

                    {formData.items.map((item, index) => (
                      <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-md border border-gray-200 mb-3">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Meal Type"
                            required
                            value={item.mealType}
                            onChange={(e) => handleItemChange(index, 'mealType', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Meal Name"
                            required
                            value={item.mealName}
                            onChange={(e) => handleItemChange(index, 'mealName', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Quantity"
                            value={item.quantity || ''}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Description"
                            value={item.description || ''}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={resetForm} className="px-3 py-1.5 text-sm font-medium border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={processingId !== null} className="px-3 py-1.5 text-sm font-medium border rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">Save</button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{plan.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-blue-600 mb-3">{plan.goal.replace('_', ' ')}</div>
                  {plan.description && <p className="text-sm text-gray-500">{plan.description}</p>}
                </div>
                {plan.items && plan.items.length > 0 && (
                  <div className="bg-gray-50 p-6 border-b border-gray-100">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Structured Meals</h4>
                    <div className="space-y-4">
                      {plan.items.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-4 rounded border border-gray-200">
                          <div className="min-w-[120px]">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.mealType}</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{item.mealName}</div>
                            {item.description && <div className="text-sm text-gray-500 mt-0.5">{item.description}</div>}
                          </div>
                          {item.quantity && (
                            <div className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">
                              {item.quantity}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-white flex gap-4">
                  <button
                    onClick={() => {
                      setFormData({
                        title: plan.title,
                        goal: plan.goal,
                        description: plan.description || '',
                        items: plan.items.map(item => ({...item}))
                      });
                      setIsEditing(plan.id);
                    }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
                  >
                    Edit Plan
                  </button>
                  <button
                    onClick={() => toggleActive(plan)}
                    disabled={processingId !== null}
                    className={`text-sm font-medium transition ${plan.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} disabled:opacity-50`}
                  >
                    {processingId === plan.id ? 'Processing...' : (plan.isActive ? 'Deactivate' : 'Activate')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {plans.length === 0 && !isCreating && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-500">No diet plans found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
