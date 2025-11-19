import React, { useState, useCallback, useEffect } from 'react';
import { fetchQuizQuestions, fetchFreePlayQuizQuestions, fetchDailyChallengeQuestions } from './services/geminiService';
import type { QuizQuestion, UserProgress, Difficulty, Language, AppSettings } from './types';
import { translations } from './translations';
import { 
    KnowledgeGalaxyIcon, 
    TrophyIcon, 
    CheckCircleIcon, 
    XCircleIcon, 
    StarIcon, 
    LockIcon, 
    LockOpenIcon,
    RepeatIcon, 
    ArrowLeftIcon, 
    HeaderCosmicBackground,
    UserIcon,
    AvatarAstronaut,
    AvatarAlien,
    AvatarRobot,
    AvatarPlanet,
    FireIcon,
    ClockIcon,
    SettingsIcon,
    VolumeMaxIcon,
    VolumeMinIcon,
    CoinIcon,
    LightbulbIcon
} from './components/icons';

type GameState = 'level_select' | 'free_play_select' | 'loading' | 'playing' | 'finished' | 'reviewing' | 'error_view' | 'profile' | 'settings';
type GameMode = 'level_path' | 'free_play' | 'daily_challenge';

const TOTAL_LEVELS = 30;
const MAX_PLAYER_LEVEL = 5;
const BASE_XP_PER_LEVEL = 50;
const XP_FOR_NEXT_LEVEL = (level: number) => level * 100 + 50;
const COINS_PER_LEVEL_WIN = 25;
const COINS_DAILY_CHALLENGE = 50;
const LEVEL_GATE_COST = 100;
const HINT_COST = 50;
const LOCAL_STORAGE_KEY = 'quizAppProgress_levelPath';
const LOCAL_STORAGE_SETTINGS_KEY = 'quizAppSettings';
const MAX_QUESTION_HISTORY = 50;

const AVATARS = [
    { id: 'astronaut', component: AvatarAstronaut, labelKey: 'astronaut' },
    { id: 'alien', component: AvatarAlien, labelKey: 'alien' },
    { id: 'robot', component: AvatarRobot, labelKey: 'robot' },
    { id: 'planet', component: AvatarPlanet, labelKey: 'planet' }
];

const getMinScoreToPass = (totalQuestions: number): number => {
    return Math.ceil(totalQuestions * 0.6);
};

// Logic for Gate Levels (every 5 levels starting from 6)
const isGateLevel = (level: number) => level > 5 && (level - 1) % 5 === 0;

// Helper to check if daily challenge is available
const isDailyChallengeAvailable = (lastPlayedDate: string | undefined): boolean => {
    if (!lastPlayedDate) return true;
    const today = new Date().toISOString().split('T')[0];
    return lastPlayedDate !== today;
};

