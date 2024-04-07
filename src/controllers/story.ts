import { Request, Response } from "express";
import Story from '../models/story';
import vision from '@google-cloud/vision'
import UserType from '../interfaces/Request'
import { Configuration, OpenAIApi } from 'openai'
import * as callToAdventureCards from '../lib/calltoadventure'
import CallToAdventureStory from "../interfaces/CallToAdventureStory";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export class StoryController {

    async get(req: Request, res: Response){
        let user = req.user || {} as UserType;
        let allUsersStories = await Story.find({user: user._id})
        res.json(allUsersStories);
    }

    async post(req: Request, res: Response){
        if(!req.file) throw Error('No File Found')
        let story = req.body.story;
        let name = req.body.name
        //@ts-ignore
        story.set('image', req.file.uri);
        story.set('user', req.user._id);
        let client = new vision.ImageAnnotatorClient();
        let response = await client.textDetection({
            image:{
                source: {
                    imageUri: story.image
                },
            }
        });
        let fullText = response[0].fullTextAnnotation?.text || ''
        story.set('imageTextAnnotation', fullText)
        let jsonStory = this.formatJsonStory(fullText.split('\n'), name);
        story.set('jsonStory', jsonStory)
        await story.save();
        let completionData = await this.getWrittenStoryFromOpenAi(jsonStory);
        req.logger.info({openAiUsage: completionData.usage})
        return res.json({choices: completionData.choices, storyId: story._id.toString()});
    }

    async update(req: Request, res: Response){
        let choice = req.body.choice;
        let storyId = req.body.story;
        let story = await Story.findById(storyId);
        story?.set('generatedStory', choice);
        await story?.save();
        return res.json(story);
    }

    async delete(req: Request, res: Response){
        let storyId = req.body.story;
        await Story.findByIdAndDelete(storyId);
        return res.send(`Story ${storyId} has been deleted`);
    }

    formatJsonStory(fullText: Array<string>, name: string): CallToAdventureStory {
        let story = {...callToAdventureCards.baseStory} as any
        story.name = name;
        for(let piece of fullText) {
            piece = piece.replace(/^\+1\s/, '');
            if(callToAdventureCards.challenges[piece]) {
                let challenge = callToAdventureCards.challenges[piece]
                story[challenge.stage].challenges.push({challenge: challenge.challenge, choice: piece})
            }
            if(callToAdventureCards.adversaries[piece]) {
                let adversary = callToAdventureCards.adversaries[piece];
                story[adversary.stage].adversaries.push(piece);
            }
            if(callToAdventureCards.traits[piece]) {
                let trait = callToAdventureCards.traits[piece];
                story[trait.stage].traits.push(piece);
            }
            if(callToAdventureCards.allies[piece]) {
                let ally = callToAdventureCards.allies[piece];
                story[ally.stage].allies.push(piece);
            }
            if(callToAdventureCards.origins.includes(piece)){
                story.early.origin = piece;
            }
            if(callToAdventureCards.motivations.includes(piece)){
                story.middle.motivation = piece;
            }
            if(callToAdventureCards.destinies.includes(piece)){
                story.late.destiny = piece;
            }
        }
        return story as CallToAdventureStory
    }

    async getWrittenStoryFromOpenAi(jsonStory: CallToAdventureStory) {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: 'system',
                    content: `You are a story generator for the board game Call to Adventure. You will be required to make a story from the following json object: ${JSON.stringify(callToAdventureCards.baseStory)}. The Story will take into account the challeges faced, the origins, allies gained, and adversaries faced. The story will also have a cohesive flow, with character development and adding some filler to use as transitions between stages. You will try not to explicitly mention early, middle, and late stages and instead transition through events. You will also try not to explicitly mention that the challenges were challenges, format them like a piece of a cohesive story. Please add names for characters and locations. Please give it some fluff so it reads more like a novel. You will only ever reply with the story you created.`
                },
                {
                    role: 'user', 
                    content: JSON.stringify(jsonStory)
                }
            ],
            temperature: .8,
            n: 2
        });
        return completion.data;
    }
}
