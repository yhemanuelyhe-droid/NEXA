/* ==========================================================
   NEXA — Núcleo animado (estilo Jarvis)
   Esfera de partículas en Canvas puro, sin librerías externas.
   ========================================================== */
(function () {
    "use strict";

    const CONFIG = {
        contenedorId: "nexa-orb",
        radioBase: 0.32,
        anillos: 15,
        colorNucleoLejos: [91, 33, 182],
        colorNucleoCerca: [96, 165, 250],
        colorCorona: [196, 181, 253],
        colorGlow: "124, 58, 237",
        numCorona: 170,
        velocidadReposo: 0.14,
        velocidadPensando: 0.6
    };

    function crearPuntosNucleo(anillos) {
        const puntos = [];
        for (let i = 0; i <= anillos; i++) {
            const phi = (Math.PI * i) / anillos;
            const numPuntos = Math.max(3, Math.round(Math.sin(phi) * anillos * 2.2));
            for (let j = 0; j < numPuntos; j++) {
                const theta = (Math.PI * 2 * j) / numPuntos;
                puntos.push({
                    x0: Math.sin(phi) * Math.cos(theta),
                    y0: Math.cos(phi),
                    z0: Math.sin(phi) * Math.sin(theta),
                    brilloExtra: 0.75 + Math.random() * 0.5
                });
            }
        }
        return puntos;
    }

    function crearPuntosCorona(num) {
        const puntos = [];
        for (let i = 0; i < num; i++) {
            const phi = Math.acos(2 * Math.random() - 1);
            const theta = Math.random() * Math.PI * 2;
            puntos.push({
                x0: Math.sin(phi) * Math.cos(theta),
                y0: Math.cos(phi),
                z0: Math.sin(phi) * Math.sin(theta),
                fase: Math.random() * Math.PI * 2,
                frecuencia: 0.6 + Math.random() * 1.4,
                alcanceBase: 1.03 + Math.random() * 0.10,
                alcanceExtra: 0.08 + Math.random() * 0.22,
                tamano: 0.6 + Math.random() * 1.4
            });
        }
        return puntos;
    }

    function mezclarColor(a, b, t) {
        return [
            Math.round(a[0] + (b[0] - a[0]) * t),
            Math.round(a[1] + (b[1] - a[1]) * t),
            Math.round(a[2] + (b[2] - a[2]) * t)
        ];
    }

    function crearOrbe(contenedor) {
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        contenedor.appendChild(canvas);
        const ctx = canvas.getContext("2d");

        const nucleo = crearPuntosNucleo(CONFIG.anillos);
        const corona = crearPuntosCorona(CONFIG.numCorona);

        let ancho = 0, alto = 0;
        const dpr = Math.max(1, window.devicePixelRatio || 1);

        const TAMANO_MIN = 140;
        const TAMANO_MAX = 280;

        function ajustarTamano() {
            const rect = contenedor.getBoundingClientRect();
            let lado = rect.width || TAMANO_MIN;
            lado = Math.max(TAMANO_MIN, Math.min(TAMANO_MAX, lado));

            contenedor.style.width = lado + "px";
            contenedor.style.height = lado + "px";

            ancho = lado;
            alto = lado;
            canvas.width = ancho * dpr;
            canvas.height = alto * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        ajustarTamano();
        window.addEventListener("resize", ajustarTamano);
        if (window.ResizeObserver) {
            new ResizeObserver(ajustarTamano).observe(contenedor);
        }

        const reducirMovimiento = !!(window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        const factorMov = reducirMovimiento ? 0.15 : 1;

        let anguloY = 0;
        let intensidad = 0;
        let intensidadObjetivo = 0;
        let inicio = performance.now();
        let ultimo = inicio;

        let mouseX = 0, mouseY = 0;
        contenedor.addEventListener("mousemove", (e) => {
            const rect = contenedor.getBoundingClientRect();
            mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        });
        contenedor.addEventListener("mouseleave", () => { mouseX = 0; mouseY = 0; });

        function proyectar(x0, y0, z0, radio, cosY, sinY, cosX, sinX, cx, cy, focal) {
            const x = x0 * radio, y = y0 * radio, z = z0 * radio;
            const x1 = x * cosY + z * sinY;
            const z1 = -x * sinY + z * cosY;
            const y2 = y * cosX - z1 * sinX;
            const z2 = y * sinX + z1 * cosX;
            const escala = focal / (focal + z2);
            return { x: cx + x1 * escala, y: cy + y2 * escala, escala, z: z2 };
        }

        function dibujar(ahora) {
            const t = (ahora - inicio) / 1000;
            const dt = Math.min(0.05, (ahora - ultimo) / 1000);
            ultimo = ahora;

            intensidad += (intensidadObjetivo - intensidad) * 0.04;

            const velocidad = (CONFIG.velocidadReposo +
                intensidad * (CONFIG.velocidadPensando - CONFIG.velocidadReposo)) * factorMov;
            anguloY += velocidad * dt;

            const inclinacion = Math.sin(t * 0.25) * 0.12 * factorMov + mouseY * 0.18;
            const anguloYFinal = anguloY + mouseX * 0.25;

            ctx.clearRect(0, 0, ancho, alto);
            ctx.globalCompositeOperation = "lighter";

            const cx = ancho / 2, cy = alto / 2;
            const R = Math.min(ancho, alto) * CONFIG.radioBase;
            const respiracion = 1 + Math.sin(t * 1.1) * 0.015 * factorMov;
            const focal = R * 3.4;

            const cosY = Math.cos(anguloYFinal), sinY = Math.sin(anguloYFinal);
            const cosX = Math.cos(inclinacion), sinX = Math.sin(inclinacion);

            const proyectados = nucleo.map((p) => ({
                proy: proyectar(p.x0, p.y0, p.z0, R * respiracion, cosY, sinY, cosX, sinX, cx, cy, focal),
                p
            }));
            proyectados.sort((a, b) => b.proy.z - a.proy.z);

            for (const { proy, p } of proyectados) {
                const brillo = Math.max(0.15, Math.min(1.4, proy.escala)) * p.brilloExtra;
                const mezcla = Math.min(1, Math.max(0, (proy.escala - 0.75) / 0.6));
                const color = mezclarColor(CONFIG.colorNucleoLejos, CONFIG.colorNucleoCerca, mezcla);
                const alfa = Math.min(1, 0.35 + brillo * 0.5) * (0.85 + intensidad * 0.15);
                const w = Math.max(0.6, 1.6 * proy.escala);
                ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alfa})`;
                ctx.fillRect(proy.x - w / 2, proy.y - w / 2, w, w * 1.6);
            }

            for (const p of corona) {
                const alcance = p.alcanceBase + p.alcanceExtra * (0.4 + intensidad * 0.9) *
                    (0.5 + 0.5 * Math.sin(t * p.frecuencia * factorMov + p.fase));
                const proy = proyectar(p.x0, p.y0, p.z0, R * respiracion * alcance, cosY, sinY, cosX, sinX, cx, cy, focal);
                const alfa = Math.max(0, Math.min(1, proy.escala - 0.7)) * (0.5 + intensidad * 0.5);
                if (alfa <= 0.02) continue;
                const radioPunto = p.tamano * (1 + intensidad * 0.6) * Math.max(0.4, proy.escala);
                ctx.shadowBlur = 8 + intensidad * 10;
                ctx.shadowColor = `rgba(${CONFIG.colorGlow}, ${Math.min(1, alfa + 0.2)})`;
                ctx.fillStyle = `rgba(${CONFIG.colorCorona[0]}, ${CONFIG.colorCorona[1]}, ${CONFIG.colorCorona[2]}, ${alfa})`;
                ctx.beginPath();
                ctx.arc(proy.x, proy.y, radioPunto, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = "source-over";

            requestAnimationFrame(dibujar);
        }

        requestAnimationFrame(dibujar);

        return {
            pensando(activo) {
                intensidadObjetivo = activo ? 1 : 0;
            }
        };
    }

    function iniciar() {
        try {
            const contenedor = document.getElementById(CONFIG.contenedorId);
            if (!contenedor) {
                console.warn(
                    `NexaOrb: no encontré un elemento con id="${CONFIG.contenedorId}". ` +
                    `Agrega <div id="${CONFIG.contenedorId}"></div> en tu HTML donde quieras que aparezca.`
                );
                return;
            }
            window.NexaOrb = crearOrbe(contenedor);
        } catch (e) {
            console.error("NexaOrb: no se pudo iniciar el núcleo.", e);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();