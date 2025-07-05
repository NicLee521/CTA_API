import Router from 'express-promise-router';
import multer from 'multer';
import Story from '../../models/story.js';
import { MinioClient } from '../../lib/object-storage/minio.js';
import {StoryController} from '../../controllers/story.js'
import { type Request, Response, NextFunction } from 'express';
import { mkdir } from 'fs/promises';

const uploadHandler = multer({
    storage: multer.diskStorage({
        destination: async (req, file, cb) => {
            // Ensure the directory exists
            try {
                await mkdir('/tmp/uploads', { recursive: true });
                cb(null, '/tmp/uploads/');
            } catch (error) {
                cb(error as Error, '/tmp/uploads/');
            }
        },
        filename: (req, file, cb) => {
            let extension = file.originalname.split('.').pop();
            let story = new Story();
            req.body = {...req.body, story};
            cb(null, `${story._id.toString()}.${extension}`);
        },
    })
});

const minioClient = new MinioClient();

const uploadToMinio = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) throw Error('No File Found');
    const filePath = req.file.path;
    const fileName = req.file.filename;
    const bucketName = 'stories';

    let {objectName} = await minioClient.uploadFile(bucketName, fileName, filePath);
    req.objectLocation = `${bucketName}/${objectName}`;
    next();
};

const router = Router();

let storyController = new StoryController();

router.get('/', storyController.get.bind(storyController));

router.post('/', uploadHandler.single('image'), uploadToMinio, storyController.post.bind(storyController));

router.patch('/', storyController.update.bind(storyController))

router.delete('/', storyController.delete.bind(storyController));

export default router;
