import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth.middleware';
import { gitConnectController } from '@/controller/git-connect.controller';
import { gitController } from '@/controller/git.controller';

const gitRouter = Router();

gitRouter.use(authenticateToken);

gitRouter.get('/connect/:provider/authorize', gitConnectController.authorize.bind(gitConnectController));
gitRouter.get('/connections', gitController.listConnections.bind(gitController));
gitRouter.get('/repos', gitController.listRepos.bind(gitController));
gitRouter.get('/repos/:owner/:repo/files', gitController.listFiles.bind(gitController));
gitRouter.get('/repos/:owner/:repo/contents', gitController.getFileContent.bind(gitController));

export default gitRouter;
