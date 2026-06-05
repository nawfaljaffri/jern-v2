'use client'

import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

const SNAKE_COLORS = ['#5D6083', '#C4FF66', '#F080BA', '#2D3B55', '#B79449', '#0011B6', '#EA3C34', '#67A2A8', '#FFEF5B', '#4A76D2', '#50769A', '#C5B4E3', '#9B6545', '#2B3B54'];
const LETTERS = "NAWFAL".split("");

export default function PhysicsHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const letterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const snakeRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const isPosingRef = useRef(false);

  const snakeColors = useRef(SNAKE_COLORS);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Engine
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 0;
    engine.world.gravity.x = 0;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 2. Boundaries (Walls, Floor, Ceiling)
    const wallOptions = { isStatic: true, restitution: 0.8, friction: 0 };
    const floor = Matter.Bodies.rectangle(width / 2, height + 50, width, 100, wallOptions);
    const ceiling = Matter.Bodies.rectangle(width / 2, -50, width, 100, wallOptions);
    const leftWall = Matter.Bodies.rectangle(-50, height / 2, 100, height, wallOptions);
    const rightWall = Matter.Bodies.rectangle(width + 50, height / 2, 100, height, wallOptions);
    Matter.World.add(engine.world, [floor, ceiling, leftWall, rightWall]);

    // 3. Letters "NAWFAL"
    const isMobile = window.innerWidth <= 768;
    const letterWidth = isMobile ? 60 : 120;
    const letterHeight = isMobile ? 80 : 150;
    const letterSpacing = isMobile ? 10 : 20;
    const totalWidth = LETTERS.length * letterWidth + (LETTERS.length - 1) * letterSpacing;
    const startX = width / 2 - totalWidth / 2 + letterWidth / 2;
    const centerY = height / 2;

    const letterBodies = LETTERS.map((char, i) => {
      const x = startX + i * (letterWidth + letterSpacing);
      const y = centerY;
      const body = Matter.Bodies.rectangle(
        x,
        y,
        letterWidth,
        letterHeight,
        {
          frictionAir: 0.1, // Slide to a smooth stop
          friction: 0.1,
          restitution: 0.8,
          mass: 10,
          inertia: Infinity,
          inverseInertia: 0
        }
      );

      const constraint = Matter.Constraint.create({
        pointA: { x, y },
        bodyB: body,
        stiffness: 0.002,
        damping: 0.1,
        render: { visible: false }
      });

      Matter.World.add(engine.world, constraint);
      return body;
    });
    Matter.World.add(engine.world, letterBodies);

    // 4. Autonomous Pixel Snake
    const segments = 14;
    const baseSegmentSize = isMobile ? 25 : 40;
    const snakeBodies: Matter.Body[] = [];
    const snakeConstraints: Matter.Constraint[] = [];
    const snakeGroup = Matter.Body.nextGroup(true); // negative group for no collisions

    for (let i = 0; i < segments; i++) {
      let bWidth = baseSegmentSize;
      const bHeight = baseSegmentSize;
      
      // Variable widths for specific indices
      if (i === 5) bWidth = isMobile ? 50 : 80;
      if (i === 6) bWidth = isMobile ? 75 : 120;
      if (i === 7) bWidth = isMobile ? 50 : 80;

      const body = Matter.Bodies.rectangle(
        width / 2 + Math.random() * 50 - 25,
        height / 2 + Math.random() * 50 - 25,
        bWidth,
        bHeight,
        {
          frictionAir: 0.05,
          restitution: 0.6,
          mass: 2,
          inertia: Infinity,
          inverseInertia: 0,
          collisionFilter: { group: snakeGroup }
        }
      );
      
      (body as any).customWidth = bWidth;
      (body as any).customHeight = bHeight;

      snakeBodies.push(body);
    }

    for (let i = 0; i < segments - 1; i++) {
      const constraint = Matter.Constraint.create({
        bodyA: snakeBodies[i],
        bodyB: snakeBodies[i + 1],
        length: baseSegmentSize * 1.1,
        stiffness: 0.2,
        damping: 0.1
      });
      snakeConstraints.push(constraint);
    }
    Matter.World.add(engine.world, [...snakeBodies, ...snakeConstraints]);

    // 5. Runner
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // 6. Update Loop for DOM and AI
    Matter.Events.on(engine, 'afterUpdate', () => {
      const time = engine.timing.timestamp;
      
      if (!isPosingRef.current) {
        // Wandering AI Logic
        const head = snakeBodies[0];
        
        // Smooth wander via sine/cosine waves (Lissajous Curve)
        const fx = Math.sin(time * 0.001) * 0.005;
        const fy = Math.sin(time * 0.002) * 0.005;
        
        Matter.Body.applyForce(head, head.position, { x: fx, y: fy });
      } else {
        // Iconic Pose logic: perfect vertical stack in the center
        const centerX = width / 2;
        const totalHeight = segments * baseSegmentSize;
        const startY = height / 2 - totalHeight / 2 + (baseSegmentSize / 2);
        
        snakeBodies.forEach((body, index) => {
            const targetX = centerX;
            const targetY = startY + index * baseSegmentSize;
            
            // Stronger spring force towards exact target
            const dx = targetX - body.position.x;
            const dy = targetY - body.position.y;
            
            Matter.Body.applyForce(body, body.position, {
                x: dx * 0.002,
                y: dy * 0.002
            });
            // High damping to lock them in place smoothly without bouncing forever
            Matter.Body.setVelocity(body, {
                x: body.velocity.x * 0.75,
                y: body.velocity.y * 0.75
            });
        });
      }

      // DOM Update: mapping body coordinates to divs
      letterBodies.forEach((body, i) => {
        const el = letterRefs.current[i];
        if (el) {
          el.style.transform = `translate(-50%, -50%) translate(${body.position.x}px, ${body.position.y}px) rotate(${body.angle}rad)`;
        }
      });

      snakeBodies.forEach((body, i) => {
        const el = snakeRefs.current[i];
        if (el) {
          el.style.transform = `translate(-50%, -50%) translate(${body.position.x}px, ${body.position.y}px) rotate(${body.angle}rad)`;
          el.style.width = `${(body as any).customWidth}px`;
          el.style.height = `${(body as any).customHeight}px`;
        }
      });
    });

    // 7. Timer for Iconic Pose
    const poseInterval = setInterval(() => {
        isPosingRef.current = true;
        setTimeout(() => {
            isPosingRef.current = false;
        }, 3000); // Hold pose for 3 seconds
    }, 15000); // Trigger every 15 seconds

    // 8. Interaction (Mouse dragging)
    let mouseConstraint: Matter.MouseConstraint | null = null;
    let mouse: Matter.Mouse | null = null;
    
    setTimeout(() => {
      mouse = Matter.Mouse.create(containerRef.current!);
      mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false
          }
        }
      });
      // Prevent mouse from capturing scrolling when hovering over canvas
      mouse.element.removeEventListener("mousewheel", (mouse as any).mousewheel);
      mouse.element.removeEventListener("DOMMouseScroll", (mouse as any).mousewheel);

      Matter.World.add(engine.world, mouseConstraint);
    }, 100);

    return () => {
      clearInterval(poseInterval);
      Matter.Runner.stop(runner);
      if (mouseConstraint) {
          Matter.World.remove(engine.world, mouseConstraint);
      }
      Matter.Engine.clear(engine);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[90vh] overflow-hidden bg-white select-none">
      {/* Snake DOM Nodes */}
      {snakeColors.current.map((color, i) => (
        <div
          key={`snake-${i}`}
          ref={(el) => { snakeRefs.current[i] = el; }}
          className="absolute top-0 left-0"
          style={{
            backgroundColor: color,
            willChange: 'transform',
            zIndex: 10,
          }}
        />
      ))}

      {/* Letter DOM Nodes */}
      {LETTERS.map((char, i) => (
        <div
          key={`letter-${i}`}
          ref={(el) => { letterRefs.current[i] = el; }}
          className="absolute top-0 left-0 font-black leading-none uppercase text-black cursor-grab active:cursor-grabbing flex items-center justify-center pointer-events-auto"
          style={{
            width: window.innerWidth > 768 ? 120 : 60,
            height: window.innerWidth > 768 ? 150 : 80,
            fontSize: window.innerWidth > 768 ? '150px' : '80px',
            willChange: 'transform',
            zIndex: 20,
          }}
        >
          {char}
        </div>
      ))}
    </div>
  );
}
