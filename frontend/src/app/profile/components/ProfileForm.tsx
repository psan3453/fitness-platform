'use client';

import { useState } from 'react';
import { UserProfile } from '@/lib/types/profile';
import { updateProfileAction } from '../actions';

interface ProfileFormProps {
  initialProfile: UserProfile;
  email: string;
}

export default function ProfileForm({ initialProfile, email }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Default values mapping
  const [firstName, setFirstName] = useState(initialProfile.firstName);
  const [lastName, setLastName] = useState(initialProfile.lastName || '');
  const [phone, setPhone] = useState(initialProfile.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl || '');
  const [gender, setGender] = useState(initialProfile.gender || '');
  const [bio, setBio] = useState(initialProfile.bio || '');

  // Extract YYYY-MM-DD from ISO string for input type="date"
  const defaultDate = initialProfile.dateOfBirth
    ? new Date(initialProfile.dateOfBirth).toISOString().split('T')[0]
    : '';
  const [dateOfBirth, setDateOfBirth] = useState(defaultDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setError('First name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim() || null,
      phone: phone.trim() || null,
      avatarUrl: avatarUrl.trim() || null,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      bio: bio.trim() || null,
    };

    const result = await updateProfileAction(payload);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Failed to update profile.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-sm text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 rounded-lg">
          Profile updated successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Preview */}
        {avatarUrl && (
          <div className="flex items-center space-x-4 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt="Avatar preview"
              className="w-16 h-16 rounded-full object-cover border border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + firstName + '&background=random';
              }}
            />
            <div className="text-sm text-gray-500">Avatar preview</div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            readOnly
            disabled
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-500 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 bg-white"
            >
              <option value="">Select...</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Avatar URL
            </label>
            <input
              type="url"
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
            placeholder="Tell us a little about your fitness journey..."
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
