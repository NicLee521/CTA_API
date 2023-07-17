import { Schema, model, Model, Document } from 'mongoose';
import PassportUser from '../interfaces/PassportUser';

interface IUser {
    gId: string
    email: string;
    source: string;
    refreshToken: string;
    expiresAt: Date;
    profilePhoto?: string;
    lastVisited?: Date;
}

interface UserModel extends Model<IUser> {
    createUser(passportUser: PassportUser): Promise<any>;
    getAllUsers(): Promise<[any]>;
    getUserByEmail(passportUser: PassportUser): Promise<any>;
}
  
const userSchema = new Schema<IUser, UserModel>({
    gId: { 
        type: String, 
        default: null 
    },
    email: { 
        type: String, 
        required: [true, 'Email required'],
    },
    source: {
        type: String,
        required: [true, "Source not specified"]
    },
    refreshToken: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
    },
    lastVisited: {
        type: Date,
        default: new Date(),
    },
    profilePhoto: String
},{
    statics: {

        async createUser(passportUser: PassportUser){
            let user = new this({
                gId: passportUser.gId,
                email: passportUser.email,
                profilePhoto: passportUser.profilePhoto,
                refreshToken: passportUser.refreshToken,
                expiresAt: passportUser.expiresAt,
                source: 'google'
            });
            return user.save();
        },

        async getAllUsers() {
            return this.find({})
        },

        async getUserByEmail(passportUser: PassportUser) {
            return this.findOne({
                email: passportUser.email
            })
        }

    }
});

userSchema.index({email: 1, gId: 1}, {unique: true});

userSchema.methods = {};

export default model<IUser, UserModel>('User', userSchema);