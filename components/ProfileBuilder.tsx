
import React, { useState, useRef } from 'react';
import { Profile, SocialLinks } from '../types';

interface ProfileBuilderProps {
  initialData: Partial<Profile>;
  onComplete: (data: Partial<Profile>) => void;
}

const SUGGESTED_INTERESTS = [
  "Hiking", "Cooking", "Photography", "Travel", "Gaming", 
  "Yoga", "Art", "Music", "Fitness", "Reading", "Coffee", 
  "Movies", "Tattoos", "Wine", "Tech", "Dogs", "Cats"
];

const ProfileBuilder: React.FC<ProfileBuilderProps> = ({ initialData, onComplete }) => {
  const [bio, setBio] = useState(initialData.bio || '');
  const [interests, setInterests] = useState<string[]>(initialData.interests || []);
  const [photos, setPhotos] = useState<string[]>(initialData.photos || (initialData.photo ? [initialData.photo] : []));
  const [socials, setSocials] = useState<SocialLinks>(initialData.socialLinks || { 
    instagram: '', twitter: '', linkedin: '', tiktok: '', threads: '', facebook: '', snapchat: '' 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Fix: Explicitly type the file parameter as 'File' to ensure it's recognized as a 'Blob'.
      // This resolves the error where 'file' might be inferred as 'unknown' from Array.from.
      const readers = Array.from(files).map((file: File) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          // Use onload for successful completion and onerror for failure handling
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(newPhotos => {
        setPhotos(prev => [...prev, ...newPhotos].slice(0, 6)); // Limit to 6 photos
      }).catch(err => {
        console.error("Error reading files:", err);
      });
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const isReady = bio.length > 5 && interests.length >= 2 && photos.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="text-center">
        <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Launch Profile</h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Connect your verified world.</p>
      </div>

      <div className="space-y-4">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Photos (up to 6)</label>
        <div className="grid grid-cols-3 gap-3">
          {photos.map((p, idx) => (
            <div key={idx} className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-700 rounded-2xl overflow-hidden border dark:border-slate-600 shadow-sm">
              <img src={p} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
              <button 
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                aria-label={`Remove photo ${idx + 1}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              {idx === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/90 text-[8px] font-black text-white uppercase text-center py-1">Main</div>
              )}
            </div>
          ))}
          {photos.length < 6 && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center hover:border-indigo-500 transition-all group"
            >
              <svg className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              <span className="text-[9px] font-black text-slate-400 uppercase mt-1">Add</span>
            </button>
          )}
        </div>
        <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" multiple />
        <p className="text-[9px] text-slate-400 italic">Tip: The first photo is your primary profile image.</p>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio</label>
        <textarea 
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Verified and ready to connect..."
          className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 resize-none text-sm font-medium border dark:border-transparent"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Connect Media Platforms</label>
        <div className="grid grid-cols-1 gap-2">
          {Object.keys(socials).map((key) => (
            <div key={key} className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-black uppercase w-8">{key.substring(0, 3)}</span>
              <input 
                value={(socials as any)[key]}
                onChange={e => setSocials({...socials, [key]: e.target.value})}
                placeholder={`@username`}
                className="w-full pl-14 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none border dark:border-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Interests</label>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_INTERESTS.map(interest => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                interests.includes(interest)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <button 
        disabled={!isReady}
        onClick={() => onComplete({ bio, interests, photo: photos[0], photos, socialLinks: socials })}
        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl ${
          isReady ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
        }`}
      >
        Complete My Profile
      </button>
    </div>
  );
};

export default ProfileBuilder;
