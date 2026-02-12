
import React, { useEffect, useRef, useState } from 'react';
import { Profile } from '../types';

interface VideoCallProps {
  match: Profile;
  onEnd: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ match, onEnd }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'connecting' | 'active'>('connecting');
  const [quality, setQuality] = useState(4); // 1-4 bars
  const [volume, setVolume] = useState(0); // 0 to 1
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    async function startCall() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }

        // Setup Audio Visualizer
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(analyser);
        analyser.fftSize = 256;
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;
            // Normalize volume (0 to 1 range, roughly)
            setVolume(Math.min(1, average / 128));
          }
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };

        updateVolume();

        // Simulate connection delay
        setTimeout(() => setStatus('active'), 2000);
      } catch (err) {
        console.error("Failed to get media devices:", err);
        alert("Could not access camera or microphone. Please check permissions.");
        onEnd();
      }
    }

    startCall();

    // Fluctuating quality indicator simulation
    const qualityInterval = setInterval(() => {
      setQuality(prev => {
        const rand = Math.random();
        if (rand > 0.8) return Math.max(1, Math.min(4, prev + (Math.random() > 0.5 ? 1 : -1)));
        return prev;
      });
    }, 3000);

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (recorderRef.current && recorderRef.current.state === 'recording') {
        recorderRef.current.stop();
      }
      clearInterval(qualityInterval);
    };
  }, []);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
      setIsMuted(!isMuted);
      if (!isMuted) {
        setVolume(0); // Reset volume immediately when muting
      }
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
      setIsCameraOff(!isCameraOff);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!stream) return;
    
    chunksRef.current = [];
    try {
      const options = { mimeType: 'video/webm;codecs=vp8,opus' };
      const recorder = new MediaRecorder(stream, options);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `TrustDate_Call_${match.name}_${new Date().toLocaleTimeString().replace(/:/g, '-')}.webm`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      };
      
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Recording is not supported in this browser or configuration.");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const getQualityColor = () => {
    if (quality >= 3) return 'bg-emerald-500';
    if (quality === 2) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center animate-in fade-in duration-500 overflow-hidden">
      {/* Remote Video (Simulated) */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={match.photo} 
          className={`w-full h-full object-cover transition-all duration-1000 ${status === 'connecting' ? 'scale-110 blur-2xl opacity-50' : 'scale-100 blur-sm opacity-60'}`} 
          alt="Remote Participant"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
        
        {/* Prominent Remote Name Overlay */}
        <div className={`absolute bottom-32 left-8 z-30 transition-all duration-700 delay-300 ${status === 'active' ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
                {match.name}
              </h2>
              <div className="bg-emerald-500 text-white p-1 rounded-full shadow-lg shadow-emerald-500/40">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/10">
                Verified Match • {match.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Call Info & Quality (Top Overlay) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 text-center space-y-2 px-6 pointer-events-none">
        <div className="flex flex-col items-center gap-1">
          <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
            {status === 'connecting' ? 'Establishing Encrypted Link...' : 'P2P Session Active'}
          </p>
          {status === 'active' && (
            <div className="flex items-end gap-0.5 h-3 mt-1" title="Signal Strength">
              {[1, 2, 3, 4].map((bar) => (
                <div 
                  key={bar} 
                  className={`w-1 rounded-full transition-all duration-500 ${bar <= quality ? getQualityColor() : 'bg-white/20'}`}
                  style={{ height: `${(bar / 4) * 100}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Local Video Overlay with Visualizer */}
      <div className="absolute top-6 right-6 w-32 aspect-[3/4] z-20 transition-transform hover:scale-105">
        {/* Dynamic Visualizer Rings */}
        {!isMuted && volume > 0.05 && (
          <>
            <div 
              className="absolute inset-0 bg-indigo-500/20 rounded-3xl transition-transform duration-75 blur-md"
              style={{ transform: `scale(${1 + volume * 0.3})` }}
            />
            <div 
              className="absolute inset-0 border-2 border-indigo-400/50 rounded-3xl transition-transform duration-100"
              style={{ transform: `scale(${1 + volume * 0.15})` }}
            />
          </>
        )}
        
        <div className="w-full h-full bg-slate-900 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl relative">
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline 
            className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : 'block'}`} 
          />
          {isCameraOff && (
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
               <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
               </svg>
            </div>
          )}
          {/* Local Stream Label */}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-md">
            <span className="text-[8px] font-black text-white uppercase tracking-tighter">You</span>
          </div>
          
          {/* Mute Indicator */}
          {isMuted && (
            <div className="absolute top-2 right-2 p-1 bg-red-500 rounded-lg shadow-lg">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 mt-auto mb-16 flex items-center gap-6">
        {/* Mute/Unmute Control */}
        <button 
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
          className={`p-5 rounded-full backdrop-blur-md transition-all active:scale-90 flex items-center justify-center ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          {isMuted ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636M9 9l3 3m0 0l3 3m-3-3l-3 3m3-3l3-3m3-3l3-3" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        {/* Record Control */}
        <button 
          onClick={handleToggleRecording}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          className={`p-5 rounded-full backdrop-blur-md transition-all active:scale-90 flex items-center justify-center ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`} />
          <span className="sr-only">{isRecording ? "Stop Recording" : "Start Recording"}</span>
        </button>

        {/* End Call Control */}
        <button 
          onClick={onEnd}
          aria-label="End call"
          className="p-8 bg-red-600 text-white rounded-full shadow-2xl shadow-red-900/40 hover:bg-red-500 transition-all active:scale-95 group flex items-center justify-center"
        >
          <svg className="w-8 h-8 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.209.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.209L9.284 3.684A1 1 0 008.284 3H5z" />
          </svg>
        </button>

        {/* Camera Toggle Control */}
        <button 
          onClick={toggleCamera}
          aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}
          className={`p-5 rounded-full backdrop-blur-md transition-all active:scale-90 flex items-center justify-center ${isCameraOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          {isCameraOff ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Safety Badge */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-full select-none">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">P2P Trust Encryption Active</span>
      </div>
    </div>
  );
};

export default VideoCall;
