import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import trainerApplicationRoutes from './modules/trainer-applications/trainer-application.routes';
import adminRoutes from './modules/admin/admin.routes';
import { adminSubscriptionPlanRoutes, userSubscriptionPlanRoutes, userSubscriptionRoutes } from './modules/subscriptions/subscription.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trainer-applications', trainerApplicationRoutes);
app.use('/api/admin/subscription-plans', adminSubscriptionPlanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscription-plans', userSubscriptionPlanRoutes);
app.use('/api/subscriptions', userSubscriptionRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Fitness Platform API is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
