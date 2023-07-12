import Queue from 'bull';
import path from 'path'

const executionQueue = new Queue('executionQueue', {
  redis: {
    port: 6379,
    host: '127.0.0.1'
  }
});

executionQueue.process(path.join(__dirname, 'codeRunningProcessor.ts'));

export default executionQueue;