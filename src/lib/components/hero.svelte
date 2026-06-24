<script>
    import { onMount } from "svelte";

    // --- State ---
    let activeSection = $state("about");
    let terminalLines = $state([]);
    let terminalInput = $state("");
    let showCursor = $state(true);
    let bootDone = $state(false);
    let skillHovered = $state(null);
    let sectionVisible = $state({});
    let isMenuOpen = $state(false); 

    const NAV = ["about", "experience", "skills", "certs", "contact"];

    const BOOT_SEQUENCE = [
        "> ALAN_OS v2.6.0 — INITIALIZING...",
        "> [*] Electrical systems: NOMINAL",
        "> [*] PLC runtime: LOADED",
        "> [*] Python runtime: LOADED",
        "> [*] GIS modules: ACTIVE",
        "> [*] Fanuc robot comms: HANDSHAKE OK",
        "> [*] IIoT bridge: CONNECTED",
        "> [WARN] Coffee level: CRITICAL",
        '> SYSTEM READY. Type "help" for commands.',
    ];

    const COMMANDS = {
        help: () => [
            "  skills     — list all skill categories",
            "  contact    — print contact info",
            "  certs      — list certifications",
            "  uptime     — personal uptime stats",
            "  clear      — clear terminal",
        ],
        skills: () => [
            "  PLCs: Ladder Logic, Rockwell Studio 5000, IP/TCP",
            "  Code: Python, C++, Rust, Zig, JS, SQL, ArcPy",
            "  Electrical: AC/DC, Schematics, Low Voltage",
            "  Robotics: Fanuc pendant + point file config",
            "  Drives: Gear, Belt, Chain, Conveyor, VFDs",
        ],
        contact: () => [
            "  Email: buenrostroalan93@gmail.com",
            "  Phone: 209-810-4413",
            "  Location: Modesto, CA",
        ],
        certs: () => [
            "  SACA — Electrical Systems",
            "  SACA — Motor Control Systems",
            "  SACA — Programmable Logic Controllers",
            "  SACA — Variable Frequency Drives",
            "  SACA — Mechanical Systems",
        ],
        uptime: () => [
            "  Languages spoken: 2 (EN advanced / ES native)",
            "  Domains mastered: Maintenance + Software + GIS",
            "  Onboarding time reduced: 70% (documented)",
            "  Production readiness acceleration: 85%",
            "  Known bugs in personality: 0 (unverified)",
        ],
        clear: () => {
            terminalLines = [];
            return null;
        },
    };

    const SKILLS = [
        {
            cat: "PLC / Automation",
            items: [
                "Rockwell Studio 5000",
                "Ladder Logic",
                "IP/TCP / Ethernet",
                "VFDs",
            ],
            color: "#ff6600",
        },
        {
            cat: "Programming",
            items: ["Python", "C++", "Rust", "Zig", "JavaScript", "SQL"],
            color: "#001a8b",
        },
        {
            cat: "Electrical",
            items: [
                "AC/DC Systems",
                "Schematic Reading",
                "Low Voltage",
                "Wiring",
            ],
            color: "#a78bfa",
        },
        {
            cat: "Robotics",
            items: [
                "Fanuc Pendant Config",
                "Point File Config",
                "Ethernet Comms",
            ],
            color: "#34d399",
        },
        {
            cat: "Mechanical",
            items: [
                "Gear Drives",
                "Chain Drives",
                "Belt Drives",
                "Ball Bearings",
                "Conveyor",
            ],
            color: "#fb7185",
        },
        {
            cat: "GIS / Data",
            items: [
                "ArcPy",
                "ETL Pipelines",
                "SQL Geodatabases",
                "QA/QC Systems",
            ],
            color: "#fbbf24",
        },
    ];

    const EXPERIENCE = [
        {
            role: "GIS Engineering Intern",
            org: "Stanislaus County",
            loc: "Modesto, CA",
            period: "Jul 2025 — 6 mo",
            color: "#001a8b",
            bullets: [
                "Engineered automated ETL pipelines (Python + ArcPy) for large-scale address dataset ingestion into SQL geodatabases.",
                "Built custom geoprocessing scripts for spatial lookups and parcel matching with exception handling and auto-validation.",
                "Architected dual-output QA/QC system splitting data into clean/error tables — eliminated manual review bottleneck.",
            ],
        },
        {
            role: "Web Software Engineering Intern",
            org: "Digital Nest",
            loc: "Modesto, CA",
            period: "Jan 2024 — 1 yr",
            color: "#001a8b",
            bullets: [
                "Spearheaded daily cross-team design reviews balancing security, scalability, and delivery — accelerated production readiness 85%.",
                "Built and maintained deployment docs that cut new-hire onboarding time by 70%.",
                "Bridged DevOps, backend, and product teams to synchronize release planning with infrastructure goals.",
            ],
        },
        {
            role: "Cherry Pack Line Worker",
            org: "Morada Produce",
            loc: "Stockton, CA",
            period: "Spring 2023 — Seasonal",
            color: "#be123c",
            bullets: [
                "Maintained consistent pack-line output through peak cherry season, ensuring zero production stoppages attributable to individual station performance.",
                "Cross-trained across multiple line stations and rotated on-demand to cover lagging positions, keeping throughput targets met during high-volume shifts.",
                "Proactively identified bottlenecks and communicated upstream/downstream flow issues to supervisors before they compounded into line holds.",
                "Operated under strict food-grade quality standards — sorting, inspecting, and packaging cherries to spec at sustained pace across full shift durations.",
            ],
        },
    ];

    function runCommand(e) {
        if (e.key !== "Enter") return;
        const cmd = terminalInput.trim().toLowerCase();
        terminalInput = "";
        if (!cmd) return;
        terminalLines = [...terminalLines, `> ${cmd}`];
        const fn = COMMANDS[cmd];
        if (!fn) {
            terminalLines = [
                ...terminalLines,
                `  command not found: ${cmd}. Type "help".`,
            ];
        } else {
            const result = fn();
            if (result) terminalLines = [...terminalLines, ...result];
        }
        setTimeout(() => {
            const el = document.getElementById("term-scroll");
            if (el) el.scrollTop = el.scrollHeight;
        }, 10);
    }

    onMount(() => {
        // Blinking cursor
        const ci = setInterval(() => (showCursor = !showCursor), 530);

        // Boot sequence
        let i = 0;
        const boot = setInterval(() => {
            if (i < BOOT_SEQUENCE.length) {
                terminalLines = [...terminalLines, BOOT_SEQUENCE[i]];
                i++;
            } else {
                clearInterval(boot);
                bootDone = true;
            }
        }, 130);

        // Intersection observer for sections
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        sectionVisible[e.target.id] = true;
                        activeSection = e.target.id;
                    }
                });
            },
            { threshold: 0.3 },
        );

        NAV.forEach((id) => {
            const el = document.getElementById(id);
            if (el) obs.observe(el);
        });

        return () => {
            clearInterval(ci);
            obs.disconnect();
        };
    });

    function scrollTo(id) {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
</script>

<!-- Blueprint grid -->
<div class="blueprint-bg" aria-hidden="true"></div>

<!-- NAV -->
<nav aria-label="Main navigation">
    <div class="nav-logo">Alan Buenrostro</div>

    <div class="nav-links desktop-only">
        {#each NAV as id}
            <button
                class:active={activeSection === id}
                onclick={() => scrollTo(id)}>{id}</button
            >
        {/each}
    </div>

    <button class="mobile-menu-btn" onclick={() => (isMenuOpen = !isMenuOpen)}>
        Menu
    </button>
</nav>

{#if isMenuOpen}
    <div class="mobile-dropdown">
        {#each NAV as id}
            <button
                onclick={() => {
                    scrollTo(id);
                    isMenuOpen = false;
                }}>{id.toUpperCase()}</button
            >
        {/each}
    </div>
{/if}

<main>
    <!-- ═══════════════ HERO / ABOUT ═══════════════ -->
    <section id="about" aria-label="About Alan Buenrostro">
        <div class="hero-left">
            <div class="hero-eyebrow">Available for opportunities</div>
            <h1 class="hero-name">
                Alan<br /><span class="accent">Buen</span>rostro
            </h1>
            <p class="hero-tagline">
                Maintenance · Automation · IIoT · Software
            </p>
            <p class="hero-objective">
                Closing the gap between factory floors and business
                intelligence. PLC logic in the morning, Python pipelines in the
                afternoon — bilingual in both Spanish and machine control
                systems.
            </p>

            <div class="hero-stats">
                <div class="stat" style="--c:#ff6600">
                    <div class="stat-num">85%</div>
                    <div class="stat-label">
                        Production readiness acceleration
                    </div>
                </div>
                <div class="stat" style="--c:#001a8b">
                    <div class="stat-num">70%</div>
                    <div class="stat-label">Onboarding time reduction</div>
                </div>
                <div class="stat" style="--c:#34d399">
                    <div class="stat-num">5</div>
                    <div class="stat-label">SACA certifications</div>
                </div>
                <div class="stat" style="--c:#a78bfa">
                    <div class="stat-num">2</div>
                    <div class="stat-label">Languages — EN + ES</div>
                </div>
            </div>

            <div class="hero-cta">
                <a
                    class="btn btn-primary"
                    href="mailto:buenrostroalan93@gmail.com">Send message</a
                >
                <a class="btn btn-outline" href="tel:+12098104413"
                    >209-810-4413</a
                >
            </div>
        </div>

        <!-- Terminal -->
        <div class="terminal" role="region" aria-label="Interactive terminal">
            <div class="term-header">
                <div class="term-dot" style="background:#fb7185"></div>
                <div class="term-dot" style="background:#fbbf24"></div>
                <div class="term-dot" style="background:#34d399"></div>
                <div class="term-title">ALAN_OS — bash</div>
            </div>
            <div class="term-body" id="term-scroll">
                {#each terminalLines as line}
                    <div
                        class="term-line
            {line.includes('[OK]') ? 'ok' : ''}
            {line.includes('[WARN]') ? 'warn' : ''}
            {line.includes('READY') ? 'ready' : ''}
            {line.startsWith('> ') &&
                        !line.includes('...') &&
                        !line.includes('[')
                            ? 'cmd'
                            : ''}"
                    >
                        {line}
                    </div>
                {/each}
                {#if bootDone}
                    <div
                        class="term-line"
                        style="color:#64748b; font-size:0.65rem; margin-top:0.5rem"
                    >
                        // type a command above ↑
                    </div>
                {/if}
            </div>
            {#if bootDone}
                <div class="term-input-row">
                    <span class="term-prompt">alan@portfolio:~$</span>
                    <input
                        class="term-input"
                        bind:value={terminalInput}
                        onkeydown={runCommand}
                        placeholder="help"
                        aria-label="Terminal input"
                        spellcheck="false"
                        autocomplete="off"
                    />
                    <span
                        class="cursor-blink"
                        style="--blink-op:{showCursor ? 1 : 0}"
                        aria-hidden="true"
                    ></span>
                </div>
            {/if}
        </div>
    </section>

    <!-- ═══════════════ EXPERIENCE ═══════════════ -->
    <section id="experience" aria-label="Work experience">
        <div class="section-label">// professional experience</div>
        <h2 class="section-title">Work Log</h2>

        <div class="exp-grid">
            {#each EXPERIENCE as exp}
                <article class="exp-card" style="--c:{exp.color}">
                    <div class="exp-meta">
                        <h3 class="exp-role">{exp.role}</h3>
                        <span class="exp-period">{exp.period}</span>
                    </div>
                    <div class="exp-org">{exp.org} — {exp.loc}</div>
                    <ul class="exp-bullets">
                        {#each exp.bullets as b}
                            <li>{b}</li>
                        {/each}
                    </ul>
                </article>
            {/each}
        </div>
    </section>

    <!-- ═══════════════ SKILLS ═══════════════ -->
    <section id="skills" aria-label="Skills">
        <div class="section-label">// capability matrix</div>
        <h2 class="section-title">Skills</h2>

        <div class="skills-grid">
            {#each SKILLS as s, i}
                <div
                    class="skill-card"
                    style="--c:{s.color}"
                    role="region"
                    aria-label={s.cat}
                    onmouseenter={() => (skillHovered = i)}
                    onmouseleave={() => (skillHovered = null)}
                >
                    <div class="skill-cat">{s.cat}</div>
                    <div class="skill-items">
                        {#each s.items as item}
                            <span class="skill-tag">{item}</span>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    </section>

    <!-- ═══════════════ CERTIFICATIONS ═══════════════ -->
    <section id="certs" aria-label="Certifications">
        <div class="section-label">// verified credentials</div>
        <h2 class="section-title">Certifications</h2>

        <div class="certs-list">
            {#each [{ icon: "⚡", title: "Electrical Systems", body: "SACA Certification" }, { icon: "⚙️", title: "Motor Control Systems", body: "SACA Certification" }, { icon: "🖥️", title: "Programmable Logic Controllers", body: "SACA Certification" }, { icon: "〰️", title: "Variable Frequency Drives", body: "SACA Certification" }, { icon: "🔩", title: "Mechanical Systems", body: "SACA Certification" }] as cert}
                <div class="cert-item">
                    <div class="cert-icon" aria-hidden="true">{cert.icon}</div>
                    <div>
                        <div class="cert-title">{cert.title}</div>
                        <div class="cert-body">{cert.body}</div>
                    </div>
                    <div class="cert-badge">Verified</div>
                </div>
            {/each}
        </div>
    </section>

    <!-- ═══════════════ CONTACT ═══════════════ -->
    <section id="contact" aria-label="Contact">
        <div class="section-label">// establish connection</div>
        <h2 class="section-title">Contact</h2>

        <div class="contact-grid">
            <div class="contact-items">
                <a
                    class="contact-item"
                    href="mailto:buenrostroalan93@gmail.com"
                >
                    <span class="ci-icon" aria-hidden="true">✉</span>
                    <div>
                        <div class="ci-label">Email</div>
                        <div class="ci-value">buenrostroalan93@gmail.com</div>
                    </div>
                </a>
                <a class="contact-item" href="tel:+12098104413">
                    <span class="ci-icon" aria-hidden="true">☎</span>
                    <div>
                        <div class="ci-label">Phone</div>
                        <div class="ci-value">209-810-4413</div>
                    </div>
                </a>
                <a
                    class="contact-item"
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span class="ci-icon" aria-hidden="true">🔗</span>
                    <div>
                        <div class="ci-label">LinkedIn</div>
                        <div class="ci-value">View profile →</div>
                    </div>
                </a>
                <div class="contact-item" style="pointer-events:none">
                    <span class="ci-icon" aria-hidden="true">📍</span>
                    <div>
                        <div class="ci-label">Location</div>
                        <div class="ci-value">
                            Modesto, CA — Open to Relocating
                        </div>
                    </div>
                </div>
            </div>

            <div class="contact-blurb">
                <p>
                    I bridge the physical and the digital — from reading a
                    wiring schematic to writing a Python ETL pipeline to
                    configuring a Fanuc robot pendant.
                    <br /><br />
                    <strong>What I bring:</strong> the rare ability to walk a
                    factory floor, understand what's actually happening at the
                    machine level, and translate that into systems that talk to
                    each other. Most people do one or the other.
                    <br /><br />
                    If your operation needs someone who won't need six months of
                    context before being useful — reach out.
                </p>
            </div>
        </div>
    </section>
</main>

<footer>
    <span>Alan Buenrostro .C — Portfolio {new Date().getFullYear()}</span>
    <span class="footer-sig">Maintenance · Automation · IIoT</span>
</footer>

<style>
    @import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&family=Barlow+Condensed:wght@400;600;700;800&display=swap");

    *,
    *::before,
    *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    :global(html) {
        scroll-behavior: smooth;
    }
    :global(body) {
        background: #ffffff;
        color: rgb(0, 0, 0);
        font-family: "JetBrains Mono", monospace;
        overflow-x: hidden;
    }

    /* Blueprint grid background */
    .blueprint-bg {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background-image: linear-gradient(
                rgba(56, 189, 248, 0.04) 1px,
                transparent 1px
            ),
            linear-gradient(
                90deg,
                rgba(56, 189, 248, 0.04) 1px,
                transparent 1px
            );
        background-size: 40px 40px;
    }
    .blueprint-bg::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image: linear-gradient(
                rgba(56, 189, 248, 0.015) 1px,
                transparent 1px
            ),
            linear-gradient(
                90deg,
                rgba(56, 189, 248, 0.015) 1px,
                transparent 1px
            );
        background-size: 8px 8px;
    }

    /* ---- NAV ---- */
    nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 2rem;
        height: 52px;
        background: rgba(255, 255, 255, 0.92);
        border-bottom: 1px solid rgba(56, 189, 248, 0.2);
        backdrop-filter: blur(8px);
    }
    .nav-logo {
        font-family: "Barlow Condensed", sans-serif;
        font-weight: 800;
        font-size: 1.1rem;
        letter-spacing: 0.12em;
        color: #ff6600;
        text-transform: uppercase;
    }

    .nav-links {
        display: flex;
        gap: 0;
    }
    .nav-links button {
        background: none;
        border: none;
        color: #64748b;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.7rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 0 1rem;
        height: 52px;
        cursor: pointer;
        transition:
            color 0.15s,
            background 0.15s;
        border-bottom: 2px solid transparent;
        position: relative;
    }
    .nav-links button:hover {
        color: #001a8b;
    }
    .nav-links button.active {
        color: #ff6600;
        border-bottom-color: #ff6600;
    }
    .mobile-menu-btn {
        display: none; /* Hidden by default */
        background: none;
        border: 1px solid #ff6600;
        color: #ff6600;
        padding: 0.25rem 0.75rem;
        cursor: pointer;
    }
    .mobile-dropdown {
        position: fixed;
        top: 52px;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.98);
        display: flex;
        flex-direction: column;
        padding: 2rem 1rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 90; /* Just below the nav */
        border-bottom: 1px solid rgba(56, 189, 248, 0.2);
    }

    .mobile-dropdown button {
        background: transparent;
        color: #001a8b; /* Use your deep blue for text */
        border: none;
        padding: 1.25rem 0.5rem;
        font-weight: 800;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.8rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        text-align: center;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;
    }

    .mobile-dropdown button:active {
        background: #ff6600;
        color: #ffffff;
    }

    /* ---- LAYOUT ---- */
    main {
        position: relative;
        z-index: 1;
        padding-top: 52px;
    }

    section {
        min-height: 100vh;
        max-width: 1100px;
        margin: 0 auto;
        padding: 5rem 2rem 4rem;
    }

    .section-label {
        font-size: 0.65rem;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        color: #001a8b;
        margin-bottom: 0.4rem;
        font-weight: 600;
    }

    .section-title {
        font-family: "Barlow Condensed", sans-serif;
        font-weight: 800;
        font-size: clamp(2.4rem, 5vw, 3.8rem);
        line-height: 1;
        text-transform: uppercase;
        letter-spacing: -0.01em;
        color: 000000;
    }

    /* ---- HERO ---- */
    #about {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        align-items: start;
        min-height: calc(100vh - 52px);
        padding-top: 6rem;
    }

    .hero-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.65rem;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        color: #ff6600;
        margin-bottom: 1.2rem;
        font-weight: 600;
    }
    .hero-eyebrow::before {
        content: "";
        display: block;
        width: 24px;
        height: 1px;
        background: #ff6600;
    }

    .hero-name {
        font-family: "Barlow Condensed", sans-serif;
        font-weight: 800;
        font-size: clamp(3.5rem, 8vw, 6rem);
        line-height: 0.95;
        text-transform: uppercase;
        letter-spacing: -0.02em;
        color: #000000;
        margin-bottom: 0.4rem;
    }
    .hero-name .accent {
        color: #ff6600;
    }

    .hero-tagline {
        font-family: "Barlow Condensed", sans-serif;
        font-size: 1.1rem;
        font-weight: 600;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: #001a8b;
        margin-bottom: 1.8rem;
    }

    .hero-objective {
        font-size: 0.82rem;

        line-height: 1.75;
        color: #000000;
        max-width: 46ch;
        border-left: 2px solid #ff6600;
        padding-left: 1rem;
        margin-bottom: 2rem;
    }

    .hero-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 2rem;
    }
    .stat {
        border: 1px solid rgba(56, 189, 248, 0.2);
        padding: 1rem;
        position: relative;
        overflow: hidden;
        transition: border-color 0.2s;
    }
    .stat::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 3px;
        height: 100%;
        background: var(--c, #ff6600);
    }
    .stat:hover {
        border-color: rgba(56, 189, 248, 0.5);
    }
    .stat-num {
        font-family: "Barlow Condensed", sans-serif;
        font-size: 2rem;
        font-weight: 800;
        color: var(--c, #ff6600);
        line-height: 1;
    }
    .stat-label {
        font-size: 0.62rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #64748b;
        margin-top: 0.2rem;
    }

    .hero-cta {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }
    .btn {
        font-family: "JetBrains Mono", monospace;
        font-size: 0.7rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 0.65rem 1.4rem;
        cursor: pointer;
        transition: all 0.15s;
        border: none;
        text-decoration: none;
        display: inline-block;
    }
    .btn-primary {
        background: #ff6600;
        color: #0b0f1a;
        font-weight: 700;
    }
    .btn-primary:hover {
        background: #fbbf24;
    }
    .btn-outline {
        background: transparent;
        color: #001a8b;
        border: 1px solid #001a8b;
    }
    .btn-outline:hover {
        background: rgba(14, 76, 186, 0.08);
    }

    /* ---- TERMINAL (hero right) ---- */
    .terminal {
        border: 1px solid rgba(0, 0, 0, 0.15);
        background: #f8f7f2;
        display: flex;
        flex-direction: column;
        width: 80%;
        height: 420px;
        font-size: 0.75rem;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
    }
    .term-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        background: #eeece5;
    }
    .term-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
    }
    .term-title {
        font-size: 0.62rem;
        letter-spacing: 0.15em;
        color: #6b7280;
        margin-left: auto;
    }
    .term-body {
        flex: 1;
        overflow-y: auto;
        padding: 0.8rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    .term-body::-webkit-scrollbar {
        width: 4px;
    }
    .term-body::-webkit-scrollbar-track {
        background: transparent;
    }
    .term-body::-webkit-scrollbar-thumb {
        background: #d1cfc6;
    }
    .term-line {
        color: #374151;
        white-space: pre;
    }
    .term-line.ok {
        color: #15803d;
    }
    .term-line.warn {
        color: #b45309;
    }
    .term-line.ready {
        color: #1d4ed8;
        font-weight: 700;
    }
    .term-line.cmd {
        color: #7c3aed;
    }
    .term-input-row {
        display: flex;
        align-items: center;
        padding: 0.5rem 1rem;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        background: #eeece5;
        gap: 0.4rem;
    }
    .term-prompt {
        color: #b45309;
        font-size: 0.75rem;
    }
    .term-input {
        flex: 1;
        background: none;
        border: none;
        outline: none;
        color: #111827;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.75rem;
    }
    .cursor-blink {
        display: inline-block;
        width: 7px;
        height: 14px;
        background: #1d4ed8;
        vertical-align: text-bottom;
        opacity: var(--blink-op, 1);
    }

    /* ---- EXPERIENCE ---- */
    #experience {
        min-height: auto;
        padding-top: 6rem;
    }

    .exp-grid {
        display: grid;
        gap: 2rem;
        margin-top: 3rem;
    }

    .exp-card {
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 2rem;
        position: relative;
        transition:
            border-color 0.2s,
            transform 0.2s;
        overflow: hidden;
    }
    .exp-card::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        height: 3px;
        width: 100%;
        background: var(--c);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s;
    }
    .exp-card:hover {
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
    }
    .exp-card:hover::before {
        transform: scaleX(1);
    }

    .exp-meta {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 0.3rem;
        gap: 1rem;
        flex-wrap: wrap;
    }
    .exp-role {
        font-family: "Barlow Condensed", sans-serif;
        font-weight: 700;
        font-size: 1.4rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: 000000;
    }
    .exp-period {
        font-size: 0.65rem;
        letter-spacing: 0.15em;
        color: #64748b;
        text-transform: uppercase;
    }
    .exp-org {
        font-size: 0.72rem;
        color: var(--c);
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-bottom: 1.2rem;
    }
    .exp-bullets {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    .exp-bullets li {
        font-size: 0.78rem;
        line-height: 1.6;
        color: #000000;
        padding-left: 1.2rem;
        position: relative;
    }
    .exp-bullets li::before {
        content: "//";
        position: absolute;
        left: 0;
        color: var(--c);
        font-weight: 700;
        font-size: 0.65rem;
    }

    /* ---- SKILLS ---- */
    #skills {
        min-height: auto;
        padding-top: 6rem;
    }

    .skills-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1px;
        border: 1px solid rgba(56, 189, 248, 0.15);
        margin-top: 3rem;
    }

    .skill-card {
        padding: 1.6rem;
        border: 1px solid transparent;
        transition:
            background 0.2s,
            border-color 0.2s;
        cursor: default;
        position: relative;
        overflow: hidden;
    }
    .skill-card::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        width: 0;
        background: var(--c);
        transition: width 0.3s;
    }
    .skill-card:hover {
        background: rgba(255, 255, 255, 0.03);
        border-color: rgba(255, 255, 255, 0.08);
    }
    .skill-card:hover::after {
        width: 100%;
    }

    .skill-cat {
        font-family: "Barlow Condensed", sans-serif;
        font-weight: 700;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--c);
        margin-bottom: 0.9rem;
    }
    .skill-items {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
    }
    .skill-tag {
        font-size: 0.62rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 0.25rem 0.6rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #000000;
        transition: all 0.15s;
    }
    .skill-card:hover .skill-tag {
        border-color: rgba(255, 255, 255, 0.2);
        color: #001a8b;
    }

    /* ---- CERTS ---- */
    #certs {
        min-height: auto;
        padding-top: 6rem;
    }

    .certs-list {
        margin-top: 3rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
    }
    .cert-item {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1.2rem 1.4rem;

        transition:
            border-color 0.2s,
            background 0.2s;
        position: relative;
        overflow: hidden;
    }
    .cert-item:hover {
        border-color: rgba(255, 0, 0, 0.4);
        background: rgba(5, 180, 255, 0.274);
    }
    .cert-icon {
        font-size: 1.3rem;
        flex-shrink: 0;
        margin-top: 0.1rem;
    }
    .cert-title {
        font-size: 0.78rem;
        font-weight: 600;
        color: #001a8b;
        letter-spacing: 0.05em;
        line-height: 1.4;
    }
    .cert-body {
        font-size: 0.65rem;
        color: #64748b;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-top: 0.2rem;
    }
    .cert-badge {
        position: absolute;
        top: 0.6rem;
        right: 0.6rem;
        font-size: 0.55rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #34d399;
        border: 1px solid #34d399;
        padding: 0.15rem 0.35rem;
    }

    /* ---- CONTACT ---- */
    #contact {
        min-height: auto;
        padding-top: 6rem;
        padding-bottom: 8rem;
    }

    .contact-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        margin-top: 3rem;
        align-items: start;
    }

    .contact-items {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .contact-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.2rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        text-decoration: none;
        color: #000000;
        transition: all 0.15s;
    }
    .contact-item:hover {
        border-color: #ff6600;
        color: 000000;
    }
    .contact-item:hover .ci-icon {
        color: #ff6600;
    }
    .ci-icon {
        font-size: 1rem;
        color: #001a8b;
    }
    .ci-label {
        font-size: 0.62rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #64748b;
    }
    .ci-value {
        font-size: 0.82rem;
        color: inherit;
        margin-top: 0.1rem;
    }

    .contact-blurb {
        font-size: 0.82rem;
        line-height: 1.8;
        color: #000000;
        border-left: 2px solid #001a8b;
        padding-left: 1.2rem;
    }
    .contact-blurb strong {
        color: 000000;
    }

    /* ---- FOOTER ---- */
    footer {
        position: relative;
        z-index: 1;
        border-top: 1px solid rgba(56, 189, 248, 0.15);
        padding: 1.5rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.62rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #334155;
        max-width: 1100px;
        margin: 0 auto;
    }
    .footer-sig {
        color: #ff6600;
    }

    /* ---- RESPONSIVE ---- */
    @media (max-width: 768px) {
        #about {
            grid-template-columns: 1fr;
        }
        .contact-grid {
            grid-template-columns: 1fr;
        }
        .hero-stats {
            grid-template-columns: 1fr 1fr;
        }
        nav {
            padding: 0 1rem;
        }
        .nav-links button {
            padding: 0 0.5rem;
            font-size: 0.6rem;
        }
        .hero-left {
            width: 80%;
        }

        .desktop-only {
            display: none; /* Hide full list on mobile */
        }

        .mobile-menu-btn {
            display: block; /* Show menu button on mobile */
        }

        @keyframes fadeUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .mobile-dropdown {
            /* Existing styles here */
            animation: fadeUp 0.3s ease-out forwards;
        }
    }
</style>
