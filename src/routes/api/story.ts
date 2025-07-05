import Router from 'express-promise-router';
import multer from 'multer';
import {storageEngine} from 'multer-cloud-storage';
import Story from '../../models/story.js';


import {StoryController} from '../../controllers/story.js'
import { Request } from 'express';

const uploadHandler = multer({
    storage: storageEngine({
        bucket: 'cta_image_storage',
        filename: (req: Request, file: any, cb: Function) => {
            let story = new Story();
            req.body = {...req.body, story};
            cb(null, `${story._id.toString()}`)
        }
    })
});

const router = Router();

let storyController = new StoryController();

router.get('/', storyController.get.bind(storyController));

router.post('/', uploadHandler.single('image'), storyController.post.bind(storyController));

router.patch('/', storyController.update.bind(storyController))

router.delete('/', storyController.delete.bind(storyController));

export default router;
