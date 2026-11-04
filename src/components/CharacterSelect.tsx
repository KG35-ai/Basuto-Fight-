import React, { useState } from 'react';
import { CharacterProfile, GameMode, Stage } from '../types/fighter';
import { CHARACTERS } from '../data/characters';
import { STAGES } from '../data/stages';
import { AIDifficulty } from '../engine/ai';
import { Shield, Zap, Flame, Snowflake, Wind, Sparkles, Trophy, Users, Dumbbell, Compass, Volume2, VolumeX, BookOpen } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface CharacterSelectProps {
  onStartFight: (p1: CharacterProfile, p2: CharacterProfile, stage: Stage, mode: GameMode, difficulty: AIDifficulty) => void;
  onOpenCodex: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  onStartFight,
  onOpenCodex,
  isMuted,
  onToggleMute,
}) => {
  const [selectedP1Index, setSelectedP1Index] = useState(0);
  const [selectedP2Index, setSelectedP2Index] = useState(1);
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('ARCADE');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('warrior');
  const [activeTab, setActiveTab] = useState<'p1' | 'p2'>('p1');

  const p1 = CHARACTERS[selectedP1Index];
  const p2 = CHARACTERS[selectedP2Index];
  const activeChar = activeTab === 'p1' ? p1 : p2;
  const currentStage = STAGES[selectedStageIndex];

  const handleSelectChar = (index: number) => {
    soundEngine.playMelamuClack();
    if (activeTab === 'p1') {
      setSelectedP1Index(index);
      if (gameMode === 'ARCADE' || gameMode === 'TRAINING') {
        // Automatically pick someone else for opponent
        setSelectedP2Index((index + 1) % CHARACTERS.length);
      }
    } else {
      setSelectedP2Index(index);
    }
  };

  const handleLaunch = () => {
    soundEngine.playSuperFlash();
    soundEngine.announce('Round 1! Fight!');
    onStartFight(p1, p2, currentStage, gameMode, difficulty);
  };

  const getElementIcon = (elem: string) => {
    switch (elem) {
      case 'thunder': return <Zap className="w-4 h-4 text-sky-400" />;
      case 'fire': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'ice': return <Snowflake className="w-4 h-4 text-cyan-300" />;
      case 'wind': return <Wind className="w-4 h-4 text-pink-400" />;
      default: return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-stone-950 text-stone-100 flex flex-col justify-between overflow-x-hidden selection:bg-amber-600">
      {/* Top Header Bar */}
      <header className="border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md px-6 py-4 flex items-center justify-between gap-8 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-amber-500/80 bg-amber-950/40 flex items-center justify-center">
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-cinzel font-black text-xl text-amber-200 tracking-wider whitespace-nowrap">
            SEVEN PEAKS ASCENSION
          </span>
        </div>

        {/* Game Mode Selector Buttons */}
        <div className="hidden md:flex items-center gap-1.5 p-1 bg-stone-900 border border-stone-800 rounded-lg">
          <button
            onClick={() => { soundEngine.playBlanketWhoosh(); setGameMode('ARCADE'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-cinzel font-bold transition-all whitespace-nowrap ${
              gameMode === 'ARCADE' ? 'bg-amber-600 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Arcade Ladder
          </button>
          <button
            onClick={() => { soundEngine.playBlanketWhoosh(); setGameMode('VERSUS'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-cinzel font-bold transition-all whitespace-nowrap ${
              gameMode === 'VERSUS' ? 'bg-amber-600 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Versus (PvP / CPU)
          </button>
          <button
            onClick={() => { soundEngine.playBlanketWhoosh(); setGameMode('TRAINING'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-cinzel font-bold transition-all whitespace-nowrap ${
              gameMode === 'TRAINING' ? 'bg-amber-600 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            Training Dojo
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCodex}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 text-xs text-amber-300 font-cinzel font-semibold transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Basotho Lore</span>
          </button>
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Roster & Fighter Stage Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Character Showcase Portrait (The user's authentic high-res character artwork!) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl overflow-hidden border border-stone-800 bg-stone-900/60 shadow-2xl relative min-h-[460px]">
          {/* Background Artwork */}
          <div className="relative w-full h-[320px] sm:h-[360px] overflow-hidden bg-stone-950">
            <img
              src={activeChar.image}
              alt={activeChar.name}
              className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-stone-950/80 border border-stone-700/80 text-xs font-cinzel font-bold text-amber-400 flex items-center gap-1.5 shadow">
                {getElementIcon(activeChar.element)}
                {activeChar.element.toUpperCase()}
              </span>
              <span className="px-2.5 py-1 rounded bg-stone-950/80 border border-stone-700/80 text-xs text-stone-300">
                {activeChar.clan}
              </span>
            </div>

            {/* Fighter Name Banner Over Image */}
            <div className="absolute bottom-4 inset-x-4">
              <h2 className="font-cinzel font-black text-2xl sm:text-3xl text-amber-200 tracking-wider">
                {activeChar.name}
              </h2>
              <p className="font-cinzel text-xs text-amber-400/90 font-bold uppercase tracking-widest">
                {activeChar.sesothoTitle}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">{activeChar.title}</p>
            </div>
          </div>

          {/* Character Combat Data & Blanket Motif */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-stone-950/90 border-t border-stone-800/80">
            <div>
              <div className="mb-3">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                  Traditional Kobo Blanket & Weapon:
                </span>
                <p className="text-xs text-amber-300 font-medium">{activeChar.blanketMotif}</p>
                <p className="text-xs text-stone-300 mt-0.5">{activeChar.weapon}</p>
              </div>

              {/* Combat Stats Bars */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-stone-400 mb-0.5">
                    <span>ATTACK</span>
                    <span className="font-mono-num text-amber-400">{activeChar.stats.attack}/10</span>
                  </div>
                  <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${activeChar.stats.attack * 10}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-stone-400 mb-0.5">
                    <span>DEFENSE</span>
                    <span className="font-mono-num text-blue-400">{activeChar.stats.defense}/10</span>
                  </div>
                  <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${activeChar.stats.defense * 10}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-stone-400 mb-0.5">
                    <span>SPEED</span>
                    <span className="font-mono-num text-emerald-400">{activeChar.stats.speed}/10</span>
                  </div>
                  <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeChar.stats.speed * 10}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-stone-400 mb-0.5">
                    <span>SPIRIT</span>
                    <span className="font-mono-num text-purple-400">{activeChar.stats.spirit}/10</span>
                  </div>
                  <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${activeChar.stats.spirit * 10}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Special & Ascension Art Preview */}
            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-stone-500 uppercase tracking-widest block">Ascension Super Art</span>
                <span className="font-cinzel font-bold text-amber-400">{activeChar.moves.super.sesothoName}</span>
              </div>
              <span className="text-right text-[11px] text-stone-400 font-mono-num">
                {activeChar.moves.super.damage} DMG
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Roster Grid, Stage Select, and Launch Controls */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          {/* P1 / P2 Slot Selector (For Versus Mode) */}
          {gameMode === 'VERSUS' && (
            <div className="flex items-center gap-2 p-1 bg-stone-900 border border-stone-800 rounded-lg">
              <button
                onClick={() => setActiveTab('p1')}
                className={`flex-1 py-2 text-xs font-cinzel font-bold rounded transition-all ${
                  activeTab === 'p1' ? 'bg-amber-600 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Select Player 1: {p1.name}
              </button>
              <button
                onClick={() => setActiveTab('p2')}
                className={`flex-1 py-2 text-xs font-cinzel font-bold rounded transition-all ${
                  activeTab === 'p2' ? 'bg-blue-600 text-white shadow' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Select Player 2: {p2.name}
              </button>
            </div>
          )}

          {/* Roster Character Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-cinzel font-bold text-sm text-stone-300 tracking-wider">
                CHOOSE YOUR ROYAL GUARDIAN (8 WARRIORS)
              </h3>
              <span className="text-xs text-amber-500 font-cinzel">
                {activeTab === 'p1' ? 'P1 ACTIVE' : 'P2 ACTIVE'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CHARACTERS.map((char, index) => {
                const isP1 = selectedP1Index === index;
                const isP2 = selectedP2Index === index;
                const isActive = (activeTab === 'p1' && isP1) || (activeTab === 'p2' && isP2);

                return (
                  <button
                    key={char.id}
                    onClick={() => handleSelectChar(index)}
                    className={`group relative rounded-xl overflow-hidden aspect-[4/5] border-2 transition-all text-left flex flex-col justify-end p-2.5 ${
                      isActive
                        ? 'border-amber-400 ring-2 ring-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.02]'
                        : isP1
                        ? 'border-amber-600/80 opacity-90'
                        : isP2
                        ? 'border-blue-600/80 opacity-90'
                        : 'border-stone-800 hover:border-stone-600 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={char.rosterThumbnail}
                      alt={char.name}
                      className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                    {/* Indicator Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      {isP1 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 text-[10px] font-black shadow">
                          P1
                        </span>
                      )}
                      {isP2 && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-500 text-white text-[10px] font-black shadow">
                          {gameMode === 'VERSUS' ? 'P2' : 'CPU'}
                        </span>
                      )}
                    </div>

                    <div className="relative z-10">
                      <span className="font-cinzel font-bold text-xs text-amber-200 block truncate">
                        {char.name}
                      </span>
                      <span className="text-[10px] text-stone-400 block truncate">
                        {char.clan}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stage Selection & Match Modifiers */}
          <div className="p-4 rounded-xl border border-stone-800 bg-stone-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-cinzel font-bold text-stone-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                BATTLE ARENA: {currentStage.name}
              </span>
              <span className="text-[11px] text-amber-400">{currentStage.sesothoName}</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {STAGES.map((stg, idx) => (
                <button
                  key={stg.id}
                  onClick={() => { soundEngine.playBlanketWhoosh(); setSelectedStageIndex(idx); }}
                  className={`py-2 px-1 text-center rounded text-[11px] font-medium border transition-all truncate ${
                    selectedStageIndex === idx
                      ? 'border-amber-500 bg-amber-950/60 text-amber-200 font-bold'
                      : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200'
                  }`}
                  title={stg.description}
                >
                  {stg.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* AI Difficulty for Arcade / Versus */}
            {gameMode !== 'TRAINING' && (
              <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                <span className="text-xs text-stone-400">AI Difficulty:</span>
                <div className="flex items-center gap-2">
                  {(['novice', 'warrior', 'champion'] as AIDifficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`px-2.5 py-1 rounded text-[11px] font-cinzel capitalize transition-all ${
                        difficulty === d ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Launch Action Bar */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLaunch}
              className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-black text-lg tracking-widest shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-[0.99] transition-all flex items-center justify-center gap-3 uppercase cursor-pointer"
            >
              <Shield className="w-5 h-5" />
              <span>ASCEND TO BATTLE · FIGHT!</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer Banner */}
      <footer className="border-t border-stone-800/80 px-6 py-3 bg-stone-950/80 text-center text-xs text-stone-500">
        Seven Peaks Ascension · Authentic Basuto Traditional Fighting Game · Inspired by Kingdom of Lesotho Martial Heritage
      </footer>
    </div>
  );
};
