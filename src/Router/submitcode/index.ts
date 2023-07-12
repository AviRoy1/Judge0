import express from 'express';
import Submission from '../../model/Submission';
import Execution from '../../model/Execution';
import User from '../../model/User';
import { getErrorMessage } from '../../utils/joi.util';
import joi from 'joi';
import verifytoken from '../../middleware/verifyToken';
import { spawnSync } from 'child_process';
import Queue from 'bull';

const router = express.Router();

const executionQueue = new Queue('executionQueue', {
  redis: {
    port: 6379,
    host: '127.0.0.1'
  }
})

function replaceLineBreaks(code: string): string {
  const lineBreakSequence = '{LINE_BREAK}';
  const lineBreakCharacter = '\n';

  const updatedCode = code.replace(new RegExp(lineBreakSequence, 'g'), lineBreakCharacter);

  return updatedCode;
}

const executionSchema = joi.object().keys({
  language: joi.string().lowercase().trim().required(),
  code: joi.string().required(),
});


router.post(
  '/submitcode',
  verifytoken,
  async (req, res, next) => {
    try {
      req.body = await executionSchema.validateAsync(req.body);
      next();
    } catch (err) {
      return res.status(422).json({ message: getErrorMessage(err) });
    }
  },
  async (req: any, res) => {
    try {
      const language = req.body.language;
      const code = req.body.code;
      const updatedCode = replaceLineBreaks(code);

      const submission = await Submission.create({
        userId: req.user.id,
        language: language,
        code: updatedCode,
        createdAt: new Date(),
      });

      const execution = await Execution.create({
        submissionId: submission._id,
        status: "",
        output: "",
        error: "",
        createdAt: new Date(),
      });

      const newJob = {
        language: language,
        code: updatedCode
      };
      res.status(200).json({message: "task is added to queue"});

      executionQueue.add({newJob}).then(() => {
        execution.status = 'queued'
        console.log("adddeedddd");
        res.status(200).json({message: "task is added to queue"});
      })

      // return res.status(200).json({result: job});

    } catch (err) {
      return res.status(400).json({ message: err });
    }
  }
);

export default router;
