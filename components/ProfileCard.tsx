
import React, { useState } from 'react';
import { Profile } from '../types';

interface ProfileCardProps {
  profile: Profile;
  onLike: (initialMessage?: string) => void;
  onPass: () => void;
  onReport: (reason: string) => void;
}

const SocialIcon = ({ platform }: { platform: string }) => {
  const icons: Record<string, React.ReactNode> = {
    instagram: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeWidth="2" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" />
      </svg>
    ),
    twitter: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    linkedin: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
    tiktok: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31 0 2.591.357 3.756 1.034a7.405 7.405 0 001.281-5.043v3.177c-.522-.178-1.077-.27-1.642-.27-2.761 0-5 2.239-5 5v3.177c-1.31 0-2.591-.357-3.756-1.034V15.02c0 3.866 3.134 7 7 7s7-3.134 7-7v-10.823c1.31 1.157 2.962 1.803 4.706 1.803V1c-1.31 0-2.591-.357-3.756-1.034V.02h-3.231z" transform="translate(-10, -2)" />
        <path d="M12 2a1 1 0 0 1 1 1v12.5a3.5 3.5 0 1 1-3.5-3.5V15a1 1 0 0 1 2 0v1a1.5 1.5 0 1 0 1.5-1.5V3a1 1 0 0 1 1-1zm6 0a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h1z" />
      </svg>
    ),
    threads: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 12c0-3.314-2.686-6-6-6S0 8.686 0 12s2.686 6 6 6c1.657 0 3-1.343 3-3V9c0-1.657 1.343-3 3-3s3 1.343 3 3v6c0 1.657-1.343 3-3 3s-3-1.343-3-3" />
      </svg>
    ),
    facebook: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
      </svg>
    ),
    snapchat: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.918c-1.77 0-3.396.485-4.43 1.325-.595.485-.88.948-.88 1.411 0 .684.6 1.432 1.258 1.801.324.183.67.29 1.015.318-.035.132-.058.267-.058.411 0 .848.814 1.536 1.819 1.536 1.004 0 1.819-.688 1.819-1.536 0-.144-.023-.279-.058-.411.345-.028.691-.135 1.015-.318.658-.369 1.258-1.117 1.258-1.801 0-.463-.285-.926-.88-1.411-1.034-.84-2.66-1.325-4.43-1.325zM12 21.082c-3.18 0-6.173-1.054-6.173-3.086 0-.306.071-.582.203-.825-.333-.189-.66-.465-.892-.816-.395-.6-.563-1.285-.563-1.956 0-.616.143-1.166.421-1.621.341-.561.859-.972 1.458-1.157-.107-.468-.166-.96-.166-1.468 0-1.517.51-2.909 1.428-4.04.167-.206.353-.401.554-.582.253-.228.536-.431.844-.607.728-.415 1.623-.664 2.587-.664.964 0 1.859.249 2.587.664.308.176.591.379.844.607.201.181.387.376.554.582.918 1.131 1.428 2.523 1.428 4.04 0 .508-.059 1-.166 1.468.599.185 1.117.596 1.458 1.157.278.455.421 1.005.421 1.621 0 .671-.168 1.356-.563 1.956-.232.351-.559.627-.892.816.132.243.203.519.203.825 0 2.032-2.993 3.086-6.173 3.086z" />
      </svg>
    ),
  };

  return icons[platform.toLowerCase()] || <span className="text-[10px] font-bold uppercase">{platform.substring(0, 2)}</span>;
};

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onLike, onPass, onReport }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [message, setMessage] = useState('');
  const [photoIndex, setPhotoIndex] = useState(0);

  const photos = profile.photos && profile.photos.length > 0 ? profile.photos : [profile.photo];

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: `TrustDate: Meet ${profile.name}`,
      text: `Check out ${profile.name}, ${profile.age} on TrustDate. Verified safety score: ${profile.verificationScore}%!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Profile link copied to clipboard!');
      } catch (err) {
        console.error('Could not copy link:', err);
      }
    }
  };

  const handleReportConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    onReport(reportReason);
    setIsReporting(false);
  };

  const handleLikeWithMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onLike(message);
    setIsMessaging(false);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const hasSocials = profile.socialLinks && Object.values(profile.socialLinks).some(val => !!val);

  return (
    <div className="relative w-full max-sm mx-auto bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl group transition-all duration-300 border dark:border-slate-700">
      <div className="h-[520px] overflow-hidden relative">
        <img 
          src={photos[photoIndex]} 
          alt={profile.name} 
          className="w-full h-full object-cover transition-transform duration-500"
        />
        
        {/* Photo Navigation Overlays */}
        {photos.length > 1 && (
          <div className="absolute inset-0 flex">
            <div 
              className="flex-1 cursor-pointer" 
              onClick={prevPhoto}
              aria-label="Previous photo"
            />
            <div 
              className="flex-1 cursor-pointer" 
              onClick={nextPhoto}
              aria-label="Next photo"
            />
          </div>
        )}

        {/* Carousel Indicators */}
        {photos.length > 1 && (
          <div className="absolute top-2 left-0 right-0 px-4 flex gap-1.5 z-20">
            {photos.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx === photoIndex ? 'bg-white shadow-sm' : 'bg-white/30'}`} 
              />
            ))}
          </div>
        )}

        {/* Floating Top Controls */}
        <div className="absolute top-6 left-4 right-4 flex justify-between items-start z-10">
          <button 
            onClick={handleShare}
            aria-label={`Share ${profile.name}'s profile`}
            className="p-3 bg-black/20 backdrop-blur-md hover:bg-black/40 text-white rounded-2xl transition-all border border-white/10 active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <div className="flex gap-2">
            <div 
              className="bg-emerald-500/90 backdrop-blur-sm text-[10px] font-black px-3 py-1.5 rounded-full text-white uppercase tracking-widest flex items-center gap-1"
              role="status"
              aria-label={`Verified safety score: ${profile.verificationScore} percent`}
            >
              Verified {profile.verificationScore}%
            </div>

            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                aria-label="More options"
                aria-expanded={menuOpen}
                className="p-2.5 bg-black/20 backdrop-blur-md hover:bg-black/40 text-white rounded-xl transition-all border border-white/10 active:scale-90"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              {menuOpen && <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />}
              <div className={`absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border dark:border-slate-700 z-30 overflow-hidden transition-all duration-300 transform origin-top-right ${menuOpen ? 'opacity-100 translate-y-0 scale-100 visible' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none invisible'}`}>
                <button 
                  onClick={() => { setMenuOpen(false); setIsReporting(true); }} 
                  aria-label="Report this profile"
                  className="w-full px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                >
                  Report Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reporting Confirmation Modal */}
        {isReporting && (
          <div className="absolute inset-0 z-[60] bg-slate-950/60 backdrop-blur-lg flex flex-col justify-center p-8 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl space-y-6 border dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <h3 className="text-xl font-black text-red-600 uppercase tracking-tighter">Report Profile</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Integrity Confirmation Required</p>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs font-medium leading-relaxed text-center">
                Are you sure you want to report <strong>{profile.name}</strong>? This will remove them from your queue and alert our safety team.
              </p>
              <form onSubmit={handleReportConfirm} className="space-y-4">
                <textarea 
                  required
                  autoFocus
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Reason for report (e.g. Inappropriate content, behavior...)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-all text-xs font-medium resize-none h-24"
                />
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsReporting(false)} 
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!reportReason.trim()}
                    className="flex-2 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/30 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Confirm Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Message Input Overlay */}
        {isMessaging && (
          <div className="absolute inset-0 z-40 bg-slate-900/40 backdrop-blur-md flex flex-col justify-end p-8 animate-in slide-in-from-bottom-8 duration-300">
            <form onSubmit={handleLikeWithMessage} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Send Initial Message</span>
                <button 
                  type="button" 
                  onClick={() => setIsMessaging(false)} 
                  aria-label="Cancel message"
                  className="text-slate-400 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <textarea 
                autoFocus
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Tell ${profile.name} something nice...`}
                aria-label={`Initial message to ${profile.name}`}
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-5 py-4 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium resize-none h-32"
              />
              <button 
                type="submit"
                disabled={!message.trim()}
                aria-label="Send Like and Message"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                Send Like & Message
              </button>
            </form>
          </div>
        )}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
      
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white transition-opacity duration-300 pointer-events-none" style={{ opacity: (isMessaging || isReporting) ? 0.3 : 1 }}>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight">{profile.name}, {profile.age}</h2>
            <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{profile.location}</p>
          </div>
          {hasSocials && (
            <div className="flex flex-wrap gap-2 mb-1 max-w-[50%] justify-end pointer-events-auto">
              {Object.entries(profile.socialLinks || {}).map(([key, value]) => {
                const val = value as string;
                return val ? (
                  <a 
                    key={key} 
                    href={val.startsWith('http') ? val : `https://${key}.com/${val.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label={`Visit ${profile.name}'s ${key} profile`}
                    className="w-9 h-9 bg-white/10 backdrop-blur-md hover:bg-indigo-600 hover:text-white text-white/90 rounded-xl flex items-center justify-center transition-all border border-white/10 active:scale-90"
                  >
                    <SocialIcon platform={key} />
                  </a>
                ) : null;
              })}
            </div>
          )}
        </div>
        
        <div className="mb-6 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <p className="text-slate-100 text-sm font-medium leading-relaxed opacity-95 line-clamp-2">
            {profile.bio}
          </p>
        </div>
        
        <div className="flex gap-4 pointer-events-auto">
          <button 
            onClick={onPass}
            aria-label={`Pass on ${profile.name}`}
            className="flex-1 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-2xl transition-all border border-white/10 text-white font-black uppercase tracking-widest text-[11px] active:scale-95"
          >
            Pass
          </button>
          <div className="flex-[2] flex gap-2">
            <button 
              onClick={() => onLike()}
              aria-label={`Like ${profile.name}`}
              className="flex-1 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-2xl transition-all border border-white/10 text-white font-black uppercase tracking-widest text-[11px] active:scale-95"
              title="Quick Like"
            >
              Like
            </button>
            <button 
              onClick={() => setIsMessaging(true)}
              aria-label={`Send a message to ${profile.name}`}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 text-white font-black uppercase tracking-widest text-[11px] active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
