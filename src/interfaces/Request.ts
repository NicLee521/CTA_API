import {Types} from 'mongoose';
import { Logger } from 'winston';

export default interface User {
    _id: Types.ObjectId
    gId: string
    email: string;
    source: string;
    profilePhoto?: string;
    lastVisited?: Date;
}


declare module "express-serve-static-core" { 
    export interface Request {
      user: User
      logger: Logger 
    }
}

declare module "multer" { 
    export interface File {
      uri: string
    }
}
