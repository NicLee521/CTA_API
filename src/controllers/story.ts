import { Request, Response } from "express";
import Story from '../models/story.js';
import UserType from '../interfaces/Request.js'
import { OpenAIClient } from "../lib/openai.js";
import * as CallToAdventureData from "../lib/calltoadventure/index.js";
const { baseStory, baseStorySchema, allCards, ...callToAdventureCards } = CallToAdventureData;
import { unlink } from "fs/promises";
import type OpenAI from "openai";
import { createWorker } from 'tesseract.js';
import { z } from "zod";

export class StoryController {

    async get(req: Request, res: Response){
        let user = req.user || {} as UserType;
        let allUsersStories = await Story.find({user: user.id})
        res.json(allUsersStories);
    }

    async post(req: Request, res: Response){
        if(!req.objectLocation || !req.file) throw Error('File not uploaded to object storage');
        let story = req.body.story;
        let name = req.body.name
        //@ts-ignore
        story.set('image', req.objectLocation);
        story.set('user', req.user.id);
        const openai = new OpenAIClient();
        let {response, jsonStory} = await this.formatJsonStory(req.file.path, name, openai);
        req.logger.info({openAiUsage: response.usage})
        story.set('jsonStory', jsonStory);
        await story.save();
        let completionData = await this.getWrittenStoryFromOpenAi(jsonStory, openai);
        req.logger.info({openAiUsage: completionData.usage})
        await unlink(req.file.path); // Delete the file after processing
        return res.json({choices: completionData.output_text, storyId: story._id.toString()});
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

    async formatJsonStory(imagePath: string, name: string, openai: OpenAIClient): Promise<any> {
        let jsonStory = JSON.parse(JSON.stringify(baseStory));
        const worker = await createWorker('eng');
        const ret = await worker.recognize(imagePath);
        const fullText = ret.data.text;
        await worker.terminate();
        const response = await openai.createAIResponse(
            `Given the following text, extract the values that match any of the following card names: ${allCards.join(', ')}.
            Use your best judgement to determine the card names.`
            , [{ role: 'user', content: fullText }],
            z.object({
                cards: z.array(z.string()).describe('Array of card names found in the text')
            })
        );
        const outputParsed = response.output_parsed as { cards: string[] };
        for (let key of outputParsed.cards) {
            let data: any = null;
            if (callToAdventureCards.challenges && key in callToAdventureCards.challenges) {
                data = { ...callToAdventureCards.challenges[key as keyof typeof callToAdventureCards.challenges], type: 'challenges' };
            } else if (callToAdventureCards.adversaries && key in callToAdventureCards.adversaries) {
                data = { ...callToAdventureCards.adversaries[key as keyof typeof callToAdventureCards.adversaries], type: 'adversaries' };
            } else if (callToAdventureCards.traits && key in callToAdventureCards.traits) {
                data = { ...callToAdventureCards.traits[key as keyof typeof callToAdventureCards.traits], type: 'traits' };
            } else if (callToAdventureCards.allies && key in callToAdventureCards.allies) {
                data = { ...callToAdventureCards.allies[key as keyof typeof callToAdventureCards.allies], type: 'allies' };
            } else if (callToAdventureCards.origins?.includes(key as typeof callToAdventureCards.origins[number])) {
                data = { stage: 'early', card: key, type: 'origin' };
            } else if (callToAdventureCards.motivations?.includes(key as typeof callToAdventureCards.motivations[number])) {
                data = { stage: 'middle', card: key, type: 'motivation' };
            } else if (callToAdventureCards.destinies?.includes(key as typeof callToAdventureCards.destinies[number])) {
                data = { stage: 'late', card: key, type: 'destiny' };
            }
            if (data) {
                if (data.type === 'origin' || data.type === 'motivation' || data.type === 'destiny') {
                    jsonStory[data.stage][data.type] = data.card;
                    continue;
                } else {
                    let {type, ...rest} = data;
                    jsonStory[data.stage][data.type].push(rest);
                    continue
                }
                
            }
        }
        jsonStory.early.name = name;
        return {response, jsonStory} 
    }

    async getWrittenStoryFromOpenAi(jsonStory: any, openai: OpenAIClient): Promise<OpenAI.Responses.Response & { output_parsed?: unknown }> {
        const response = await openai.createAIResponse(`You are a professional fantasy writer specializing in crafting novel‐style adventures.
            When given a JSON object {${JSON.stringify(baseStory)}}, you must:

            Parse its keys:

            early.name (the hero’s name)

            early.origin (the hero’s background)

            middle.motivation (the hero’s driving force)

            late.destiny (the hero’s ultimate goal)

            (early | middle | late).challenges (obstacles overcome)

            (early | middle | late).allies (companions gained)

            (early | middle | late).adversaries (foes encountered)

            (early | middle | late).traits (character traits developed)

            Weave these elements into a single, cohesive narrative of 300–500 words, with flowing transitions.

            Name characters and locations creatively.

            Show character development—don’t label “early,” “middle,” or “late” stages.

            Avoid calling events “challenges” or “obstacles” in the narration; integrate them seamlessly.

            Write in a vivid, novel‐like tone with “fluff” (sensory details, internal thoughts, scenic descriptions).

            Format your response strictly as the finished story—no additional commentary, headings, or JSON.`,
        [
            {
                role: 'user',
                content: JSON.stringify(jsonStory)
            }
        ]);
        return response;
    }
}