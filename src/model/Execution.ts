import mongoose, {Document} from 'mongoose';

export interface IExecution extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    submissionId: mongoose.Schema.Types.ObjectId;
    status: String;
    submittedAt: Date;
    completedAt: Date;
    output: String;
    error: String;
    // timeElapsed: 
    memoryUsed: Number;
    createdAt: Date;
}

const executionSchema = new mongoose.Schema(
    {
        submissionId: {type: mongoose.Schema.Types.ObjectId, require:true, ref: "Submission"},
        output: {type:String, require:true},
        error: {type:String ,require: true},
        status: {type: String, require: true, enum:["queued","running","completed","failed"]},
        startedAt: {type:Date, require:true},
        completedAt: {type:Date, require:true},
        memoryUsed: {Type:Number},
        createdAt: {type: Date, require:true},
    }
);

const Execution = mongoose.model<IExecution>("Execution", executionSchema);

export default Execution;