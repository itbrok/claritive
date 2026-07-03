import { useEffect } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { useStore } from '../storage/store';
import '../index.css';

function App() {
  const { loadSessions, createNewSession, currentSession } = useStore();

  useEffect(() => {
    loadSessions();

    // Auto-create session for current tab if none active
    if (!currentSession) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab?.id) {
          createNewSession(tab.title || "Untitled", tab.url || "");
        }
      });
    }
  }, [loadSessions, createNewSession, currentSession]);

  return (
    <div className="h-screen w-full">
      <ChatInterface />
    </div>
  );
}

export default App;
