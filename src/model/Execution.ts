import mongoose, {Document} from 'mongoose';

export interface IExecution extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    submissionId: mongoose.Schema.Types.ObjectId;
    status: String;
    submittedAt: Date;
    completedAt: Date;
    output: String;
    error: String;
    executionTime: String;
    memoryUsed: number;
    createdAt: Date;
}

const executionSchema = new mongoose.Schema(
    {
        submissionId: {type: mongoose.Schema.Types.ObjectId, require:true, ref: "Submission"},
        output: {type:String, require:true},
        error: {type:String ,require: true},
        status: {type: String, require: true, enum:["","queued","running","completed","failed"]},
        submittedAt: {type:Date},
        completedAt: {type:Date},
        memoryUsed: {Type:Number},
        executionTime: {Type: String},
        createdAt: {type: Date, require:true},

    }
);

const Execution = mongoose.model<IExecution>("Execution", executionSchema);

export default Execution;