// app/api/generate-report/route.js

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google AI SDK with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// This is the "meta-prompt" that instructs the AI on how to generate the report.
const reportGenerationPrompt = `
You are an expert performance analyst and communications coach.
Below is a transcript of a user practicing a simulation. Your task is to provide a structured, objective, and helpful performance report.
The user's role is "user", and the AI's role is "model".

**Analyze the entire transcript and generate a report with the following four sections, using these exact headings and markdown formatting:**

### 1. Overall Summary
Provide a brief, high-level overview of the user's performance during the simulation.

### 2. Key Strengths
- Based on the transcript, identify 2-3 specific things the user did well.
- Examples: Clear communication, good handling of a specific question, strong problem-solving approach, maintaining a professional tone.

### 3. Areas for Improvement
- Based on the transcript, identify 2-3 specific and actionable areas where the user could improve.
- Be constructive and specific. Instead of "was nervous," say "Used filler words like 'um' or 'like' several times, which can indicate nervousness. Practicing pausing instead of using fillers can project more confidence."

### 4. Actionable Advice
Provide a concluding paragraph with concrete, actionable advice for the user's next practice session. This should be a forward-looking summary of how to reinforce strengths and address the areas for improvement.
`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { conversation, scenarioName } = body;

    if (!conversation || !scenarioName) {
      return NextResponse.json({ error: 'Conversation transcript and scenario name are required' }, { status: 400 });
    }
    
    // Select the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Combine the meta-prompt with the actual conversation data
    const fullPrompt = `${reportGenerationPrompt}\n\n**Scenario:** ${scenarioName}\n\n**Transcript:**\n${JSON.stringify(conversation)}`;

    const result = await model.generateContent(fullPrompt);
    const reportText = result.response.text();

    return NextResponse.json({ report: reportText });

  } catch (error) {
    // Re-using the same robust error handling from our chat API
    console.error("Report Generation API Error:", error);
    let errorMessage = "An unexpected error occurred while generating the report.";
    let statusCode = 500;

    if (error.message.includes('API key not valid')) {
      errorMessage = "The server's API key is invalid.";
      statusCode = 500;
    } else if (error.message.includes('429')) {
      errorMessage = "API rate limit exceeded. Please try again later.";
      statusCode = 429;
    }
    
    return NextResponse.json({ 
      error: {
        message: errorMessage,
        details: error.message
      } 
    }, { status: statusCode });
  }
}