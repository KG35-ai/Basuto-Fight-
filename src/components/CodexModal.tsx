import React, { useState } from 'react';
import { X, Shield, BookOpen, Sparkles, Feather, Mountain } from 'lucide-react';
import { CHARACTERS } from '../data/characters';

interface CodexModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({ isOpen, onClose }) => {
  const [selectedWarriorId, setSelectedWarriorId] = useState<string>('makotoane');

  if (!isOpen) return null;

  const activeWarrior = CHARACTERS.find((c) => c.id === selectedWarriorId) || CHARACTERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-stone-900 border border-amber-600/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 bg-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-amber-500/80 bg-amber-950/40 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-lg text-amber-200">
                Basotho Cultural Codex & Seven Peaks Lore
              </h3>
              <p className="text-xs text-stone-400">
                Heritage of the Kingdom of Lesotho · Blankets, Melamu Martial Arts & Mokorotlo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with 2-Column Layout */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Interactive Roster Selector & Cultural Articles */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <h4 className="font-cinzel font-bold text-xs text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5" />
                The Seven Peaks Royal Guard
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {CHARACTERS.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedWarriorId(char.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                      selectedWarriorId === char.id
                        ? 'border-amber-500 bg-amber-950/50 text-amber-200'
                        : 'border-stone-800 bg-stone-950/40 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <img
                      src={char.rosterThumbnail}
                      alt={char.name}
                      className="w-8 h-8 rounded object-cover object-top border border-stone-700 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="truncate">
                      <div className="text-xs font-cinzel font-bold truncate">{char.name}</div>
                      <div className="text-[10px] text-stone-500 truncate">{char.element}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cultural Articles */}
            <div className="p-4 rounded-xl border border-stone-800 bg-stone-950/60 space-y-3 text-xs text-stone-300">
              <h4 className="font-cinzel font-bold text-amber-300 flex items-center gap-1.5">
                <Feather className="w-3.5 h-3.5 text-amber-500" />
                The Traditional Basotho Blanket (Kobo)
              </h4>
              <p className="text-[11px] leading-relaxed text-stone-400">
                Unlike ordinary garments, the <em>Kobo</em> is an enduring symbol of Basotho identity, sovereignty, and status. Introduced during the 19th-century reign of King Moshoeshoe I, blankets like <em>Seanamarena</em> ("To swear by the Chiefs") and <em>Poone</em> (Maize) feature sacred vertical pin-stripes worn pointing toward heaven to invoke good fortune. In combat lore, warriors wield their blankets as defensive shields and wind cloaks.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stone-800 bg-stone-950/60 space-y-2 text-xs text-stone-300">
              <h4 className="font-cinzel font-bold text-amber-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                Melamu Stick Fighting (Leballo)
              </h4>
              <p className="text-[11px] leading-relaxed text-stone-400">
                <em>Melamu</em> is the traditional stick-fighting art of the Basotho. Herdboys practice dual-stick coordination in the highland pastures, wielding a defensive guard staff (*mulamu*) and an offensive club (*knobkerrie*), emphasizing lightning footwork, evasive parries, and honor dueling.
              </p>
            </div>
          </div>

          {/* Right: Selected Warrior Cultural Profile & Attached Art */}
          <div className="md:col-span-7 flex flex-col rounded-xl overflow-hidden border border-stone-800 bg-stone-950">
            {/* Warrior Full Artwork */}
            <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-black">
              <img
                src={activeWarrior.image}
                alt={activeWarrior.name}
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-xs font-cinzel font-bold text-amber-400 tracking-widest uppercase">
                  {activeWarrior.sesothoTitle}
                </span>
                <h3 className="font-cinzel font-black text-2xl text-amber-100">
                  {activeWarrior.name}
                </h3>
                <p className="text-xs text-stone-400">{activeWarrior.clan}</p>
              </div>
            </div>

            {/* Profile Narrative */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h5 className="text-[11px] font-bold text-amber-500 uppercase tracking-widest mb-1">
                  Warrior Origin & Lore
                </h5>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {activeWarrior.lore}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                <h5 className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-1">
                  Cultural Significance
                </h5>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {activeWarrior.culturalBackground}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-stone-800/80 pt-3">
                <div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest block">Blanket Motif</span>
                  <span className="text-stone-200 font-medium">{activeWarrior.blanketMotif}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest block">Weapon & Combat Art</span>
                  <span className="text-stone-200 font-medium">{activeWarrior.weapon}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-cinzel font-bold text-xs"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};
