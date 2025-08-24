// app/hooks/useFirestoreHistory.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebaseConfig';
// --- CHANGE: Added 'updateDoc' for the new two-step save process ---
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';

export default function useFirestoreHistory(user) {
  const [historyItems, setHistoryItems] = useState([]);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setHistoryItems([]);
      return;
    }
    try {
      const sessionsCollectionRef = collection(db, "users", user.uid, "sessions");
      const q = query(sessionsCollectionRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const sessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setHistoryItems(sessions);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // --- UPGRADED saveSession FUNCTION ---
  const saveSession = async (activeScenario, conversation) => {
    if (!user || !activeScenario || conversation.length <= 1) {
      console.log("Save conditions not met. Skipping save.");
      return;
    }

    // A placeholder for the new document reference
    let sessionDocRef; 
    
    try {
      // Step 1: Create the initial session document with a "processing" status.
      const sessionsCollectionRef = collection(db, "users", user.uid, "sessions");
      sessionDocRef = await addDoc(sessionsCollectionRef, {
        scenarioName: activeScenario.name,
        createdAt: serverTimestamp(),
        status: 'processing', // Add a status field
        reportContent: 'Your report is being generated, please wait...',
      });
      console.log("Initial session metadata saved with ID:", sessionDocRef.id);

      // Immediately re-fetch history to show the "processing" state in the UI.
      fetchHistory();

      // Step 2: Call the new report generation API in the background.
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: conversation,
          scenarioName: activeScenario.name
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        // If the API fails, we still have a saved session, but we'll note the error.
        throw new Error(result.error.message || 'Failed to generate report.');
      }
      
      const reportText = result.report;

      // Step 3: Update the document with the generated report and a "completed" status.
      await updateDoc(sessionDocRef, {
        reportContent: reportText,
        status: 'completed'
      });
      console.log("Report generated and session document updated successfully!");

    } catch (error) {
      console.error("Error during session save or report generation:", error);
      // If an error occurs after the document is created, update it to show the error state.
      if (sessionDocRef) {
        try {
          await updateDoc(sessionDocRef, {
            reportContent: `Failed to generate report. Error: ${error.message}`,
            status: 'failed'
          });
        } catch (updateError) {
          console.error("Failed to update session with error state:", updateError);
        }
      }
    } finally {
      // Step 4: Re-fetch the history one last time to show the final "completed" state.
      fetchHistory();
    }
  };

  const deleteSession = async (sessionId) => {
    // This function remains unchanged
    if (!user || !sessionId) return;
    try {
      const sessionDocRef = doc(db, "users", user.uid, "sessions", sessionId);
      await deleteDoc(sessionDocRef);
      fetchHistory();
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  return { historyItems, saveSession, deleteSession };
}