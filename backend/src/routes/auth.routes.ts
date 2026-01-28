import { Router } from "express";
import { authController } from "@/controller/auth.controller";
import { authenticateToken } from "@/middleware/auth.middleware";
import { oauthController } from "@/controller/oauth.controller";

const authRouter = Router();

authRouter.post('/register', authController.register.bind(authController));
authRouter.post('/login', authController.login.bind(authController));
authRouter.post('/refresh', authController.refresh.bind(authController));

authRouter.post('/logout', authenticateToken, authController.logout.bind(authController));
authRouter.post('/logout-all', authenticateToken, authController.logoutAll.bind(authController));
authRouter.get('/me', authenticateToken, authController.getMe.bind(authController));

authRouter.get('/oauth/providers', oauthController.getProviders.bind(oauthController));
authRouter.get('/oauth/:provider/authorize', oauthController.authorize.bind(oauthController));
authRouter.get('/oauth/:provider/callback', oauthController.callback.bind(oauthController));

authRouter.post('/change-password', authenticateToken, authController.changePassword.bind(authController));
authRouter.get('/sessions', authenticateToken, authController.getSessions.bind(authController));
authRouter.delete('/sessions/:sessionId', authenticateToken, authController.revokeSession.bind(authController));

export default authRouter;