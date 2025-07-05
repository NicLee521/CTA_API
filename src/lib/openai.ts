import OpenAi from 'openai'
import { zodResponseFormat, zodTextFormat } from "openai/helpers/zod";
import zod from 'zod';

type CustomChatCompletionCreateParams = Omit<OpenAi.Chat.Completions.ChatCompletionCreateParams, 'stream' | 'model' | 'messages'>;

class OpenAIClient {
    private readonly client: OpenAi;

    constructor() {
        this.client = new OpenAi({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async createChatCompletion(
        messages: OpenAi.Chat.Completions.ChatCompletionMessageParam[],
        additionalOptions?: CustomChatCompletionCreateParams,
        responseFormat?: zod.ZodType
    ): Promise<OpenAi.Chat.Completions.ChatCompletion> {
        additionalOptions = additionalOptions || {} as CustomChatCompletionCreateParams;
        let options: OpenAi.Chat.Completions.ChatCompletionCreateParams = {
            messages,
            model: 'gpt-4o-mini',
            stream: false,
            ...additionalOptions,
        };
        if (responseFormat) {
            options.response_format = zodResponseFormat(responseFormat, 'story');
        }
        return this.client.chat.completions.create(options);
    }

    async createAIResponse(
        instructions: string,
        input: OpenAi.Responses.ResponseCreateParams['input'],
        responseFormat?: zod.ZodType
    ): Promise<OpenAi.Responses.Response & { output_parsed?: unknown }> {
        let options: OpenAi.Responses.ResponseCreateParams = {
            model: 'gpt-4o-mini',
            instructions,
            input,
            stream: false,
        };
        if (responseFormat) {
            options.text = {format: zodTextFormat(responseFormat, 'story')};
            return this.client.responses.parse<zod.infer<typeof responseFormat>>(options);
        }
        return this.client.responses.create(options);
    }

    async uploadFile(
        file: OpenAi.Files.FileCreateParams,
    ): Promise<OpenAi.Files.FileObject> {
        return this.client.files.create(file);
    }

    async deleteFile(
        fileId: string,
    ): Promise<void> {
        await this.client.files.delete(fileId);
    }

}

export { OpenAIClient}