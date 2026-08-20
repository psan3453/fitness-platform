'use client';

import { useState } from 'react';
import { submitApplicationAction, SubmitApplicationData } from '../actions';
import { LiveClassCategory } from '@/lib/types/classes';

export default function TrainerApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [specialization, setSpecialization] = useState<LiveClassCategory | ''>('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [certifications, setCertifications] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialization) {
      setError('Please select a specialization.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: SubmitApplicationData = {
      specialization,
      bio: bio.trim() || undefined,
      experience: experience.trim() || undefined,
      certifications: certifications.trim() || undefined,
    };

    const result = await submitApplicationAction(payload);
    
    if (!result.success) {
      setError(result.error || 'Failed to submit application.');
      setIsSubmitting(false);
    }
    // On success, the server action revalidates the page, which will cause the page to 
    // fetch the latest applications and render the status component instead.
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Application Form</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-sm text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
            Primary Specialization <span className="text-red-500">*</span>
          </label>
          <select
            id="specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value as LiveClassCategory)}
            required
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="" disabled>Select your expertise...</option>
            <option value="YOGA">Yoga</option>
            <option value="ZUMBA">Zumba</option>
            <option value="HIIT">HIIT</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Choose the main fitness category you intend to teach.
          </p>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
            placeholder="Tell us about yourself and your training philosophy..."
          />
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
            Experience
          </label>
          <textarea
            id="experience"
            rows={2}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
            placeholder="e.g., 5 years teaching Yoga at local studios."
          />
        </div>

        <div>
          <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-1">
            Certifications
          </label>
          <textarea
            id="certifications"
            rows={2}
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
            placeholder="List any relevant fitness certifications or qualifications."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Application'
          )}
        </button>
      </form>
    </div>
  );
}
