/**
 * Seven Peaks: Basuto Ascension
 * Authentic 2D Basuto Fighting Game featuring traditional Melamu combat mechanics,
 * cultural Kobo blanket animations, Mokorotlo hats, and the Royal Guard of the Seven Peaks.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CharacterProfile, FighterEntity, GameMode, Stage, Projectile, ParticleEffect } from './types/fighter';
import { CHARACTERS } from './data/characters';
import { STAGES } from './data/stages';
import { FighterAI, AIDifficulty } from './engine/ai';
import {
  createFighter,
  updateFighterState,
  processCombatHit,
  checkAABBCollision,
  getFighterHurtbox,
} from './engine/physics';
import { soundEngine } from './audio/soundEngine';
import { FightCanvas } from './components/FightCanvas';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { CharacterSelect } from './components/CharacterSelect';
import { MoveListModal } from './components/MoveListModal';
import { CodexModal } from './components/CodexModal';
import { VictoryModal } from './components/VictoryModal';

type AppState = 'SELECT' | 'FIGHT' | 'MATCH_OVER';

export default function App() {
  const [appState, setAppState] = useState<AppState>('SELECT');
  const [p1Profile, setP1Profile] = useState<CharacterProfile>(CHARACTERS[0]);
  const [p2Profile, setP2Profile] = useState<CharacterProfile>(CHARACTERS[1]);
  const [currentStage, setCurrentStage] = useState<Stage>(STAGES[0]);
  const [gameMode, setGameMode] = useState<GameMode>('ARCADE');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('warrior');
  const [arcadeStageIndex, setArcadeStageIndex] = useState<number>(0);

  // Match State
  const [player1, setPlayer1] = useState<FighterEntity>(() =>
    createFighter('p1', CHARACTERS[0], 360, true, 1)
  );
  const [player2, setPlayer2] = useState<FighterEntity>(() =>
    createFighter('p2', CHARACTERS[1], 740, false, 2)
  );
  const [roundTimer, setRoundTimer] = useState<number>(99);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [matchBannerText, setMatchBannerText] = useState<string | null>('ROUND 1');
  const [matchBannerSubtext, setMatchBannerSubtext] = useState<string | null>('LEBALLO COMBAT · FIGHT!');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showHitboxes, setShowHitboxes] = useState<boolean>(false);

  // Modals
  const [isMoveListOpen, setIsMoveListOpen] = useState<boolean>(false);
  const [isCodexOpen, setIsCodexOpen] = useState<boolean>(false);

  // Refs for real-time 60 FPS animation loop
  const p1Ref = useRef<FighterEntity>(player1);
  const p2Ref = useRef<FighterEntity>(player2);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<ParticleEffect[]>([]);
  const screenShakeRef = useRef<number>(0);
  const hitStopRef = useRef<number>(0);
  const aiControllerRef = useRef<FighterAI>(new FighterAI('warrior'));

  // Active Key Inputs
  const activeKeysRef = useRef<{ [key: string]: boolean }>({});
  const roundStateRef = useRef<'COUNTDOWN' | 'FIGHTING' | 'ROUND_OVER' | 'MATCH_OVER'>('COUNTDOWN');
  const timerIntervalRef = useRef<number | null>(null);

  // Keep refs synced
  useEffect(() => {
    p1Ref.current = player1;
  }, [player1]);

  useEffect(() => {
    p2Ref.current = player2;
  }, [player2]);

  // Audio mute sync
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if modifier keys like Ctrl/Cmd are pressed
      if (e.ctrlKey || e.metaKey) return;
      activeKeysRef.current[e.key.toLowerCase()] = true;
      activeKeysRef.current[e.code] = true;
      activeKeysRef.current[e.key] = true;

      // Quick hotkeys
      if (e.key === 'p' || e.key === 'P') {
        setIsPaused((prev) => !prev);
      }
      if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      }
      if (e.key === 'h' || e.key === 'H') {
        setShowHitboxes((prev) => !prev);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      activeKeysRef.current[e.key.toLowerCase()] = false;
      activeKeysRef.current[e.code] = false;
      activeKeysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleToggleMute]);

  // Virtual Touch / Mouse Handlers
  const handleTouchDown = useCallback((key: string) => {
    activeKeysRef.current[key.toLowerCase()] = true;
    activeKeysRef.current[key] = true;
  }, []);

  const handleTouchUp = useCallback((key: string) => {
    activeKeysRef.current[key.toLowerCase()] = false;
    activeKeysRef.current[key] = false;
  }, []);

  // Start Fight Routine
  const startMatch = useCallback(
    (
      p1Prof: CharacterProfile,
      p2Prof: CharacterProfile,
      stg: Stage,
      mode: GameMode,
      diff: AIDifficulty,
      roundNum: number = 1,
      p1Rounds: number = 0,
      p2Rounds: number = 0
    ) => {
      setP1Profile(p1Prof);
      setP2Profile(p2Prof);
      setCurrentStage(stg);
      setGameMode(mode);
      setAiDifficulty(diff);
      setCurrentRound(roundNum);
      setRoundTimer(99);
      setIsPaused(false);
      setAppState('FIGHT');

      aiControllerRef.current.setDifficulty(diff);

      const f1 = createFighter('p1', p1Prof, 360, true, 1);
      f1.roundsWon = p1Rounds;

      const f2 = createFighter('p2', p2Prof, 740, mode === 'VERSUS', 2);
      f2.roundsWon = p2Rounds;

      p1Ref.current = f1;
      p2Ref.current = f2;
      setPlayer1({ ...f1 });
      setPlayer2({ ...f2 });

      projectilesRef.current = [];
      particlesRef.current = [];
      screenShakeRef.current = 0;
      hitStopRef.current = 0;

      // Start round countdown
      roundStateRef.current = 'COUNTDOWN';
      setMatchBannerText(`ROUND ${roundNum}`);
      setMatchBannerSubtext('LEBALLO COMBAT · FIGHT!');
      soundEngine.startBGM(false);
      soundEngine.announce(`Round ${roundNum}. Fight!`);

      window.setTimeout(() => {
        setMatchBannerText(null);
        setMatchBannerSubtext(null);
        roundStateRef.current = 'FIGHTING';
      }, 1600);

      // Reset timer
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = window.setInterval(() => {
        if (roundStateRef.current === 'FIGHTING' && !isPaused) {
          setRoundTimer((t) => {
            if (t <= 1) {
              handleTimeUp();
              return 0;
            }
            return t - 1;
          });
        }
      }, 1000);
    },
    [isPaused]
  );

  // Time-up resolution
  const handleTimeUp = () => {
    roundStateRef.current = 'ROUND_OVER';
    setMatchBannerText('TIME UP!');
    setMatchBannerSubtext('PEAK DELIBERATION');
    soundEngine.announce('Time Up!');

    window.setTimeout(() => {
      const p1Hp = p1Ref.current.health;
      const p2Hp = p2Ref.current.health;
      if (p1Hp > p2Hp) {
        awardRoundWin(1);
      } else if (p2Hp > p1Hp) {
        awardRoundWin(2);
      } else {
        // Draw - replay round
        startMatch(p1Profile, p2Profile, currentStage, gameMode, aiDifficulty, currentRound, p1Ref.current.roundsWon, p2Ref.current.roundsWon);
      }
    }, 1800);
  };

  // Award round victory
  const awardRoundWin = useCallback(
    (winnerNum: 1 | 2) => {
      roundStateRef.current = 'ROUND_OVER';
      const winner = winnerNum === 1 ? p1Ref.current : p2Ref.current;
      winner.roundsWon++;

      setMatchBannerText(winnerNum === 1 ? `${p1Profile.name} WINS!` : `${p2Profile.name} WINS!`);
      setMatchBannerSubtext('ROUND CONQUERED');
      soundEngine.announce(winnerNum === 1 ? `${p1Profile.name} Wins!` : `${p2Profile.name} Wins!`);

      window.setTimeout(() => {
        if (winner.roundsWon >= 2) {
          // Match Won!
          roundStateRef.current = 'MATCH_OVER';
          setAppState('MATCH_OVER');
          soundEngine.stopBGM();
        } else {
          // Next round
          startMatch(
            p1Profile,
            p2Profile,
            currentStage,
            gameMode,
            aiDifficulty,
            currentRound + 1,
            p1Ref.current.roundsWon,
            p2Ref.current.roundsWon
          );
        }
      }, 2200);
    },
    [aiDifficulty, currentRound, currentStage, gameMode, p1Profile, p2Profile, startMatch]
  );

  // Next Arcade Match (Ascend to next peak)
  const handleNextArcadeMatch = useCallback(() => {
    const nextIndex = arcadeStageIndex + 1;
    setArcadeStageIndex(nextIndex);
    // Opponent ladder: Cycle through roster until reaching the Grand Champion Makotoane
    const nextOpponent = CHARACTERS[(nextIndex + 1) % CHARACTERS.length];
    const nextStage = STAGES[nextIndex % STAGES.length];
    startMatch(p1Profile, nextOpponent, nextStage, 'ARCADE', aiDifficulty, 1, 0, 0);
  }, [arcadeStageIndex, aiDifficulty, p1Profile, startMatch]);

  // Main 60 FPS Fighting Loop
  useEffect(() => {
    if (appState !== 'FIGHT') return;

    let animId: number;

    const gameLoop = () => {
      animId = requestAnimationFrame(gameLoop);

      if (isPaused) return;

      // Handle hitstop pause (freeze-frames for crunchy impact)
      if (hitStopRef.current > 0) {
        hitStopRef.current--;
        return;
      }

      // Decay screen shake
      if (screenShakeRef.current > 0) {
        screenShakeRef.current *= 0.88;
        if (screenShakeRef.current < 0.2) screenShakeRef.current = 0;
      }

      const p1 = p1Ref.current;
      const p2 = p2Ref.current;

      // 1. Gather Player 1 inputs
      const keys = activeKeysRef.current;
      const p1Inputs = {
        left: Boolean(keys['a'] || keys['ArrowLeft']),
        right: Boolean(keys['d'] || keys['ArrowRight']),
        up: Boolean(keys['w'] || keys['ArrowUp']),
        down: Boolean(keys['s'] || keys['ArrowDown']),
        light: Boolean(keys['j'] || keys['z'] || keys['KeyJ']),
        heavy: Boolean(keys['k'] || keys['x'] || keys['KeyK']),
        special: Boolean(keys['l'] || keys['c'] || keys['KeyL']),
        super: Boolean(keys['u'] || keys['i'] || keys['v'] || keys['KeyU'] || keys['KeyI']),
        dash: Boolean(keys['Shift'] || keys['ShiftLeft'] || keys['ShiftRight']),
      };

      // 2. Gather Player 2 inputs (Human or AI)
      let p2Inputs;
      if (p2.isPlayer && gameMode === 'VERSUS') {
        p2Inputs = {
          left: Boolean(keys['ArrowLeft']),
          right: Boolean(keys['ArrowRight']),
          up: Boolean(keys['ArrowUp']),
          down: Boolean(keys['ArrowDown']),
          light: Boolean(keys['1'] || keys['Numpad1']),
          heavy: Boolean(keys['2'] || keys['Numpad2']),
          special: Boolean(keys['3'] || keys['Numpad3']),
          super: Boolean(keys['0'] || keys['Numpad0'] || keys['Enter']),
          dash: Boolean(keys['NumpadDecimal'] || keys['ControlRight']),
        };
      } else {
        p2Inputs = aiControllerRef.current.decide(p2, p1);
      }

      // 3. Update Fighter Physics & States
      if (roundStateRef.current === 'FIGHTING') {
        updateFighterState(p1, p2, p1Inputs, projectilesRef.current, particlesRef.current);
        updateFighterState(p2, p1, p2Inputs, projectilesRef.current, particlesRef.current);

        // 4. Combat Collisions (P1 vs P2)
        const hit1 = processCombatHit(p1, p2, particlesRef.current);
        if (hit1?.hitLanded) {
          hitStopRef.current = hit1.isParry ? 8 : 4;
          screenShakeRef.current = hit1.isParry ? 8 : hit1.damageDealt > 80 ? 12 : 5;
        }

        // Combat Collisions (P2 vs P1)
        const hit2 = processCombatHit(p2, p1, particlesRef.current);
        if (hit2?.hitLanded) {
          hitStopRef.current = hit2.isParry ? 8 : 4;
          screenShakeRef.current = hit2.isParry ? 8 : hit2.damageDealt > 80 ? 12 : 5;
        }

        // 5. Projectiles Update & Collision
        const projs = projectilesRef.current;
        for (let i = projs.length - 1; i >= 0; i--) {
          const pr = projs[i];
          pr.x += pr.vx;
          pr.y += pr.vy;
          pr.life--;

          // Target check
          const target = pr.ownerId === p1.id ? p2 : p1;
          const targetHurt = getFighterHurtbox(target);
          const projBox = { x: pr.x - pr.width / 2, y: pr.y - pr.height / 2, width: pr.width, height: pr.height };

          if (checkAABBCollision(projBox, targetHurt) && target.invincibleFrames <= 0) {
            // Projectile Hit
            target.health = Math.max(0, target.health - pr.damage);
            target.state = 'hitstun';
            target.stateFrame = 0;
            target.totalStateFrames = 18;
            target.vx = pr.vx > 0 ? 8 : -8;
            screenShakeRef.current = 8;
            soundEngine.playHeavySlash();
            projs.splice(i, 1);
            continue;
          }

          if (pr.life <= 0 || pr.x < -100 || pr.x > 1200) {
            projs.splice(i, 1);
          }
        }

        // 6. Check K.O. Victory Condition
        if (p1.health <= 0 && p2.health <= 0) {
          awardRoundWin(1);
        } else if (p1.health <= 0) {
          awardRoundWin(2);
        } else if (p2.health <= 0) {
          awardRoundWin(1);
        }

        // 7. Dynamic Danger Music when either fighter health < 300
        const isCritical = p1.health < 300 || p2.health < 300;
        soundEngine.updateBGMDanger(isCritical);
      }

      // Sync state for rendering
      setPlayer1({ ...p1 });
      setPlayer2({ ...p2 });
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [appState, isPaused, gameMode, awardRoundWin]);

  return (
    <div className="relative w-screen h-screen bg-stone-950 text-stone-100 overflow-hidden flex flex-col font-sans select-none">
      {appState === 'SELECT' && (
        <CharacterSelect
          onStartFight={(p1, p2, stg, mode, diff) => {
            setArcadeStageIndex(0);
            startMatch(p1, p2, stg, mode, diff, 1, 0, 0);
          }}
          onOpenCodex={() => setIsCodexOpen(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {appState === 'FIGHT' && (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          {/* Main 60 FPS Canvas Game Engine */}
          <FightCanvas
            player1={player1}
            player2={player2}
            stage={currentStage}
            projectiles={projectilesRef.current}
            particles={particlesRef.current}
            screenShake={screenShakeRef.current}
            hitStopFrames={hitStopRef.current}
            showHitboxes={showHitboxes}
          />

          {/* Tournament Fighting HUD */}
          <HUD
            player1={player1}
            player2={player2}
            roundTimer={roundTimer}
            currentRound={currentRound}
            matchBannerText={matchBannerText}
            matchBannerSubtext={matchBannerSubtext}
            isMuted={isMuted}
            isPaused={isPaused}
            onToggleMute={handleToggleMute}
            onTogglePause={() => setIsPaused((p) => !p)}
            onOpenMoveList={() => setIsMoveListOpen(true)}
            onOpenCodex={() => setIsCodexOpen(true)}
          />

          {/* Touch Controls (Virtual Arcade D-Pad & Action Buttons) */}
          <TouchControls
            onInputDown={handleTouchDown}
            onInputUp={handleTouchUp}
            canSuper={player1.meter >= 100}
          />

          {/* Pause Menu Overlay */}
          {isPaused && (
            <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
              <div className="max-w-sm w-full bg-stone-900 border border-stone-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
                <h3 className="font-cinzel font-black text-2xl text-amber-300 tracking-wider uppercase">
                  Match Paused
                </h3>
                <p className="text-xs text-stone-400">
                  {currentStage.name} · Round {currentRound}
                </p>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setIsPaused(false)}
                    className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-cinzel font-bold text-xs"
                  >
                    Resume Match
                  </button>
                  <button
                    onClick={() => setIsMoveListOpen(true)}
                    className="w-full py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-cinzel font-semibold text-xs border border-stone-700"
                  >
                    View Move List
                  </button>
                  <button
                    onClick={() => {
                      setIsPaused(false);
                      soundEngine.stopBGM();
                      setAppState('SELECT');
                    }}
                    className="w-full py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-red-400 font-cinzel font-semibold text-xs border border-stone-700"
                  >
                    Quit to Roster Select
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Victory / Match Over Modal */}
      {appState === 'MATCH_OVER' && (
        <VictoryModal
          winner={player1.roundsWon >= 2 ? p1Profile : p2Profile}
          loser={player1.roundsWon >= 2 ? p2Profile : p1Profile}
          isP1Winner={player1.roundsWon >= 2}
          gameMode={gameMode}
          arcadeStageIndex={arcadeStageIndex}
          totalArcadeStages={STAGES.length}
          onNextArcadeMatch={handleNextArcadeMatch}
          onRematch={() => {
            startMatch(p1Profile, p2Profile, currentStage, gameMode, aiDifficulty, 1, 0, 0);
          }}
          onReturnToSelect={() => setAppState('SELECT')}
        />
      )}

      {/* Move List Modal */}
      <MoveListModal
        character={p1Profile}
        isOpen={isMoveListOpen}
        onClose={() => setIsMoveListOpen(false)}
      />

      {/* Cultural Codex Modal */}
      <CodexModal
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
      />
    </div>
  );
}
