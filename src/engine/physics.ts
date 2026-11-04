import { FighterEntity, MoveData, Hitbox, Hurtbox, Projectile, ParticleEffect } from '../types/fighter';
import { soundEngine } from '../audio/soundEngine';

export const STAGE_WIDTH = 1100;
export const GROUND_Y = 460;
export const GRAVITY = 0.85;

export function createFighter(
  id: string,
  profile: any,
  startX: number,
  isPlayer: boolean,
  playerNum: 1 | 2
): FighterEntity {
  return {
    id,
    profile,
    x: startX,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    facing: playerNum === 1 ? 'right' : 'left',
    health: 1000,
    maxHealth: 1000,
    meter: 25, // Start with quarter bar for excitement
    state: 'idle',
    stateFrame: 0,
    totalStateFrames: 0,
    isGrounded: true,
    isCrouching: false,
    comboCount: 0,
    hitboxActive: false,
    invincibleFrames: 0,
    parryWindow: 0,
    roundsWon: 0,
    isPlayer,
    playerNum,
    blanketPhysics: {
      clothNodes: [
        { x: startX, y: GROUND_Y - 80, vx: 0, vy: 0 },
        { x: startX - (playerNum === 1 ? 15 : -15), y: GROUND_Y - 55, vx: 0, vy: 0 },
        { x: startX - (playerNum === 1 ? 25 : -25), y: GROUND_Y - 30, vx: 0, vy: 0 },
        { x: startX - (playerNum === 1 ? 35 : -35), y: GROUND_Y - 10, vx: 0, vy: 0 },
      ],
      flutterAngle: 0,
    },
  };
}

export function getFighterHurtbox(fighter: FighterEntity): Hurtbox {
  const isCrouching = fighter.isCrouching;
  const height = isCrouching ? 95 : 145;
  const width = 64;
  return {
    x: fighter.x - width / 2,
    y: fighter.y - height,
    width,
    height,
  };
}

export function getFighterHitbox(fighter: FighterEntity): Hitbox | null {
  if (!fighter.hitboxActive || !fighter.currentAttack) return null;
  const move = fighter.currentAttack;
  const isRight = fighter.facing === 'right';
  const width = move.rangeX;
  const height = move.rangeY;

  return {
    x: isRight ? fighter.x + 10 : fighter.x - 10 - width,
    y: fighter.y + move.offsetY - height / 2,
    width,
    height,
    damage: move.damage,
    hitStun: move.hitStun,
    blockStun: move.blockStun,
    knockbackX: move.knockbackX,
    knockbackY: move.knockbackY,
    isSuper: move.type === 'super',
  };
}

export function checkAABBCollision(
  box1: { x: number; y: number; width: number; height: number },
  box2: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    box1.x < box2.x + box2.width &&
    box1.x + box1.width > box2.x &&
    box1.y < box2.y + box2.height &&
    box1.y + box1.height > box2.y
  );
}

export interface HitResult {
  hitLanded: boolean;
  isBlocked: boolean;
  isParry: boolean;
  damageDealt: number;
  hitX: number;
  hitY: number;
}