const XPProgressBar: React.FC<{ level: number; xp: number; xpForNextLevel: number; className?: string; labels: any }> = ({ level, xp, xpForNextLevel, className="", labels }) => {
    const isMaxLevel = level >= MAX_PLAYER_LEVEL;
    const progressPercentage = isMaxLevel ? 100 : Math.min((xp / xpForNextLevel) * 100, 100);

    return (
        <div className={`w-full ${className}`}>
            <div className="flex justify-between items-center mb-1.5 text-sm tracking-wide">
                <span className="font-bold text-violet-200 drop-shadow-md">{labels.common.level} {level}</span>
                <span className="text-violet-200/70 font-mono text-xs">
                    {isMaxLevel ? labels.common.max : `${xp} / ${xpForNextLevel} ${labels.common.xp}`}
                </span>
            </div>
            <div className="w-full bg-slate-900/60 rounded-full h-4 border border-slate-700/50 backdrop-blur-sm overflow-hidden shadow-inner">
                <div 
                    className="h-full rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)] relative transition-all duration-700 ease-out" 
                    style={{ 
                        width: `${progressPercentage}%`,
                        background: 'linear-gradient(90deg, #22d3ee, #3b82f6, #8b5cf6, #d946ef, #22d3ee)',
                        backgroundSize: '200% 100%',
                        animation: 'flowGradient 2s linear infinite'
                    }}
                >
                    {/* Glossy Effect Top Half */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-full"></div>
                </div>
            </div>
        </div>
    );
};

const SettingsView: React.FC<{
    settings: AppSettings;
    onUpdateSettings: (newSettings: AppSettings) => void;
    onBack: () => void;
    t: any;
}> = ({ settings, onUpdateSettings, onBack, t }) => {
    
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateSettings({ ...settings, volume: parseInt(e.target.value) });
    };

    const handleLanguageChange = (lang: Language) => {
        onUpdateSettings({ ...settings, language: lang });
    };

    return (
        <div className="max-w-md mx-auto w-full glass-panel rounded-3xl overflow-hidden animate-[fadeIn_0.5s_ease-out] p-8">
            <div className="flex items-center gap-3 mb-8">
                <button onClick={onBack} className="bg-slate-800/50 hover:bg-slate-700 p-2 rounded-full transition-colors text-slate-300">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-white">{t.settings.title}</h2>
            </div>

            <div className="space-y-8">
                {/* Volume Control */}
                <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-700/50">
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-widest mb-4">{t.settings.volume}</label>
                    <div className="flex items-center gap-4">
                        <VolumeMinIcon className="w-5 h-5 text-slate-500" />
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={settings.volume} 
                            onChange={handleVolumeChange}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                        />
                        <VolumeMaxIcon className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="text-right mt-2 text-xs font-mono text-slate-500">{settings.volume}%</div>
                </div>

                {/* Language Selection */}
                <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-700/50">
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-widest mb-4">{t.settings.language}</label>
                    <div className="flex flex-col gap-3">
                        {[
                            { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
                            { code: 'en', label: 'English', flag: '🇬🇧' },
                            { code: 'es', label: 'Español', flag: '🇪🇸' }
                        ].map((lang) => {
                            const isActive = settings.language === lang.code;
                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code as Language)}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                        isActive 
                                        ? 'bg-violet-600/20 border-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.2)]' 
                                        : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:bg-slate-800/60'
                                    }`}
                                >
                                    <span className="flex items-center gap-3 font-medium">
                                        <span className="text-xl">{lang.flag}</span>
                                        {lang.label}
                                    </span>
                                    {isActive && <div className="w-3 h-3 bg-violet-500 rounded-full shadow-[0_0_5px_rgba(139,92,246,1)]"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileView: React.FC<{
    userProgress: UserProgress;
    onUpdateProfile: (name: string, avatar: string) => void;
    onResetProgress: () => void;
    onBack: () => void;
    t: any;
}> = ({ userProgress, onUpdateProfile, onResetProgress, onBack, t }) => {
    const [name, setName] = useState(userProgress.username || 'Kosmos-Entdecker');
    const [selectedAvatar, setSelectedAvatar] = useState(userProgress.avatarId || 'astronaut');

    const handleSave = () => {
        onUpdateProfile(name, selectedAvatar);
        onBack();
    };

    const CurrentAvatarComp = AVATARS.find(a => a.id === selectedAvatar)?.component || AvatarAstronaut;

    const memorySummary = {
        user: name,
        level: userProgress.playerLevel,
        coins: userProgress.coins,
        progress: `${userProgress.highestLevelUnlocked - 1}/${TOTAL_LEVELS} Levels`,
        historySize: `${userProgress.askedQuestions.length} items`,
        lastDaily: userProgress.lastDailyChallengePlayed || 'Never'
    };

    return (
        <div className="max-w-2xl mx-auto w-full glass-panel rounded-3xl overflow-hidden animate-[fadeIn_0.5s_ease-out]">
             <div className="relative h-40 bg-gradient-to-b from-slate-900/80 to-transparent overflow-hidden">
                <HeaderCosmicBackground className="absolute inset-0 w-full h-full opacity-80" />
                <button onClick={onBack} className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors flex items-center gap-2 z-20 group">
                    <div className="bg-slate-900/50 p-2 rounded-full group-hover:bg-violet-600 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm tracking-wide">{t.common.back.toUpperCase()}</span>
                </button>
                
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full p-1.5 bg-gradient-to-b from-violet-500 to-fuchsia-600 shadow-[0_0_20px_rgba(139,92,246,0.6)]">
                    <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-white relative overflow-hidden">
                        <CurrentAvatarComp className="w-20 h-20 relative z-10" />
                        <div className="absolute inset-0 bg-violet-900/20 animate-pulse"></div>
                    </div>
                </div>
            </div>

            <div className="pt-16 px-8 pb-10">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 mb-1">{name || 'Spieler'}</h2>
                    <div className="inline-block px-3 py-1 rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider">
                        {t.profile.rank}: {t.common.level} {userProgress.playerLevel}
                    </div>
                </div>

                <div className="grid gap-8">
                    <div className="space-y-3">
                        <label className="block text-slate-300 text-xs font-bold uppercase tracking-widest ml-1">{t.profile.nameLabel}</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            maxLength={20}
                            className="w-full bg-slate-900/60 border border-slate-600 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-inner"
                            placeholder={t.profile.namePlaceholder}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-slate-300 text-xs font-bold uppercase tracking-widest ml-1">{t.profile.avatarLabel}</label>
                        <div className="grid grid-cols-4 gap-4">
                            {AVATARS.map(avatar => {
                                const Icon = avatar.component;
                                const isSelected = selectedAvatar === avatar.id;
                                return (
                                    <button 
                                        key={avatar.id}
                                        onClick={() => setSelectedAvatar(avatar.id)}
                                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 border transition-all duration-300 relative overflow-hidden group ${isSelected ? 'bg-violet-600/20 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)] transform scale-105' : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-700/60'}`}
                                    >
                                        <Icon className={`w-12 h-12 mb-2 transition-transform duration-300 ${isSelected ? 'text-white scale-110' : 'text-slate-400 group-hover:scale-110 group-hover:text-slate-200'}`}/>
                                        <span className={`text-[10px] font-bold uppercase tracking-wide ${isSelected ? 'text-violet-200' : 'text-slate-500'}`}>{t.profile.avatars[avatar.labelKey]}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-6 border-b border-slate-700/50 pb-4 flex items-center gap-2">
                            <TrophyIcon className="w-5 h-5 text-yellow-400" />
                            {t.profile.statsTitle}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                                <p className="text-3xl font-black text-yellow-400 mb-1">{userProgress.coins}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.common.coins}</p>
                            </div>
                            <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                                <p className="text-3xl font-black text-violet-400 mb-1">{userProgress.highestLevelUnlocked - 1}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.mainMenu.levelCompleted}</p>
                            </div>
                        </div>
                        <div className="mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">{t.profile.totalXp}: {userProgress.xp}</div>
                        <XPProgressBar 
                            level={userProgress.playerLevel} 
                            xp={userProgress.xp} 
                            xpForNextLevel={XP_FOR_NEXT_LEVEL(userProgress.playerLevel)}
                            labels={t}
                        />
                    </div>

                    <button 
                        onClick={handleSave}
                        className="w-full glass-button text-white font-bold py-4 rounded-xl transition-all transform hover:-translate-y-1 active:scale-95 text-lg tracking-wide"
                    >
                        {t.common.save}
                    </button>

                    <div className="mt-4 pt-6 border-t border-slate-700/50">
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            {t.profile.systemMemory}
                        </h3>
                        
                        <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-emerald-400/80 overflow-x-auto border border-slate-800 mb-4 shadow-inner">
                            {JSON.stringify(memorySummary, null, 2)}
                        </div>

                        <button 
                            onClick={onResetProgress}
                            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 hover:text-red-400 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide group"
                        >
                            <XCircleIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            {t.profile.resetMemory}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LevelPathView: React.FC<{
    userProgress: UserProgress;
    onSelectLevel: (level: number) => void;
    onUnlockGate: (level: number) => void;
    onFreePlayClick: () => void;
    onDailyChallengeClick: () => void;
    onProfileClick: () => void;
    onSettingsClick: () => void;
    t: any;
}> = ({ userProgress, onSelectLevel, onUnlockGate, onFreePlayClick, onDailyChallengeClick, onProfileClick, onSettingsClick, t }) => {
    const CurrentAvatar = AVATARS.find(a => a.id === (userProgress.avatarId || 'astronaut'))?.component || UserIcon;
    const isDailyAvailable = isDailyChallengeAvailable(userProgress.lastDailyChallengePlayed);
    
    return (
    <div className="text-center max-w-5xl mx-auto relative w-full px-4">
        <div className="flex justify-end mb-6 gap-3">
            <div className="glass-panel px-3 py-1.5 rounded-full text-white flex items-center gap-2 border border-amber-500/30 bg-amber-900/20 mr-auto">
                <CoinIcon className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-amber-100">{userProgress.coins}</span>
            </div>

            <button
                onClick={onSettingsClick}
                className="glass-panel p-2.5 rounded-full text-white hover:bg-slate-700/50 transition-all flex items-center justify-center group hover:scale-105 border border-slate-600/50"
                title={t.common.settings}
            >
                <SettingsIcon className="w-6 h-6 text-slate-300 group-hover:text-white group-hover:rotate-90 transition-transform duration-500" />
            </button>

            <button 
                onClick={onProfileClick}
                className="glass-panel px-1.5 py-1.5 pr-5 rounded-full text-white hover:bg-slate-700/50 transition-all flex items-center gap-3 group"
                title={t.common.profile}
            >
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <CurrentAvatar className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t.common.profile}</span>
                    <span className="text-sm font-bold text-white leading-none">{userProgress.username || 'Profil'}</span>
                </div>
            </button>
        </div>

        <div className="relative glass-panel rounded-3xl p-8 md:p-10 mb-10 overflow-hidden">
             <HeaderCosmicBackground className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay z-0" />
             
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50"></div>
             
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6 text-left">
                    <div className="p-4 bg-violet-900/30 rounded-2xl border border-violet-500/30 backdrop-blur-sm shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                        <KnowledgeGalaxyIcon className="w-12 h-12 text-violet-300" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg mb-1">
                            Quizo<span className="text-violet-400">.me</span>
                        </h1>
                        <p className="text-slate-400 font-medium tracking-wide">{t.mainMenu.subtitle}</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2">
                     <XPProgressBar 
                        level={userProgress.playerLevel} 
                        xp={userProgress.xp} 
                        xpForNextLevel={XP_FOR_NEXT_LEVEL(userProgress.playerLevel)} 
                        labels={t}
                    />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <button 
                onClick={onFreePlayClick}
                className="relative group w-full px-8 py-5 rounded-2xl overflow-hidden transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] border border-cyan-500/30"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/90 to-blue-600/90 group-hover:from-cyan-500 group-hover:to-blue-500 transition-colors"></div>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                <div className="relative z-10 flex items-center justify-center gap-3">
                    <StarIcon className="w-6 h-6 text-white" />
                    <div className="text-left">
                        <span className="block text-white font-bold text-lg tracking-wider leading-none">{t.mainMenu.freePlay}</span>
                        <span className="text-cyan-100 text-xs uppercase font-semibold tracking-wide">{t.mainMenu.freePlayDesc}</span>
                    </div>
                </div>
            </button>

            <button 
                onClick={onDailyChallengeClick}
                disabled={!isDailyAvailable}
                className={`relative group w-full px-8 py-5 rounded-2xl overflow-hidden transition-all border ${isDailyAvailable ? 'hover:scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] border-amber-500/30 cursor-pointer' : 'opacity-70 border-slate-600 cursor-not-allowed'}`}
            >
                {isDailyAvailable ? (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/90 to-orange-600/90 group-hover:from-amber-400 group-hover:to-orange-500 transition-colors"></div>
                ) : (
                    <div className="absolute inset-0 bg-slate-800/90"></div>
                )}
                
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                
                <div className="relative z-10 flex items-center justify-center gap-3">
                    {isDailyAvailable ? <FireIcon className="w-6 h-6 text-white" /> : <ClockIcon className="w-6 h-6 text-slate-400" />}
                    <div className="text-left">
                        <span className={`block font-bold text-lg tracking-wider leading-none ${isDailyAvailable ? 'text-white' : 'text-slate-300'}`}>
                            {t.mainMenu.dailyChallenge}
                        </span>
                        <span className={`${isDailyAvailable ? 'text-amber-100' : 'text-slate-400'} text-xs uppercase font-semibold tracking-wide`}>
                            {isDailyAvailable ? t.mainMenu.dailyChallengeDesc : t.mainMenu.dailyChallengeWait}
                        </span>
                    </div>
                    {!isDailyAvailable && (
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-500/20 p-1 rounded-full">
                            <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                         </div>
                    )}
                </div>
            </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map(level => {
                const isCompleted = level < userProgress.highestLevelUnlocked;
                const isCurrent = level === userProgress.highestLevelUnlocked;
                
                // Gate Logic
                const isGate = isGateLevel(level);
                const isGateUnlocked = userProgress.unlockedGates.includes(level);
                
                let isPlayable = false;
                let needsUnlock = false;

                if (isCurrent) {
                    if (isGate && !isGateUnlocked) {
                        needsUnlock = true;
                        isPlayable = false;
                    } else {
                        isPlayable = true;
                    }
                }

                let buttonClass = '';
                let innerContent = null;

                if (isCompleted) {
                    buttonClass = 'bg-emerald-900/40 border-emerald-600/50 text-emerald-400';
                    innerContent = (
                        <>
                            <span className="text-2xl font-bold opacity-50">{level}</span>
                            <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-1">
                                <CheckCircleIcon className="w-6 h-6 text-emerald-400 fill-emerald-900/50"/>
                            </div>
                        </>
                    );
                } else if (needsUnlock) {
                    // GATE LOCK STATE (Active)
                    buttonClass = 'bg-slate-800/80 border-amber-500/50 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]';
                    innerContent = (
                        <div className="flex flex-col items-center animate-bounce-slight">
                            <LockOpenIcon className="w-8 h-8 mb-1 text-amber-400"/>
                            <span className="text-xs font-bold uppercase tracking-wide">{t.mainMenu.buy}</span>
                            <div className="flex items-center text-xs font-mono mt-1 bg-black/40 px-2 py-0.5 rounded-full">
                                <CoinIcon className="w-3 h-3 mr-1" /> {LEVEL_GATE_COST}
                            </div>
                        </div>
                    );
                } else if (isCurrent) {
                    buttonClass = 'bg-violet-600 border-violet-400 text-white shadow-[0_0_25px_rgba(139,92,246,0.6)] scale-105 z-10 ring-4 ring-violet-500/20';
                    innerContent = (
                        <>
                             <span className="text-3xl font-black drop-shadow-md">{level}</span>
                             <div className="absolute top-0 left-0 w-full h-full bg-white/10 animate-pulse rounded-2xl"></div>
                        </>
                    );
                } else { 
                    // LOCKED STATE
                    if (isGate && !isGateUnlocked) {
                        // FUTURE LOCKED GATE (Preview)
                        buttonClass = 'bg-slate-900/60 border-amber-900/60 text-amber-700/60';
                        innerContent = (
                            <div className="flex flex-col items-center opacity-60">
                                <LockIcon className="w-6 h-6 mb-1"/>
                                <div className="flex items-center gap-1 text-[10px] font-bold">
                                    <CoinIcon className="w-3 h-3" />
                                    <span>{LEVEL_GATE_COST}</span>
                                </div>
                            </div>
                        );
                    } else {
                        // Standard Locked Level
                        buttonClass = 'bg-slate-800/40 border-slate-700/50 text-slate-600';
                        innerContent = <LockIcon className="w-8 h-8 opacity-50"/>;
                    }
                }
                
                return (
                    <button
                        key={level}
                        onClick={() => {
                            if (needsUnlock) {
                                onUnlockGate(level);
                            } else if (isPlayable) {
                                onSelectLevel(level);
                            }
                        }}
                        disabled={!isPlayable && !needsUnlock}
                        className={`relative w-full aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-sm group ${buttonClass} ${(isPlayable || needsUnlock) ? 'hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] cursor-pointer' : 'cursor-default'}`}
                    >
                        {innerContent}
                    </button>
                );
            })}
        </div>
    </div>
)};

