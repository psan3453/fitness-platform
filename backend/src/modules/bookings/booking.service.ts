import { prisma } from '../../prisma';
import { Prisma } from '../../generated/prisma/client';
import { BookingStatus, LiveClassStatus, LiveClassCategory } from '../../generated/prisma/enums';
import { BookingResponseDto, MyBookingsResponseDto } from './booking.types';

export const bookingService = {
  bookClass: async (userId: string, classId: string): Promise<BookingResponseDto> => {
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          // 1. Read the LiveClass
          const liveClass = await tx.liveClass.findUnique({
            where: { id: classId },
          });

          if (!liveClass) {
            const error = new Error('Class not found.') as Error & { status: number };
            error.status = 404;
            throw error;
          }

          // 2. Verify it is bookable
          if (liveClass.status !== LiveClassStatus.SCHEDULED) {
            const error = new Error('Class is not available for booking.') as Error & { status: number };
            error.status = 409;
            throw error;
          }

          if (new Date() >= liveClass.startTime) {
            const error = new Error('Cannot book a class that has already started.') as Error & { status: number };
            error.status = 409;
            throw error;
          }

          // 3. Determine the number of active BOOKED bookings
          const activeBookingsCount = await tx.classBooking.count({
            where: {
              liveClassId: classId,
              status: BookingStatus.BOOKED,
            },
          });

          // 4. Verify capacity
          if (activeBookingsCount >= liveClass.capacity) {
            const error = new Error('Class is full.') as Error & { status: number };
            error.status = 409;
            throw error;
          }

          // 5. Check whether this user already has a booking
          const existingBooking = await tx.classBooking.findUnique({
            where: {
              userId_liveClassId: {
                userId,
                liveClassId: classId,
              },
            },
          });

          if (existingBooking) {
            if (existingBooking.status === BookingStatus.BOOKED) {
              const error = new Error('You have already booked this class.') as Error & { status: number };
              error.status = 409;
              throw error;
            }
            if (existingBooking.status === BookingStatus.ATTENDED) {
              const error = new Error('Cannot rebook an attended booking.') as Error & { status: number };
              error.status = 409;
              throw error;
            }
            // existingBooking.status is CANCELLED - reactivate the booking
            const updatedBooking = await tx.classBooking.update({
              where: { id: existingBooking.id },
              data: {
                status: BookingStatus.BOOKED,
                bookedAt: new Date(),
                cancelledAt: null,
              },
            });
            return updatedBooking;
          } else {
            // 6. Create new booking
            const newBooking = await tx.classBooking.create({
              data: {
                userId,
                liveClassId: classId,
                status: BookingStatus.BOOKED,
              },
            });
            return newBooking;
          }
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );

      return {
        id: result.id,
        status: result.status as BookingStatus,
        bookedAt: result.bookedAt,
        cancelledAt: result.cancelledAt,
        liveClassId: result.liveClassId,
      };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2034') {
          // Transaction failed due to a write conflict or a deadlock.
          const conflictError = new Error('Booking conflict. Please try again.') as Error & { status: number };
          conflictError.status = 409;
          throw conflictError;
        }
      }
      throw error;
    }
  },

  getMyBookings: async (userId: string): Promise<MyBookingsResponseDto> => {
    const bookings = await prisma.classBooking.findMany({
      where: { userId },
      orderBy: { bookedAt: 'desc' },
      select: {
        id: true,
        status: true,
        bookedAt: true,
        cancelledAt: true,
        liveClassId: true,
        liveClass: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            startTime: true,
            endTime: true,
            capacity: true,
            meetingUrl: true,
            status: true,
          },
        },
      },
    });

    return { 
      bookings: bookings.map(b => ({
        ...b,
        status: b.status as BookingStatus,
        liveClass: {
          ...b.liveClass,
          category: b.liveClass.category as LiveClassCategory,
          status: b.liveClass.status as LiveClassStatus,
        }
      })) 
    };
  },

  cancelBooking: async (userId: string, bookingId: string): Promise<BookingResponseDto> => {
    // 1. Get booking and check ownership
    const booking = await prisma.classBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.userId !== userId) {
      const error = new Error('Booking not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    if (booking.status === BookingStatus.CANCELLED) {
      const error = new Error('Booking is already cancelled.') as Error & { status: number };
      error.status = 409;
      throw error;
    }

    if (booking.status === BookingStatus.ATTENDED) {
      const error = new Error('Cannot cancel an attended booking.') as Error & { status: number };
      error.status = 409;
      throw error;
    }

    // 2. Cancel
    const cancelledBooking = await prisma.classBooking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    return {
      id: cancelledBooking.id,
      status: cancelledBooking.status as BookingStatus,
      bookedAt: cancelledBooking.bookedAt,
      cancelledAt: cancelledBooking.cancelledAt,
      liveClassId: cancelledBooking.liveClassId,
    };
  },
};
