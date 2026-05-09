// AI Service using Groq API
import Groq from "groq-sdk";

// Lazy initialization - create client only when needed
function getGroqClient() {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set in environment variables");
    }
    return new Groq({
        apiKey: process.env.GROQ_API_KEY
    });
}

export async function summarizePost(title, content) {
    try {
        console.log('=== AI Summarization Request (Groq) ===');
        console.log('API Key exists:', !!process.env.GROQ_API_KEY);

        if (!content || content.length < 100) {
            console.log('Content too short, skipping summarization');
            return null;
        }

        const groq = getGroqClient();
        const prompt = `Summarize this post in 2-3 concise sentences:\n\nTitle: ${title}\n\nContent: ${content}`;

        console.log('Calling Groq API...');
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 200
        });

        const text = completion.choices[0]?.message?.content;
        console.log('Summary generated successfully');
        return text.trim();

    } catch (error) {
        console.error('=== Error generating summary ===');
        console.error('Error message:', error.message);

        // Fallback
        console.log('Used fallback summary generation');
        if (content) {
            const sentences = content.match(/[^\.!\?]+[\.!\?]+/g) || [content];
            const localSummary = sentences.slice(0, 2).join(' ').trim();
            const finalSummary = localSummary.length > 0 ? localSummary : content.substring(0, 200);
            return "Note: AI API unavailable/failed. Preview: " + (finalSummary.length > 300 ? finalSummary.substring(0, 300) + '...' : finalSummary);
        }
        return null;
    }
}

export async function summarizeComments(comments) {
    try {
        if (!comments || comments.length === 0) return null;

        const groq = getGroqClient();
        const commentsText = comments.map(c => c.content).join('\n\n');
        const prompt = `Summarize the main discussion points from these comments in 2-3 sentences:\n\n${commentsText}`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 200
        });

        const text = completion.choices[0]?.message?.content;
        return text.trim();
    } catch (error) {
        console.error('Error generating comment summary:', error);
        return null;
    }
}

export async function askQuestion(question) {
    try {
        console.log('=== AI Ask Request (Groq) ===');
        if (!question) return null;

        // Import Community model to fetch real communities
        const Community = (await import("../models/Community.js")).default;

        // Fetch all communities from database
        const communities = await Community.find({}, 'name description').limit(50);
        const communityList = communities.map(c => `r/${c.name} - ${c.description || 'No description'}`).join('\n');

        console.log(`Found ${communities.length} communities to recommend from`);

        const groq = getGroqClient();

        const prompt = `You are a helpful Reddit assistant. Answer the user's question and recommend REAL subreddits from the available communities list.

Question: "${question}"

Available Communities in Database:
${communityList}

Important: ONLY recommend communities from the list above. Choose 2-3 most relevant ones.

Respond in strict JSON format:
{
    "answer": "Concise answer to the question.",
    "communities": ["r/Name1", "r/Name2"]
}`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 500
        });

        let text = completion.choices[0]?.message?.content;
        console.log('AI Response:', text);

        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(text);
            return data;
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            // If JSON parsing fails, return the text as answer
            return {
                answer: text,
                communities: []
            };
        }
    } catch (error) {
        console.error('Error asking AI:', error);
        console.error('Full error:', error.message);
        return {
            answer: "I'm having trouble connecting to the AI right now. Please try again in a moment.",
            communities: ["r/AskReddit", "r/NoStupidQuestions", "r/explainlikeimfive"]
        };
    }
}