const FreePlaySelectView: React.FC<{
    onSelectDifficulty: (difficulty: Difficulty) => void;
    onBack: () => void;
    t: any;
}> = ({ onSelectDifficulty, onBack, t }) => (
    <div className="text-center max-w-lg mx-auto glass-panel p-10 rounded-3xl animate-[fadeIn_0.5s_ease-out]">
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-violet-200 mb-2">{t.freePlay.title}</h2>
        <p className="text-slate-400 mb-8 font-medium">{t.freePlay.subtitle}</p>
        
        <div className="flex flex-col gap-5">
            {[
                { id: 'Leicht', label: t.freePlay.easy, color: 'from-emerald-500 to-emerald-700', hover: 'group-hover:shadow-emerald-500/50' },
                { id: 'Mittel', label: t.freePlay.medium, color: 'from-amber-500 to-amber-700', hover: 'group-hover:shadow-amber-500/50' },
                { id: 'Schwer', label: t.freePlay.hard, color: 'from-rose-500 to-rose-700', hover: 'group-hover:shadow-rose-500/50' }
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => onSelectDifficulty(item.id as Difficulty)}
                    className={`group relative overflow-hidden rounded-2xl p-1 transition-all duration-300 hover:scale-[1.02] shadow-lg ${item.hover}`}
                >
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                    <div className="relative bg-slate-900/90 rounded-xl py-5 px-6 flex items-center justify-center group-hover:bg-slate-900/0 transition-colors">
                        <span className="text-xl font-bold text-white tracking-widest uppercase group-hover:scale-110 transition-transform duration-300">{item.label}</span>
                    </div>
                </button>
            ))}
        </div>
         <button onClick={onBack} className="mt-8 text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto group">
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t.common.back}
        </button>
    </div>
);

