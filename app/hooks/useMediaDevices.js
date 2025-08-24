// app/hooks/useMediaDevices.js
"use client";

import { useState, useRef } from 'react';

// This hook encapsulates all logic for webcam and screen recording.
export default function useMediaDevices() {
  // --- State and Refs managed by this hook ---
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const videoStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const displayStreamRef = useRef(null);
  const micStreamRef = useRef(null);

  // --- Media Functions ---
  const handleDownload = () => {
    if (recordedChunksRef.current.length === 0) return;
    const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style = "display: none";
    a.href = url;
    a.download = `SpeakUp-Session-${new Date().toISOString()}.webm`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    recordedChunksRef.current = [];
  };

  const startScreenRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true });
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      
      displayStreamRef.current = displayStream;
      micStreamRef.current = micStream;

      const audioContext = new AudioContext();
      const mixedAudioDestination = audioContext.createMediaStreamDestination();
      const micAudioSource = audioContext.createMediaStreamSource(micStream);
      micAudioSource.connect(mixedAudioDestination);
      if (displayStream.getAudioTracks().length > 0) {
        const systemAudioSource = audioContext.createMediaStreamSource(displayStream);
        systemAudioSource.connect(mixedAudioDestination);
      }
      
      const finalStream = new MediaStream([
        displayStream.getVideoTracks()[0],
        mixedAudioDestination.stream.getAudioTracks()[0],
      ]);

      mediaRecorderRef.current = new MediaRecorder(finalStream, { mimeType: "video/webm" });
      recordedChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = handleDownload;
      mediaRecorderRef.current.start();
      setIsRecording(true);

    } catch (error) {
      console.error("Screen recording permission denied or error:", error);
      setIsRecording(false);
    }
  };

  const handleToggleVideo = async () => {
    if (isVideoOn) {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        videoStreamRef.current = null;
      }
      setIsVideoOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoStreamRef.current = stream;
        setIsVideoOn(true);
      } catch (error) {
        console.error("Error accessing webcam:", error);
        setIsVideoOn(false);
      }
    }
  };

  // This function is for cleaning up all streams, to be called from the main component.
  const cleanupMediaStreams = () => {
    if (displayStreamRef.current) {
      displayStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    // Reset UI states
    setIsVideoOn(false);
    setIsRecording(false);
  };

  // The hook returns all the state, refs, and functions that the main component needs to interact with.
  return {
    isVideoOn,
    isRecording,
    videoStreamRef,
    startScreenRecording,
    handleToggleVideo,
    cleanupMediaStreams,
  };
}