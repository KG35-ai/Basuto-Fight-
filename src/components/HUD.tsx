import React from 'react';
import { FighterEntity } from '../types/fighter';
import { Volume2, VolumeX, Pause, Play, HelpCircle, BookOpen } from 'lucide-react';

interface HUDProps {
  player1: FighterEntity;
  player2: FighterEntity;
  roundTimer: number;
  currentRound: number;
  matchBannerText: string | null;
  matchBannerSubtext: string | null;
  isMuted: boolean;
  isPaused: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onOpenMoveList: () => void;
  onOpenCodex: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player1,
  player2,
  roundTimer,
  currentRound,
  matchBannerText,
  matchBannerSubtext,
  isMuted,
  isPaused,
  onToggleMute,
  onTogglePause,
  onOpenMoveList,
  onOpenCodex,
}) => {
  const p1HealthPercent = Math.max(0, (player1.health / player1.maxHealth) * 100);
  const p2HealthPercent = Math.max(0, (player2.health / player2.maxHealth) * 100);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-20">
      {/* Top Bar: Fighter Gauges, Round Timer, and Round Counts */}
      <div className="w-full flex items-start justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
        {/* Player 1 Health & Profile */}
        <div className="flex-1 flex items-start gap-2 sm:gap-3">
          {/* Portrait with cultural frame */}
          <div className="relative w-14 h-14 sm:w-18 sm:h-18 rounded-lg overflow-hidden border-2 border-amber-600/80 bg-stone-900 shrink-0 shadow-lg">
            <img
              src={player1.profile.rosterThumbnail}
              alt={player1.profile.name}
              className="w-full h-full object-cover object-top"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 inset-x-0 bg-stone-950/80 py-0.5 text-center text-[10px] font-bold text-amber-400">
              P1
            </div>
          </div>

          {/* Name & Health Bar */}
          <div className="flex-1">
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-cinzel font-bold text-sm sm:text-base text-amber-200 tracking-wider truncate">
                {player1.profile.name}
              </span>
              <span className="text-xs text-stone-400 font-mono-num">
                {Math.ceil(player1.health)} / 1000
              </span>
            </div>

            {/* Health Meter Container */}
            <div className="relative h-5 sm:h-6 bg-stone-950 border border-stone-800 rounded overflow-hidden shadow-inner">
              {/* Health fill */}
              <div
                className={`h-full transition-all duration-150 ${
                  p1HealthPercent > 30 ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400' : 'bg-gradient-to-r from-red-700 via-red-600 to-amber-500 animate-pulse'
                }`}
                style={{ width: `${p1HealthPercent}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            </div>

            {/* Rounds Won and Subtitle */}
            <div className="flex items-center justify-between mt-1 text-xs text-stone-400">
              <span className="truncate">{player1.profile.sesothoTitle}</span>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {[1, 2].map((r) => (
                  <div
                    key={r}
                    className={`w-3 h-3 rounded-full border border-amber-500/60 transition-colors ${
                      player1.roundsWon >= r ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-stone-900'
                    }`}
                    title={`Round ${r}`}
                  />
                ))}
              </div>
            </div>

            {/* Combo Counter Left */}
            {player1.comboCount > 1 && (
              <div className="mt-2 text-left animate-bounce">
                <span className="text-lg sm:text-2xl font-cinzel font-black text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {player1.comboCount} HITS!
                </span>
                <span className="ml-2 text-xs text-amber-200 uppercase tracking-widest">
                  Leballo Combo
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Center: Timer & Controls */}
        <div className="flex flex-col items-center shrink-0 px-2 sm:px-4">
          <div className="w-14 sm:w-18 h-12 sm:h-14 bg-stone-900/90 border border-amber-600/60 rounded-lg flex items-center justify-center shadow-2xl backdrop-blur-sm">
            <span
              className={`font-mono-num font-black text-2xl sm:text-3xl ${
                roundTimer <= 10 ? 'text-red-500 animate-ping' : 'text-amber-400'
              }`}
            >
              {roundTimer}
            </span>
          </div>
          <span className="text-[11px] font-cinzel font-bold text-amber-500/80 uppercase tracking-widest mt-1">
            Round {currentRound}
          </span>

          {/* Quick HUD Action Buttons */}
          <div className="flex items-center gap-1.5 mt-2 pointer-events-auto">
            <button
              onClick={onTogglePause}
              className="p-1.5 rounded bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
              title={isPaused ? 'Resume Match' : 'Pause Match'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onToggleMute}
              className="p-1.5 rounded bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onOpenMoveList}
              className="p-1.5 rounded bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
              title="View Moves"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenCodex}
              className="p-1.5 rounded bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
              title="Cultural Codex"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Player 2 Health & Profile */}
        <div className="flex-1 flex items-start gap-2 sm:gap-3 flex-row-reverse">
          {/* Portrait with cultural frame */}
          <div className="relative w-14 h-14 sm:w-18 sm:h-18 rounded-lg overflow-hidden border-2 border-blue-600/80 bg-stone-900 shrink-0 shadow-lg">
            <img
              src={player2.profile.rosterThumbnail}
              alt={player2.profile.name}
              className="w-full h-full object-cover object-top"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 inset-x-0 bg-stone-950/80 py-0.5 text-center text-[10px] font-bold text-blue-400">
              {player2.isPlayer ? 'P2' : 'CPU'}
            </div>
          </div>

          {/* Name & Health Bar */}
          <div className="flex-1">
            <div className="flex items-baseline justify-between mb-1 flex-row-reverse">
              <span className="font-cinzel font-bold text-sm sm:text-base text-blue-200 tracking-wider truncate">
                {player2.profile.name}
              </span>
              <span className="text-xs text-stone-400 font-mono-num">
                {Math.ceil(player2.health)} / 1000
              </span>
            </div>

            {/* Health Meter Container */}
            <div className="relative h-5 sm:h-6 bg-stone-950 border border-stone-800 rounded overflow-hidden shadow-inner flex justify-end">
              <div
                className={`h-full transition-all duration-150 ${
                  p2HealthPercent > 30 ? 'bg-gradient-to-l from-blue-600 via-sky-500 to-cyan-400' : 'bg-gradient-to-l from-red-700 via-red-600 to-amber-500 animate-pulse'
                }`}
                style={{ width: `${p2HealthPercent}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            </div>

            {/* Rounds Won and Subtitle */}
            <div className="flex items-center justify-between mt-1 text-xs text-stone-400 flex-row-reverse">
              <span className="truncate">{player2.profile.sesothoTitle}</span>
              <div className="flex items-center gap-1.5 shrink-0 mr-2">
                {[1, 2].map((r) => (
                  <div
                    key={r}
                    className={`w-3 h-3 rounded-full border border-blue-500/60 transition-colors ${
                      player2.roundsWon >= r ? 'bg-blue-400 shadow-[0_0_8px_#3b82f6]' : 'bg-stone-900'
                    }`}
                    title={`Round ${r}`}
                  />
                ))}
              </div>
            </div>

            {/* Combo Counter Right */}
            {player2.comboCount > 1 && (
              <div className="mt-2 text-right animate-bounce">
                <span className="text-lg sm:text-2xl font-cinzel font-black text-blue-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {player2.comboCount} HITS!
                </span>
                <span className="mr-2 text-xs text-blue-200 uppercase tracking-widest">
                  Leballo Combo
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dramatic Mid-Screen Announcement Banner */}
      {matchBannerText && (
        <div className="my-auto self-center text-center animate-in zoom-in-75 duration-200">
          <div className="bg-stone-950/90 border-y-2 border-amber-500/80 px-8 py-4 backdrop-blur-md shadow-[0_0_50px_rgba(217,119,6,0.5)]">
            <h2 className="font-cinzel font-black text-4xl sm:text-6xl text-amber-400 tracking-widest drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
              {matchBannerText}
            </h2>
            {matchBannerSubtext && (
              <p className="font-cinzel text-sm sm:text-lg text-amber-200/90 tracking-widest mt-1 uppercase">
                {matchBannerSubtext}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bottom Gauges: Super / Ascension Meter (Kobo Spirit Meter) */}
      <div className="w-full flex items-end justify-between gap-4 max-w-7xl mx-auto">
        {/* P1 Super Meter */}
        <div className="w-64 sm:w-80">
          <div className="flex items-center justify-between text-xs font-cinzel font-bold mb-1">
            <span className={player1.meter >= 100 ? 'text-amber-400 animate-pulse' : 'text-stone-400'}>
              {player1.meter >= 100 ? '★ ASCENSION READY (PRESS U / I) ★' : 'ASCENSION METER'}
            </span>
            <span className="font-mono-num text-stone-400">{Math.floor(player1.meter)}%</span>
          </div>
          <div className="h-3 sm:h-3.5 bg-stone-900 border border-stone-800 rounded overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${
                player1.meter >= 100
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400 shadow-[0_0_12px_#f59e0b]'
                  : 'bg-gradient-to-r from-stone-600 to-amber-600'
              }`}
              style={{ width: `${player1.meter}%` }}
            />
          </div>
        </div>

        {/* P2 Super Meter */}
        <div className="w-64 sm:w-80 text-right">
          <div className="flex items-center justify-between text-xs font-cinzel font-bold mb-1 flex-row-reverse">
            <span className={player2.meter >= 100 ? 'text-blue-400 animate-pulse' : 'text-stone-400'}>
              {player2.meter >= 100 ? '★ ASCENSION READY ★' : 'ASCENSION METER'}
            </span>
            <span className="font-mono-num text-stone-400">{Math.floor(player2.meter)}%</span>
          </div>
          <div className="h-3 sm:h-3.5 bg-stone-900 border border-stone-800 rounded overflow-hidden flex justify-end">
            <div
              className={`h-full transition-all duration-100 ${
                player2.meter >= 100
                  ? 'bg-gradient-to-l from-blue-500 via-sky-300 to-blue-400 shadow-[0_0_12px_#3b82f6]'
                  : 'bg-gradient-to-l from-stone-600 to-blue-600'
              }`}
              style={{ width: `${player2.meter}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