const ErrorView: React.FC<{
    message: string | null;
    onRetry: () => void;
    onBack: () => void;
    t: any;
}> = ({ message, onRetry, onBack, t }) => {
    const isQuota = message?.includes("Limit") || message?.includes("429");
    
    return (
    <div className="text-center max-w-md mx-auto glass-panel p-10 rounded-3xl border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        <div className="bg-red-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <XCircleIcon className="w-12 h-12 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{t.error.title}</h3>
        <p className="text-slate-300 mb-8 leading-relaxed">{message || t.error.defaultMessage}</p>
        
        {isQuota && (
            <div className="bg-slate-900/60 p-4 rounded-xl mb-8 text-sm text-slate-400 border border-slate-700">
                <span className="block text-yellow-500 font-bold mb-1">{t.error.quotaTipTitle}</span>
                {t.error.quotaTipMessage}
            </div>
        )}

        <div className="flex flex-col gap-3">
            <button
                onClick={onRetry}
                className="glass-button text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all"
            >
                {t.common.retry}
            </button>
             <button
                onClick={onBack}
                className="px-6 py-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all font-semibold text-sm uppercase tracking-wider"
            >
                {t.common.abort}
            </button>
        </div>
    </div>
    );
};

const LoadingView: React.FC<{ t: any }> = ({ t }) => (
    <div className="flex flex-col items-center justify-center text-center animate-[fadeIn_1s_ease-out]">
        <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-violet-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-4 border-fuchsia-500/30 rounded-full"></div>
            <div className="absolute inset-4 border-4 border-b-fuchsia-500 border-t-transparent border-l-transparent border-r-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <KnowledgeGalaxyIcon className="absolute inset-0 m-auto w-8 h-8 text-white opacity-80 animate-pulse" />
        </div>
        <p className="text-white text-xl font-bold tracking-wide mb-2">{t.quiz.generating}</p>
        <p className="text-slate-400 text-sm">{t.quiz.generatingDesc}</p>
    </div>
);

