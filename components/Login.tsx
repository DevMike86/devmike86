
import React from 'react';

interface LoginProps {
  onLogin: (method: 'google' | 'apple') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="h-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div>
          <h1 className="text-6xl font-black text-indigo-600 tracking-tighter uppercase italic">TrustDate</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-4">Safety & High Integrity First</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => onLogin('google')}
            className="w-full py-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-4 text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="w-6 h-6" alt="Google" />
            Sign in with Google
          </button>
          
          <button 
            onClick={() => onLogin('apple')}
            className="w-full py-5 bg-black text-white rounded-2xl flex items-center justify-center gap-4 text-sm font-black uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 shadow-xl"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C4.79 17.59 4.3 12.33 6.64 8.79c1.11-1.68 2.89-2.73 4.67-2.73 1.34 0 2.45.69 3.25.69.75 0 2.15-.81 3.73-.65 1.66.17 2.87.79 3.56 1.83-3.18 1.94-2.65 6.18.52 7.49-1.3 3.32-3.15 6.27-5.32 8.36M12.03 6.07c-.12-3.1 2.54-5.69 5.56-5.87.35 3.54-3.3 6.36-5.56 5.87z" /></svg>
            Sign in with Apple
          </button>
        </div>

        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed max-w-[280px] mx-auto">
          By signing in, you agree to our terms and the mandatory upfront identity check.
        </p>
      </div>
    </div>
  );
};

export default Login;
