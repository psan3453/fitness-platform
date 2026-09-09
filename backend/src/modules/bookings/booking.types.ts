import { BookingStatus, LiveClassCategory, LiveClassStatus } from '../../generated/prisma/enums';

export interface BookingResponseDto {
  id: string;
  status: BookingStatus;
  bookedAt: Date;
  cancelledAt: Date | null;
  liveClassId: string;
}

export interface MyBookingsResponseDto {
  bookings: Array<BookingResponseDto & {
    liveClass: {
      id: string;
      title: string;
      description: string | null;
      category: LiveClassCategory;
      startTime: Date;
      endTime: Date;
      capacity: number;
      status: LiveClassStatus;
    };
  }>;
}
