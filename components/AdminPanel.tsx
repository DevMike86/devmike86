
import React, { useState } from 'react';
import { AdminSettings } from '../types';

interface AdminPanelProps {
  settings: AdminSettings;
  onUpdate: (settings: AdminSettings) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ settings, onUpdate, onClose }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [view, setView] = useState<'finance' | 'reports'>('finance');

  const handleSave = () => {
    onUpdate(localSettings);
    alert("Financial records updated and synchronized.");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col transition-all animate-in fade-in duration-300">
      <div className="flex justify-between items-center p-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black tracking-tighter uppercase">Admin Core</h2>
          <p className="text-slate-500 text-[10px] font-bold tracking-widest">Financial Oversight Terminal</p>
        </div>
        <div className="flex items-center gap-2">
          <nav className="flex bg-slate-900 rounded-xl p-1 mr-4">
             <button onClick={() => setView('finance')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${view === 'finance' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>Finance</button>
             <button onClick={() => setView('reports')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${view === 'reports' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>Reports ({settings.reports?.length || 0})</button>
          </nav>
          <button onClick={onClose} className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {view === 'finance' ? (
          <>
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 shadow-2xl shadow-indigo-900/40 border border-indigo-400/20">
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Total Vault Revenue</p>
              <h3 className="text-5xl font-black tracking-tighter">${settings.totalRevenue.toFixed(2)}</h3>
              <div className="mt-6 flex gap-4">
                 <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl">
                   <p className="text-[8px] font-bold text-indigo-200 uppercase">Paid Subs</p>
                   <p className="font-bold">{Math.floor(settings.totalRevenue)}</p>
                 </div>
                 <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl">
                   <p className="text-[8px] font-bold text-indigo-200 uppercase">Conversion</p>
                   <p className="font-bold">4.2%</p>
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Payout Destinations</h4>
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-5">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-2 ml-1">Receiving Institution</label>
                  <input 
                    value={localSettings.bankName}
                    onChange={e => setLocalSettings({...localSettings, bankName: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-2 ml-1">Account Number</label>
                    <input 
                      type="password"
                      value={localSettings.accountNumber}
                      onChange={e => setLocalSettings({...localSettings, accountNumber: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-2 ml-1">Routing Number</label>
                    <input 
                      value={localSettings.routingNumber}
                      onChange={e => setLocalSettings({...localSettings, routingNumber: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleSave}
                  className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/40 active:scale-95"
                >
                  Update Payout Routes
                </button>
              </div>
            </div>

            <div className="space-y-4 pb-10">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Recent Flow</h4>
              <div className="space-y-2">
                {settings.transactions && settings.transactions.length > 0 ? (
                  settings.transactions.map((tx) => (
                    <div key={tx.id} className="bg-slate-900/50 p-4 rounded-2xl flex justify-between items-center border border-slate-800">
                      <div>
                        <p className="text-xs font-bold">{tx.matchName}</p>
                        <p className="text-[9px] text-slate-500 uppercase">{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                      <p className="text-emerald-400 font-black tracking-tighter text-sm">+${tx.amount.toFixed(2)}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-600 bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-800">
                    <p className="text-xs font-bold uppercase tracking-widest">No Recent Inflow</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4 pb-10 animate-in fade-in duration-300">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Safety & Integrity Reports</h4>
            <div className="space-y-3">
              {settings.reports && settings.reports.length > 0 ? (
                settings.reports.map((report) => (
                  <div key={report.id} className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-black uppercase text-indigo-400 tracking-wider">Reported Profile</p>
                        <p className="text-lg font-bold">{report.reportedProfileName}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] text-slate-500 uppercase font-bold">{new Date(report.timestamp).toLocaleString()}</p>
                         <p className="text-[9px] text-indigo-300 font-black uppercase mt-1">ID: {report.reportedProfileId.substring(0, 8)}</p>
                      </div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Reason for Report</p>
                       <p className="text-sm font-medium italic text-slate-200">"{report.reason}"</p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                       <p className="text-[10px] text-slate-500 font-bold uppercase">Reported By: {report.reporterName}</p>
                       <button className="px-3 py-1.5 bg-red-500/10 text-red-500 text-[10px] font-black uppercase rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">Ban Profile</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-slate-600 bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-800">
                  <p className="text-xs font-bold uppercase tracking-widest">System Clear: No Pending Reports</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
