import Queue from 'bull';
import { spawnSync } from 'child_process';

// Create a Bull queue instance
const queue = new Queue('codeExecution', {
  redis: {
    host: 'localhost', // Redis server host
    port: 6379, // Redis server port
  },
});

// Process the job
queue.process(async (job) => {
  const { language, code } = job.data;

  try {
    // Execute the code
    const result = spawnSync(language, ['-e', code]);
    const output = result.stdout.toString();
    const error = result.stderr.toString();

    // Save the output and error to the job data
    await job.update({
      output,
      error,
    });

    // Update the job status
    await job.moveToCompleted();
  } catch (error: any) {
    // Handle any errors
    await job.moveToFailed({
      message: error.message,
    });
  }
});

export { queue };