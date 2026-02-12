
import React, { useState, useEffect, useMemo } from 'react';
import { Profile, Match, UserState, VerificationStatus, OnboardingStep, AdminSettings, Transaction, NotificationSettings, Report } from './types';
import { performBackgroundCheck, generateDiscoverProfiles } from './services/gemini';
import { sendPushNotification } from './services/notifications';
import ProfileCard from './components/ProfileCard';
import ChatWindow from './components/ChatWindow';
import ProfileBuilder from './components/ProfileBuilder';
import AdminPanel from './components/AdminPanel';
import Settings from './components/Settings';
import VideoCall from './components/VideoCall';
import Login from './components/Login';
import GlobalSearch from './components/GlobalSearch';

const ADMIN_PASSWORD = '19733369';

const App: React.FC = () => {
  const [userState, setUserState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem('trustdate_user');
      if (!saved) throw new Error("No saved state");
      const parsed = JSON.parse(saved);
      if (parsed.onboardingStep === OnboardingStep.COMPLETED && !parsed.profile) {
        parsed.onboardingStep = OnboardingStep.IDENTITY;
      }
      return parsed;
    } catch (e) {
      return {
        onboardingStep: OnboardingStep.LOGIN,
        isVerified: false,
        isMember: false,
        profile: null,
        matches: [],
        theme: 'light',
        notificationSettings: {
          matches: true,
          messages: true,
          icebreakers: true,
          browserPermission: 'default'
        }
      };
    }
  });

  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    try {
      const saved = localStorage.getItem('trustdate_admin');
      return saved ? JSON.parse(saved) : {
        bankName: 'Global Reserve Bank',
        accountNumber: '**** **** 1973',
        routingNumber: '000000000',
        totalRevenue: 0,
        transactions: [],
        reports: []
      };
    } catch (e) {
      return {
        bankName: 'Global Reserve Bank',
        accountNumber: '**** **** 1973',
        routingNumber: '000000000',
        totalRevenue: 0,
        transactions: [],
        reports: []
      };
    }
  });

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(VerificationStatus.IDLE);
  const [discoverQueue, setDiscoverQueue] = useState<Profile[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<{matchId: string, type: 'text' | 'call' | 'global_search'} | null>(null);
  const [isCalling, setIsCalling] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'discover' | 'matches' | 'me' | 'settings' | 'global_search'>('discover');
  const [showAdmin, setShowAdmin] = useState(false);
  const [celebratingMatch, setCelebratingMatch] = useState<Profile | null>(null);

  const [onboardingData, setOnboardingData] = useState({ name: '', location: '', age: '25' });

  const activeMatchData = useMemo(() => {
    if (!activeChatId) return null;
    return userState.matches.find(m => m.profile.id === activeChatId) || null;
  }, [activeChatId, userState.matches]);

  useEffect(() => {
    const handlePopState = () => {
      if (activeChatId) {
        setActiveChatId(null);
      } else if (view !== 'discover') {
        setView('discover');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeChatId, view]);

  useEffect(() => {
    const currentState = { view, activeChatId };
    window.history.pushState(currentState, '', '');
  }, [view, activeChatId]);

  useEffect(() => {
    if (userState.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userState.theme]);

  useEffect(() => {
    if (userState.onboardingStep === OnboardingStep.COMPLETED && discoverQueue.length === 0 && !loading) {
      loadProfiles();
    }
    localStorage.setItem('trustdate_user', JSON.stringify(userState));
  }, [userState.onboardingStep, discoverQueue.length, loading, userState]);

  useEffect(() => {
    localStorage.setItem('trustdate_admin', JSON.stringify(adminSettings));
  }, [adminSettings]);

  const loadProfiles = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const profiles = await generateDiscoverProfiles();
      setDiscoverQueue(profiles || []);
    } catch (err) {
      console.error("Failed to load profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (method: 'google' | 'apple') => {
    setUserState(prev => ({ ...prev, onboardingStep: OnboardingStep.IDENTITY }));
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationStatus(VerificationStatus.PENDING);
    setUserState(prev => ({ ...prev, onboardingStep: OnboardingStep.VERIFYING }));
    
    const result = await performBackgroundCheck(onboardingData.name, onboardingData.location);
    
    if (result.score >= 70) {
      setUserState(prev => ({
        ...prev,
        isVerified: true,
        onboardingStep: OnboardingStep.PROFILE_BUILDER,
        profile: {
          id: 'me',
          name: onboardingData.name,
          age: parseInt(onboardingData.age),
          location: onboardingData.location,
          bio: '',
          photo: '',
          verificationScore: result.score,
          verificationReport: result.summary,
          interests: [],
          socialLinks: { instagram: '', twitter: '', linkedin: '', tiktok: '', threads: '', facebook: '', snapchat: '' }
        }
      }));
      setVerificationStatus(VerificationStatus.VERIFIED);
    } else {
      setVerificationStatus(VerificationStatus.FAILED);
      setUserState(prev => ({ ...prev, onboardingStep: OnboardingStep.IDENTITY }));
    }
  };

  const handleUpgradeToMember = () => {
    setAdminSettings(prev => ({
      ...prev,
      totalRevenue: prev.totalRevenue + 1.0,
      transactions: [{
        id: `tx-mem-${Date.now()}`,
        amount: 1.0,
        date: Date.now(),
        matchName: userState.profile?.name || 'User',
        type: 'membership'
      }, ...prev.transactions]
    }));
    setUserState(prev => ({ ...prev, isMember: true }));
  };

  const handleProfileComplete = (data: Partial<Profile>) => {
    if (!userState.profile) return;
    setUserState(prev => ({
      ...prev,
      onboardingStep: OnboardingStep.COMPLETED,
      profile: { ...prev.profile!, ...data } as Profile
    }));
  };

  const onLike = (profile: Profile, initialMessage?: string) => {
    const newMatch: Match = {
      profile,
      messagesSent: initialMessage ? 1 : 0,
      callsMade: 0,
      isUnlimited: false,
      chatHistory: initialMessage ? [{ sender: 'me', text: initialMessage, timestamp: Date.now() }] : []
    };
    
    setUserState(prev => ({ 
      ...prev, 
      matches: [newMatch, ...prev.matches] 
    }));

    if (userState.notificationSettings.matches) {
      sendPushNotification("It's a Match!", `You are now connected with ${profile.name}.`, profile.photo);
    }

    setCelebratingMatch(profile);
    setDiscoverQueue(prev => prev.filter(p => p.id !== profile.id));
    
    setTimeout(() => {
      setCelebratingMatch(null);
      setActiveChatId(profile.id);
    }, 2500);
  };

  const onReport = (profile: Profile, reason: string) => {
    const newReport: Report = {
      id: `rep-${Date.now()}`,
      reportedProfileId: profile.id,
      reportedProfileName: profile.name,
      reporterName: userState.profile?.name || "Anonymous",
      reason: reason,
      timestamp: Date.now()
    };

    setAdminSettings(prev => ({
      ...prev,
      reports: [newReport, ...prev.reports]
    }));

    setDiscoverQueue(prev => prev.filter(p => p.id !== profile.id));
    alert("Profile reported. Our trust and safety team will review this immediately.");
  };

  const onSendMessage = (text: string) => {
    if (!activeChatId) return;
    setUserState(prev => {
      const updatedMatches = prev.matches.map(m => {
        if (m.profile.id === activeChatId) {
          return {
            ...m,
            isTyping: true,
            messagesSent: !m.isUnlimited ? m.messagesSent + 1 : m.messagesSent,
            chatHistory: [...m.chatHistory, { sender: 'me' as const, text, timestamp: Date.now() }]
          };
        }
        return m;
      });
      return { ...prev, matches: updatedMatches };
    });

    setTimeout(() => {
      setUserState(prev => {
        const updatedMatches = prev.matches.map(m => {
          if (m.profile.id === activeChatId) {
            return {
              ...m,
              isTyping: false,
              chatHistory: [...m.chatHistory, { 
                sender: 'them' as const, 
                text: `Verified Match: Looking forward to our chat!`, 
                timestamp: Date.now() 
              }]
            };
          }
          return m;
        });
        return { ...prev, matches: updatedMatches };
      });
    }, 1500);
  };

  const onCall = () => {
    if (!activeChatId || !activeMatchData) {
      alert("Encryption Error: Video calls are only available once matched.");
      return;
    }
    
    if (!activeMatchData.isUnlimited && activeMatchData.callsMade >= 3) {
      setShowPaymentModal({matchId: activeChatId, type: 'call'});
      return;
    }

    setIsCalling(activeMatchData.profile);
    setUserState(prev => ({
      ...prev,
      matches: prev.matches.map(m => m.profile.id === activeChatId ? { ...m, callsMade: !m.isUnlimited ? m.callsMade + 1 : m.callsMade } : m)
    }));
  };

  const handleGlobalSearchCheck = async (name: string, location: string) => {
    if (!userState.isMember) {
      alert("Membership required for global background checks.");
      return null;
    }
    setAdminSettings(prev => ({
      ...prev,
      totalRevenue: prev.totalRevenue + 2.0,
      transactions: [{
        id: `tx-gs-${Date.now()}`,
        amount: 2.0,
        date: Date.now(),
        matchName: `Search: ${name}`,
        type: 'global_search_check'
      }, ...prev.transactions]
    }));
    return await performBackgroundCheck(name, location);
  };

  const onUpgrade = (matchId: string) => {
    const match = userState.matches.find(m => m.profile.id === matchId);
    if (!match) return;
    setAdminSettings(prev => ({
      ...prev,
      totalRevenue: prev.totalRevenue + 1.0,
      transactions: [{
        id: `tx-unl-${Date.now()}`,
        amount: 1.0,
        date: Date.now(),
        matchName: match.profile.name,
        type: 'text_unlock'
      }, ...prev.transactions]
    }));
    setUserState(prev => ({
      ...prev,
      matches: prev.matches.map(m => m.profile.id === matchId ? { ...m, isUnlimited: true } : m)
    }));
    setShowPaymentModal(null);
  };

  const handleAdminAuth = () => {
    const pass = window.prompt("Admin Access Key Required:");
    if (pass === ADMIN_PASSWORD) {
      setShowAdmin(true);
    }
  };

  if (userState.onboardingStep === OnboardingStep.LOGIN) {
    return <Login onLogin={handleLogin} />;
  }

  if (userState.onboardingStep === OnboardingStep.IDENTITY || userState.onboardingStep === OnboardingStep.VERIFYING) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border dark:border-slate-800 animate-in fade-in zoom-in duration-300">
          <div className="text-center">
            <h1 className="text-4xl font-black text-indigo-600 tracking-tighter uppercase italic">TrustDate</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Identity & Safety Verification</p>
          </div>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-4">
              <input 
                required
                value={onboardingData.name}
                onChange={e => setOnboardingData({...onboardingData, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                placeholder="Full Legal Name"
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  required
                  value={onboardingData.location}
                  onChange={e => setOnboardingData({...onboardingData, location: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                  placeholder="City"
                />
                <input 
                  required
                  type="number"
                  value={onboardingData.age}
                  onChange={e => setOnboardingData({...onboardingData, age: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                  placeholder="Age"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={userState.onboardingStep === OnboardingStep.VERIFYING}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {userState.onboardingStep === OnboardingStep.VERIFYING ? 'Scanning Records...' : 'Verify My Identity'}
            </button>
          </form>
          <p className="text-[9px] text-slate-400 text-center uppercase tracking-tighter opacity-50">
            P2P Encrypted • Public Record Simulation
          </p>
        </div>
      </div>
    );
  }

  if (userState.onboardingStep === OnboardingStep.PROFILE_BUILDER) {
    return (
      <div className="h-full bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center overflow-y-auto">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border dark:border-slate-800">
          <ProfileBuilder initialData={userState.profile || {}} onComplete={handleProfileComplete} />
        </div>
      </div>
    );
  }

  if (!userState.profile) {
    return <div className="h-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <button onClick={() => setUserState(p => ({...p, onboardingStep: OnboardingStep.IDENTITY}))} className="p-4 bg-indigo-600 text-white rounded-xl">Incomplete Profile: Reset Session</button>
    </div>;
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950 transition-colors flex flex-col">
      {isCalling && <VideoCall match={isCalling} onEnd={() => setIsCalling(null)} />}
      {showAdmin && <AdminPanel settings={adminSettings} onUpdate={setAdminSettings} onClose={() => setShowAdmin(false)} />}
      
      {celebratingMatch && (
        <div className="fixed inset-0 z-[200] bg-indigo-600/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
           <div className="relative">
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" />
              <img src={celebratingMatch.photo} className="w-48 h-48 rounded-full border-4 border-white shadow-2xl relative z-10" alt="Match" />
           </div>
           <h2 className="text-5xl font-black text-white mt-12 tracking-tighter italic animate-bounce">IT'S A MATCH!</h2>
           <p className="text-indigo-100 font-bold uppercase tracking-widest text-sm mt-4">Verified Connection Established</p>
           <p className="text-white/50 text-[10px] mt-2 uppercase font-black">Video calls now unlocked</p>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-black dark:text-white tracking-tight">
                {showPaymentModal.type === 'call' ? 'Unlock Unlimited Calls' : 'Unlock Unlimited Chat'}
              </h3>
              <p className="text-slate-500 text-sm mt-1">You've reached the free interaction limit for this match.</p>
            </div>
            <button onClick={() => onUpgrade(showPaymentModal.matchId)} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl">Pay $1.00 Now</button>
            <button onClick={() => setShowPaymentModal(null)} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px]">Maybe Later</button>
          </div>
        </div>
      )}

      {activeChatId && activeMatchData ? (
        <div className="flex-1 max-w-2xl mx-auto w-full border-x dark:border-slate-800 shadow-2xl overflow-hidden">
          <ChatWindow 
            match={activeMatchData} 
            onSendMessage={onSendMessage} 
            onCall={onCall} 
            onUpgrade={() => setShowPaymentModal({matchId: activeChatId, type: 'text'})} 
            onBack={() => setActiveChatId(null)} 
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full border-x dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
          <header className="px-6 py-4 flex justify-between items-center bg-white dark:bg-slate-900 border-b dark:border-slate-800 z-20 shrink-0">
            <h1 className="text-2xl font-black text-indigo-600 tracking-tighter uppercase italic cursor-pointer" onClick={handleAdminAuth}>TD</h1>
            <div className="flex items-center gap-4">
              {!userState.isMember && (
                <button onClick={handleUpgradeToMember} className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-200">Get Pro $1</button>
              )}
              {userState.isMember && (
                <span className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">PRO</span>
              )}
              <button onClick={() => setView('me')} className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                <img src={userState.profile.photo || 'https://picsum.photos/200'} alt="Me" className="w-full h-full object-cover" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            {view === 'discover' && (
              <div className="p-6 pb-20">
                <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="text-2xl font-black dark:text-white tracking-tight">Discover</h2>
                  <button onClick={() => setView('global_search')} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Check Anyone
                  </button>
                </div>
                {discoverQueue.length > 0 ? (
                  <ProfileCard 
                    profile={discoverQueue[0]} 
                    onLike={(msg) => onLike(discoverQueue[0], msg)} 
                    onPass={() => setDiscoverQueue(prev => prev.slice(1))} 
                    onReport={(reason) => onReport(discoverQueue[0], reason)} 
                  />
                ) : (
                  <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Updating Queue...</div>
                )}
              </div>
            )}
            {view === 'global_search' && <GlobalSearch isMember={userState.isMember} onCheck={handleGlobalSearchCheck} onBack={() => setView('discover')} />}
            {view === 'matches' && (
              <div className="p-6 grid grid-cols-2 gap-4 pb-20">
                {userState.matches.map(m => (
                  <div key={m.profile.id} onClick={() => setActiveChatId(m.profile.id)} className="relative aspect-[4/5] rounded-3xl overflow-hidden border dark:border-slate-800 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform">
                    <img src={m.profile.photo} className="w-full h-full object-cover" alt={m.profile.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <p className="text-sm font-black">{m.profile.name}</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-400">Verified Match</p>
                    </div>
                  </div>
                ))}
                {userState.matches.length === 0 && (
                  <div className="col-span-2 text-center py-20 text-slate-400 font-black uppercase tracking-widest text-[10px]">No matches yet.</div>
                )}
              </div>
            )}
            {view === 'me' && userState.profile && <div className="p-6 pb-20"><ProfileCard profile={userState.profile} onLike={()=>{}} onPass={()=>{}} onReport={()=>{}} /></div>}
            {view === 'settings' && <Settings settings={userState.notificationSettings} onUpdate={(s) => setUserState(prev => ({ ...prev, notificationSettings: s }))} adminSettings={adminSettings} onAdminUpdate={setAdminSettings} onBack={() => setView('discover')} />}
          </main>

          <nav className="bg-white dark:bg-slate-900 border-t dark:border-slate-800 px-8 py-4 pb-8 flex justify-between items-center z-20 shrink-0">
            <button onClick={() => setView('discover')} className={`p-2 ${view === 'discover' ? 'text-indigo-600' : 'text-slate-300'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L3 9v11a2 2 0 002 2h14a2 2 0 002-2V9l-9-7z" /></svg></button>
            <button onClick={() => setView('matches')} className={`p-2 ${view === 'matches' ? 'text-indigo-600' : 'text-slate-300'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg></button>
            <button onClick={() => setView('settings')} className={`p-2 ${view === 'settings' ? 'text-indigo-600' : 'text-slate-300'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58z" /></svg></button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default App;
