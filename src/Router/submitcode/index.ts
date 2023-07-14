import express from 'express';
import Submission from '../../model/Submission';
import Execution from '../../model/Execution';
import User from '../../model/User';
import { getErrorMessage } from '../../utils/joi.util';
import joi from 'joi';
import verifytoken from '../../middleware/verifyToken';
import { spawn } from 'child_process';
import { performance } from 'perf_hooks';
import { exec } from 'child_process';
import Queue from 'bull';

const executionQueue = new Queue('codeExecution', {
  redis: {
    host: 'localhost',
    port: 6379,
  },
});



function getCommand(language: string): string {
  // Define the command to execute based on the selected language
  switch (language) {
    case 'java':
      return 'java';

    case 'cpp':
      return './build/a.out';

    case 'typescript':
        return 'node';

    case 'javascript':
          return 'node';

    // Add cases for other languages

    default:
      throw new Error('Invalid language');
  }
}

executionQueue.process(async (job, done) => {
  console.log(job.data)
  const { language, code } = job.data.submission;
  let execute = await Execution.findOne({submissionId: job.data.submission._id})
    
  const startTime = performance.now();
  const process = spawn(getCommand(language), []);

  let output = '';
  let error = '';

  process.stdout.on('data', (data) => {
    output += data.toString();
  });

  process.stderr.on('data', (data) => {
    error += data.toString();
  });

  process.on('close', async (code) => {
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    const memoryUsage = 0;

    const response = {
      output,
      executionTime,
      memoryUsage,
      status: 'completed', // Set the status as 'completed' by default
    };
    console.log(response)


    if (code !== 0) {
      response.status = 'failed'; // Update the status to 'failed' if the process exited with a non-zero code
    }

    // console.log(response);
    
    if(execute === null)
    return null; 
    execute.status = "completed";
    execute.completedAt = new Date();
    // execute.executionTime = executionTime.toString();
    execute.memoryUsed = memoryUsage;
    execute.output=output;
    execute.error=error;
    // Save the updated execution data
    await execute.save();

    done();
  });

  process.stdin.write(code);
  process.stdin.end();
  if(execute === null)
    return null; 
  // Update the status of the execution to 'running'
  execute.status = 'running';
  // Save the updated execution data
  await execute.save();
  console.log(execute);
});


const router = express.Router();



function replaceLineBreaks(code: string): string {
  const lineBreakSequence = '{LINE_BREAK}';
  const lineBreakCharacter = '\n';

  const updatedCode = code.replace(new RegExp(lineBreakSequence, 'g'), lineBreakCharacter);

  return updatedCode;
}

const executionSchema = joi.object().keys({
  language: joi.string().lowercase().trim().required(),
  code: joi.any().required(),
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
        status: "queued",
        output: "",
        error: "",
        createdAt: new Date(),
      });


    const addQueue = async () => {
      await executionQueue.add({submission})
      // ,{
      //   delay: 4000,
      //   fifo: true,
      //   attempts: 1,
      // }
      executionQueue.on('completed', async (newJob) => {
        const executedcode = await Execution.findById(execution._id);
        return res.status(200).json({message: "code run successfully", executedcode});
      });
      executionQueue.on('failed', (newJob) => {
        return res.status(400).json({message: "there have some error in your code"})
      });
    };

    addQueue();

    } catch (err) {
      return res.status(400).json({ message: err });
    }
  }
);

export default router;
