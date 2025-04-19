import express, { Router } from 'express';

import authRouter from './authRouter';

const apiRouter: Router = express.Router();

apiRouter.use("/auth", authRouter);


export default apiRouter;