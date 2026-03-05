export type Vector = { x: number; y: number };

export enum WeaponType {
  SWORD = "SWORD",
  PISTOL = "PISTOL",
  SHOTGUN = "SHOTGUN",
  PLASMA = "PLASMA",
  MINIGUN = "MINIGUN",
}

export interface Weapon {
  type: WeaponType;
  damage: number;
  fireRate: number;
  bulletSpeed: number;
  color: string;
  spread?: number;
  count?: number;
}

export interface Entity {
  id: string;
  pos: Vector;
  radius: number;
  health: number;
  maxHealth: number;
  speed: number;
  color: string;
}

export interface Player extends Entity {
  magic: number;
  maxMagic: number;
  aetherCharges: number;
  maxAetherCharges: number;
  weapon: Weapon;
  score: number;
  roomsCleared: number;
  lives: number;
}

export interface Enemy extends Entity {
  type: "BASIC" | "FAST" | "TANK" | "ELITE";
  lastShot: number;
  shootCooldown: number;
}

export interface Bullet {
  id: string;
  pos: Vector;
  vel: Vector;
  radius: number;
  damage: number;
  color: string;
  owner: "PLAYER" | "ENEMY";
  maxDistance?: number;
  distanceTraveled?: number;
}

export interface PowerUp {
  id: string;
  pos: Vector;
  type: "HEALTH" | "MAGIC" | "WEAPON_UPGRADE";
  radius: number;
}

export interface Explosion {
  id: string;
  pos: Vector;
  radius: number;
  maxRadius: number;
  duration: number;
  startTime: number;
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  explosions: Explosion[];
  roomNumber: number;
  isGameOver: boolean;
  isPaused: boolean;
  inDialogue: boolean;
  dialogueStep: number;
  screenShake: number;
}
