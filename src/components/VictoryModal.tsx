import React from 'react';
import { CharacterProfile, GameMode } from '../types/fighter';
import { Trophy, RotateCcw, Home, ArrowRight, Shield } from 'lucide-react';

interface VictoryModalProps {
  winner: CharacterProfile;
  loser: CharacterProfile;
  isP1Winner: boolean;
  gameMode: GameMode;
  arcadeStageIndex: number;
  totalArcadeStages: number;
  onNextArcadeMatch: () => void;
  onRematch: () => void;
  onReturnToSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  loser,
  isP1Winner,
  gameMode,
  arcadeStageIndex,
  totalArcadeStages,
  onNextArcadeMatch,
  onRematch,
  onReturnToSelect,
}) => {
  const isFinalArcadeBoss = arcadeStageIndex >= totalArcadeStages - 1;
  const isArcadeVictory = gameMode === 'ARCADE' && isP1Winner;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border border-amber-500/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-center">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 p-6 border-b border-amber-600/50">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="font-cinzel font-black text-3xl sm:text-4xl text-amber-300 tracking-widest uppercase">
            {isArcadeVictory && isFinalArcadeBoss
              ? 'SEVEN PEAKS ASCENSION ACHIEVED!'
              : `${winner.name} VICTORIOUS!`}
          </h2>
          <p className="font-cinzel text-xs sm:text-sm text-amber-400/90 font-bold uppercase tracking-widest mt-1">
            {winner.sesothoTitle}
          </p>
        </div>

        {/* Winner Showcase */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-center gap-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-xl">
              <img
                src={winner.rosterThumbnail}
                alt={winner.name}
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left">
              <span className="text-xs text-stone-400 uppercase tracking-widest block font-cinzel">Champion Clan</span>
              <h4 className="font-cinzel font-bold text-lg text-stone-100">{winner.clan}</h4>
              <p className="text-xs text-amber-300 mt-1 italic">
                "{winner.name} stands unconquered amidst the high mountain gale."
              </p>
            </div>
          </div>

          {/* Arcade Progression Status */}
          {gameMode === 'ARCADE' && (
            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs">
              {isP1Winner ? (
                isFinalArcadeBoss ? (
                  <p className="text-amber-300 font-cinzel font-bold">
                    You have conquered all Seven Peaks and claimed the title of Supreme Warden!
                  </p>
                ) : (
                  <p className="text-stone-300">
                    Peak {arcadeStageIndex + 1} of {totalArcadeStages} Cleared. Prepare for the next mountain challenger!
                  </p>
                )
              ) : (
                <p className="text-red-400 font-cinzel">
                  Defeated on Peak {arcadeStageIndex + 1}. Hone your Melamu skills and challenge again!
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {gameMode === 'ARCADE' && isP1Winner && !isFinalArcadeBoss ? (
              <button
                onClick={onNextArcadeMatch}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-black text-sm tracking-wider shadow-lg flex items-center justify-center gap-2"
              >
                <span>ASCEND TO NEXT PEAK</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onRematch}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-black text-sm tracking-wider shadow-lg flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>REMATCH</span>
              </button>
            )}

            <button
              onClick={onReturnToSelect}
              className="w-full py-3 px-6 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-cinzel font-bold text-sm tracking-wider flex items-center justify-center gap-2 border border-stone-700"
            >
              <Home className="w-4 h-4" />
              <span>ROSTER SELECT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
