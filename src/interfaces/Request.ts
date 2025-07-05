import { Logger } from 'winston';

export default interface User {
    id: string
    email: string;
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
