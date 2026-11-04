import React, { useRef, useEffect } from 'react';
import { FighterEntity, Projectile, ParticleEffect, Stage } from '../types/fighter';
import { STAGE_WIDTH, GROUND_Y } from '../engine/physics';

interface FightCanvasProps {
  player1: FighterEntity;
  player2: FighterEntity;
  stage: Stage;
  projectiles: Projectile[];
  particles: ParticleEffect[];
  screenShake: number;
  hitStopFrames: number;
  showHitboxes?: boolean;
}

export const FightCanvas: React.FC<FightCanvasProps> = ({
  player1,
  player2,
  stage,
  projectiles,
  particles,
  screenShake,
  showHitboxes = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Viewport dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Camera Calculation (Focus on midpoint of fighters with clamp)
    const midX = (player1.x + player2.x) / 2;
    const fighterDist = Math.abs(player1.x - player2.x);
    // Dynamic scale based on distance
    const scale = Math.max(0.85, Math.min(1.15, 1100 / (fighterDist + 400)));

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Apply Screen Shake
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake * 1.5;
      const shakeY = (Math.random() - 0.5) * screenShake * 1.5;
      ctx.translate(shakeX, shakeY);
    }

    // Apply dynamic camera centered on fighters
    const camX = width / 2 - midX * scale;
    const camY = height - 520 * scale;
    ctx.translate(camX, camY);
    ctx.scale(scale, scale);

    // 1. Draw Mountain Backdrop & Traditional Rondavels
    drawStageBackdrop(ctx, stage, width / scale, height / scale, midX);

    // 2. Draw Ground / Arena Floor
    drawArenaGround(ctx, stage);

    // 3. Draw Stage Weather (Snow, lightning flashes, embers, etc.)
    drawStageWeather(ctx, stage);

    // 4. Draw Projectiles
    drawProjectiles(ctx, projectiles);

    // 5. Draw Fighters (Authentic Basotho Kobo & Melamu animations)
    // Draw fighter who is not in hitstun on top, or P1 then P2
    if (player1.state === 'hitstun') {
      drawFighter(ctx, player1, showHitboxes);
      drawFighter(ctx, player2, showHitboxes);
    } else {
      drawFighter(ctx, player2, showHitboxes);
      drawFighter(ctx, player1, showHitboxes);
    }

    // 6. Draw Combat Particle Effects (Sparks, smoke, lightning)
    drawParticles(ctx, particles);

    ctx.restore();
  }, [player1, player2, stage, projectiles, particles, screenShake, showHitboxes]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black select-none">
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="w-full h-full max-w-[1440px] aspect-[16/9] object-contain shadow-2xl"
      />
    </div>
  );
};

