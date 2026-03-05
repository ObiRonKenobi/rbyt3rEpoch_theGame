import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Circle, Rect, Group } from 'react-konva';
import { Player, Enemy, Bullet, GameState, WeaponType, Vector, PowerUp } from '../types';
import { HUD } from './HUD';
import { Dialogue } from './Dialogue';
import { GameOver } from './GameOver';
import { StartScreen } from './StartScreen';
import { InitialsEntry } from './InitialsEntry';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const SWORD_WEAPON = {
  type: WeaponType.SWORD,
  damage: 35, // Buffed damage
  fireRate: 350,
  bulletSpeed: 0,
  color: '#e2e8f0',
};

const PISTOL_WEAPON = {
  type: WeaponType.PISTOL,
  damage: 15,
  fireRate: 200,
  bulletSpeed: 12,
  color: '#ffffff', // White bullets for visibility
};

const SHOTGUN_WEAPON = {
  type: WeaponType.SHOTGUN,
  damage: 12,
  fireRate: 700,
  bulletSpeed: 10,
  color: '#f97316',
  spread: 0.4,
  count: 6,
};

const PLASMA_WEAPON = {
  type: WeaponType.PLASMA,
  damage: 50,
  fireRate: 900,
  bulletSpeed: 6,
  color: '#a855f7',
};

const MINIGUN_WEAPON = {
  type: WeaponType.MINIGUN,
  damage: 8,
  fireRate: 100,
  bulletSpeed: 14,
  color: '#fbbf24',
};

