import { useEffect } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { useStore } from '../storage/store';
import '../index.css';

function App() {
  const { loadSessions } = useStore();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <div className="w-[400px] h-[600px] overflow-hidden shadow-2xl">
      <ChatInterface />
    </div>
  );
}

export default App;
