
import React, { useState } from 'react';

interface GlobalSearchProps {
  isMember: boolean;
  onCheck: (name: string, location: string) => Promise<any>;
  onBack: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isMember, onCheck, onBack }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) return;
    setLoading(true);
    const data = await onCheck(name, location);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-black dark:text-white uppercase tracking-tighter">Search Any Check</h2>
      </div>

      {!isMember ? (
        <div className="bg-amber-50 dark:bg-amber-900/20 p-8 rounded-3xl border border-amber-200 text-center space-y-4">
          <p className="text-amber-700 dark:text-amber-400 font-black text-sm uppercase tracking-widest leading-relaxed">
            PRO Membership Required to Search External Names
          </p>
          <p className="text-xs text-amber-600/70 font-medium">Upgrade to TrustDate Pro for $1.00 to access deep searches for $2.00 per name.</p>
        </div>
      ) : (
        <>
          <form onSubmit={handleSearch} className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Deep Scan Cost: $2.00</p>
            <input 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Legal Full Name"
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            />
            <input 
              required
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="City, State/Country"
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Performing Deep Scan...' : 'Run $2 Background Check'}
            </button>
          </form>

          {result && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border dark:border-slate-700 shadow-xl space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Safety Analysis</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${result.score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                  Score: {result.score}%
                </span>
              </div>
              <p className="text-sm dark:text-slate-300 leading-relaxed font-medium italic">"{result.summary}"</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GlobalSearch;
