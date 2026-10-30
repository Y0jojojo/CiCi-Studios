(() => {
  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const createOrb = (element, radius) => {
    const angle = randomBetween(0, Math.PI * 2);
    const distance = randomBetween(radius * .72, radius);
    return {
      element,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      vx: randomBetween(-8, 8),
      vy: randomBetween(-8, 8),
      noiseX: 0,
      noiseY: 0,
      targetNoiseX: randomBetween(-15, 15),
      targetNoiseY: randomBetween(-15, 15),
      noiseChangeIn: randomBetween(.4, 1.4),
      turn: randomBetween(-1, 1)
    };
  };

  document.querySelectorAll(".icon-orbs").forEach((group) => {
    const artwork = group.parentElement;
    const icon = artwork.querySelector("img");
    const orbCount = Math.floor(randomBetween(2, 11));
    group.replaceChildren(...Array.from({ length: orbCount }, () => {
      const orb = document.createElement("span");
      orb.style.setProperty("--orb-size", `${randomBetween(6, 12).toFixed(1)}px`);
      return orb;
    }));
    const orbs = Array.from(group.children);
    if (!icon) return;

    const iconRadius = icon.getBoundingClientRect().width / 2;
    const artworkRadius = Math.min(artwork.clientWidth, artwork.clientHeight) / 2;
    const innerRadius = iconRadius + 10;
    const outerRadius = Math.max(innerRadius + 8, artworkRadius - 5);
    const motionRadius = Math.min(outerRadius, Math.max(innerRadius + 8, artworkRadius * .88));
    const particles = orbs.map((element) => createOrb(element, motionRadius));
    let previousTime = 0;
    let animationFrame = 0;

    const render = () => {
      particles.forEach(({ element, x, y }) => {
        element.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px), 0)`;
      });
    };

    const seedStaticPositions = () => {
      particles.forEach((particle) => {
        const angle = randomBetween(0, Math.PI * 2);
        const distance = randomBetween(innerRadius, motionRadius);
        particle.x = Math.cos(angle) * distance;
        particle.y = Math.sin(angle) * distance;
      });
      render();
    };

    if (reducedMotion.matches) {
      seedStaticPositions();
      return;
    }

    const tick = (time) => {
      const delta = previousTime ? Math.min((time - previousTime) / 1000, .04) : 0;
      previousTime = time;

      particles.forEach((particle) => {
        particle.noiseChangeIn -= delta;
        if (particle.noiseChangeIn <= 0) {
          particle.targetNoiseX = randomBetween(-18, 18);
          particle.targetNoiseY = randomBetween(-18, 18);
          particle.turn = randomBetween(-1, 1);
          particle.noiseChangeIn = randomBetween(.45, 1.65);
        }

        const noiseEase = Math.min(1, delta * 1.8);
        particle.noiseX += (particle.targetNoiseX - particle.noiseX) * noiseEase;
        particle.noiseY += (particle.targetNoiseY - particle.noiseY) * noiseEase;

        const distance = Math.hypot(particle.x, particle.y) || 1;
        const inwardPull = .42;
        let ax = -particle.x / distance * inwardPull + particle.noiseX;
        let ay = -particle.y / distance * inwardPull + particle.noiseY;

        if (distance < innerRadius) {
          const push = (innerRadius - distance) * 2.2;
          ax += particle.x / distance * push;
          ay += particle.y / distance * push;
        } else if (distance > outerRadius) {
          const pull = (distance - outerRadius) * 1.6;
          ax -= particle.x / distance * pull;
          ay -= particle.y / distance * pull;
        }

        ax += -particle.vy * particle.turn * .12;
        ay += particle.vx * particle.turn * .12;
        particle.vx = (particle.vx + ax * delta) * Math.exp(-.32 * delta);
        particle.vy = (particle.vy + ay * delta) * Math.exp(-.32 * delta);

        const speed = Math.hypot(particle.vx, particle.vy);
        const maxSpeed = 34;
        if (speed > maxSpeed) {
          particle.vx = particle.vx / speed * maxSpeed;
          particle.vy = particle.vy / speed * maxSpeed;
        }
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
      });

      particles.forEach((particle, index) => {
        for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
          const other = particles[otherIndex];
          const separationX = other.x - particle.x;
          const separationY = other.y - particle.y;
          const separation = Math.hypot(separationX, separationY) || 1;
          const nx = separationX / separation;
          const ny = separationY / separation;
          const forceScale = 1 / Math.max(1, particles.length - 1);
          let force = 0;

          if (separation < 34) {
            force = -Math.min((34 - separation) * 1.2, 24) * forceScale;
          } else if (separation > 96) {
            force = Math.min((separation - 96) * .055, 3) * forceScale;
          }

          const impulse = force * delta;
          particle.vx -= nx * impulse;
          particle.vy -= ny * impulse;
          other.vx += nx * impulse;
          other.vy += ny * impulse;
        }
      });

      particles.forEach((particle) => {
        const distance = Math.hypot(particle.x, particle.y) || 1;
        const nx = particle.x / distance;
        const ny = particle.y / distance;
        if (distance > outerRadius) {
          particle.x = nx * outerRadius;
          particle.y = ny * outerRadius;
          const outwardSpeed = particle.vx * nx + particle.vy * ny;
          if (outwardSpeed > 0) {
            particle.vx -= nx * outwardSpeed * 1.35;
            particle.vy -= ny * outwardSpeed * 1.35;
          }
        } else if (distance < innerRadius) {
          particle.x = nx * innerRadius;
          particle.y = ny * innerRadius;
          const inwardSpeed = particle.vx * nx + particle.vy * ny;
          if (inwardSpeed < 0) {
            particle.vx -= nx * inwardSpeed;
            particle.vy -= ny * inwardSpeed;
          }
        }
      });

      render();
      animationFrame = window.requestAnimationFrame(tick);
    };

    render();
    animationFrame = window.requestAnimationFrame(tick);

    const stopMotion = (event) => {
      if (event.matches) {
        window.cancelAnimationFrame(animationFrame);
        seedStaticPositions();
      } else {
        previousTime = 0;
        animationFrame = window.requestAnimationFrame(tick);
      }
    };
    reducedMotion.addEventListener("change", stopMotion);
  });

  document.documentElement.classList.add("orbit-motion-ready");
})();