// --- STAGE RENDERING ---
function drawStageBackdrop(ctx: CanvasRenderingContext2D, stage: Stage, viewW: number, viewH: number, camMidX: number) {
  // Sky Gradient
  const grad = ctx.createLinearGradient(0, -200, 0, GROUND_Y);
  grad.addColorStop(0, stage.bgGradTop);
  grad.addColorStop(1, stage.bgGradBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(-600, -400, STAGE_WIDTH + 1200, GROUND_Y + 500);

  // Distant Mountain Peaks (Maloti / Drakensberg)
  ctx.fillStyle = stage.mountainColor;
  ctx.beginPath();
  ctx.moveTo(-600, GROUND_Y);
  // Mountain silhouettes with Lesotho tablelands and jagged peaks
  const peaks = [
    [-400, 160], [-250, 60], [-100, 190], [100, 40], [250, 140],
    [450, 30], [600, 180], [800, 50], [950, 170], [1200, 20], [1500, 160]
  ];
  for (const [px, py] of peaks) {
    ctx.lineTo(px, py);
  }
  ctx.lineTo(STAGE_WIDTH + 600, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  // Subtle Parallax Mid-Ground (Sacred plateau cliffs like Thaba Bosiu)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
  ctx.beginPath();
  ctx.moveTo(-500, GROUND_Y);
  ctx.lineTo(-300, 260);
  ctx.lineTo(-150, 260);
  ctx.lineTo(50, 310);
  ctx.lineTo(250, 240);
  ctx.lineTo(480, 240);
  ctx.lineTo(650, 290);
  ctx.lineTo(900, 220);
  ctx.lineTo(1100, 220);
  ctx.lineTo(STAGE_WIDTH + 400, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  // Traditional Basotho Stone Rondavels (Thatched huts with smoke)
  drawRondavel(ctx, 120, GROUND_Y, 70, 75);
  drawRondavel(ctx, 240, GROUND_Y, 55, 60);
  drawRondavel(ctx, 880, GROUND_Y, 65, 70);
  drawRondavel(ctx, 990, GROUND_Y, 80, 85);

  // Village Watchfire / Kraal bonfires
  drawWatchfire(ctx, 180, GROUND_Y - 5);
  drawWatchfire(ctx, 935, GROUND_Y - 5);
}

function drawRondavel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  // Cylindrical stone base
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  const baseH = h * 0.55;
  ctx.fillRect(x - w / 2, y - baseH, w, baseH);
  ctx.strokeRect(x - w / 2, y - baseH, w, baseH);

  // Rounded wooden doorway with warm interior light
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(x, y - 22, 12, Math.PI, 0, false);
  ctx.lineTo(x + 12, y);
  ctx.lineTo(x - 12, y);
  ctx.closePath();
  ctx.fill();

  // Conical thatched roof (inspired by Mokorotlo hat geometry)
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 8, y - baseH);
  ctx.lineTo(x, y - h);
  ctx.lineTo(x + w / 2 + 8, y - baseH);
  ctx.closePath();
  ctx.fill();

  // Thatch ridges
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Top spire
  ctx.strokeStyle = '#d97706';
  ctx.beginPath();
  ctx.moveTo(x, y - h);
  ctx.lineTo(x, y - h - 10);
  ctx.stroke();

  ctx.restore();
}

function drawWatchfire(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  // Stones in circle
  ctx.fillStyle = '#475569';
  for (let i = -14; i <= 14; i += 7) {
    ctx.beginPath();
    ctx.arc(x + i, y - 2, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Flame glow
  const flicker = Math.sin(Date.now() * 0.01 + x) * 4;
  const flameGrad = ctx.createRadialGradient(x, y - 10, 2, x, y - 10, 30);
  flameGrad.addColorStop(0, 'rgba(251, 146, 60, 0.9)');
  flameGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.5)');
  flameGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.arc(x, y - 12, 28 + flicker, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawArenaGround(ctx: CanvasRenderingContext2D, stage: Stage) {
  ctx.save();
  // Main Ground Plane
  ctx.fillStyle = stage.groundColor;
  ctx.fillRect(-600, GROUND_Y, STAGE_WIDTH + 1200, 300);

  // Ground Edge / Surface line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-600, GROUND_Y);
  ctx.lineTo(STAGE_WIDTH + 600, GROUND_Y);
  ctx.stroke();

  // Ceremonial stone carvings on arena center
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(STAGE_WIDTH / 2, GROUND_Y + 40, 180, 0, Math.PI);
  ctx.stroke();

  ctx.restore();
}

function drawStageWeather(ctx: CanvasRenderingContext2D, stage: Stage) {
  const time = Date.now() * 0.002;
  ctx.save();

  if (stage.hasWeather === 'snow') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 73 + time * 60) % (STAGE_WIDTH + 400)) - 200;
      const sy = ((i * 47 + time * 120) % (GROUND_Y + 100));
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 3) + 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (stage.hasWeather === 'thunder') {
    // Occasional sky flash
    if (Math.sin(time * 3) > 0.96) {
      ctx.fillStyle = 'rgba(191, 219, 254, 0.15)';
      ctx.fillRect(-600, -400, STAGE_WIDTH + 1200, GROUND_Y + 500);
    }
  } else if (stage.hasWeather === 'fire_embers') {
    ctx.fillStyle = 'rgba(249, 115, 22, 0.8)';
    for (let i = 0; i < 35; i++) {
      const ex = ((i * 59 + Math.sin(time + i) * 30) % STAGE_WIDTH);
      const ey = GROUND_Y - ((time * 80 + i * 35) % 400);
      ctx.beginPath();
      ctx.arc(ex, ey, (i % 3) + 1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (stage.hasWeather === 'sand') {
    ctx.fillStyle = 'rgba(253, 224, 71, 0.45)';
    for (let i = 0; i < 30; i++) {
      const sx = ((i * 83 + time * 180) % (STAGE_WIDTH + 200)) - 100;
      const sy = GROUND_Y - ((i * 31 + Math.sin(time * 2 + i) * 20) % 250);
      ctx.fillRect(sx, sy, 6, 2);
    }
  }

  ctx.restore();
}

// --- PROJECTILE RENDERING ---
function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]) {
  for (const p of projectiles) {
    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.element === 'thunder') {
      // Lightning Spear Arc
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#93c5fd';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(-p.width / 2, 0);
      ctx.lineTo(-p.width / 4, -8);
      ctx.lineTo(0, 8);
      ctx.lineTo(p.width / 4, -8);
      ctx.lineTo(p.width / 2, 0);
      ctx.stroke();
    } else if (p.element === 'fire') {
      // Volcanic Magma Ball
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, p.width / 2);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#f97316');
      grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.element === 'nature') {
      // Jade Spirit Orb
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, p.width / 2);
      grad.addColorStop(0, '#bbf7d0');
      grad.addColorStop(0.6, '#22c55e');
      grad.addColorStop(1, 'rgba(21, 128, 61, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Ice / Wind / Shadow
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// --- AUTHENTIC BASOTHO FIGHTER SKELETAL & CLOTH RENDERING ---
function drawFighter(ctx: CanvasRenderingContext2D, fighter: FighterEntity, showHitboxes: boolean) {
  ctx.save();
  ctx.translate(fighter.x, fighter.y);

  const isRight = fighter.facing === 'right';
  const scaleX = isRight ? 1 : -1;
  ctx.scale(scaleX, 1);

  // Shadow under feet
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 38, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Invincibility or hit flash
  if (fighter.invincibleFrames > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
    ctx.globalAlpha = 0.6;
  }

  // Animation pose offsets based on state
  const pose = computeFighterPose(fighter);

  // 1. Draw Flowing Kobo Blanket Back Layer (Trailing Cape/Wrap)
  drawKoboBlanketBack(ctx, fighter, pose);

  // 2. Draw Legs & Leather Boots
  drawLegsAndBoots(ctx, fighter, pose);

  // 3. Draw Tactical Under-Armor & Belt
  drawTorsoAndArmor(ctx, fighter, pose);

  // 4. Draw Flowing Kobo Blanket Front Drapes (Woven patterns & borders)
  drawKoboBlanketFront(ctx, fighter, pose);

  // 5. Draw Head, Mokorotlo Conical Hat / Cowl & Glowing Eyes
  drawHeadAndHat(ctx, fighter, pose);

  // 6. Draw Arms & Traditional Weapon (Melamu / Curved Blade)
  drawArmsAndWeapon(ctx, fighter, pose);

  // 7. Elemental Aura / Special Stance FX
  if (fighter.meter >= 100 || fighter.state === 'super' || fighter.state === 'special') {
    drawFighterAura(ctx, fighter);
  }

  ctx.restore();

  // Debug Box View
  if (showHitboxes) {
    drawDebugBoxes(ctx, fighter);
  }
}

interface FighterPose {
  bodyY: number;
  bodyRotation: number;
  legL: { hipX: number; hipY: number; kneeX: number; kneeY: number; footX: number; footY: number };
  legR: { hipX: number; hipY: number; kneeX: number; kneeY: number; footX: number; footY: number };
  armLead: { shoulderX: number; shoulderY: number; elbowX: number; elbowY: number; handX: number; handY: number };
  armRear: { shoulderX: number; shoulderY: number; elbowX: number; elbowY: number; handX: number; handY: number };
  weaponAngle: number;
  blanketLift: number;
}

function computeFighterPose(fighter: FighterEntity): FighterPose {
  const s = fighter.state;
  const f = fighter.stateFrame;
  let bodyY = -90;
  let bodyRotation = 0;
  let blanketLift = 0;
  let weaponAngle = 0.3; // Default resting angle

  const legL = { hipX: -10, hipY: -45, kneeX: -15, kneeY: -22, footX: -18, footY: 0 };
  const legR = { hipX: 10, hipY: -45, kneeX: 15, kneeY: -22, footX: 18, footY: 0 };

  const armLead = { shoulderX: 12, shoulderY: -80, elbowX: 25, elbowY: -65, handX: 35, handY: -55 };
  const armRear = { shoulderX: -12, shoulderY: -80, elbowX: -18, elbowY: -65, handX: -15, handY: -55 };

  if (s === 'idle') {
    const breathe = Math.sin(Date.now() * 0.005) * 3;
    bodyY = -90 + breathe;
    armLead.handY += breathe * 0.5;
  } else if (s === 'walk_forward') {
    const cycle = Math.sin(Date.now() * 0.012);
    legL.footX = -10 - cycle * 20;
    legR.footX = 10 + cycle * 20;
    bodyRotation = 0.08;
    bodyY = -88 + Math.abs(cycle) * 4;
  } else if (s === 'walk_backward') {
    const cycle = Math.sin(Date.now() * 0.01);
    legL.footX = -10 + cycle * 15;
    legR.footX = 10 - cycle * 15;
    bodyRotation = -0.06;
  } else if (s === 'crouch') {
    bodyY = -60;
    legL.kneeX = -25; legL.kneeY = -12;
    legR.kneeX = 22; legR.kneeY = -12;
    armLead.handY = -35;
    blanketLift = -15;
  } else if (s === 'jump') {
    bodyY = -105;
    legL.kneeY = -28; legL.footY = -15;
    legR.kneeY = -28; legR.footY = -15;
    blanketLift = 25;
  } else if (s === 'dash') {
    bodyY = -80;
    bodyRotation = 0.22;
    armLead.handX = 45;
    blanketLift = 30;
  } else if (s === 'attack_light') {
    // Quick forward Melamu thrust
    bodyRotation = 0.12;
    armLead.elbowX = 40; armLead.elbowY = -75;
    armLead.handX = 65; armLead.handY = -70;
    weaponAngle = 1.5; // Horizontal thrust
    blanketLift = 15;
  } else if (s === 'attack_heavy') {
    // Heavy downward overhead clack
    if (f < 8) {
      // Wind-up high
      armLead.handX = -5; armLead.handY = -120;
      weaponAngle = -1.2;
    } else {
      // Crushing downward arc
      armLead.handX = 70; armLead.handY = -30;
      weaponAngle = 2.1;
      bodyRotation = 0.25;
    }
  } else if (s === 'special') {
    // Swirling blanket flourish & energy focus
    armLead.handX = 55; armLead.handY = -75;
    armRear.handX = -35; armRear.handY = -85;
    weaponAngle = 1.2;
    blanketLift = 35;
  } else if (s === 'super') {
    // Dramatic ascension posture
    armLead.handX = 35; armLead.handY = -115;
    armRear.handX = -35; armRear.handY = -115;
    weaponAngle = -0.1;
    blanketLift = 45;
  } else if (s === 'block_high' || s === 'block_low') {
    // Melamu angled across chest with blanket wrap
    armLead.handX = 18; armLead.handY = -85;
    armRear.handX = 5; armRear.handY = -70;
    weaponAngle = -0.8; // Angled shield posture
    bodyRotation = -0.1;
  } else if (s === 'hitstun') {
    bodyRotation = -0.25;
    bodyY = -85;
    armLead.handX = -10; armLead.handY = -60;
  } else if (s === 'knockdown') {
    bodyRotation = -1.2;
    bodyY = -25;
    legL.footY = -30; legR.footY = -20;
  }

  return {
    bodyY,
    bodyRotation,
    legL,
    legR,
    armLead,
    armRear,
    weaponAngle,
    blanketLift,
  };
}

// 1. Back Blanket Layer
function drawKoboBlanketBack(ctx: CanvasRenderingContext2D, fighter: FighterEntity, pose: FighterPose) {
  ctx.save();
  const theme = fighter.profile.themeColor;

  ctx.fillStyle = theme;
  ctx.beginPath();
  ctx.moveTo(-16, pose.bodyY + 15);
  ctx.quadraticCurveTo(-45 - pose.blanketLift * 0.4, pose.bodyY + 50, -32 - pose.blanketLift * 0.8, -10);
  ctx.lineTo(8, -10);
  ctx.quadraticCurveTo(5, pose.bodyY + 45, 16, pose.bodyY + 15);
  ctx.closePath();
  ctx.fill();

  // Cultural stripe pattern inside blanket back
  ctx.strokeStyle = fighter.profile.accentColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-28 - pose.blanketLift * 0.5, pose.bodyY + 40);
  ctx.lineTo(-20 - pose.blanketLift * 0.7, -10);
  ctx.stroke();

  ctx.restore();
}

// 2. Legs and Leather Bindings
function drawLegsAndBoots(ctx: CanvasRenderingContext2D, fighter: FighterEntity, pose: FighterPose) {
  ctx.save();
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#1e293b'; // Dark trousers

  // Left Leg
  ctx.beginPath();
  ctx.moveTo(pose.legL.hipX, pose.legL.hipY);
  ctx.lineTo(pose.legL.kneeX, pose.legL.kneeY);
  ctx.lineTo(pose.legL.footX, pose.legL.footY);
  ctx.stroke();

  // Right Leg
  ctx.beginPath();
  ctx.moveTo(pose.legR.hipX, pose.legR.hipY);
  ctx.lineTo(pose.legR.kneeX, pose.legR.kneeY);
  ctx.lineTo(pose.legR.footX, pose.legR.footY);
  ctx.stroke();

  // Boots
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(pose.legL.footX - 8, pose.legL.footY - 8, 18, 8);
  ctx.fillRect(pose.legR.footX - 8, pose.legR.footY - 8, 18, 8);

  ctx.restore();
}

// 3. Torso & Armor Undergarment
function drawTorsoAndArmor(ctx: CanvasRenderingContext2D, fighter: FighterEntity, pose: FighterPose) {
  ctx.save();
  ctx.translate(0, pose.bodyY);
  ctx.rotate(pose.bodyRotation);

  // Armored chest plate
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-18, 10, 36, 40);

  // War sash / sash belt (Tlamo ea Ntwa)
  ctx.fillStyle = fighter.profile.accentColor;
  ctx.fillRect(-20, 38, 40, 8);

  ctx.restore();
}

// 4. Flowing Kobo Blanket Front (Geometric Basotho patterns)
function drawKoboBlanketFront(ctx: CanvasRenderingContext2D, fighter: FighterEntity, pose: FighterPose) {
  ctx.save();
  ctx.translate(0, pose.bodyY);
  ctx.rotate(pose.bodyRotation);

  const theme = fighter.profile.themeColor;
  const accent = fighter.profile.accentColor;

  // Draped shoulder mantle
  ctx.fillStyle = theme;
  ctx.beginPath();
  ctx.moveTo(-24, 8);
  ctx.lineTo(24, 8);
  ctx.lineTo(20, 52);
  ctx.quadraticCurveTo(0, 58, -20, 52);
  ctx.closePath();
  ctx.fill();

  // Authentic Basotho blanket borders (Seanamarena stripes & diamonds)
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-18, 15);
  ctx.lineTo(-14, 48);
  ctx.moveTo(18, 15);
  ctx.lineTo(14, 48);
  ctx.stroke();

  // Royal / Clan Center Sigil (Tri-Peak or Spiral)
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(0, 30, 7, 0, Math.PI * 2);
  ctx.fill();

  // Sacred Tri-peak crest inside sigil
  ctx.fillStyle = theme;
  ctx.beginPath();
  ctx.moveTo(-4, 33);
  ctx.lineTo(0, 26);
  ctx.lineTo(4, 33);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// 5. Head, Mokorotlo Hat & Mask
function drawHeadAndHat(ctx: CanvasRenderingContext2D, fighter: FighterEntity, pose: FighterPose) {
  ctx.save();
  ctx.translate(0, pose.bodyY);
  ctx.rotate(pose.bodyRotation);

  const charId = fighter.profile.id;

  // Mask / Cowl Base
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, -5, 14, 0, Math.PI * 2);
  ctx.fill();

  // Glowing Elemental Eyes (Iconic ninja / royal guard gaze)
  ctx.fillStyle = fighter.profile.accentColor;
  ctx.shadowColor = fighter.profile.accentColor;
  ctx.shadowBlur = 8;
  ctx.fillRect(2, -7, 5, 2.5);
  ctx.fillRect(8, -7, 4, 2.5);
  ctx.shadowBlur = 0;

  // Check if character wears Mokorotlo Hat (Makotoane, Mokhachane, Molapo, Lerotholi)
  if (['makotoane', 'mokhachane', 'molapo', 'lerotholi'].includes(charId)) {
    // Authentic Basotho Mokorotlo Conical Hat
    // Brim
    ctx.fillStyle = charId === 'makotoane' ? '#1e3a8a' : charId === 'molapo' ? '#7f1d1d' : '#292524';
    ctx.beginPath();
    ctx.ellipse(0, -14, 30, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = fighter.profile.accentColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Conical Peak
    ctx.beginPath();
    ctx.moveTo(-18, -14);
    ctx.lineTo(0, -38);
    ctx.lineTo(18, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top woven loop of Mokorotlo
    ctx.beginPath();
    ctx.arc(0, -41, 3.5, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Hooded cowl (Nthabiseng, Tlali, Tau, Moriti)
    ctx.fillStyle = fighter.profile.themeColor;
    ctx.beginPath();
    ctx.arc(0, -8, 17, Math.PI, 0, false);
    ctx.quadraticCurveTo(18, 5, 12, 10);
    ctx.quadraticCurveTo(-18, 5, -12, 10);
    ctx.closePath();
    ctx.fill();

    // Moriti Halo Ring
    if (charId === 'moriti') {
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, -12, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  ctx.restore();
}

// 6. Arms & Traditional Weapons (Melamu stick / Royal blade)
function drawArmsAndWeapon(ctx: CanvasRenderingContext2D, fighter: FighterEntity, pose: FighterPose) {
  ctx.save();
  ctx.translate(0, pose.bodyY);
  ctx.rotate(pose.bodyRotation);

  // Rear Arm
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pose.armRear.shoulderX, pose.armRear.shoulderY - pose.bodyY);
  ctx.lineTo(pose.armRear.elbowX, pose.armRear.elbowY - pose.bodyY);
  ctx.lineTo(pose.armRear.handX, pose.armRear.handY - pose.bodyY);
  ctx.stroke();

  // Lead Arm
  ctx.beginPath();
  ctx.moveTo(pose.armLead.shoulderX, pose.armLead.shoulderY - pose.bodyY);
  ctx.lineTo(pose.armLead.elbowX, pose.armLead.elbowY - pose.bodyY);
  ctx.lineTo(pose.armLead.handX, pose.armLead.handY - pose.bodyY);
  ctx.stroke();

  // Weapon in hand
  const handX = pose.armLead.handX;
  const handY = pose.armLead.handY - pose.bodyY;

  ctx.save();
  ctx.translate(handX, handY);
  ctx.rotate(pose.weaponAngle);

  const weapon = fighter.profile.weapon;

  if (weapon.includes('Blade') || weapon.includes('Sword') || weapon.includes('Katana')) {
    // Curved Royal Broadsword / Katana
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = fighter.profile.accentColor;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = fighter.profile.accentColor;
    ctx.shadowBlur = fighter.state.includes('attack') ? 12 : 2;

    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.lineTo(3, -6);
    ctx.lineTo(6, -65);
    ctx.lineTo(0, -78); // Sharp tip
    ctx.lineTo(-4, -65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hilt / Tsuka
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-5, -6, 10, 16);
    ctx.fillStyle = fighter.profile.accentColor;
    ctx.fillRect(-7, -7, 14, 3);
  } else {
    // Traditional Basotho Melamu Fighting Stick / Knobkerrie
    ctx.strokeStyle = '#78350f'; // Polished hard mountain wood
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(0, -68);
    ctx.stroke();

    // Carved Knobkerrie bulb at top
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.arc(0, -70, 8, 0, Math.PI * 2);
    ctx.fill();

    // Elemental infusion glow at head
    ctx.strokeStyle = fighter.profile.accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
  ctx.restore();
}

// 7. Elemental Aura on High Meter or Special Moves
function drawFighterAura(ctx: CanvasRenderingContext2D, fighter: FighterEntity) {
  ctx.save();
  const time = Date.now() * 0.008;
  const accent = fighter.profile.accentColor;

  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5 + Math.sin(time) * 0.25;

  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 + time;
    const r = 55 + Math.sin(time * 2 + i) * 8;
    const ax = Math.cos(angle) * (r * 0.6);
    const ay = -60 + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(ax, ay);
    else ctx.lineTo(ax, ay);
  }
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

// 8. Particle System Rendering
function drawParticles(ctx: CanvasRenderingContext2D, particles: ParticleEffect[]) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life++;

    const alpha = 1 - p.life / p.maxLife;
    if (alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    if (p.type === 'shockwave') {
      const radius = (p.radius || 10) + p.life * 4;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// 9. Debug Hitbox / Hurtbox Overlay
function drawDebugBoxes(ctx: CanvasRenderingContext2D, fighter: FighterEntity) {
  // Hurtbox (Green)
  ctx.save();
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  const height = fighter.isCrouching ? 95 : 145;
  ctx.strokeRect(fighter.x - 32, fighter.y - height, 64, height);

  // Hitbox (Red)
  if (fighter.hitboxActive && fighter.currentAttack) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    const move = fighter.currentAttack;
    const isRight = fighter.facing === 'right';
    const hitX = isRight ? fighter.x + 10 : fighter.x - 10 - move.rangeX;
    const hitY = fighter.y + move.offsetY - move.rangeY / 2;
    ctx.strokeRect(hitX, hitY, move.rangeX, move.rangeY);
  }

  ctx.restore();
}
