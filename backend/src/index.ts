import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import trainerApplicationRoutes from './modules/trainer-applications/trainer-application.routes';
import adminRoutes from './modules/admin/admin.routes';
import { adminSubscriptionPlanRoutes, adminSubscriptionRoutes, userSubscriptionPlanRoutes, userSubscriptionRoutes } from './modules/subscriptions/subscription.routes';
import { trainerClassRoutes, userClassRoutes, adminClassRoutes } from './modules/live-classes/live-class.routes';
import { trainerPlanRoutes } from './modules/trainer-plans/trainer-plan.routes';
import { bookingActionRoutes, bookingRoutes } from './modules/bookings/booking.routes';
import { dietPlanCreatorRoutes, dietPlanPublicRoutes, trainerDietPlanRoutes } from './modules/diet-plans/diet-plan.routes';
import { paymentRoutes } from './modules/payments/payment.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trainer-applications', trainerApplicationRoutes);
app.use('/api/admin/subscription-plans', adminSubscriptionPlanRoutes);
app.use('/api/admin/subscriptions', adminSubscriptionRoutes);
app.use('/api/admin/classes', adminClassRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscription-plans', userSubscriptionPlanRoutes);
app.use('/api/subscriptions', userSubscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/trainer/plans', trainerPlanRoutes);
app.use('/api/trainer/classes', trainerClassRoutes);
app.use('/api/trainer/diet-plans', trainerDietPlanRoutes);
app.use('/api/classes', userClassRoutes);
app.use('/api/classes', bookingActionRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/diet-plans', dietPlanCreatorRoutes);
app.use('/api/diet-plans', dietPlanPublicRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Fitness Platform API is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
