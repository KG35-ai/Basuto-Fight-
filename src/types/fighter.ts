export type ElementType = 'thunder' | 'fire' | 'ice' | 'nature' | 'shadow' | 'wind' | 'earth';

export type CombatState =
  | 'idle'
  | 'walk_forward'
  | 'walk_backward'
  | 'crouch'
  | 'jump'
  | 'dash'
  | 'attack_light'
  | 'attack_heavy'
  | 'special'
  | 'super'
  | 'block_high'
  | 'block_low'
  | 'parry'
  | 'hitstun'
  | 'knockdown'
  | 'getup'
  | 'victory'
  | 'defeat';

export interface MoveData {
  name: string;
  sesothoName: string;
  type: 'normal' | 'special' | 'super';
  startupFrames: number;
  activeFrames: number;
  recoveryFrames: number;
  damage: number;
  blockDamage: number;
  hitStun: number;
  blockStun: number;
  knockbackX: number;
  knockbackY: number;
  rangeX: number;
  rangeY: number;
  offsetY: number;
  meterGain: number;
  description: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  sesothoTitle: string;
  title: string;
  clan: string;
  element: ElementType;
  image: string;
  rosterThumbnail: string;
  blanketMotif: string;
  weapon: string;
  fightingStyle: string;
  lore: string;
  culturalBackground: string;
  themeColor: string;
  accentColor: string;
  stats: {
    attack: number;    // 1-10
    defense: number;   // 1-10
    speed: number;     // 1-10
    range: number;     // 1-10
    spirit: number;    // 1-10
  };
  moves: {
    light: MoveData;
    heavy: MoveData;
    special: MoveData;
    super: MoveData;
  };
}

export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  hitStun: number;
  blockStun: number;
  knockbackX: number;
  knockbackY: number;
  isSuper?: boolean;
}

export interface Hurtbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FighterEntity {
  id: string;
  profile: CharacterProfile;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 'left' | 'right';
  health: number;
  maxHealth: number;
  meter: number; // 0 to 100
  state: CombatState;
  stateFrame: number;
  totalStateFrames: number;
  isGrounded: boolean;
  isCrouching: boolean;
  comboCount: number;
  currentAttack?: MoveData;
  hitboxActive: boolean;
  invincibleFrames: number;
  parryWindow: number;
  lastHitBy?: string;
  roundsWon: number;
  isPlayer: boolean;
  playerNum: 1 | 2;
  blanketPhysics: {
    clothNodes: { x: number; y: number; vx: number; vy: number }[];
    flutterAngle: number;
  };
}

export interface ParticleEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'spark' | 'lightning' | 'ember' | 'frost' | 'petal' | 'poison' | 'smoke' | 'shockwave';
  radius?: number;
}

export interface Projectile {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
  color: string;
  element: ElementType;
  life: number;
  isSuper: boolean;
}

export interface Stage {
  id: string;
  name: string;
  sesothoName: string;
  region: string;
  bgGradTop: string;
  bgGradBottom: string;
  mountainColor: string;
  groundColor: string;
  description: string;
  hasWeather: 'snow' | 'thunder' | 'fire_embers' | 'petals' | 'mist' | 'sand';
}

export type GameMode = 'ARCADE' | 'VERSUS' | 'TRAINING';
