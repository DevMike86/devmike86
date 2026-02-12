
import React, { useState } from 'react';
import { NotificationSettings, AdminSettings } from '../types';
import { requestNotificationPermission, sendPushNotification } from '../services/notifications';

interface SettingsProps {
  settings: NotificationSettings;
  onUpdate: (settings: NotificationSettings) => void;
  adminSettings: AdminSettings;
  onAdminUpdate: (settings: AdminSettings) => void;
  onBack: () => void;
}

const ADMIN_PASSWORD = '19733369';

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, adminSettings, onAdminUpdate, onBack }) => {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [localAdminSettings, setLocalAdminSettings] = useState(adminSettings);

  const toggleSetting = (key: keyof Omit<NotificationSettings, 'browserPermission'>) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    onUpdate({ ...settings, browserPermission: permission });
    if (permission === 'granted') {
      sendPushNotification('TrustDate Connected', 'Notifications are now enabled for your verified account.');
    }
  };

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === ADMIN_PASSWORD) {
      setIsAdminUnlocked(true);
    } else {
      alert("Unauthorized access attempt logged.");
      setAdminPasswordInput('');
    }
  };

  const handleSaveAdmin = () => {
    onAdminUpdate(localAdminSettings);
    alert("Financial infrastructure updated successfully.");
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 flex flex-col animate-in slide-in-from-right-4 duration-300">
      <div className="px-6 py-5 flex items-center gap-4 border-b dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-black dark:text-white uppercase tracking-tighter">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-12">
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Push Notifications</h3>
          
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold dark:text-white text-sm">New Matches</p>
                <p className="text-[10px] text-slate-400 font-medium">Alert me when someone likes me back</p>
              </div>
              <button 
                onClick={() => toggleSetting('matches')}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.matches ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.matches ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold dark:text-white text-sm">Direct Messages</p>
                <p className="text-[10px] text-slate-400 font-medium">Notify for incoming verified messages</p>
              </div>
              <button 
                onClick={() => toggleSetting('messages')}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.messages ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.messages ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold dark:text-white text-sm">AI Icebreakers</p>
                <p className="text-[10px] text-slate-400 font-medium">Reminders for inactive connections</p>
              </div>
              <button 
                onClick={() => toggleSetting('icebreakers')}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.icebreakers ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.icebreakers ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="pt-4 border-t dark:border-slate-700">
              {settings.browserPermission !== 'granted' ? (
                <button 
                  onClick={handleRequestPermission}
                  className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all"
                >
                  Enable Browser Permission
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-emerald-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span className="text-[10px] font-black uppercase">Browser Alerts Active</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Financial Infrastructure</h3>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            {!isAdminUnlocked ? (
              <form onSubmit={handleUnlockAdmin} className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 000 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold dark:text-white">Admin Locked Area</p>
                    <p className="text-[10px] text-slate-400 font-medium">Verify credentials to manage payouts</p>
                  </div>
                </div>
                <input 
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Master Key Required"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-black tracking-widest"
                />
                <button 
                  type="submit"
                  className="w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
                >
                  Unlock Payout Terminal
                </button>
              </form>
            ) : (
              <div className="space-y-5 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Master Access Granted
                  </span>
                  <button onClick={() => setIsAdminUnlocked(false)} className="text-[10px] font-bold text-slate-400 uppercase hover:text-red-500 transition-colors">Lock Section</button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Receiving Bank</label>
                    <input 
                      value={localAdminSettings.bankName}
                      onChange={e => setLocalAdminSettings({...localAdminSettings, bankName: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-700 rounded-xl px-4 py-3 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-medium border dark:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Account Number</label>
                    <input 
                      type="password"
                      value={localAdminSettings.accountNumber}
                      onChange={e => setLocalAdminSettings({...localAdminSettings, accountNumber: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-700 rounded-xl px-4 py-3 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-medium border dark:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Routing Number</label>
                    <input 
                      value={localAdminSettings.routingNumber}
                      onChange={e => setLocalAdminSettings({...localAdminSettings, routingNumber: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-700 rounded-xl px-4 py-3 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-medium border dark:border-transparent"
                    />
                  </div>
                  <button 
                    onClick={handleSaveAdmin}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
                  >
                    Save & Encrypt Financials
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Account Safety</h3>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
             <button className="w-full flex items-center justify-between group">
               <span className="text-sm font-bold dark:text-white">Review Verified ID</span>
               <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
             </button>
             <button className="w-full flex items-center justify-between group pt-4 border-t dark:border-slate-700">
               <span className="text-sm font-bold text-red-500">Deactivate Profile</span>
               <svg className="w-4 h-4 text-slate-300 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
             </button>
          </div>
        </section>

        <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] py-4">
          TrustDate v1.2.0 • P2P Encrypted
        </p>
      </div>
    </div>
  );
};

export default Settings;
