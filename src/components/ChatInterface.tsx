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
      await chrome.runtime.sendMessage({ action: 'LOAD_MODEL', modelId: selectedModelId });
      setLoading(false);

      let context = "";
      if (currentSession.messages.length === 0) {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab.id) {
              const pageData = await chrome.tabs.sendMessage(tab.id, { action: 'GET_PAGE_CONTENT' });
              context = `Context from ${pageData.title} (${pageData.url}):\n\n${pageData.content}\n\n---\n\n`;
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
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="font-semibold text-lg flex items-center gap-2">
            <Sparkles className="text-primary" size={20} />
            Claritive
        </h1>
        <div className="flex gap-2">
            <button onClick={() => setShowPrompts(!showPrompts)} className="p-2 hover:bg-accent rounded-md"><Sparkles size={20} /></button>
            <button className="p-2 hover:bg-accent rounded-md"><Settings size={20} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentSession?.messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-3 rounded-2xl ${
              m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted shadow-sm'
            }`}>
              <MarkdownRenderer content={m.content} />
            </div>
          </div>
        ))}
        {streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[90%] p-3 rounded-2xl bg-muted shadow-sm">
              <MarkdownRenderer content={streamingMessage} />
            </div>
          </div>
        )}
        {isModelLoading && (
            <div className="flex justify-center p-2 text-sm text-muted-foreground animate-pulse">
                <Loader2 className="animate-spin mr-2" size={16} />
                Initializing model... {loadProgress.toFixed(0)}%
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showPrompts && (
          <div className="p-4 grid grid-cols-2 gap-2 bg-accent/30 border-t">
              {PROMPT_LIBRARY.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSend(p.prompt)}
                    className="p-2 text-xs text-left hover:bg-background rounded-lg border bg-background/50 transition-colors"
                  >
                      <div className="font-medium">{p.name}</div>
                  </button>
              ))}
          </div>
      )}

      <div className="p-4 border-t bg-background">
        <div className="relative">
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
            className="w-full p-4 pr-12 rounded-2xl bg-secondary/50 border-none focus:ring-2 focus:ring-primary resize-none placeholder:text-muted-foreground/60"
            rows={2}
          />
          <button
            onClick={() => handleSend()}
            disabled={isModelLoading || !input.trim()}
            className="absolute right-3 bottom-3 p-2 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
