'use client';

import { useState } from 'react';
import { LiveClass } from '@/lib/types/classes';
import { bookClassAction, joinClassAction } from '../actions';

interface ClassCardProps {
  liveClass: LiveClass;
  isBooked: boolean;
  bookingId?: string;
}

const categoryColors: Record<string, { bg: string; text: string; accent: string }> = {
  YOGA: { bg: 'bg-emerald-50', text: 'text-emerald-700', accent: 'bg-emerald-100' },
  ZUMBA: { bg: 'bg-pink-50', text: 'text-pink-700', accent: 'bg-pink-100' },
  HIIT: { bg: 'bg-orange-50', text: 'text-orange-700', accent: 'bg-orange-100' },
};

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return { date, time };
}

export default function ClassCard({ liveClass, isBooked: initialIsBooked, bookingId: initialBookingId }: ClassCardProps) {
  const [isBooked, setIsBooked] = useState(initialIsBooked);
  const [bookingId, setBookingId] = useState<string | undefined>(initialBookingId);
  const [isBooking, setIsBooking] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = categoryColors[liveClass.category] ?? {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    accent: 'bg-gray-100',
  };

  const { date, time: startTime } = formatDateTime(liveClass.startTime);
  const { time: endTime } = formatDateTime(liveClass.endTime);
  const isPast = new Date(liveClass.startTime) < new Date();
  const canBook = !isBooked && !isPast && liveClass.status === 'SCHEDULED';

  const handleBook = async () => {
    setIsBooking(true);
    setError(null);

    const result = await bookClassAction(liveClass.id);

    if (result.success) {
      setIsBooked(true);
      if (result.booking?.id) {
        setBookingId(result.booking.id);
      }
    } else {
      setError(result.error || 'Failed to book class.');
    }

    setIsBooking(false);
  };

  const handleJoin = async () => {
    if (!bookingId) return;
    setIsJoining(true);
    setError(null);

    const result = await joinClassAction(bookingId);

    if (result.success && result.meetingUrl) {
      window.open(result.meetingUrl, '_blank', 'noopener,noreferrer');
    } else {
      setError(result.error || 'Failed to join class.');
    }

    setIsJoining(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className={`p-4 border-b border-gray-100 flex justify-between items-center ${colors.bg}`}>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${colors.accent} ${colors.text}`}>
          {liveClass.category}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {liveClass.status}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{liveClass.title}</h3>
        {liveClass.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{liveClass.description}</p>
        )}
        <div className="mt-auto space-y-3">
          <div className="flex items-start space-x-3 text-sm text-gray-600">
            <svg className="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">{date}</p>
              <p>{startTime} - {endTime}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <svg className="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <p>
              Instructor: <span className="font-medium text-gray-900">{liveClass.trainer?.specialization || 'Trainer'}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 text-sm text-gray-600">
             <svg className="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
            <p>Capacity: {liveClass.capacity} participants</p>
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-gray-100 bg-gray-50">
        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
            {error}
          </div>
        )}
        {isBooked ? (
          bookingId ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex justify-center items-center py-2.5 px-3 border border-transparent rounded-md text-sm font-medium text-green-700 bg-green-100">
                <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Booked
              </div>
              <button
                type="button"
                onClick={handleJoin}
                disabled={isJoining}
                className="flex-1 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {isJoining ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining...
                  </span>
                ) : (
                  'Join Class'
                )}
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-100 cursor-not-allowed"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Booked
            </button>
          )
        ) : (
          <button
            onClick={handleBook}
            disabled={!canBook || isBooking}
            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors ${
              canBook
                ? 'text-white bg-blue-600 hover:bg-blue-700'
                : 'text-gray-500 bg-gray-200 cursor-not-allowed'
            }`}
          >
            {isBooking ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Booking...
              </span>
            ) : isPast ? (
              'Class Ended'
            ) : liveClass.status !== 'SCHEDULED' ? (
              liveClass.status
            ) : (
              'Book Class'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
