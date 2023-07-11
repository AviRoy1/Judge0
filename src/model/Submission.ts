import mongoose, {Document} from 'mongoose';

export interface ISubmission extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
    language: String;
    code: String;
    isAdmin: Boolean,
    createdAt: Date;
}

const submissionSchema = new mongoose.Schema(
    {
        userId: {type: mongoose.Schema.Types.ObjectId, require:true, ref: "User"},
        language: {type:String, require:true},
        code: {type:String ,require: true},
        isAdmin: {type:Boolean , default: false},
        createdAt: {type: Date, require:true},
    }
);

const Submission = mongoose.model<ISubmission>("Submission", submissionSchema);

export default Submission;