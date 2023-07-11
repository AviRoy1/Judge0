import express from 'express';
import userRouter from './User/index';

const router = express.Router();

router.use('/user', userRouter);

export default router;
