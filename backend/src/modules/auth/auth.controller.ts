import { Request, Response } from 'express';
import { authValidation } from './auth.validation';
import { authService } from './auth.service';
import { z } from 'zod';

export const authController = {
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Validate request body
      const validatedData = authValidation.registerSchema.parse(req.body);

      // 2. Call service
      const result = await authService.registerUser(validatedData);

      // 3. Return 201 Created
      res.status(201).json(result);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          errors: error.issues,
        });
        return;
      }

      const err = error as Error & { status?: number };
      if (err.status === 409) {
        res.status(409).json({
          message: err.message,
        });
        return;
      }

      console.error('[authController.register]', error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  },

  login: async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Validate request body
      const validatedData = authValidation.loginSchema.parse(req.body);

      // 2. Call service
      const result = await authService.loginUser(validatedData);

      // 3. Return 200 OK
      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          errors: error.issues,
        });
        return;
      }

      const err = error as Error & { status?: number };
      if (err.status === 401) {
        res.status(401).json({
          message: err.message,
        });
        return;
      }

      console.error('[authController.login]', error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  },

  refreshToken: async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = authValidation.tokenSchema.parse(req.body);
      const result = await authService.refreshToken(validatedData);
      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          errors: error.issues,
        });
        return;
      }

      const err = error as Error & { status?: number };
      if (err.status === 401) {
        res.status(401).json({
          message: err.message,
        });
        return;
      }

      console.error('[authController.refreshToken]', error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  },

  logout: async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = authValidation.tokenSchema.parse(req.body);
      await authService.logout(validatedData);
      res.status(200).json({ message: 'Logged out successfully.' });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          errors: error.issues,
        });
        return;
      }

      console.error('[authController.logout]', error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  },

  getMe: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const user = await authService.getCurrentUser(req.user.userId);
      res.status(200).json({ user });
    } catch (error: unknown) {
      const err = error as Error & { status?: number };

      if (err.status === 401) {
        res.status(401).json({ message: err.message });
        return;
      }

      console.error('[authController.getMe]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
