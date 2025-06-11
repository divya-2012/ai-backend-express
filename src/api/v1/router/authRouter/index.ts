import express, { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { AuthController } from '../../controller';

const authRouter: Router = express.Router();

// Public routes
authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);
authRouter.post('/refresh-token', AuthController.refreshToken);
authRouter.post('/forgot-password', AuthController.requestReset);
authRouter.post('/reset-password', AuthController.resetPassword);
authRouter.post('/logout', AuthController.logout);

authRouter.post('/test', AuthController.register);
// Protected routes
authRouter.get('/me', authenticateToken, AuthController.me);

export default authRouter; 