export const Game: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [showInitials, setShowInitials] = useState(false);
  const [meleeSwing, setMeleeSwing] = useState<{ active: boolean; angle: number }>({ active: false, angle: 0 });
  const stageRef = useRef<any>(null);
  const [gameState, setGameState] = useState<GameState>({
    player: {
      id: 'player',
      pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
      radius: 15,
      health: 100,
      maxHealth: 100,
      magic: 0,
      maxMagic: 100,
      aetherCharges: 0,
      maxAetherCharges: 1,
      speed: 4,
      color: '#10b981',
      weapon: SWORD_WEAPON,
      score: 0,
      roomsCleared: 0,
      lives: 0,
    },
    enemies: [],
    bullets: [],
    powerUps: [
      {
        id: 'initial-gun',
        pos: { x: CANVAS_WIDTH / 2 + 100, y: CANVAS_HEIGHT / 2 },
        type: 'WEAPON_UPGRADE',
        radius: 10,
      }
    ],
    explosions: [],
    roomNumber: 1,
    isGameOver: false,
    isPaused: false,
    inDialogue: false,
    dialogueStep: 0,
    screenShake: 0,
  });

  const requestRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const isMouseDown = useRef<boolean>(false);
  const lastFireTime = useRef<number>(0);
  const lastSpaceTime = useRef<number>(0);
  const mousePos = useRef<Vector>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });

  // Use a ref for state to avoid stale closures in the game loop
  const gameStateRef = useRef<GameState>(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const spawnEnemies = useCallback((roomNum: number) => {
    const count = 3 + Math.floor(roomNum * 1.5);
    const newEnemies: Enemy[] = [];
    for (let i = 0; i < count; i++) {
      const side = Math.floor(Math.random() * 4);
      let x, y;
      if (side === 0) { x = Math.random() * CANVAS_WIDTH; y = -50; }
      else if (side === 1) { x = CANVAS_WIDTH + 50; y = Math.random() * CANVAS_HEIGHT; }
      else if (side === 2) { x = Math.random() * CANVAS_WIDTH; y = CANVAS_HEIGHT + 50; }
      else { x = -50; y = Math.random() * CANVAS_HEIGHT; }

      const difficultyMultiplier = 1 + (roomNum * 0.1);
      
      // Every 10 levels, introduce a Green Demon (Tank)
      // At level 10+, there's a chance to spawn one.
      const isTank = roomNum >= 10 && (i === 0 || Math.random() < 0.2);
      
      if (isTank) {
        newEnemies.push({
          id: `enemy-tank-${Date.now()}-${i}`,
          pos: { x, y },
          radius: 25, // Larger
          health: 60 * difficultyMultiplier, // Twice as many hits as basic (30)
          maxHealth: 60 * difficultyMultiplier,
          speed: 0.4 + Math.random() * 0.2, // Much slower
          color: '#22c55e', // Green
          type: 'TANK',
          lastShot: 0,
          shootCooldown: 3000 / difficultyMultiplier,
        });
      } else {
        newEnemies.push({
          id: `enemy-${Date.now()}-${i}`,
          pos: { x, y },
          radius: 15,
          health: 30 * difficultyMultiplier,
          maxHealth: 30 * difficultyMultiplier,
          speed: 0.6 + Math.random() * (0.3 + roomNum * 0.02), // Slower than before
          color: '#ef4444',
          type: 'BASIC',
          lastShot: 0,
          shootCooldown: 2500 / difficultyMultiplier,
        });
      }
    }
    return newEnemies;
  }, []);

  useEffect(() => {
    setGameState(prev => ({ ...prev, enemies: spawnEnemies(1) }));
  }, [spawnEnemies]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    keysPressed.current.add(e.code);
    if (e.key === ' ') {
      keysPressed.current.add('Space');
    }
  };
  const handleKeyUp = (e: KeyboardEvent) => {
    if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    keysPressed.current.delete(e.code);
    if (e.key === ' ') {
      keysPressed.current.delete('Space');
    }
  };

  useEffect(() => {
    const handleGlobalMouseDown = (e: MouseEvent) => { 
      if (e.button === 0) isMouseDown.current = true; 
    };
    const handleGlobalMouseUp = (e: MouseEvent) => { 
      if (e.button === 0) isMouseDown.current = false; 
    };
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (stageRef.current) {
        const container = stageRef.current.container();
        const rect = container.getBoundingClientRect();
        mousePos.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleGlobalMouseDown);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleGlobalMouseDown);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, []);

  const update = useCallback((time: number) => {
    if (!gameStarted) {
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    const prev = gameStateRef.current;
    if (prev.isGameOver || prev.isPaused || prev.inDialogue) {
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    // Update Mouse Position from Stage (more accurate)
    if (stageRef.current) {
      const pointerPos = stageRef.current.getPointerPosition();
      if (pointerPos) {
        mousePos.current = pointerPos;
      }
    }

    const newPlayer = { ...prev.player };
    let enemiesToProcess = [...prev.enemies];
    
    // Accumulate Magic into Charges
    if (newPlayer.magic >= newPlayer.maxMagic && newPlayer.aetherCharges < newPlayer.maxAetherCharges) {
      newPlayer.magic = 0;
      newPlayer.aetherCharges++;
    }

    const moveX = (keysPressed.current.has('KeyD') || keysPressed.current.has('ArrowRight') ? 1 : 0) - 
                  (keysPressed.current.has('KeyA') || keysPressed.current.has('ArrowLeft') ? 1 : 0);
    const moveY = (keysPressed.current.has('KeyS') || keysPressed.current.has('ArrowDown') ? 1 : 0) - 
                  (keysPressed.current.has('KeyW') || keysPressed.current.has('ArrowUp') ? 1 : 0);

    if (moveX !== 0 || moveY !== 0) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      newPlayer.pos.x = Math.max(newPlayer.radius, Math.min(CANVAS_WIDTH - newPlayer.radius, newPlayer.pos.x + (moveX / length) * newPlayer.speed));
      newPlayer.pos.y = Math.max(newPlayer.radius, Math.min(CANVAS_HEIGHT - newPlayer.radius, newPlayer.pos.y + (moveY / length) * newPlayer.speed));
    }

    // AoE Attack (Demonic Purge)
    let newExplosions = prev.explosions.map(ex => ({
      ...ex,
      radius: ex.radius + (ex.maxRadius - ex.radius) * 0.1,
      duration: ex.duration - 16,
    })).filter(ex => ex.duration > 0);

    if (keysPressed.current.has('Space') && newPlayer.aetherCharges > 0 && time - lastSpaceTime.current > 500) {
      lastSpaceTime.current = time;
      newPlayer.aetherCharges--;
      const aoeRadius = 250;
      
      newExplosions.push({
        id: `explosion-${Date.now()}`,
        pos: { ...newPlayer.pos },
        radius: 0,
        maxRadius: aoeRadius,
        duration: 1000,
        startTime: time,
      });
    }

    // Shooting / Melee
    let newBullets = prev.bullets.map(b => {
      const dx = b.vel.x;
      const dy = b.vel.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return { 
        ...b, 
        pos: { x: b.pos.x + dx, y: b.pos.y + dy },
        distanceTraveled: (b.distanceTraveled || 0) + dist
      };
    })
    .filter(b => {
      const withinBounds = b.pos.x > -50 && b.pos.x < CANVAS_WIDTH + 50 && b.pos.y > -50 && b.pos.y < CANVAS_HEIGHT + 50;
      const withinRange = !b.maxDistance || (b.distanceTraveled || 0) < b.maxDistance;
      return withinBounds && withinRange;
    });
    
    if (isMouseDown.current && time - lastFireTime.current > newPlayer.weapon.fireRate) {
      lastFireTime.current = time;
      const dx = mousePos.current.x - newPlayer.pos.x;
      const dy = mousePos.current.y - newPlayer.pos.y;
      const angle = Math.atan2(dy, dx);
      
      if (newPlayer.weapon.type === WeaponType.SWORD) {
        // Melee Swing
        setMeleeSwing({ active: true, angle });
        setTimeout(() => setMeleeSwing(s => ({ ...s, active: false })), 100);
        
        const meleeRange = 110; 
        enemiesToProcess = enemiesToProcess.map(enemy => {
          const edx = enemy.pos.x - newPlayer.pos.x;
          const edy = enemy.pos.y - newPlayer.pos.y;
          const dist = Math.sqrt(edx * edx + edy * edy);
          const enemyAngle = Math.atan2(edy, edx);
          
          let angleDiff = Math.abs(enemyAngle - angle);
          while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - 2 * Math.PI);

          if (dist < meleeRange && angleDiff < 1.4) {
            return { ...enemy, health: enemy.health - newPlayer.weapon.damage };
          }
          return enemy;
        });
      } else if (newPlayer.weapon.type === WeaponType.SHOTGUN) {
        const count = newPlayer.weapon.count || 5;
        const spread = newPlayer.weapon.spread || 0.4;
        for (let i = 0; i < count; i++) {
          const offset = (i - (count - 1) / 2) * (spread / count);
          newBullets.push({
            id: `bullet-${Date.now()}-${Math.random()}`,
            pos: { x: newPlayer.pos.x, y: newPlayer.pos.y },
            vel: { 
              x: Math.cos(angle + offset) * newPlayer.weapon.bulletSpeed, 
              y: Math.sin(angle + offset) * newPlayer.weapon.bulletSpeed 
            },
            radius: 4,
            damage: newPlayer.weapon.damage,
            color: newPlayer.weapon.color, 
            owner: 'PLAYER',
            maxDistance: 200, // Short range
            distanceTraveled: 0,
          });
        }
      } else if (newPlayer.weapon.type === WeaponType.PLASMA) {
        newBullets.push({
          id: `bullet-plasma-${Date.now()}-${Math.random()}`,
          pos: { x: newPlayer.pos.x, y: newPlayer.pos.y },
          vel: { 
            x: Math.cos(angle) * newPlayer.weapon.bulletSpeed, 
            y: Math.sin(angle) * newPlayer.weapon.bulletSpeed 
          },
          radius: 12,
          damage: newPlayer.weapon.damage,
          color: newPlayer.weapon.color, 
          owner: 'PLAYER',
          distanceTraveled: 0,
        });
      } else if (newPlayer.weapon.type === WeaponType.MINIGUN) {
        // Parallel streams
        const perpAngle = angle + Math.PI / 2;
        const offsets = [-8, 8];
        offsets.forEach(off => {
          newBullets.push({
            id: `bullet-mini-${Date.now()}-${Math.random()}`,
            pos: { 
              x: newPlayer.pos.x + Math.cos(perpAngle) * off, 
              y: newPlayer.pos.y + Math.sin(perpAngle) * off 
            },
            vel: { 
              x: Math.cos(angle) * newPlayer.weapon.bulletSpeed, 
              y: Math.sin(angle) * newPlayer.weapon.bulletSpeed 
            },
            radius: 4,
            damage: newPlayer.weapon.damage,
            color: newPlayer.weapon.color, 
            owner: 'PLAYER',
            distanceTraveled: 0,
          });
        });
      } else {
        // Ranged Shooting (Pistol)
        newBullets.push({
          id: `bullet-${Date.now()}-${Math.random()}`,
          pos: { x: newPlayer.pos.x, y: newPlayer.pos.y },
          vel: { 
            x: Math.cos(angle) * newPlayer.weapon.bulletSpeed, 
            y: Math.sin(angle) * newPlayer.weapon.bulletSpeed 
          },
          radius: 6,
          damage: newPlayer.weapon.damage,
          color: '#ffffff', 
          owner: 'PLAYER',
          distanceTraveled: 0,
        });
      }
    }

    // Enemy logic
    const movedEnemies = enemiesToProcess.map(enemy => {
      const dx = newPlayer.pos.x - enemy.pos.x;
      const dy = newPlayer.pos.y - enemy.pos.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      const nextPos = {
        x: enemy.pos.x + (dx / length) * enemy.speed,
        y: enemy.pos.y + (dy / length) * enemy.speed,
      };

      if (length < newPlayer.radius + enemy.radius) {
        newPlayer.health -= 0.5;
      }

      if (time - enemy.lastShot > enemy.shootCooldown) {
        enemy.lastShot = time;
        newBullets.push({
          id: `ebullet-${Date.now()}-${enemy.id}`,
          pos: { ...enemy.pos },
          vel: { x: (dx / length) * 4, y: (dy / length) * 4 },
          radius: 4,
          damage: 5,
          color: '#f87171',
          owner: 'ENEMY',
          distanceTraveled: 0,
        });
      }

      return { ...enemy, pos: nextPos };
    }).filter(e => e.health > 0);

    // Collision Detection
    const activeBulletIds = new Set(newBullets.map(b => b.id));
    const finalEnemies = movedEnemies.map(enemy => {
      let h = enemy.health;
      
      // Bullet collisions
      newBullets.forEach(bullet => {
        if (bullet.owner === 'PLAYER' && activeBulletIds.has(bullet.id)) {
          const dx = bullet.pos.x - enemy.pos.x;
          const dy = bullet.pos.y - enemy.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < bullet.radius + enemy.radius) {
            h -= bullet.damage;
            activeBulletIds.delete(bullet.id);

            // Plasma Explosion
            if (newPlayer.weapon.type === WeaponType.PLASMA) {
              newExplosions.push({
                id: `plasma-ex-${Date.now()}-${Math.random()}`,
                pos: { ...bullet.pos },
                radius: 0,
                maxRadius: 80,
                duration: 500,
                startTime: time,
              });
            }
          }
        }
      });

      // Aether Explosion collisions (Expanding Ring)
      newExplosions.forEach(ex => {
        const dx = ex.pos.x - enemy.pos.x;
        const dy = ex.pos.y - enemy.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // If enemy is hit by the expanding ring
        if (dist < ex.radius + enemy.radius) {
          h = 0; // Instant Kill
        }
      });

      if (h <= 0 && enemy.health > 0) {
        newPlayer.score += 10;
        // Only accumulate magic if we have room for more charges
        if (newPlayer.aetherCharges < newPlayer.maxAetherCharges) {
          newPlayer.magic = Math.min(newPlayer.maxMagic, newPlayer.magic + 5);
        }
      }

      return { ...enemy, health: h };
    }).filter(e => e.health > 0);

    newBullets.forEach(bullet => {
      if (bullet.owner === 'ENEMY' && activeBulletIds.has(bullet.id)) {
        const dx = bullet.pos.x - newPlayer.pos.x;
        const dy = bullet.pos.y - newPlayer.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < bullet.radius + newPlayer.radius) {
          newPlayer.health -= bullet.damage;
          activeBulletIds.delete(bullet.id);
        }
      }
    });

    let finalBullets = newBullets.filter(b => activeBulletIds.has(b.id));

    // Power Up Collision
    const newPowerUps = prev.powerUps.filter(p => {
      const dx = p.pos.x - newPlayer.pos.x;
      const dy = p.pos.y - newPlayer.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < p.radius + newPlayer.radius) {
        if (p.type === 'WEAPON_UPGRADE') {
          newPlayer.weapon = PISTOL_WEAPON;
        } else if (p.type === 'HEALTH') {
          newPlayer.health = Math.min(newPlayer.maxHealth, newPlayer.health + 30);
        }
        return false;
      }
      return true;
    });

    // Check for room clear
    let nextRoom = prev.roomNumber;
    let inDialogue = prev.inDialogue;
    let finalEnemiesList = finalEnemies;
    if (finalEnemies.length === 0 && !prev.inDialogue) {
      newPlayer.roomsCleared++;
      if (prev.roomNumber % 15 === 0) {
        // Award reboot credit automatically
        newPlayer.lives++;
        inDialogue = true;
      } else if (prev.roomNumber % 5 === 0) {
        inDialogue = true;
      } else if (prev.roomNumber % 3 === 0) {
        inDialogue = true;
      } else {
        nextRoom++;
        finalEnemiesList = spawnEnemies(nextRoom);
      }
    }

    let isGameOver = prev.isGameOver;
    if (newPlayer.health <= 0) {
      if (newPlayer.lives > 0) {
        newPlayer.lives--;
        newPlayer.health = newPlayer.maxHealth;
        // Brief invulnerability or clear bullets?
        finalBullets = [];
      } else {
        isGameOver = true;
        // Check for high score
        fetch('/api/leaderboard')
          .then(res => res.json())
          .then(scores => {
            const isHigh = scores.length < 5 || newPlayer.score > scores[scores.length - 1].score;
            if (isHigh) {
              setShowInitials(true);
            }
          });
      }
    }

    setGameState({
      ...prev,
      player: newPlayer,
      enemies: finalEnemiesList,
      bullets: finalBullets,
      powerUps: newPowerUps,
      explosions: newExplosions,
      roomNumber: nextRoom,
      inDialogue,
      isGameOver,
      screenShake: Math.max(0, prev.screenShake - 0.5),
    });

    requestRef.current = requestAnimationFrame(update);
  }, [spawnEnemies, gameStarted]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  const handleChoice = (choice: 'WEAPON' | 'HEALTH' | 'MAGIC' | 'LIFE' | 'CHOOSE_PISTOL' | 'CHOOSE_SHOTGUN' | 'CHOOSE_PLASMA' | 'CHOOSE_MINIGUN') => {
    setGameState(prev => {
      const newPlayer = { ...prev.player };
      if (choice === 'WEAPON') {
        newPlayer.weapon = {
          ...newPlayer.weapon,
          damage: newPlayer.weapon.damage + 5,
          fireRate: Math.max(100, newPlayer.weapon.fireRate - 20),
        };
      } else if (choice === 'HEALTH') {
        newPlayer.maxHealth += 20;
        newPlayer.health = newPlayer.maxHealth;
      } else if (choice === 'MAGIC') {
        newPlayer.maxAetherCharges = Math.min(3, newPlayer.maxAetherCharges + 1);
      } else if (choice === 'LIFE') {
        newPlayer.lives++;
      } else if (choice === 'CHOOSE_PISTOL') {
        newPlayer.weapon = PISTOL_WEAPON;
      } else if (choice === 'CHOOSE_SHOTGUN') {
        newPlayer.weapon = SHOTGUN_WEAPON;
      } else if (choice === 'CHOOSE_PLASMA') {
        newPlayer.weapon = PLASMA_WEAPON;
      } else if (choice === 'CHOOSE_MINIGUN') {
        newPlayer.weapon = MINIGUN_WEAPON;
      }
      return {
        ...prev,
        player: newPlayer,
        inDialogue: false,
        roomNumber: prev.roomNumber + 1,
        enemies: spawnEnemies(prev.roomNumber + 1),
      };
    });
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 flex items-center justify-center overflow-hidden">
      {!gameStarted && <StartScreen onStart={() => setGameStarted(true)} />}
      
      <div 
        className="relative shadow-2xl border-4 border-slate-800 rounded-lg overflow-hidden"
        style={{ 
          width: CANVAS_WIDTH, 
          height: CANVAS_HEIGHT,
          transform: `translate(${Math.random() * gameState.screenShake}px, ${Math.random() * gameState.screenShake}px)`
        }}
      >
        <Stage 
          ref={stageRef}
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT}
          onMouseDown={() => { isMouseDown.current = true; }}
          onMouseUp={() => { isMouseDown.current = false; }}
          onTouchStart={() => { isMouseDown.current = true; }}
          onTouchEnd={() => { isMouseDown.current = false; }}
        >
          <Layer>
            {/* Background Grid */}
            <Rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#020617" />
            
            {/* Power Ups */}
            {gameState.powerUps.map(p => (
              <Group key={p.id} x={p.pos.x} y={p.pos.y}>
                <Circle radius={p.radius} fill="#fbbf24" shadowBlur={10} />
                {p.type === 'WEAPON_UPGRADE' && (
                  <Rect x={-5} y={-2} width={10} height={4} fill="#1e293b" />
                )}
              </Group>
            ))}

            {/* Explosions */}
            {gameState.explosions.map(ex => (
              <Group key={ex.id}>
                <Circle 
                  x={ex.pos.x}
                  y={ex.pos.y}
                  radius={ex.radius}
                  fill="rgba(59, 130, 246, 0.2)"
                  stroke="#60a5fa"
                  strokeWidth={20}
                  opacity={ex.duration / 1000}
                  shadowBlur={50}
                  shadowColor="#3b82f6"
                />
                <Circle 
                  x={ex.pos.x}
                  y={ex.pos.y}
                  radius={ex.radius * 0.8}
                  stroke="#93c5fd"
                  strokeWidth={5}
                  opacity={ex.duration / 1000}
                />
              </Group>
            ))}

            {/* Bullets */}
            {gameState.bullets.map(b => (
              <Circle 
                key={b.id} 
                x={b.pos.x} 
                y={b.pos.y} 
                radius={b.radius} 
                fill={b.color} 
                shadowBlur={15} 
                shadowColor={b.color} 
              />
            ))}

            {/* Enemies */}
            {gameState.enemies.map(e => (
              <Group key={e.id} x={e.pos.x} y={e.pos.y} scaleX={e.type === 'TANK' ? 1.5 : 1} scaleY={e.type === 'TANK' ? 1.5 : 1}>
                {/* Devil Monster Sprite */}
                <Rect x={-10} y={-10} width={20} height={20} fill={e.color} cornerRadius={4} />
                <Rect x={-12} y={-14} width={6} height={8} fill={e.color} rotation={-20} />
                <Rect x={6} y={-14} width={6} height={8} fill={e.color} rotation={20} />
                <Rect x={-6} y={-4} width={4} height={4} fill="#000" />
                <Rect x={2} y={-4} width={4} height={4} fill="#000" />
                <Rect x={-4} y={4} width={8} height={2} fill="#000" />
                
                <Rect 
                  x={-10} 
                  y={-25} 
                  width={20} 
                  height={4} 
                  fill="#334155" 
                />
                <Rect 
                  x={-10} 
                  y={-25} 
                  width={20 * (e.health / e.maxHealth)} 
                  height={4} 
                  fill={e.color} 
                />
              </Group>
            ))}

            {/* Player: Pixelated Space Man */}
            <Group x={gameState.player.pos.x} y={gameState.player.pos.y}>
              {/* Melee Swing Visual */}
              {meleeSwing.active && (
                <Group rotation={meleeSwing.angle * (180 / Math.PI)}>
                  <Rect 
                    x={10} 
                    y={-2} 
                    width={85} 
                    height={4} 
                    fill="#fff" 
                    cornerRadius={2}
                    shadowBlur={15}
                    shadowColor="#fff"
                  />
                </Group>
              )}
              {/* Body */}
              <Rect x={-10} y={-5} width={20} height={15} fill="#334155" cornerRadius={2} />
              {/* Helmet */}
              <Rect x={-8} y={-15} width={16} height={12} fill="#94a3b8" cornerRadius={4} />
              {/* Visor */}
              <Rect x={-6} y={-12} width={12} height={6} fill="#38bdf8" cornerRadius={1} />
              {/* Backpack */}
              <Rect x={-14} y={-8} width={6} height={12} fill="#475569" cornerRadius={1} />
              {/* Boots */}
              <Rect x={-8} y={10} width={6} height={4} fill="#1e293b" />
              <Rect x={2} y={10} width={6} height={4} fill="#1e293b" />
              
              {/* Weapon Visual */}
              {gameState.player.weapon.type === WeaponType.SWORD ? (
                <Rect x={8} y={-25} width={2} height={50} fill="#e2e8f0" rotation={30} cornerRadius={1} />
              ) : (
                <Rect x={8} y={0} width={15} height={5} fill="#3b82f6" cornerRadius={1} />
              )}
            </Group>
          </Layer>
        </Stage>

        <HUD player={gameState.player} roomNumber={gameState.roomNumber} />
        
        {gameState.inDialogue && (
          <Dialogue onChoice={handleChoice} roomNumber={gameState.roomNumber} />
        )}

        {showInitials && (
          <InitialsEntry 
            score={gameState.player.score} 
            onComplete={() => setShowInitials(false)} 
          />
        )}

        {gameState.isGameOver && !showInitials && (
          <GameOver 
            score={gameState.player.score} 
            rooms={gameState.player.roomsCleared} 
            onRestart={() => window.location.reload()} 
          />
        )}
      </div>
    </div>
  );
};