const ScoreView: React.FC<{ 
    score: number;
    totalQuestions: number;
    level: number | null; 
    onRetry: () => void;
    onNextLevel: () => void;
    onGoToMap: () => void;
    onReview: () => void;
    xpGained: number;
    coinsGained: number;
    levelledUp: boolean;
    userProgress: UserProgress;
    isLevelPassed?: boolean;
    gameMode: GameMode;
    t: any;
}> = ({ score, totalQuestions, level, onRetry, onNextLevel, onGoToMap, onReview, xpGained, coinsGained, levelledUp, userProgress, isLevelPassed, gameMode, t }) => {
    const isFreePlay = gameMode === 'free_play';
    const isDaily = gameMode === 'daily_challenge';
    
    let title = '';
    if (isDaily) {
        title = t.mainMenu.dailyFinished;
    } else if (isFreePlay) {
        title = t.mainMenu.levelCompleted + '!'; 
    } else {
        title = `${t.common.level} ${level} ${isLevelPassed ? t.score.levelPassed : t.score.levelFailed}`;
    }

    const minScore = getMinScoreToPass(totalQuestions);

    return (
        <div className="text-center glass-panel p-8 md:p-12 rounded-3xl shadow-2xl max-w-xl mx-auto w-full animate-[scaleIn_0.3s_ease-out]">
            <div className="relative inline-block mb-6">
                {isLevelPassed === false && !isDaily && !isFreePlay ? (
                    <div className="w-28 h-28 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                        <XCircleIcon className="w-14 h-14 text-red-400" />
                    </div>
                ) : (
                    <div className="relative w-28 h-28 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                         <TrophyIcon className="w-14 h-14 text-yellow-400" />
                         <div className="absolute inset-0 rounded-full border-2 border-yellow-300 opacity-50 animate-ping"></div>
                    </div>
                )}
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">{title}</h2>
            
            {!isFreePlay && !isDaily && (
                 <p className="text-slate-300 text-lg mb-8 font-medium">
                    {isLevelPassed 
                        ? t.score.victoryMessage
                        : t.score.defeatMessage.replace('{score}', minScore.toString())}
                </p>
            )}

            {isDaily && (
                <p className="text-amber-300 text-lg mb-8 font-medium">
                   {t.score.dailyMessage}
                </p>
            )}
            
            <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-2xl mb-8 flex justify-around items-center">
                <div className="text-center">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{t.score.resultLabel}</p>
                    <p className="text-white text-4xl font-black">{score} <span className="text-slate-500 text-2xl">/ {totalQuestions}</span></p>
                </div>
                
                {!isFreePlay && (isLevelPassed || isDaily) && (
                     <div className="text-center border-l border-slate-700 pl-6">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{t.score.rewardLabel}</p>
                        <div className="flex flex-col gap-1">
                            <p className="text-violet-400 font-black text-lg drop-shadow-md flex items-center justify-center gap-1">
                                +{xpGained} <span className="text-xs uppercase">{t.common.xp}</span>
                            </p>
                            {coinsGained > 0 && (
                                <p className="text-amber-400 font-black text-lg drop-shadow-md flex items-center justify-center gap-1">
                                    <CoinIcon className="w-4 h-4" /> +{coinsGained}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {!isFreePlay && levelledUp && (
                <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/30 p-4 rounded-xl mb-8 animate-bounce-slight">
                    <div className="flex items-center justify-center gap-3 text-emerald-300 font-bold text-xl">
                        <StarIcon className="w-6 h-6 fill-emerald-300 text-emerald-300 animate-spin-slow"/>
                        <span>{t.score.levelUp}</span>
                        <StarIcon className="w-6 h-6 fill-emerald-300 text-emerald-300 animate-spin-slow"/>
                    </div>
                </div>
            )}
            
            {!isFreePlay && (isLevelPassed || isDaily) && <XPProgressBar
                 level={userProgress.playerLevel} 
                 xp={userProgress.xp} 
                 xpForNextLevel={XP_FOR_NEXT_LEVEL(userProgress.playerLevel)}
                 className="mb-8"
                 labels={t}
            />}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <button
                    onClick={onReview}
                    className="bg-slate-700/50 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-xl transition-all border border-slate-600"
                >
                    {t.score.review}
                </button>

                {isFreePlay ? (
                    <button
                        onClick={onRetry}
                        className="glass-button text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <RepeatIcon className="w-5 h-5"/> {t.score.playAgain}
                    </button>
                ) : isDaily ? (
                    <button
                        onClick={onGoToMap}
                        className="glass-button text-white font-bold py-4 px-6 rounded-xl transition-all"
                    >
                        {t.common.back}
                    </button>
                ) : isLevelPassed ? (
                    level && level < TOTAL_LEVELS && (
                        <button
                            onClick={onNextLevel}
                            className="glass-button text-white font-bold py-4 px-6 rounded-xl transition-all"
                        >
                            {t.score.nextLevel}
                        </button>
                    )
                ) : (
                     <button
                        onClick={onRetry}
                        className="glass-button text-white font-bold py-4 px-6 rounded-xl transition-all"
                    >
                        {t.score.retryLevel}
                    </button>
                )}
                
                {!isDaily && (
                <button
                    onClick={onGoToMap}
                    className="sm:col-span-2 text-slate-400 hover:text-white py-2 text-sm font-bold uppercase tracking-widest transition-colors mt-2"
                >
                    {isFreePlay ? t.score.backToMenu : t.score.backToMap}
                </button>
                )}
            </div>
        </div>
    );
};


const QuizView: React.FC<{
    title: string;
    questions: QuizQuestion[];
    currentQuestionIndex: number;
    handleAnswerSelect: (answer: string) => void;
    handleNextQuestion: () => void;
    selectedAnswer: string | null;
    onAbort: () => void;
    abortButtonLabel: string;
    userCoins: number;
    onUseHint: (cost: number) => boolean;
    t: any;
}> = ({ title, questions, currentQuestionIndex, handleAnswerSelect, handleNextQuestion, selectedAnswer, onAbort, abortButtonLabel, userCoins, onUseHint, t }) => {
    const question = questions[currentQuestionIndex];
    const isAnswered = selectedAnswer !== null;
    const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);

    useEffect(() => {
        setHiddenOptions([]);
    }, [currentQuestionIndex]);

    const handleHintClick = () => {
        if (hiddenOptions.length > 0) return;
        if (userCoins < HINT_COST) {
            alert(t.mainMenu.notEnoughCoins);
            return;
        }

        const success = onUseHint(HINT_COST);
        if (success) {
            const incorrectOptions = question.options.filter(opt => opt !== question.correctAnswer);
            // Shuffle incorrect options to pick 2 random ones
            const shuffledIncorrect = [...incorrectOptions].sort(() => 0.5 - Math.random());
            const optionsToHide = shuffledIncorrect.slice(0, 2);
            setHiddenOptions(optionsToHide);
        }
    };

    const isHintDisabled = hiddenOptions.length > 0 || isAnswered || userCoins < HINT_COST;

    return (
        <div className="glass-panel p-6 md:p-10 rounded-3xl shadow-2xl max-w-4xl w-full mx-auto flex flex-col min-h-[600px] relative overflow-hidden">
            {/* Background glow decoration */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex-grow relative z-10">
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-3">
                        <div className="flex flex-col gap-2">
                            <span className="font-bold text-slate-400 text-sm uppercase tracking-wider">{title}</span>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-900/20 w-fit">
                                <CoinIcon className="w-4 h-4 text-amber-400" />
                                <span className="font-bold text-amber-100 text-sm">{userCoins}</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <span className="text-3xl font-black text-white">{currentQuestionIndex + 1}</span>
                             <span className="text-slate-500 text-lg font-medium">/{questions.length}</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-900/50 rounded-full h-2 overflow-hidden">
                        <div className="bg-violet-500 h-2 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(139,92,246,0.8)]" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                    </div>
                </div>

                <h2 className="text-2xl md:text-4xl font-bold text-white mb-10 leading-tight drop-shadow-md min-h-[100px] flex items-center">
                    {question.question}
                </h2>

                {/* HINT BUTTON */}
                <div className="flex justify-end mb-4">
                    <button 
                        onClick={handleHintClick}
                        disabled={isHintDisabled}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all border ${
                            isHintDisabled 
                            ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed opacity-70' 
                            : 'bg-amber-900/40 border-amber-500/50 text-amber-400 hover:bg-amber-900/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        }`}
                    >
                        <LightbulbIcon className={`w-4 h-4 ${!isHintDisabled ? 'fill-amber-400/20' : ''}`} />
                        <span>{t.quiz.useHint}</span>
                        <span className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full ml-1 text-xs font-mono">
                            <CoinIcon className="w-3 h-3" /> {HINT_COST}
                        </span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                    {question.options.map((option, index) => {
                        const isCorrect = option === question.correctAnswer;
                        const isSelected = option === selectedAnswer;
                        const isHidden = hiddenOptions.includes(option);
                        
                        let buttonClass = 'bg-slate-800/40 hover:bg-slate-700/60 border-slate-600/50 text-slate-200';
                        let shadowClass = 'hover:shadow-lg hover:border-slate-400';
                        
                        if (isAnswered) {
                            shadowClass = '';
                            if (isCorrect) {
                                buttonClass = 'bg-emerald-900/60 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]';
                            } else if (isSelected) {
                                buttonClass = 'bg-red-900/60 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]';
                            } else {
                                buttonClass = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-50';
                            }
                        }

                        if (isHidden) {
                            // Hidden style
                            return (
                                <div key={index} className="w-full p-5 rounded-2xl border-2 border-slate-800 bg-slate-900/20 opacity-30 flex items-center justify-between select-none pointer-events-none">
                                    <span className="text-lg blur-[2px]">{option}</span>
                                </div>
                            )
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(option)}
                                disabled={isAnswered || isHidden}
                                className={`w-full p-5 rounded-2xl text-left font-semibold transition-all duration-200 border-2 flex items-center justify-between group ${buttonClass} ${shadowClass} active:scale-[0.98]`}
                            >
                                <span className="text-lg">{option}</span>
                                {isAnswered && isCorrect && <CheckCircleIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />}
                                {isAnswered && isSelected && !isCorrect && <XCircleIcon className="w-6 h-6 text-red-400 flex-shrink-0" />}
                                {!isAnswered && <div className="w-4 h-4 rounded-full border-2 border-slate-600 group-hover:border-white transition-colors"></div>}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mt-auto h-16 flex items-center justify-center relative z-10">
                <button 
                    onClick={onAbort} 
                    className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-medium uppercase tracking-wide text-sm"
                    aria-label={t.quiz.abortLabel}
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{abortButtonLabel}</span>
                </button>

                {isAnswered && (
                    <button
                        onClick={handleNextQuestion}
                        className="glass-button text-white font-bold py-4 px-12 rounded-full transition-all duration-300 text-lg animate-[fadeIn_0.3s_ease-out] hover:scale-105"
                    >
                        {currentQuestionIndex < questions.length - 1 ? t.quiz.nextQuestion : t.quiz.showResult}
                    </button>
                )}
            </div>
        </div>
    );
};

const ReviewView: React.FC<{
    questions: QuizQuestion[];
    userAnswers: Map<number, string>;
    onBack: () => void;
    t: any;
}> = ({ questions, userAnswers, onBack, t }) => {
    return (
        <div className="glass-panel p-6 md:p-10 rounded-3xl shadow-2xl max-w-4xl w-full mx-auto h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-8 shrink-0">
                <h2 className="text-3xl font-bold text-white">{t.score.review}</h2>
                <button
                    onClick={onBack}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-full transition-all border border-slate-600 text-sm"
                >
                    {t.common.close}
                </button>
            </div>
            <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar flex-grow">
                {questions.map((q, index) => {
                    const userAnswer = userAnswers.get(index);
                    const wasCorrect = userAnswer === q.correctAnswer;

                    return (
                        <div key={index} className="bg-slate-900/40 p-6 rounded-2xl border border-slate-700/50">
                            <p className="font-bold text-slate-200 text-lg mb-4 flex gap-3">
                                <span className="text-violet-400 font-mono">#{index + 1}</span>
                                {q.question}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q.options.map((option, optIndex) => {
                                    const isCorrectAnswer = option === q.correctAnswer;
                                    const isUserAnswer = option === userAnswer;
                                    
                                    let optionClass = 'bg-slate-800/30 text-slate-400 border-slate-800';
                                    let icon = null;

                                    if (isCorrectAnswer) {
                                        optionClass = 'bg-emerald-900/30 border-emerald-600/50 text-white font-semibold shadow-[0_0_10px_rgba(16,185,129,0.1)]';
                                        icon = <CheckCircleIcon className="w-5 h-5 ml-auto text-emerald-400" />;
                                    } else if (isUserAnswer && !wasCorrect) {
                                        optionClass = 'bg-red-900/30 border-red-600/50 text-white font-semibold opacity-70';
                                        icon = <XCircleIcon className="w-5 h-5 ml-auto text-red-400" />;
                                    } else {
                                        optionClass = 'bg-slate-800/30 text-slate-500 border-slate-800/50 opacity-60';
                                    }
                                    
                                    return (
                                        <div key={optIndex} className={`p-3 px-4 rounded-xl border flex items-center ${optionClass}`}>
                                            <span>{option}</span>
                                            {icon}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('level_select');
    const [gameMode, setGameMode] = useState<GameMode>('level_path');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentLevelPlaying, setCurrentLevelPlaying] = useState<number | null>(null);
    const [lastFreePlayDifficulty, setLastFreePlayDifficulty] = useState<Difficulty | null>(null);
    const [lastFreePlayPreviousQuestions, setLastFreePlayPreviousQuestions] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [userAnswers, setUserAnswers] = useState<Map<number, string>>(new Map());
    const [error, setError] = useState<string | null>(null);
    const [settings, setSettings] = useState<AppSettings>({ volume: 50, language: 'de' });
    
    const [userProgress, setUserProgress] = useState<UserProgress>({ 
        playerLevel: 1, 
        xp: 0,
        coins: 0,
        highestLevelUnlocked: 1, 
        unlockedGates: [],
        askedQuestions: [],
        username: 'Kosmos-Entdecker',
        avatarId: 'astronaut',
        lastDailyChallengePlayed: undefined
    });
    const [lastRoundXpGained, setLastRoundXpGained] = useState(0);
    const [lastRoundCoinsGained, setLastRoundCoinsGained] = useState(0);
    const [levelledUp, setLevelledUp] = useState(false);
    const [lastQuizPassed, setLastQuizPassed] = useState(false);
    const [activeLevelAttempt, setActiveLevelAttempt] = useState<{ level: number, questions: QuizQuestion[] } | null>(null);

    // Get translations for current language
    const t = translations[settings.language];

    useEffect(() => {
        try {
            const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedProgress) {
                const parsed = JSON.parse(savedProgress);
                if(parsed.playerLevel && parsed.highestLevelUnlocked) {
                    setUserProgress({
                        ...parsed,
                        coins: parsed.coins || 0, // Default to 0 for existing users
                        unlockedGates: Array.isArray(parsed.unlockedGates) ? parsed.unlockedGates : [],
                        playerLevel: Math.min(parsed.playerLevel, MAX_PLAYER_LEVEL),
                        askedQuestions: Array.isArray(parsed.askedQuestions) ? parsed.askedQuestions : [],
                        username: parsed.username || 'Kosmos-Entdecker',
                        avatarId: parsed.avatarId || 'astronaut',
                        lastDailyChallengePlayed: parsed.lastDailyChallengePlayed
                    });
                }
            }

            const savedSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }
        } catch (e) {
            console.error("Failed to load user data:", e);
        }
    }, []);

    const handleUpdateProfile = (name: string, avatar: string) => {
        const newProgress = {
            ...userProgress,
            username: name,
            avatarId: avatar
        };
        setUserProgress(newProgress);
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProgress));
        } catch (e) { console.error("Failed to save user progress:", e); }
    };

    const handleUpdateSettings = (newSettings: AppSettings) => {
        setSettings(newSettings);
        try {
            localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(newSettings));
        } catch (e) { console.error("Failed to save settings:", e); }
    };

    const handleResetProgress = () => {
        if (window.confirm(t.profile.resetConfirm)) {
            const initialProgress: UserProgress = {
                playerLevel: 1,
                xp: 0,
                coins: 0,
                highestLevelUnlocked: 1,
                unlockedGates: [],
                askedQuestions: [],
                username: 'Kosmos-Entdecker',
                avatarId: 'astronaut',
                lastDailyChallengePlayed: undefined
            };
            setUserProgress(initialProgress);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setGameState('level_select'); 
        }
    };

    const resetQuizState = () => {
        setLastRoundXpGained(0);
        setLastRoundCoinsGained(0);
        setLevelledUp(false);
        setLastQuizPassed(false);
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setUserAnswers(new Map());
    };

    const selectLevel = useCallback(async (level: number) => {
        // Double check Gate logic
        if (isGateLevel(level) && !userProgress.unlockedGates.includes(level)) {
            alert(t.mainMenu.unlockGateDesc.replace('{cost}', LEVEL_GATE_COST.toString()));
            return;
        }

        setGameMode('level_path');
        setCurrentLevelPlaying(level);
        setGameState('loading');
        setError(null);
        resetQuizState();

        try {
            let questionsToPlay: QuizQuestion[];

            if (activeLevelAttempt && activeLevelAttempt.level === level) {
                questionsToPlay = activeLevelAttempt.questions;
            } else {
                const fetchedQuestions = await fetchQuizQuestions(level, userProgress.askedQuestions, settings.language);
                questionsToPlay = fetchedQuestions;
                setActiveLevelAttempt({ level: level, questions: fetchedQuestions });
            }
            
            setQuestions(questionsToPlay);
            setGameState('playing');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten.');
            setGameState('error_view');
            setActiveLevelAttempt(null);
        }
    }, [userProgress.askedQuestions, userProgress.unlockedGates, activeLevelAttempt, settings.language, t]);

    const handleUnlockGate = (level: number) => {
        if (userProgress.coins >= LEVEL_GATE_COST) {
            if(window.confirm(`${t.mainMenu.unlockGate} (${LEVEL_GATE_COST} ${t.common.coins})?`)) {
                const newProgress = {
                    ...userProgress,
                    coins: userProgress.coins - LEVEL_GATE_COST,
                    unlockedGates: [...userProgress.unlockedGates, level]
                };
                setUserProgress(newProgress);
                try {
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProgress));
                } catch (e) { console.error("Failed to save progress:", e); }
            }
        } else {
            alert(t.mainMenu.notEnoughCoins);
        }
    };

    const handleDeductCoins = (amount: number): boolean => {
        if (userProgress.coins >= amount) {
            const newProgress = { ...userProgress, coins: userProgress.coins - amount };
            setUserProgress(newProgress);
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProgress));
            } catch (e) { console.error("Failed to save progress:", e); }
            return true;
        }
        return false;
    };

    const startFreePlay = useCallback(async (difficulty: Difficulty, previousQuestions: string[] = []) => {
        setGameMode('free_play');
        setCurrentLevelPlaying(null);
        setLastFreePlayDifficulty(difficulty);
        setGameState('loading');
        setError(null);
        resetQuizState();
        
        try {
            const fetchedQuestions = await fetchFreePlayQuizQuestions(difficulty, previousQuestions, settings.language);
            setQuestions(fetchedQuestions);
            setGameState('playing');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten.');
            setGameState('error_view');
        }
    }, [settings.language]);

    const startDailyChallenge = useCallback(async () => {
        if (!isDailyChallengeAvailable(userProgress.lastDailyChallengePlayed)) return;

        setGameMode('daily_challenge');
        setCurrentLevelPlaying(null);
        setGameState('loading');
        setError(null);
        resetQuizState();

        try {
            const fetchedQuestions = await fetchDailyChallengeQuestions(userProgress.askedQuestions, settings.language);
            setQuestions(fetchedQuestions);
            setGameState('playing');
        } catch (err) {
             setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten.');
             setGameState('error_view');
        }
    }, [userProgress.lastDailyChallengePlayed, userProgress.askedQuestions, settings.language]);


    const handleAnswerSelect = (answer: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(answer);
        setUserAnswers(prev => new Map(prev).set(currentQuestionIndex, answer));
        if (answer === questions[currentQuestionIndex].correctAnswer) {
            setScore(prevScore => prevScore + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            setSelectedAnswer(null);
        } else {
            const minScore = getMinScoreToPass(questions.length);
            const passed = score >= minScore;
            setLastQuizPassed(passed);

            if(gameMode === 'level_path' && currentLevelPlaying) {
                if (passed) {
                    const newQuestionStrings = questions.map(q => q.question);
                    const updatedAskedQuestions = [...userProgress.askedQuestions, ...newQuestionStrings].slice(-MAX_QUESTION_HISTORY);
                    
                    const xpGained = Math.floor((score / questions.length) * BASE_XP_PER_LEVEL);
                    setLastRoundXpGained(xpGained);
                    setLastRoundCoinsGained(COINS_PER_LEVEL_WIN);

                    let newXp = userProgress.xp + xpGained;
                    let newPlayerLevel = userProgress.playerLevel;
                    let didLevelUp = false;
                    let xpNeededForNextLevel = XP_FOR_NEXT_LEVEL(newPlayerLevel);
                    
                    while (newXp >= xpNeededForNextLevel) {
                        if (newPlayerLevel >= MAX_PLAYER_LEVEL) {
                            break; 
                        }
                        newXp -= xpNeededForNextLevel;
                        newPlayerLevel++;
                        didLevelUp = true;
                        xpNeededForNextLevel = XP_FOR_NEXT_LEVEL(newPlayerLevel);
                    }

                    const newHighestLevel = (currentLevelPlaying === userProgress.highestLevelUnlocked)
                        ? userProgress.highestLevelUnlocked + 1
                        : userProgress.highestLevelUnlocked;
                    
                    const newProgress: UserProgress = { 
                        ...userProgress,
                        playerLevel: newPlayerLevel, 
                        xp: newXp,
                        coins: userProgress.coins + COINS_PER_LEVEL_WIN,
                        highestLevelUnlocked: Math.min(newHighestLevel, TOTAL_LEVELS + 1),
                        askedQuestions: updatedAskedQuestions
                    };
                    setUserProgress(newProgress);
                    setLevelledUp(didLevelUp);
                    setActiveLevelAttempt(null); 
                    
                    try {
                        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProgress));
                    } catch (e) { console.error("Failed to save user progress:", e); }
                }
            } else if (gameMode === 'daily_challenge') {
                const newQuestionStrings = questions.map(q => q.question);
                const updatedAskedQuestions = [...userProgress.askedQuestions, ...newQuestionStrings].slice(-MAX_QUESTION_HISTORY);
                const today = new Date().toISOString().split('T')[0];
                
                const maxDailyXP = 100;
                const xpGained = Math.floor((score / questions.length) * maxDailyXP);
                setLastRoundXpGained(xpGained);
                setLastRoundCoinsGained(COINS_DAILY_CHALLENGE);

                let newXp = userProgress.xp + xpGained;
                let newPlayerLevel = userProgress.playerLevel;
                let didLevelUp = false;
                let xpNeededForNextLevel = XP_FOR_NEXT_LEVEL(newPlayerLevel);
                
                while (newXp >= xpNeededForNextLevel) {
                    if (newPlayerLevel >= MAX_PLAYER_LEVEL) {
                        break; 
                    }
                    newXp -= xpNeededForNextLevel;
                    newPlayerLevel++;
                    didLevelUp = true;
                    xpNeededForNextLevel = XP_FOR_NEXT_LEVEL(newPlayerLevel);
                }

                const newProgress: UserProgress = {
                    ...userProgress,
                    playerLevel: newPlayerLevel,
                    xp: newXp,
                    coins: userProgress.coins + COINS_DAILY_CHALLENGE,
                    askedQuestions: updatedAskedQuestions,
                    lastDailyChallengePlayed: today
                };
                setUserProgress(newProgress);
                setLevelledUp(didLevelUp);
                
                try {
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProgress));
                } catch (e) { console.error("Failed to save user progress:", e); }

            } else { // gameMode === 'free_play'
                const newQuestionStrings = questions.map(q => q.question);
                setLastFreePlayPreviousQuestions(newQuestionStrings);
            }
            setGameState('finished');
        }
    };
    
    const goToLevelSelect = () => {
        setGameState('level_select');
        setGameMode('level_path');
        setCurrentLevelPlaying(null);
        setLastFreePlayPreviousQuestions([]);
        setError(null); 
    };

    const retryLevel = () => {
        if (gameMode === 'level_path' && currentLevelPlaying) {
            selectLevel(currentLevelPlaying);
        } else if (gameMode === 'free_play' && lastFreePlayDifficulty) {
            startFreePlay(lastFreePlayDifficulty, lastFreePlayPreviousQuestions);
        }
    };
    
    const nextLevel = () => {
        if (gameMode === 'level_path' && currentLevelPlaying && currentLevelPlaying < TOTAL_LEVELS) {
            const nextLvl = currentLevelPlaying + 1;
            if (isGateLevel(nextLvl) && !userProgress.unlockedGates.includes(nextLvl)) {
                // Cannot proceed automatically to a locked gate
                goToLevelSelect();
            } else {
                selectLevel(nextLvl);
            }
        }
    };

    const handleAbortQuiz = () => {
        setActiveLevelAttempt(null);
        if (gameMode === 'free_play') {
            setGameState('free_play_select');
        } else {
            setGameState('level_select');
        }
    };

    const renderContent = () => {
        switch (gameState) {
            case 'loading':
                return <LoadingView t={t} />;
            case 'playing':
                return questions.length > 0 && <QuizView 
                    title={gameMode === 'level_path' && currentLevelPlaying ? `${t.common.level} ${currentLevelPlaying}` : gameMode === 'daily_challenge' ? t.mainMenu.dailyChallenge : `${t.freePlay.title}: ${t.freePlay[lastFreePlayDifficulty === 'Leicht' ? 'easy' : lastFreePlayDifficulty === 'Mittel' ? 'medium' : 'hard']}`}
                    questions={questions}
                    currentQuestionIndex={currentQuestionIndex}
                    handleAnswerSelect={handleAnswerSelect}
                    handleNextQuestion={handleNextQuestion}
                    selectedAnswer={selectedAnswer}
                    onAbort={handleAbortQuiz}
                    abortButtonLabel={gameMode === 'level_path' ? t.quiz.abortLabel : t.freePlay.toSelect}
                    userCoins={userProgress.coins}
                    onUseHint={handleDeductCoins}
                    t={t}
                />;
            case 'finished':
                return <ScoreView 
                    score={score}
                    totalQuestions={questions.length}
                    level={currentLevelPlaying}
                    onRetry={retryLevel}
                    onNextLevel={nextLevel}
                    onGoToMap={goToLevelSelect}
                    onReview={() => setGameState('reviewing')}
                    xpGained={lastRoundXpGained}
                    coinsGained={lastRoundCoinsGained}
                    levelledUp={levelledUp}
                    userProgress={userProgress}
                    isLevelPassed={lastQuizPassed}
                    gameMode={gameMode}
                    t={t}
                />;
            case 'reviewing':
                return <ReviewView
                    questions={questions}
                    userAnswers={userAnswers}
                    onBack={() => setGameState('finished')}
                    t={t}
                />;
            case 'error_view':
                return <ErrorView 
                    message={error} 
                    onRetry={() => {
                        if (gameMode === 'level_path' && currentLevelPlaying) {
                            selectLevel(currentLevelPlaying);
                        } else if (gameMode === 'free_play' && lastFreePlayDifficulty) {
                            startFreePlay(lastFreePlayDifficulty, lastFreePlayPreviousQuestions);
                        } else if (gameMode === 'daily_challenge') {
                            startDailyChallenge();
                        } else {
                             goToLevelSelect();
                        }
                    }}
                    onBack={goToLevelSelect}
                    t={t}
                />;
            case 'free_play_select':
                return <FreePlaySelectView onSelectDifficulty={(diff) => startFreePlay(diff)} onBack={goToLevelSelect} t={t} />;
            case 'profile':
                return <ProfileView 
                    userProgress={userProgress}
                    onUpdateProfile={handleUpdateProfile}
                    onResetProgress={handleResetProgress}
                    onBack={goToLevelSelect}
                    t={t}
                />;
            case 'settings':
                return <SettingsView 
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                    onBack={goToLevelSelect}
                    t={t}
                />;
            case 'level_select':
            default:
                return <LevelPathView
                    userProgress={userProgress}
                    onSelectLevel={selectLevel}
                    onUnlockGate={handleUnlockGate}
                    onFreePlayClick={() => setGameState('free_play_select')}
                    onDailyChallengeClick={startDailyChallenge}
                    onProfileClick={() => setGameState('profile')}
                    onSettingsClick={() => setGameState('settings')}
                    t={t}
                />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-x-hidden">
            <main className="w-full py-8 relative z-10">
                {error && gameState !== 'error_view' && (
                    <div className="bg-red-500/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl mb-6 max-w-md mx-auto text-center shadow-lg border border-red-400/50 animate-bounce-slight" role="alert">
                        <strong>{t.common.error}:</strong> {error}
                    </div>
                )}
                {renderContent()}
            </main>
        </div>
    );
};

export default App;