import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { content } = await request.json();

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: `Please summarize the following text: ${content}` },
            ],
        });

        console.log(completion)

        const summary = completion.choices[0]?.message?.content;
        return NextResponse.json({ summary });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
