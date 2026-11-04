import { FighterEntity } from '../types/fighter';

export type AIDifficulty = 'novice' | 'warrior' | 'champion';

export interface AIInputs {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  light: boolean;
  heavy: boolean;
  special: boolean;
  super: boolean;
  dash: boolean;
}

export class FighterAI {
  private difficulty: AIDifficulty;
  private actionCooldown: number = 0;
  private currentStrategy: 'approach' | 'retreat' | 'poke' | 'anti_air' | 'combo' | 'block' = 'approach';
  private strategyFrames: number = 0;

  constructor(difficulty: AIDifficulty = 'warrior') {
    this.difficulty = difficulty;
  }

  public setDifficulty(diff: AIDifficulty) {
    this.difficulty = diff;
  }

  public decide(ai: FighterEntity, player: FighterEntity): AIInputs {
    const inputs: AIInputs = {
      left: false,
      right: false,
      up: false,
      down: false,
      light: false,
      heavy: false,
      special: false,
      super: false,
      dash: false,
    };

    if (ai.state === 'hitstun' || ai.state === 'knockdown' || ai.state === 'defeat' || ai.state === 'victory') {
      return inputs;
    }

    const dist = Math.abs(ai.x - player.x);
    const aiIsRight = ai.x > player.x;
    const playerIsAttacking =
      player.state === 'attack_light' ||
      player.state === 'attack_heavy' ||
      player.state === 'special' ||
      player.state === 'super';

    // Difficulty-based block reaction chance
    const blockChance = this.difficulty === 'champion' ? 0.88 : this.difficulty === 'warrior' ? 0.65 : 0.35;
    const parryChance = this.difficulty === 'champion' ? 0.25 : 0.08;

    // Defensive check
    if (playerIsAttacking && dist < 160 && Math.random() < blockChance) {
      // Walk away from player to block
      if (aiIsRight) inputs.right = true;
      else inputs.left = true;

      if (player.isCrouching) {
        inputs.down = true; // Low block
      }
      return inputs;
    }

    // Super Move Activation
    if (ai.meter >= 100 && dist < 220 && Math.random() < (this.difficulty === 'champion' ? 0.45 : 0.25)) {
      inputs.super = true;
      return inputs;
    }

    // Cooldown check for next proactive action
    this.actionCooldown--;
    this.strategyFrames--;

    if (this.strategyFrames <= 0) {
      this.strategyFrames = Math.floor(Math.random() * 25) + 15;
      const roll = Math.random();
      if (dist > 280) {
        this.currentStrategy = 'approach';
      } else if (dist < 90 && roll < 0.4) {
        this.currentStrategy = 'retreat';
      } else if (player.state === 'jump') {
        this.currentStrategy = 'anti_air';
      } else {
        this.currentStrategy = roll < 0.6 ? 'poke' : 'combo';
      }
    }

    // Execute active strategy
    if (this.currentStrategy === 'approach') {
      if (aiIsRight) inputs.left = true;
      else inputs.right = true;

      // Occasional dash
      if (dist > 220 && Math.random() < 0.15) {
        inputs.dash = true;
      }
    } else if (this.currentStrategy === 'retreat') {
      if (aiIsRight) inputs.right = true;
      else inputs.left = true;
    } else if (this.currentStrategy === 'anti_air') {
      if (dist < 120) {
        inputs.heavy = true; // High clack
      }
    } else if (this.currentStrategy === 'poke' || this.currentStrategy === 'combo') {
      if (dist <= 100) {
        const attackRoll = Math.random();
        if (attackRoll < 0.45) {
          inputs.light = true;
        } else if (attackRoll < 0.8) {
          inputs.heavy = true;
        } else {
          inputs.special = true;
        }
      } else if (dist <= 180) {
        if (Math.random() < 0.5) {
          inputs.special = true;
        } else {
          if (aiIsRight) inputs.left = true;
          else inputs.right = true;
        }
      } else {
        if (aiIsRight) inputs.left = true;
        else inputs.right = true;
      }
    }

    return inputs;
  }
}