export function updateFighterState(
  fighter: FighterEntity,
  opponent: FighterEntity,
  inputs: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    light: boolean;
    heavy: boolean;
    special: boolean;
    super: boolean;
    dash: boolean;
  },
  projectiles: Projectile[],
  particles: ParticleEffect[]
): HitResult | null {
  // Decrease invincibility and parry windows
  if (fighter.invincibleFrames > 0) fighter.invincibleFrames--;
  if (fighter.parryWindow > 0) fighter.parryWindow--;

  // Update cloth/blanket physics
  updateBlanketCloth(fighter);

  // If in hitstun, knockdown, victory, or defeat
  if (fighter.state === 'defeat' || fighter.state === 'victory') {
    fighter.vx *= 0.8;
    applyPhysics(fighter);
    return null;
  }

  if (fighter.state === 'hitstun') {
    fighter.stateFrame++;
    fighter.hitboxActive = false;
    fighter.vx *= 0.88;
    applyPhysics(fighter);
    if (fighter.stateFrame >= fighter.totalStateFrames) {
      fighter.state = 'idle';
      fighter.comboCount = 0;
    }
    return null;
  }

  if (fighter.state === 'knockdown') {
    fighter.stateFrame++;
    fighter.hitboxActive = false;
    fighter.vx *= 0.85;
    applyPhysics(fighter);
    if (fighter.y >= GROUND_Y && fighter.stateFrame > 25) {
      fighter.state = 'getup';
      fighter.stateFrame = 0;
      fighter.totalStateFrames = 18;
      fighter.invincibleFrames = 15;
    }
    return null;
  }

  if (fighter.state === 'getup') {
    fighter.stateFrame++;
    fighter.vx *= 0.8;
    applyPhysics(fighter);
    if (fighter.stateFrame >= fighter.totalStateFrames) {
      fighter.state = 'idle';
      fighter.comboCount = 0;
    }
    return null;
  }

  // Blocking states
  if (fighter.state === 'block_high' || fighter.state === 'block_low' || fighter.state === 'parry') {
    fighter.stateFrame++;
    fighter.vx *= 0.82;
    applyPhysics(fighter);
    if (fighter.stateFrame >= fighter.totalStateFrames) {
      fighter.state = 'idle';
    }
    return null;
  }

  // Attack execution logic
  if (
    fighter.state === 'attack_light' ||
    fighter.state === 'attack_heavy' ||
    fighter.state === 'special' ||
    fighter.state === 'super'
  ) {
    fighter.stateFrame++;
    const move = fighter.currentAttack;
    if (move) {
      // Active window check
      if (
        fighter.stateFrame >= move.startupFrames &&
        fighter.stateFrame < move.startupFrames + move.activeFrames
      ) {
        fighter.hitboxActive = true;

        // If this is a projectile special spawn
        if (
          move.type === 'special' &&
          fighter.stateFrame === move.startupFrames + 2 &&
          (fighter.profile.id === 'mokhachane' ||
            fighter.profile.id === 'tlali' ||
            fighter.profile.id === 'molapo' ||
            fighter.profile.id === 'lerotholi')
        ) {
          spawnProjectile(fighter, projectiles);
        }
      } else {
        fighter.hitboxActive = false;
      }

      // Check recovery done
      const totalFrames = move.startupFrames + move.activeFrames + move.recoveryFrames;
      if (fighter.stateFrame >= totalFrames) {
        fighter.state = 'idle';
        fighter.currentAttack = undefined;
        fighter.hitboxActive = false;
      }
    }
    fighter.vx *= 0.88;
    applyPhysics(fighter);
    return null;
  }

  // Normal movement & command execution
  // Determine if holding back (blocking direction)
  const isFacingRight = fighter.facing === 'right';
  const holdingBack = isFacingRight ? inputs.left : inputs.right;
  const holdingForward = isFacingRight ? inputs.right : inputs.left;

  // Face opponent if grounded and not mid-action
  if (fighter.isGrounded) {
    if (fighter.x < opponent.x) {
      fighter.facing = 'right';
    } else {
      fighter.facing = 'left';
    }
  }

  // Crouch check
  fighter.isCrouching = inputs.down && fighter.isGrounded;

  // Attacks trigger
  if (inputs.super && fighter.meter >= 100 && fighter.isGrounded) {
    startAttack(fighter, fighter.profile.moves.super, 'super');
    fighter.meter = 0;
    soundEngine.playSuperFlash();
    spawnSuperAura(fighter, particles);
    return null;
  }

  if (inputs.special) {
    startAttack(fighter, fighter.profile.moves.special, 'special');
    soundEngine.playBlanketWhoosh();
    if (fighter.profile.element === 'thunder') soundEngine.playLightning();
    else if (fighter.profile.element === 'fire') soundEngine.playFire();
    else soundEngine.playMelamuClack();
    return null;
  }

  if (inputs.heavy) {
    startAttack(fighter, fighter.profile.moves.heavy, 'attack_heavy');
    soundEngine.playBlanketWhoosh();
    return null;
  }

  if (inputs.light) {
    startAttack(fighter, fighter.profile.moves.light, 'attack_light');
    soundEngine.playMelamuClack();
    return null;
  }

  // Dashing
  if (inputs.dash && fighter.isGrounded) {
    fighter.state = 'dash';
    const dashDir = holdingBack ? -1 : 1;
    const dir = isFacingRight ? dashDir : -dashDir;
    fighter.vx = dir * 12;
    soundEngine.playBlanketWhoosh();
    spawnDashDust(fighter, particles);
  }

  // Jump
  if (inputs.up && fighter.isGrounded) {
    fighter.vy = -16.5;
    fighter.isGrounded = false;
    fighter.state = 'jump';
    if (holdingForward) fighter.vx = isFacingRight ? 5.5 : -5.5;
    else if (holdingBack) fighter.vx = isFacingRight ? -5.5 : 5.5;
    else fighter.vx = 0;
    soundEngine.playBlanketWhoosh();
  }

  // Walking & crouching movement
  if (fighter.isGrounded && fighter.state !== 'dash') {
    if (fighter.isCrouching) {
      fighter.state = 'crouch';
      fighter.vx *= 0.7;
    } else if (holdingForward) {
      fighter.state = 'walk_forward';
      fighter.vx = (isFacingRight ? 1 : -1) * (fighter.profile.stats.speed * 0.55 + 2.5);
    } else if (holdingBack) {
      fighter.state = 'walk_backward';
      fighter.vx = (isFacingRight ? -1 : 1) * (fighter.profile.stats.speed * 0.45 + 1.8);
      // Give parry window if just started holding back
      if (fighter.parryWindow === 0) fighter.parryWindow = 6;
    } else {
      fighter.state = 'idle';
      fighter.vx *= 0.75;
    }
  }

  applyPhysics(fighter);
  return null;
}

