// app/hooks/useSession.js
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export default function useSession() {
  // --- State and Refs ---
  const [activeScenario, setActiveScenario] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [countdown, setCountdown] = useState(3);
  const [isListening, setIsListening] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  
  // --- NEW STATE: To manage multi-stage scenarios like IELTS ---
  const [currentPartIndex, setCurrentPartIndex] = useState(0);

  // --- Core Functions ---
  const speakText = (text) => {
    // This function remains unchanged
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech Synthesis not supported in this browser.");
    }
  };

  // --- UPGRADED FUNCTION: Now handles both scenario types ---
  const handleUserSpeech = useCallback(async (finalTranscript) => {
    if (!activeScenario || !finalTranscript) return;

    const updatedConversation = [...conversation, { role: 'user', content: finalTranscript }];
    setConversation(updatedConversation);
    setIsResponding(true);

    try {
      // Step 1: Determine the correct system prompt based on scenario type
      let systemPrompt;
      if (activeScenario.type === 'multi-stage') {
        systemPrompt = activeScenario.parts[currentPartIndex].prompt;
      } else {
        systemPrompt = activeScenario.prompt;
      }

      const historyToSend = [
        { role: 'user', content: systemPrompt },
        ...updatedConversation
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: historyToSend }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message || 'An unknown error occurred.');
      
      const aiTextReply = data.reply;
      speakText(aiTextReply);
      setConversation(prev => [...prev, { role: 'ai', content: aiTextReply }]);

      // Step 2: Check for and handle transitions in multi-stage scenarios
      if (activeScenario.type === 'multi-stage') {
        const replyLower = aiTextReply.toLowerCase();
        const currentPart = activeScenario.parts[currentPartIndex];

        // Define the exact phrases the AI was instructed to say
        const part1Transition = "now we will move to part 2";
        const part2Transition = "now we will move on to part 3";
        const testEndTransition = "that is the end of the speaking test";

        if (currentPart.part === 1 && replyLower.includes(part1Transition)) {
          setCurrentPartIndex(1);
        } else if (currentPart.part === 2 && replyLower.includes(part2Transition)) {
          setCurrentPartIndex(2);
        } else if (currentPart.part === 3 && replyLower.includes(testEndTransition)) {
          console.log("IELTS Test Concluded.");
        }
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage = `Error: ${error.message}`;
      speakText(errorMessage);
      setConversation(prev => [...prev, { role: 'ai', content: errorMessage }]);
    } finally {
      setIsResponding(false);
    }
  }, [activeScenario, conversation, currentPartIndex]); // CRITICAL: Added currentPartIndex to dependency array

  // --- Speech Recognition useEffect remains unchanged ---
  useEffect(() => {
    // ... your existing speech recognition setup logic ...
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const fullTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript(fullTranscript);
      };
      recognition.onerror = (event) => {
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          return;
        }
        console.error("Speech recognition error:", event.error);
      };
      recognitionRef.current = recognition;
    } else {
      setIsSpeechRecognitionSupported(false);
      console.warn("Speech Recognition not supported in this browser.");
    }
  }, []); // Intentionally empty to run only once

  // --- Countdown useEffect remains unchanged ---
  useEffect(() => {
    let timer;
    if (activeScenario && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [activeScenario, countdown]);

  // --- handleToggleListening remains unchanged ---
  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (transcript.trim()) {
        handleUserSpeech(transcript.trim());
      }
      setTranscript(""); 
    } else {
      setTranscript("");
      recognitionRef.current?.start();
    }
  };

  // --- UPGRADED FUNCTION: Now handles both scenario types ---
  const startSession = async (scenario) => {
    setActiveScenario(scenario);
    setConversation([]);
    setCountdown(3);
    setIsResponding(true);

    let initialPrompt;
    if (scenario.type === 'multi-stage') {
      setCurrentPartIndex(0); // Reset to the first part
      initialPrompt = scenario.parts[0].prompt;
    } else {
      initialPrompt = scenario.prompt;
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: [{ role: 'user', content: initialPrompt }] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message || 'An unknown error occurred.');
      const aiGreeting = data.reply;
      speakText(aiGreeting);
      setConversation([{ role: 'ai', content: aiGreeting }]);
    } catch (error) {
      console.error("Failed to initialize session:", error);
      const errorMessage = `Error: Could not start the session. ${error.message}`;
      speakText(errorMessage);
      setConversation([{ role: 'ai', content: errorMessage }]);
    } finally {
      setIsResponding(false);
    }
  };

  // --- UPGRADED FUNCTION: Now resets the new state variable ---
  const endSession = () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current && isListening) recognitionRef.current.stop();
    setActiveScenario(null);
    setConversation([]);
    setCurrentPartIndex(0); // Reset the part index
  };

  return {
    activeScenario,
    conversation,
    countdown,
    isListening,
    isResponding,
    isSpeechRecognitionSupported,
    transcript,
    startSession,
    endSession,
    handleToggleListening,
    // --- NEW RETURN VALUE: So the UI knows which part is active ---
    currentPartIndex, 
  };
}