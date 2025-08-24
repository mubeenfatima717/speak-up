
"use client";

import React from 'react';
import { marked } from 'marked'; // We will use a library to safely render the report's markdown formatting.

// A simple utility icon for the download button. You can add a more complex SVG to Icons.js if you prefer.
const DownloadIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);


export default function ReportView({ reportData }) {
  if (!reportData) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>Select a session from the history to view its report.</p>
      </div>
    );
  }

  // Sanitize and render the markdown content from the report.
  // This will correctly format the ### headings and - bullet points.
  const getMarkdownText = () => {
    const rawMarkup = marked(reportData.reportContent || 'Report not available.', { sanitize: true });
    return { __html: rawMarkup };
  };

  const handleDownload = () => {
    if (!reportData.reportContent) return;

    // Create a Blob from the report text
    const blob = new Blob([reportData.reportContent], { type: 'text/markdown;charset=utf-8' });
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    // Format the filename
    const formattedDate = new Date(reportData.createdAt?.toDate()).toISOString().split('T')[0];
    link.download = `SpeakUp-Report-${reportData.scenarioName}-${formattedDate}.md`;
    // Programmatically click the link to trigger the download
    document.body.appendChild(link);
    link.click();
    // Clean up by removing the link and revoking the URL
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-gray-800/50 rounded-lg overflow-y-auto">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-white">{reportData.scenarioName} - Performance Report</h2>
          <p className="text-sm text-gray-400">
            Session Date: {reportData.createdAt ? new Date(reportData.createdAt.toDate()).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-500"
          disabled={!reportData.reportContent || reportData.status !== 'completed'}
        >
          <DownloadIcon className="w-5 h-5" />
          Download
        </button>
      </div>
      
      {reportData.status === 'processing' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-400 mb-4"></div>
          <p className="text-lg text-gray-300">Your report is being generated...</p>
          <p className="text-sm text-gray-500">This may take a moment. Please check back soon.</p>
        </div>
      )}
      
      {reportData.status === 'failed' && (
        <div className="flex-1 p-4 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="font-semibold text-red-300">Report Generation Failed</p>
          <p className="text-sm text-red-400 mt-2 whitespace-pre-wrap">{reportData.reportContent}</p>
        </div>
      )}

      {reportData.status === 'completed' && (
        <div
          className="prose prose-invert max-w-none text-gray-300"
          dangerouslySetInnerHTML={getMarkdownText()}
        />
      )}
    </div>
  );
}