function startAttack(fighter: FighterEntity, move: MoveData, state: any) {
  fighter.state = state;
  fighter.stateFrame = 0;
  fighter.totalStateFrames = move.startupFrames + move.activeFrames + move.recoveryFrames;
  fighter.currentAttack = move;
  fighter.hitboxActive = false;
}

function applyPhysics(fighter: FighterEntity) {
  fighter.x += fighter.vx;
  fighter.y += fighter.vy;

  // Gravity
  if (!fighter.isGrounded) {
    fighter.vy += GRAVITY;
  }

  // Ground collision
  if (fighter.y >= GROUND_Y) {
    fighter.y = GROUND_Y;
    fighter.vy = 0;
    fighter.isGrounded = true;
    if (fighter.state === 'jump') {
      fighter.state = 'idle';
    }
  } else {
    fighter.isGrounded = false;
  }

  // Arena wall bounds
  const minX = 75;
  const maxX = STAGE_WIDTH - 75;
  if (fighter.x < minX) {
    fighter.x = minX;
    fighter.vx = 0;
  } else if (fighter.x > maxX) {
    fighter.x = maxX;
    fighter.vx = 0;
  }
}

// Check combat interaction between Attacker & Defender
export function processCombatHit(
  attacker: FighterEntity,
  defender: FighterEntity,
  particles: ParticleEffect[]
): HitResult | null {
  const hitbox = getFighterHitbox(attacker);
  if (!hitbox) return null;

  const hurtbox = getFighterHurtbox(defender);

  if (defender.invincibleFrames > 0) return null;

  if (checkAABBCollision(hitbox, hurtbox)) {
    // We have a collision!
    const hitX = (hitbox.x + hitbox.width / 2 + hurtbox.x + hurtbox.width / 2) / 2;
    const hitY = (hitbox.y + hitbox.height / 2 + hurtbox.y + hurtbox.height / 2) / 2;

    // Check if Defender is blocking
    const isDefenderFacingRight = defender.facing === 'right';
    const isAttackerOnRight = attacker.x > defender.x;
    // Blocking means holding toward opposite of attacker
    const holdingBlock = isAttackerOnRight
      ? defender.state === 'walk_backward' || (defender.isCrouching && !isDefenderFacingRight)
      : defender.state === 'walk_backward' || (defender.isCrouching && isDefenderFacingRight);

    // Parry Check (Perfect timed block)
    if (defender.parryWindow > 0 && holdingBlock) {
      defender.state = 'parry';
      defender.stateFrame = 0;
      defender.totalStateFrames = 12;
      defender.meter = Math.min(100, defender.meter + 15);
      attacker.state = 'hitstun';
      attacker.stateFrame = 0;
      attacker.totalStateFrames = 16;
      attacker.vx = (attacker.facing === 'right' ? -1 : 1) * 8;
      attacker.hitboxActive = false;

      soundEngine.playParry();
      spawnParrySparks(hitX, hitY, particles);
      return {
        hitLanded: true,
        isBlocked: true,
        isParry: true,
        damageDealt: 0,
        hitX,
        hitY,
      };
    }

    if (holdingBlock) {
      // Standard block
      const blockDamage = hitbox.damage * 0.15;
      defender.health = Math.max(1, defender.health - blockDamage);
      defender.state = defender.isCrouching ? 'block_low' : 'block_high';
      defender.stateFrame = 0;
      defender.totalStateFrames = hitbox.blockStun;
      defender.vx = (attacker.facing === 'right' ? 1 : -1) * (hitbox.knockbackX * 0.6);
      defender.meter = Math.min(100, defender.meter + 8);
      attacker.meter = Math.min(100, attacker.meter + 6);
      attacker.hitboxActive = false; // Prevents multiple hits in 1 swing

      soundEngine.playBlock();
      spawnBlockSparks(hitX, hitY, particles);
      return {
        hitLanded: true,
        isBlocked: true,
        isParry: false,
        damageDealt: blockDamage,
        hitX,
        hitY,
      };
    }

    // Direct Hit!
    const defenseFactor = 1 - (defender.profile.stats.defense - 5) * 0.03;
    const actualDamage = Math.round(hitbox.damage * defenseFactor);

    defender.health = Math.max(0, defender.health - actualDamage);
    defender.state = hitbox.knockbackY > 4 || defender.health <= 0 ? 'knockdown' : 'hitstun';
    defender.stateFrame = 0;
    defender.totalStateFrames = hitbox.hitStun;
    defender.vx = (attacker.facing === 'right' ? 1 : -1) * hitbox.knockbackX;
    defender.vy = -hitbox.knockbackY;
    if (hitbox.knockbackY > 0) defender.isGrounded = false;

    // Meters & Combos
    attacker.comboCount++;
    attacker.meter = Math.min(100, attacker.meter + (attacker.currentAttack?.meterGain || 12));
    defender.meter = Math.min(100, defender.meter + 12);
    attacker.hitboxActive = false;

    // SFX & Particles
    if (hitbox.isSuper) {
      soundEngine.playHeavySlash();
      spawnSuperImpact(hitX, hitY, attacker.profile.element, particles);
    } else if (attacker.profile.weapon.includes('Blade') || attacker.profile.weapon.includes('Sword')) {
      soundEngine.playHeavySlash();
      spawnHitSparks(hitX, hitY, attacker.profile.themeColor, particles);
    } else {
      soundEngine.playMelamuClack();
      spawnHitSparks(hitX, hitY, attacker.profile.accentColor, particles);
    }

    return {
      hitLanded: true,
      isBlocked: false,
      isParry: false,
      damageDealt: actualDamage,
      hitX,
      hitY,
    };
  }

  return null;
}

