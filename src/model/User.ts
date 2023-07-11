import mongoose, {Document} from 'mongoose';

export interface IUser extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    name: String;
    password: String;
    email: String;
    createdAt: Date;
}

const userSchema = new mongoose.Schema(
    {
        name: {type:String, require:true},
        password: {type:String, require:true, trim:true, unique:true},
        email: {type:String ,require: true, trim: true},
        createdAt: {type: Date, require:true},
    }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;