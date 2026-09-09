export type LiveClassCategory = 'YOGA' | 'ZUMBA' | 'HIIT';
export type LiveClassStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

export interface LiveClassTrainer {
  id: string;
  specialization: string;
  profileImageUrl: string | null;
}

export interface LiveClass {
  id: string;
  trainerId: string;
  title: string;
  description: string | null;
  category: LiveClassCategory;
  startTime: string;
  endTime: string;
  capacity: number;
  status: LiveClassStatus;
  createdAt: string;
  updatedAt: string;
  trainer: LiveClassTrainer;
}

export interface AdminLiveClass extends LiveClass {
  meetingUrl: string | null;
  trainer: LiveClassTrainer & {
    user: {
      email: string;
      profile: {
        firstName: string;
        lastName: string | null;
      } | null;
    };
  };
}

export interface AdminLiveClassesResponse {
  classes: AdminLiveClass[];
}

export interface LiveClassesResponse {
  classes: LiveClass[];
}

export interface ClassBookingResponse {
  booking: {
    id: string;
    status: 'BOOKED' | 'CANCELLED' | 'ATTENDED';
    bookedAt: string;
    cancelledAt: string | null;
    liveClassId: string;
  };
}

export interface TrainerClass {
  id: string;
  trainerId: string;
  title: string;
  description: string | null;
  category: LiveClassCategory;
  startTime: string;
  endTime: string;
  capacity: number;
  meetingUrl: string | null;
  status: LiveClassStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TrainerClassesResponse {
  classes: TrainerClass[];
}
