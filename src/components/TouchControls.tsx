import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap, Shield, Sparkles } from 'lucide-react';

interface TouchControlsProps {
  onInputDown: (key: string) => void;
  onInputUp: (key: string) => void;
  canSuper: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onInputDown,
  onInputUp,
  canSuper,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-4 px-4 sm:px-8 flex items-end justify-between pointer-events-none z-30 select-none">
      {/* Virtual D-Pad (Left Side) */}
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 bg-stone-950/70 border border-stone-800/80 rounded-full backdrop-blur-md p-2 pointer-events-auto shadow-2xl flex items-center justify-center">
        {/* Up */}
        <button
          onTouchStart={() => onInputDown('w')}
          onTouchEnd={() => onInputUp('w')}
          onMouseDown={() => onInputDown('w')}
          onMouseUp={() => onInputUp('w')}
          className="absolute top-2 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-300 flex items-center justify-center active:scale-95 active:bg-amber-600 transition-all border border-stone-700/60"
          title="Jump"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* Down */}
        <button
          onTouchStart={() => onInputDown('s')}
          onTouchEnd={() => onInputUp('s')}
          onMouseDown={() => onInputDown('s')}
          onMouseUp={() => onInputUp('s')}
          className="absolute bottom-2 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-300 flex items-center justify-center active:scale-95 active:bg-amber-600 transition-all border border-stone-700/60"
          title="Crouch"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        {/* Left */}
        <button
          onTouchStart={() => onInputDown('a')}
          onTouchEnd={() => onInputUp('a')}
          onMouseDown={() => onInputDown('a')}
          onMouseUp={() => onInputUp('a')}
          className="absolute left-2 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-300 flex items-center justify-center active:scale-95 active:bg-amber-600 transition-all border border-stone-700/60"
          title="Move Left / Block"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Right */}
        <button
          onTouchStart={() => onInputDown('d')}
          onTouchEnd={() => onInputUp('d')}
          onMouseDown={() => onInputDown('d')}
          onMouseUp={() => onInputUp('d')}
          className="absolute right-2 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-300 flex items-center justify-center active:scale-95 active:bg-amber-600 transition-all border border-stone-700/60"
          title="Move Right / Advance"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Center Dash Button */}
        <button
          onTouchStart={() => onInputDown('Shift')}
          onTouchEnd={() => onInputUp('Shift')}
          onMouseDown={() => onInputDown('Shift')}
          onMouseUp={() => onInputUp('Shift')}
          className="w-10 h-10 rounded-full bg-stone-800/80 hover:bg-stone-700 text-amber-400 flex items-center justify-center text-[10px] font-bold active:scale-90 border border-stone-600"
          title="Dash"
        >
          <Zap className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons (Right Side) */}
      <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
        {/* Light Attack (J) */}
        <div className="flex flex-col items-center gap-1">
          <button
            onTouchStart={() => onInputDown('j')}
            onTouchEnd={() => onInputUp('j')}
            onMouseDown={() => onInputDown('j')}
            onMouseUp={() => onInputUp('j')}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-stone-900/90 border border-amber-600/60 text-amber-300 font-cinzel font-black text-sm flex items-center justify-center active:scale-90 active:bg-amber-600 active:text-white shadow-lg transition-all"
            title="Light Strike (J)"
          >
            LIGHT
          </button>
          <span className="text-[10px] text-stone-400 font-mono-num">J</span>
        </div>

        {/* Heavy Attack (K) */}
        <div className="flex flex-col items-center gap-1">
          <button
            onTouchStart={() => onInputDown('k')}
            onTouchEnd={() => onInputUp('k')}
            onMouseDown={() => onInputDown('k')}
            onMouseUp={() => onInputUp('k')}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-stone-900/90 border border-amber-600/60 text-amber-400 font-cinzel font-black text-sm flex items-center justify-center active:scale-90 active:bg-amber-600 active:text-white shadow-lg transition-all"
            title="Heavy Strike (K)"
          >
            HEAVY
          </button>
          <span className="text-[10px] text-stone-400 font-mono-num">K</span>
        </div>

        {/* Special Move (L) */}
        <div className="flex flex-col items-center gap-1">
          <button
            onTouchStart={() => onInputDown('l')}
            onTouchEnd={() => onInputUp('l')}
            onMouseDown={() => onInputDown('l')}
            onMouseUp={() => onInputUp('l')}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-stone-900/90 border border-sky-500/80 text-sky-300 font-cinzel font-black text-sm flex items-center justify-center active:scale-90 active:bg-sky-600 active:text-white shadow-lg transition-all"
            title="Special Skill (L)"
          >
            SKILL
          </button>
          <span className="text-[10px] text-stone-400 font-mono-num">L</span>
        </div>

        {/* Super Ascension Art (U) */}
        <div className="flex flex-col items-center gap-1">
          <button
            onTouchStart={() => onInputDown('u')}
            onTouchEnd={() => onInputUp('u')}
            onMouseDown={() => onInputDown('u')}
            onMouseUp={() => onInputUp('u')}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full font-cinzel font-black text-xs flex flex-col items-center justify-center active:scale-90 shadow-xl transition-all border ${
              canSuper
                ? 'bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 text-stone-950 border-amber-300 shadow-[0_0_15px_#f59e0b] animate-bounce'
                : 'bg-stone-900/80 text-stone-500 border-stone-800'
            }`}
            title="Ascension Art (U)"
          >
            <Sparkles className="w-4 h-4 mb-0.5" />
            SUPER
          </button>
          <span className="text-[10px] text-stone-400 font-mono-num">U</span>
        </div>
      </div>
    </div>
  );
};
