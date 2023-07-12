import express from 'express';
import userRouter from './User/index';
import submitcode from './submitcode/index';

const router = express.Router();

router.use('/user', userRouter);
router.use('/submit', submitcode);

export default router;
