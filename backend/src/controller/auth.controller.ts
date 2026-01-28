import { Request, Response } from "express";
import { authService, RegisterDto, LoginDto } from "@/services/auth.service";
import { AuthRequest } from "@/middleware/auth.middleware";
import { tokenStorageService } from '../services/token-storage.service';
import { sessionService } from '../services/session.service';

export class AuthController {

    async register(req: Request, res: Response): Promise<void> {
        try {
            const data: RegisterDto = req.body;

            if (!data.email || !data.password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }

            const result = await authService.registerWithSession(data, req, res);

            res.status(201).json({
                message: 'User registered successfully',
                data: result
            });
        } catch (error: any) {
            if (error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
                return;
            }

            if (error.message.includes('Password must')) {
                res.status(400).json({ error: error.message });
                return;
            }

            res.status(500).json({ error: 'Registration failed' });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const data: LoginDto = req.body;

            if (!data.email || !data.password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }

            const result = await authService.loginWithSession(data, req, res);

            res.status(200).json({
                message: 'Login successful',
                data: result,
            });
        } catch (error: any) {
            if (error.message.includes('Invalid email or password')) {
                res.status(401).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: 'Login failed' });
        }
    }

    async refresh(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({ error: 'Refresh token is required' });
                return;
            }

            const result = await authService.refreshToken(refreshToken);

            res.status(200).json({
                message: 'Token refreshed successfully',
                data: result,
            });
        } catch (error: any) {
            if (error.message.includes('expired') || error.message.includes('revoked')) {
                res.status(401).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: 'Token refresh failed' });
        }
    }

    async changePassword(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                res.status(400).json({ error: 'Current password and new password are required' });
                return;
            }

            await authService.changePassword(req.user.id, currentPassword, newPassword);

            // Clear tokens
            tokenStorageService.clearTokens(res);

            res.status(200).json({
                message: 'Password changed successfully. All sessions have been invalidated.',
            });
        } catch (error: any) {
            if (error.message.includes('incorrect') || error.message.includes('Password must')) {
                res.status(400).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: 'Failed to change password' });
        }
    }

    async logout(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { accessToken, refreshToken } = req.body;

            if (!accessToken || !refreshToken) {
                res.status(400).json({ error: 'Both access and refresh tokens are required' });
                return;
            }

            await authService.logout(accessToken, refreshToken);

            res.status(200).json({
                message: 'Logout successful',
            });
        } catch (error: any) {
            res.status(500).json({ error: 'Logout failed' });
        }
    }

    async logoutAll(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            await authService.logoutAll(req.user.id);

            res.status(200).json({
                message: 'Logged out from all devices',
            });
        } catch (error: any) {
            res.status(500).json({ error: 'Logout failed' });
        }
    }

    async getMe(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            res.status(200).json({
                data: {
                    user: req.user,
                },
            });
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to get user info' });
        }
    }

    async getSessions(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const sessions = await authService.getUserSessions(req.user.id);

            res.status(200).json({
                message: 'Sessions retrieved successfully',
                data: sessions,
            });
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to retrieve sessions' });
        }
    }

    async revokeSession(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const { sessionId } = req.params;
            if (Array.isArray(sessionId)) {
                res.status(400).json({ error: 'Invalid sessionId' });
                return;
            }

            await authService.revokeSession(req.user.id, sessionId);

            res.status(200).json({
                message: 'Session revoked successfully',
            });
        } catch (error: any) {
            if (error.message === 'Session not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: 'Failed to revoke session' });
        }
    }
}

export const authController = new AuthController();