// Cloth physics for the flowing Basotho blanket
function updateBlanketCloth(fighter: FighterEntity) {
  const isRight = fighter.facing === 'right';
  const rootX = fighter.x - (isRight ? 18 : -18);
  const rootY = fighter.y - (fighter.isCrouching ? 65 : 105);

  const nodes = fighter.blanketPhysics.clothNodes;
  nodes[0].x = rootX;
  nodes[0].y = rootY;

  const flutter = Math.sin(Date.now() * 0.008 + fighter.x * 0.05) * 3;

  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];

    // Follow predecessor with springiness & inertia
    const targetX = prev.x - (isRight ? 14 : -14) - fighter.vx * 1.5 + (i === 3 ? flutter : 0);
    const targetY = prev.y + 24;

    curr.vx += (targetX - curr.x) * 0.35;
    curr.vy += (targetY - curr.y) * 0.35;

    curr.vx *= 0.65;
    curr.vy *= 0.65;

    curr.x += curr.vx;
    curr.y += curr.vy;
  }
}

// Projectile Spawning
function spawnProjectile(fighter: FighterEntity, projectiles: Projectile[]) {
  const isRight = fighter.facing === 'right';
  projectiles.push({
    id: `proj_${Date.now()}_${Math.random()}`,
    ownerId: fighter.id,
    x: fighter.x + (isRight ? 45 : -45),
    y: fighter.y - 65,
    vx: isRight ? 11 : -11,
    vy: 0,
    width: 38,
    height: 38,
    damage: 130,
    color: fighter.profile.accentColor,
    element: fighter.profile.element,
    life: 90,
    isSuper: false,
  });
}

