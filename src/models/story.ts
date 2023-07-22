import { Schema, model, Model, Types } from 'mongoose';
import CallToAdventureStory from '../interfaces/CallToAdventureStory';

interface IStory {
    image: string,
    imageTextAnnotation: string
    jsonStory: CallToAdventureStory
    user: Types.ObjectId,
    generatedStory?: string,
}

interface IStoryMethods {
    setImage(gcsUrl: URL): void
}

interface StoryModel extends Model<IStory, {}, IStoryMethods> {
}
  
const storySchema = new Schema<IStory, StoryModel, IStoryMethods>({
    image: {
        type: String,
        required: true
    },
    imageTextAnnotation: String,
    jsonStory: Object,
    user: {
        type: Schema.Types.ObjectId,
        ref : 'User'
    },
    generatedStory: {
        type: String
    }
},{
    statics: {},
});

storySchema.methods = {
    async setImage(gsUrl: URL): Promise<void> {
        //@ts-ignore
        this.set('image', gsUrl);
        //@ts-ignore
        return this.save();
    }
}

export default model<IStory, StoryModel>('Story', storySchema);