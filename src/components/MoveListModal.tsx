import React from 'react';
import { CharacterProfile } from '../types/fighter';
import { X, Zap, Shield, Sparkles } from 'lucide-react';

interface MoveListModalProps {
  character: CharacterProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const MoveListModal: React.FC<MoveListModalProps> = ({
  character,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const moves = [
    { key: 'J / Light', data: character.moves.light, tag: 'NORMAL' },
    { key: 'K / Heavy', data: character.moves.heavy, tag: 'HEAVY' },
    { key: 'L / Special', data: character.moves.special, tag: 'SPECIAL' },
    { key: 'U or I / Super', data: character.moves.super, tag: 'ASCENSION ART' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-amber-600/60 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 bg-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-amber-500 shrink-0">
              <img
                src={character.rosterThumbnail}
                alt={character.name}
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-lg text-amber-200">
                {character.name} · Move List
              </h3>
              <p className="text-xs text-stone-400 font-cinzel">{character.fightingStyle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {moves.map(({ key, data, tag }) => (
              <div
                key={data.name}
                className="p-3.5 rounded-lg border border-stone-800 bg-stone-950/60 hover:border-stone-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-mono-num font-bold">
                      {key}
                    </span>
                    <span className="font-cinzel font-bold text-sm text-stone-100">
                      {data.name}
                    </span>
                    <span className="text-xs text-amber-500 font-cinzel">({data.sesothoName})</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 bg-stone-800 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                </div>

                <p className="text-xs text-stone-300 mb-2">{data.description}</p>

                {/* Frame Data & Damage */}
                <div className="flex items-center gap-4 text-[11px] text-stone-400 font-mono-num border-t border-stone-900 pt-2">
                  <span>Damage: <strong className="text-amber-400">{data.damage}</strong></span>
                  <span>Startup: <strong className="text-stone-300">{data.startupFrames}f</strong></span>
                  <span>Active: <strong className="text-stone-300">{data.activeFrames}f</strong></span>
                  <span>Recovery: <strong className="text-stone-300">{data.recoveryFrames}f</strong></span>
                  <span>Hit Stun: <strong className="text-stone-300">+{data.hitStun}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Core Mechanics Guide */}
          <div className="p-4 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-300 space-y-2">
            <h4 className="font-cinzel font-bold text-amber-400 text-sm">Combat Mechanics Guide</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>• <strong>Blocking (Back / Down-Back):</strong> Hold away from opponent to reduce incoming damage by 85%.</div>
              <div>• <strong>Kobo Parry:</strong> Press Back within 4 frames of an incoming attack to parry with zero stun!</div>
              <div>• <strong>Dashing (Shift / Double-Tap):</strong> Quick burst of speed to close distance or retreat.</div>
              <div>• <strong>Ascension Super (U / I):</strong> Unlocks when Ascension Gauge reaches 100%. Deals devastating damage.</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-cinzel font-bold text-xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
