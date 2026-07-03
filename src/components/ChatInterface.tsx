import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Settings, Sparkles } from 'lucide-react';
import { useStore } from '../storage/store';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { ChatMessage } from '../ai/types';
import { PROMPT_LIBRARY } from '../prompts/library';

export const ChatInterface = () => {
  const {
    currentSession,
    addMessage,
    selectedModelId,
    isModelLoading,
    loadProgress,
    setLoading,
    setProgress,
    createNewSession
  } = useStore();

  const [input, setInput] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [showPrompts, setShowPrompts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [currentSession?.messages, streamingMessage]);

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.action === 'MODEL_LOAD_PROGRESS') {
        setProgress(message.progress);
      } else if (message.action === 'GENERATION_CHUNK') {
        setStreamingMessage(prev => prev + message.chunk);
      } else if (message.action === 'ASK_QUESTION') {
          setInput(message.text);
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [setProgress]);

  const handleSend = async (overridePrompt?: string) => {
    const textToSend = overridePrompt || input;
    if (!textToSend.trim() || isModelLoading) return;

    if (!currentSession) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            createNewSession(tab?.title || "New Chat", tab?.url || "");
        });
        return;
    }

    const userMessage: ChatMessage = { role: 'user', content: textToSend };
    addMessage(userMessage);
    setInput('');
    setShowPrompts(false);
    setStreamingMessage('');

    try {
      setLoading(true);
      // Ensure model is loaded before generating
      await chrome.runtime.sendMessage({ action: 'LOAD_MODEL', modelId: selectedModelId });

      let context = "";
      if (currentSession.messages.length === 0) {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab.id) {
              try {
                const pageData = await chrome.tabs.sendMessage(tab.id, { action: 'GET_PAGE_CONTENT' });
                if (pageData) {
                    context = `Context from ${pageData.title} (${pageData.url}):\n\n${pageData.content}\n\n---\n\n`;
                }
              } catch (e) {
                console.log("Could not get page content", e);
              }
          }
      }

      const history = [...currentSession.messages, { role: 'user', content: context + userMessage.content }];

      const response = await chrome.runtime.sendMessage({
        action: 'GENERATE_RESPONSE',
        messages: history
      });

      if (response.success) {
        addMessage({ role: 'assistant', content: response.fullText });
        setStreamingMessage('');
      } else {
        addMessage({ role: 'assistant', content: "Error: " + response.error });
      }
    } catch (error: any) {
        addMessage({ role: 'assistant', content: "Failed: " + error.message });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="font-semibold text-lg flex items-center gap-2">
            <Sparkles className="text-primary" size={20} />
            Claritive
        </h1>
        <div className="flex gap-2">
            <button onClick={() => setShowPrompts(!showPrompts)} className="p-2 hover:bg-accent rounded-md transition-colors"><Sparkles size={20} /></button>
            <button className="p-2 hover:bg-accent rounded-md transition-colors"><Settings size={20} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {currentSession?.messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-3 rounded-2xl ${
              m.role === 'user' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted shadow-sm border border-border/50'
            }`}>
              <MarkdownRenderer content={m.content} />
            </div>
          </div>
        ))}
        {streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[90%] p-3 rounded-2xl bg-muted shadow-sm border border-border/50">
              <MarkdownRenderer content={streamingMessage} />
            </div>
          </div>
        )}
        {isModelLoading && (
            <div className="flex justify-center p-4 text-sm text-muted-foreground bg-accent/20 rounded-xl animate-pulse">
                <Loader2 className="animate-spin mr-2" size={16} />
                Initializing AI Engine... {loadProgress.toFixed(0)}%
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showPrompts && (
          <div className="p-4 grid grid-cols-2 gap-2 bg-accent/10 border-t backdrop-blur-sm">
              {PROMPT_LIBRARY.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSend(p.prompt)}
                    className="p-3 text-xs text-left hover:bg-background rounded-xl border border-border/50 bg-background/50 transition-all hover:shadow-sm active:scale-95"
                  >
                      <div className="font-semibold text-primary/80 mb-1">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">{p.prompt}</div>
                  </button>
              ))}
          </div>
      )}

      <div className="p-4 border-t bg-background/80 backdrop-blur-md">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            }}
            placeholder="Ask about this page..."
            className="w-full p-4 pr-14 rounded-2xl bg-secondary/30 border border-transparent focus:border-primary/30 focus:bg-secondary/50 focus:ring-0 transition-all resize-none placeholder:text-muted-foreground/50"
            rows={2}
          />
          <button
            onClick={() => handleSend()}
            disabled={isModelLoading || !input.trim()}
            className="absolute right-3 bottom-3 p-2.5 bg-primary text-primary-foreground rounded-xl disabled:opacity-30 shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