// Particle emitters
function spawnHitSparks(x: number, y: number, color: string, particles: ParticleEffect[]) {
  for (let i = 0; i < 18; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 3;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 0,
      maxLife: 22,
      color,
      size: Math.random() * 4 + 2,
      type: 'spark',
    });
  }
}

function spawnBlockSparks(x: number, y: number, particles: ParticleEffect[]) {
  for (let i = 0; i < 10; i++) {
    const angle = Math.PI * (Math.random() - 0.5);
    const speed = Math.random() * 5 + 2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 0,
      maxLife: 15,
      color: '#cbd5e1',
      size: 2.5,
      type: 'spark',
    });
  }
}

function spawnParrySparks(x: number, y: number, particles: ParticleEffect[]) {
  particles.push({
    x,
    y,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 20,
    color: '#38bdf8',
    size: 20,
    type: 'shockwave',
    radius: 10,
  });
}

function spawnSuperImpact(x: number, y: number, element: string, particles: ParticleEffect[]) {
  particles.push({
    x,
    y,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 35,
    color: element === 'fire' ? '#f97316' : element === 'thunder' ? '#60a5fa' : '#a855f7',
    size: 35,
    type: 'shockwave',
    radius: 15,
  });
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 14 + 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      life: 0,
      maxLife: 35,
      color: '#facc15',
      size: Math.random() * 5 + 3,
      type: 'spark',
    });
  }
}

function spawnDashDust(fighter: FighterEntity, particles: ParticleEffect[]) {
  for (let i = 0; i < 6; i++) {
    particles.push({
      x: fighter.x - (fighter.facing === 'right' ? 20 : -20),
      y: fighter.y - 10,
      vx: (Math.random() - 0.5) * 3,
      vy: -Math.random() * 2,
      life: 0,
      maxLife: 18,
      color: '#94a3b8',
      size: Math.random() * 6 + 3,
      type: 'smoke',
    });
  }
}

function spawnSuperAura(fighter: FighterEntity, particles: ParticleEffect[]) {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: fighter.x + (Math.random() - 0.5) * 50,
      y: fighter.y - Math.random() * 110,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 6 - 2,
      life: 0,
      maxLife: 28,
      color: fighter.profile.accentColor,
      size: Math.random() * 4 + 2,
      type: 'lightning',
    });
  }
}
