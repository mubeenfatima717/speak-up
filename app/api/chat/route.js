// import { NextResponse } from 'next/server';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// // Initialize the Google AI SDK with your API key
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const userMessage = body.message;

//     if (!userMessage) {
//       return NextResponse.json({ error: 'Message is required' }, { status: 400 });
//     }

//     // 1. Select the Gemini model
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     // 2. [FIXED] Engineer the prompt correctly
//     let promptToSend = userMessage; // Bug #1 Fixed: 'promptToSend' is now declared
//     if (!userMessage.startsWith("You are")) {
//       promptToSend = `${userMessage}\n\n(Please keep your response professional, empathetic, and conversational. Aim for 2-4 sentences.)`;
//     }

//     // 3. [FIXED] Use the robust API method for engineered prompts
//     const result = await model.generateContent(promptToSend); // Flaw #2 Fixed: Using generateContent
//     const aiResponse = result.response.text();

//     // 4. Send the successful response back to the frontend
//     return NextResponse.json({ reply: aiResponse });

//   } catch (error) {
//     console.error("API Error:", error);

//     let errorMessage = "An unexpected error occurred. Please try again.";
//     let statusCode = 500;

//     // [IMPROVED] Check for specific Gemini API related errors
//     if (error.message.includes('API key not valid')) {
//       errorMessage = "The server's API key is invalid. Please contact support.";
//       statusCode = 500;
//     } else if (error.message.includes('429')) {
//       errorMessage = "You have exceeded the free tier limit. Please try again later or upgrade your plan.";
//       statusCode = 429;
//     } else if (error.message.includes('404')) { // Flaw #3 Fixed: Added 404 check
//       errorMessage = "The AI model is not available. Please contact support.";
//       statusCode = 404;
//     }
    
//     // Send a structured error response back to the frontend
//     return NextResponse.json({ 
//       error: {
//         message: errorMessage,
//         details: error.message
//       } 
//     }, { status: statusCode });
//   }
// }
// app/api/chat/route.js

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google AI SDK with your API key (NO CHANGE)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  // Your robust error handling will be preserved (NO CHANGE)
  try {
    const body = await request.json();
    
    // --- CHANGE #1: We now expect a 'history' array instead of a single 'message' ---
    const conversationHistory = body.history;

    if (!conversationHistory || !Array.isArray(conversationHistory) || conversationHistory.length === 0) {
      return NextResponse.json({ error: 'Conversation history is required' }, { status: 400 });
    }

    // Select the Gemini model (NO CHANGE)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // --- CHANGE #2: Prepare the history for the Gemini API ---
    // The Gemini API expects a specific format. We will convert our simple { role, content } array.
    // The first item in our array is the powerful "system prompt". The rest is the chat.
    const geminiHistory = conversationHistory.map(turn => ({
      role: turn.role === 'ai' ? 'model' : 'user', // Convert 'ai' role to 'model'
      parts: [{ text: turn.content }],
    }));

    // The last message in the history is the one we need to respond to.
    const latestUserMessage = geminiHistory.pop(); 

    // --- CHANGE #3: Use the multi-turn chat API ---
    // We provide all the previous messages as context.
    const chat = model.startChat({
      history: geminiHistory,
    });

    const result = await chat.sendMessage(latestUserMessage.parts);
    const aiResponse = result.response.text();

    // Send the successful response back to the frontend (NO CHANGE)
    return NextResponse.json({ reply: aiResponse });

  } catch (error) {
    // --- YOUR ENTIRE ERROR HANDLING LOGIC REMAINS COMPLETELY UNCHANGED ---
    console.error("API Error:", error);

    let errorMessage = "An unexpected error occurred. Please try again.";
    let statusCode = 500;

    if (error.message.includes('API key not valid')) {
      errorMessage = "The server's API key is invalid. Please contact support.";
      statusCode = 500;
    } else if (error.message.includes('429')) {
      errorMessage = "You have exceeded the free tier limit. Please try again later or upgrade your plan.";
      statusCode = 429;
    } else if (error.message.includes('404')) {
      errorMessage = "The AI model is not available. Please contact support.";
      statusCode = 404;
    }
    
    return NextResponse.json({ 
      error: {
        message: errorMessage,
        details: error.message
      } 
    }, { status: statusCode });
  }
}