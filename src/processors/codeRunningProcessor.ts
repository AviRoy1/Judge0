
const codeRunningProcessor = (job:any, done:any) => {
    console.log(job);
    done();
}

module.exports = codeRunningProcessor;