
import React from 'react';

export const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21A3.48 3.48 0 0 1 9 19.5a3.5 3.5 0 0 1-3.5-3.5c0-.55.24-1.06.6-1.42" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21A3.48 3.48 0 0 0 15 19.5a3.5 3.5 0 0 0 3.5-3.5c0-.55-.24-1.06-.6-1.42" />
    <path d="M9 4h6" />
    <path d="M12 4v8" />
    <path d="M6.53 16.47a3.5 3.5 0 0 1 5.47-4.47 3.5 3.5 0 0 1 5.47 4.47" />
  </svg>
);

export const KnowledgeGalaxyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    <circle cx="12" cy="12" r="2" fill="currentColor"></circle>
    <path d="M12 8v-1"></path>
    <path d="M12 17v-1"></path>
    <path d="M16 12h-1"></path>
    <path d="M9 12h-1"></path>
    <path d="m15 9-.7-.7"></path>
    <path d="m9.7 14.3-.7-.7"></path>
    <path d="m15 15-.7.7"></path>
    <path d="m9.7 9.7-.7.7"></path>
  </svg>
);


export const BrainCircuitIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5.5 5.5 0 0 0-5.5 5.5c0 1.73.8 3.26 2.06 4.24" />
      <path d="M12 2a5.5 5.5 0 0 1 5.5 5.5c0 1.73-.8 3.26-2.06 4.24" />
      <path d="M17.5 11.74a5.5 5.5 0 0 1-11 0" />
      <path d="M6.5 11.74A5.5 5.5 0 0 0 12 17.24" />
      <path d="M17.5 11.74A5.5 5.5 0 0 1 12 17.24" />
      <path d="M12 17.24V22" />
      <path d="m15 14-3 3-3-3" />
      <path d="M5 12H2" />
      <path d="M19 12h3" />
      <path d="M4.2 7.5 2 6" />
      <path d="m19.8 7.5 2.2-1.5" />
    </svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

export const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

export const LockOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
    </svg>
);

export const RepeatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 2.1l4 4-4 4"/>
        <path d="M3 12.6A9 9 0 0 1 21 7.9l-1 1"/>
        <path d="M7 21.9l-4-4 4-4"/>
        <path d="M21 11.4A9 9 0 0 1 3 16.1l1-1"/>
    </svg>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

export const FireIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
    </svg>
);

export const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
);

export const VolumeMaxIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
);

export const VolumeMinIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    </svg>
);

export const CoinIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <line x1="12" y1="16" x2="12" y2="16" strokeWidth="2"/>
        <path d="M12 8c.8 0 1.2.5 1.2 1.2s-.4 1.3-1.2 1.3c-.8 0-1.2.5-1.2 1.3S11.2 13 12 13" />
    </svg>
);

export const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6"></path>
        <path d="M10 22h4"></path>
        <path d="M12 2v1"></path>
        <path d="M12 7v-3"></path>
        <path d="M5.6 5.6l.7.7"></path>
        <path d="M18.4 5.6l-.7.7"></path>
        <path d="M21 12h-1"></path>
        <path d="M4 12H3"></path>
        <path d="M16.2 16.2L18 18"></path>
        <path d="M7.8 16.2L6 18"></path>
        <path d="M15 13a3 3 0 1 0-6 0"></path>
    </svg>
);

// Avatars
export const AvatarAstronaut: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" className="text-slate-500" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 2a7 7 0 0 1 7 7v2a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z" className="text-violet-300" />
        <path d="M9 9a3 3 0 0 1 6 0" />
        <path d="M7 13v4" />
        <path d="M17 13v4" />
    </svg>
);

export const AvatarAlien: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" className="text-green-900" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 3c-4 0-7 4-7 9s3 9 7 9 7-4 7-9-3-9-7-9z" className="text-green-400" />
        <path d="M8 11a2 2 0 0 1 2 2" />
        <path d="M14 11a2 2 0 0 1 2 2" />
        <path d="M10 17s1 1 2 1 2-1 2-1" />
    </svg>
);

export const AvatarRobot: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" className="text-blue-900" fill="currentColor" fillOpacity="0.1" />
        <rect x="6" y="6" width="12" height="12" rx="2" className="text-blue-400" />
        <line x1="9" y1="10" x2="9.01" y2="10" strokeWidth="3"/>
        <line x1="15" y1="10" x2="15.01" y2="10" strokeWidth="3"/>
        <path d="M9 14h6" />
        <line x1="12" y1="6" x2="12" y2="3" />
        <circle cx="12" cy="3" r="1" />
    </svg>
);

export const AvatarPlanet: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" className="text-orange-900" fill="currentColor" fillOpacity="0.1" />
        <circle cx="12" cy="12" r="7" className="text-orange-400" />
        <path d="M4.93 19.07c1.5-4.5 8.5-6 14.14 0" />
    </svg>
);

export const HeaderCosmicBackground: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 250" preserveAspectRatio="xMidYMid slice">
        <defs>
            <radialGradient id="cosmic-nebula" cx="50%" cy="100%" r="80%">
                <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
            </radialGradient>
        </defs>
        
        <rect width="800" height="250" fill="url(#cosmic-nebula)" />

        {/* Stars with twinkling animation */}
        <circle cx="100" cy="50" r="1.5" fill="white" opacity="0.9"><animate attributeName="opacity" values="0.2;1;0.2" dur="5s" repeatCount="indefinite" /></circle>
        <circle cx="700" cy="150" r="1.5" fill="white" opacity="0.7"><animate attributeName="opacity" values="0.7;0.2;0.7" dur="4s" repeatCount="indefinite" /></circle>
        <circle cx="50" cy="120" r="1" fill="white" opacity="0.5"><animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" /></circle>
        <circle cx="750" cy="80" r="1" fill="white" opacity="0.6"><animate attributeName="opacity" values="1;0.3;1" dur="6s" repeatCount="indefinite" /></circle>
        <circle cx="400" cy="20" r="1.2" fill="white" opacity="0.8" />
        <circle cx="250" cy="180" r="1.2" fill="white" opacity="0.6" />
        <circle cx="550" cy="90" r="1" fill="white" opacity="0.7" />
        <circle cx="150" cy="160" r="1" fill="white" opacity="0.9"><animate attributeName="opacity" values="0.3;0.9;0.3" dur="4.5s" repeatCount="indefinite" /></circle>
        <circle cx="650" cy="40" r="1" fill="white" opacity="0.5" />
        <circle cx="320" cy="130" r="1.5" fill="white" opacity="0.8" />
        <circle cx="480" cy="200" r="1" fill="white" opacity="0.7" />
    </svg>
);