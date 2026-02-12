
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Match, Message } from '../types';
import { generateIcebreakers, translateText } from '../services/gemini';

interface ChatWindowProps {
  match: Match;
  onSendMessage: (text: string) => void;
  onCall: () => void;
  onUpgrade: () => void;
  onBack: () => void;
}

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Chinese"
];

const ChatWindow: React.FC<ChatWindowProps> = ({ match, onSendMessage, onCall, onUpgrade, onBack }) => {
  const [inputText, setInputText] = useState('');
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [loadingIcebreakers, setLoadingIcebreakers] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState(() => {
    return localStorage.getItem('trustdate_target_lang') || 'English';
  });
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [translatingIds, setTranslatingIds] = useState<Set<number>>(new Set());
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const lastMessage = match.chatHistory[match.chatHistory.length - 1];
  const isInactive = useMemo(() => {
    if (!lastMessage) return true;
    return lastMessage.sender === 'me' && match.chatHistory.length > 2;
  }, [match.chatHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [match.chatHistory, match.isTyping]);

  useEffect(() => {
    if (match.chatHistory.length === 0) {
      fetchIcebreakers();
    }
    // Reset translations when changing match
    setTranslations({});
    setTranslatingIds(new Set());
  }, [match.profile.id]);

  useEffect(() => {
    localStorage.setItem('trustdate_target_lang', targetLanguage);
  }, [targetLanguage]);

  const fetchIcebreakers = async () => {
    setLoadingIcebreakers(true);
    const suggestions = await generateIcebreakers(
      match.profile.name,
      match.profile.interests,
      match.profile.bio
    );
    setIcebreakers(suggestions);
    setLoadingIcebreakers(false);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
    setIcebreakers([]); // Clear suggestions after sending
  };

  const handleTranslate = async (msgIndex: number, text: string) => {
    if (translatingIds.has(msgIndex)) return;

    setTranslatingIds(prev => new Set(prev).add(msgIndex));
    const translated = await translateText(text, targetLanguage);
    
    setTranslations(prev => ({ ...prev, [msgIndex]: translated }));
    setTranslatingIds(prev => {
      const next = new Set(prev);
      next.delete(msgIndex);
      return next;
    });
  };

  const isTextLimited = !match.isUnlimited && match.messagesSent >= 3;
  const isCallLimited = !match.isUnlimited && match.callsMade >= 3;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="bg-white dark:bg-slate-800 px-4 py-3 border-b dark:border-slate-700 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 overflow-hidden">
          <button onClick={onBack} aria-label="Back to matches" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 shrink-0 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <img src={match.profile.photo} alt="" className="w-9 h-9 rounded-full object-cover border dark:border-slate-600 shrink-0" />
          <div className="truncate">
            <h3 className="font-bold dark:text-white text-sm truncate">{match.profile.name}</h3>
            <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Matched & Verified
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Language Picker */}
          <div className="relative group">
            <select 
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              aria-label="Target language for translation"
              className="appearance-none bg-slate-100 dark:bg-slate-700 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 px-3 py-2 pr-6 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 border border-transparent transition-all cursor-pointer"
            >
              {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
            <svg className="w-2.5 h-2.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>

          <button 
            onClick={onCall}
            disabled={isCallLimited}
            aria-label={isCallLimited ? "Call limit reached. Upgrade to unlock." : `Start video call with ${match.profile.name}`}
            className={`p-2.5 rounded-xl transition-all flex flex-col items-center group relative ${isCallLimited ? 'opacity-20 cursor-not-allowed' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:scale-105 active:scale-95'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            {!match.isUnlimited && match.callsMade < 3 && (
               <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[8px] flex items-center justify-center rounded-full font-black border border-white dark:border-slate-800">
                 {3 - match.callsMade}
               </span>
            )}
          </button>
        </div>
      </div>

      {!match.isUnlimited && (
        <div className="bg-indigo-600 text-white px-4 py-1.5 flex justify-between items-center shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider">Free Interaction Mode: {3 - match.messagesSent} texts remaining</span>
          <button onClick={onUpgrade} className="text-[10px] bg-white text-indigo-600 px-2 py-0.5 rounded font-black hover:bg-indigo-50 transition-colors uppercase">Unlock Unlimited $1</button>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {match.chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative group max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
              msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border dark:border-slate-700 rounded-tl-none shadow-sm'
            }`}>
              <p>{msg.text}</p>
              
              {/* Translated Text Display */}
              {translations[i] && (
                <div className="mt-2 pt-2 border-t dark:border-slate-700 text-[11px] italic opacity-80 border-dashed">
                  <span className="text-[8px] font-black uppercase tracking-tighter text-indigo-500 block mb-0.5">{targetLanguage}:</span>
                  {translations[i]}
                </div>
              )}

              {/* Translate Action for received messages */}
              {msg.sender === 'them' && !translations[i] && (
                <button 
                  onClick={() => handleTranslate(i, msg.text)}
                  className="mt-1 text-[9px] font-black uppercase text-indigo-500 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                >
                  {translatingIds.has(i) ? (
                    <div className="w-2 h-2 border border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                  )}
                  {translatingIds.has(i) ? 'Translating...' : 'Translate'}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {match.isTyping && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border dark:border-slate-700 shadow-sm flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        
        {(match.chatHistory.length === 0 || (isInactive && icebreakers.length > 0)) && !isTextLimited && !match.isTyping && (
          <div className="py-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 px-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span className="text-[9px] font-black uppercase tracking-widest">{isInactive && match.chatHistory.length > 0 ? 'AI Connection Nudge' : 'AI Icebreakers'}</span>
            </div>
            <div className="flex flex-col gap-2">
              {icebreakers.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(suggestion)}
                  className="text-left px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs hover:border-indigo-500 transition-all active:scale-[0.98]"
                >
                  {suggestion}
                </button>
              ))}
              {!loadingIcebreakers && (
                <button onClick={fetchIcebreakers} className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 self-center py-2 uppercase hover:underline">Regenerate AI Suggestions</button>
              )}
              {loadingIcebreakers && (
                <div className="flex justify-center py-2">
                   <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-700 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        {isTextLimited ? (
          <button onClick={onUpgrade} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-all">Unlock Unlimited Interactions for $1.00</button>
        ) : (
          <div className="flex gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your secure message..."
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm border dark:border-transparent"
            />
            <button onClick={handleSend} disabled={!inputText.trim()} className="p-3 bg-indigo-600 disabled:opacity-30 text-white rounded-2xl shadow-lg transition-transform active:scale-95">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
