(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (prefersReducedMotion.matches) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.className = "ambient-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);

    const particles = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastTime = performance.now();

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    function createParticle(initial = false) {
        const bandHeight = Math.max(120, height * 0.22);
        const edgeBias = Math.random();
        let x;

        if (edgeBias < 0.22) {
            x = randomBetween(-width * 0.04, width * 0.16);
        } else if (edgeBias > 0.78) {
            x = randomBetween(width * 0.84, width * 1.04);
        } else {
            x = randomBetween(-width * 0.02, width * 1.02);
        }

        return {
            x,
            y: initial ? randomBetween(0, height) : randomBetween(height - bandHeight, height + 24),
            r: randomBetween(0.55, width < 640 ? 1.5 : 2),
            vx: randomBetween(-7, 7),
            vy: randomBetween(width < 640 ? -72 : -102, width < 640 ? -48 : -68),
            alpha: randomBetween(0.48, 0.98),
            life: randomBetween(6.8, 10.8),
            age: randomBetween(0, 2),
            hue: randomBetween(30, 50),
            flickerSpeed: randomBetween(3.2, 8.8),
            flickerOffset: randomBetween(0, Math.PI * 2),
            flickerDepth: randomBetween(0.12, 0.42),
            jitterAmpX: randomBetween(6, 18),
            jitterAmpY: randomBetween(1.2, 4.6),
            jitterSpeedX: randomBetween(1.4, 3.8),
            jitterSpeedY: randomBetween(2.6, 6.4)
        };
    }

    function seedParticles() {
        particles.length = 0;
        const count = Math.round(Math.max(42, Math.min(110, width / 14)));
        for (let i = 0; i < count; i += 1) {
            particles.push(createParticle(true));
        }
    }

    function drawBackgroundGlow() {
        const gradient = ctx.createLinearGradient(0, height, 0, height * 0.45);
        gradient.addColorStop(0, "rgba(255, 133, 20, 0.18)");
        gradient.addColorStop(0.3, "rgba(255, 183, 72, 0.08)");
        gradient.addColorStop(1, "rgba(255, 200, 120, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    function render(now) {
        const delta = Math.min((now - lastTime) / 1000, 0.033);
        lastTime = now;

        ctx.clearRect(0, 0, width, height);
        drawBackgroundGlow();
        ctx.globalCompositeOperation = "lighter";

        for (let i = particles.length - 1; i >= 0; i -= 1) {
            const p = particles[i];
            p.age += delta;
            p.x += p.vx * delta;
            p.y += p.vy * delta;

            const jitterX = Math.sin(p.age * p.jitterSpeedX + p.flickerOffset) * p.jitterAmpX;
            const jitterY = Math.sin(p.age * p.jitterSpeedY + p.flickerOffset * 0.7) * p.jitterAmpY;
            p.vx += Math.sin((p.age + p.x) * 0.8) * 1.1 * delta;
            p.vy -= 1.5 * delta;

            const progress = p.age / p.life;
            const fadeIn = progress < 0.08 ? progress / 0.08 : 1;
            const fadeOut = progress > 0.82 ? 1 - (progress - 0.82) / 0.18 : 1;
            const fade = Math.max(0, Math.min(fadeIn, fadeOut));
            const flicker =
                1 -
                p.flickerDepth +
                ((Math.sin(p.age * p.flickerSpeed + p.flickerOffset) + 1) * 0.5) * p.flickerDepth;
            const alpha = Math.max(0, fade) * p.alpha * flicker;

            if (alpha <= 0 || p.y < -28 || p.x < -width * 0.08 || p.x > width * 1.08) {
                particles[i] = createParticle(false);
                continue;
            }

            const drawX = p.x + jitterX;
            const drawY = p.y + jitterY;
            const core = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, p.r * 4.6);
            core.addColorStop(0, `hsla(${p.hue}, 100%, 88%, ${alpha})`);
            core.addColorStop(0.18, `hsla(${p.hue - 2}, 100%, 72%, ${alpha})`);
            core.addColorStop(0.45, `hsla(${p.hue - 8}, 100%, 58%, ${alpha * 0.78})`);
            core.addColorStop(0.78, `hsla(${p.hue - 14}, 96%, 48%, ${alpha * 0.24})`);
            core.addColorStop(1, `hsla(${p.hue - 18}, 92%, 42%, 0)`);

            ctx.fillStyle = core;
            ctx.beginPath();
            ctx.arc(drawX, drawY, p.r * 4.6, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalCompositeOperation = "source-over";
        requestAnimationFrame(render);
    }

    resize();
    seedParticles();
    requestAnimationFrame(render);

    window.addEventListener("resize", () => {
        resize();
        seedParticles();
    });

    if (typeof prefersReducedMotion.addEventListener === "function") {
        prefersReducedMotion.addEventListener("change", (event) => {
            if (event.matches) canvas.remove();
        });
    }
})();
