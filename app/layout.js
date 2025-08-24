// app/layout.js
import { AuthContextProvider } from "./context/AuthContext"; // <-- 1. IMPORT THE PROVIDER
import "./globals.css";

export const metadata = {
  title: "SpeakUp",
  description: "AI Conversation Practice Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <AuthContextProvider> {/* <-- 2. WRAP YOUR APP WITH THE PROVIDER */}
          {/* No navbar here — only the page contents */}
          <main className="min-h-screen">
            {children}
          </main>
        </AuthContextProvider>
      </body>
    </html>
  );
}
