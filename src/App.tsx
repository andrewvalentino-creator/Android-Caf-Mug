import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useScroll, useMotionValueEvent, useReducedMotion } from 'motion/react'
import { SCROLL_VH, P, G, VIDEO_SEAM, span, ramp, lerp } from './scroll'
import { PRODUCT } from './product'
import Footer from './Footer'

/*
  Zap Band — adapted from the mug template's fixed artboard and three-group parallax filmstrip.
  The original 20,000ms motion-prototype timeline is preserved in scroll.ts.
  The product photo moves through two continuous camera compositions meeting
  at VIDEO_SEAM, replacing the unrelated jetski clips with the proposed wearable.
  Width alone sets scale. A portrait coordinate set keeps phones readable.
  Navigation stays outside the artboard, at natural size.
*/
const NAV = [
  { label: 'Overview', hash: '#overview', p: 0 },
  { label: 'Details', hash: '#details', p: 0.7 },
  { label: 'Your routine', hash: '#ritual', p: 0.94 },
]
const CARDS = [
  { label: ['Quiet by', 'design.'], text: 'A proposed alternative to a loud alarm.', position: '50% 35%', zoom: 1.6 },
  { label: ['Your time.', 'Your start.'], text: 'Explore a wake-time setting in the demo.', position: '55% 20%', zoom: 1.3 },
  { label: ['Comfort', 'comes first.'], text: 'Wearability is a goal still to be tested.', position: '50% 65%', zoom: 1 },
  { label: ['Less noise.', 'More space.'], text: 'Different schedules. One shared room.', position: '60% 60%', zoom: 1.4 },
]
const box = (x: number, y: number, w?: number, h?: number): CSSProperties => ({
  position: 'absolute', left: x, top: y,
  ...(w != null ? { width: w } : {}), ...(h != null ? { height: h } : {}),
})

/** The template's rising clip mask; each word keeps its own stagger. */
function Mask({ t, children, style }: { t: number; children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...style, overflow: 'hidden' }}><div style={{ transform: `translateY(${(1 - t) * 115}%)` }}>{children}</div></div>
}

export default function App() {
  const wrap = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [width, setWidth] = useState(() => window.innerWidth)
  const [p, setP] = useState(0)
  const [intro, setIntro] = useState(0)
  const mobile = width < 640
  const stageW = mobile ? 390 : 1440
  const stageH = mobile ? 844 : 810
  const scale = width / stageW
  const safeL = mobile ? 24 : 96
  const groupW = stageW - safeL * 2
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', setP)

  useLayoutEffect(() => {
    const fit = () => setWidth(document.documentElement.clientWidth)
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  // The original 650ms stagger also opens on arrival so no copy is stranded
  // behind its mask before the visitor discovers the scroll interaction.
  useEffect(() => {
    if (reduced) return
    let raf = 0
    const start = performance.now()
    const tick = (time: number) => {
      const t = Math.min(1, (time - start) / 650)
      setIntro(t * 0.035)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  const navigate = (hash: string, progress: number) => {
    if (!wrap.current) return
    const y = wrap.current.offsetTop + (wrap.current.offsetHeight - window.innerHeight) * progress
    window.scrollTo({ top: y, behavior: reduced ? 'instant' : 'smooth' })
    history.replaceState(null, '', hash)
  }
  useEffect(() => {
    const target = NAV.find(n => n.hash === window.location.hash)
    if (['#demo', '#questions'].includes(window.location.hash)) {
      const id = window.location.hash.slice(1)
      const raf = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }))
      return () => cancelAnimationFrame(raf)
    }
    if (!target || !wrap.current) return
    const raf = requestAnimationFrame(() => {
      const root = wrap.current!
      window.scrollTo({ top: root.offsetTop + (root.offsetHeight - window.innerHeight) * target.p, behavior: 'instant' })
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  /* Keep the prototype's phase windows and unequal per-group travel distances. */
  const m1 = ramp(p, P.move1)
  const m2 = ramp(p, P.move2)
  const y53 = lerp(mobile ? 136 : G.g53.start, G.g53.end, m1)
  const y54 = lerp(lerp(G.g54.enter, mobile ? 130 : G.g54.mid, m1), G.g54.end, m2)
  const y55 = lerp(lerp(G.g55.enter, G.g55.mid, m1), G.g55.end, m2)
  const copyP = reduced ? 1 : Math.max(p, intro)
  const active = p < 0.54 ? 0 : p < 0.83 ? 1 : 2
  const groupStyles = (y: number): CSSProperties => ({ ...box(safeL, 0, groupW, stageH), transform: `translateY(${y}px)`, willChange: 'transform' })

  /* Two camera moves over the actual front-view photo, continuous at seam. */
  const first = ramp(p, [0, VIDEO_SEAM])
  const second = ramp(p, [VIDEO_SEAM, 1])
  const mugX = mobile ? lerp(84, 64, second) : lerp(lerp(694, 424, first), 732, second)
  const mugY = mobile ? lerp(374, 104, second) : lerp(lerp(116, 130, first), 66, second)
  const mugSize = mobile ? lerp(282, 270, second) : lerp(lerp(590, 536, first), 450, second)
  const mugAngle = reduced ? 0 : lerp(lerp(-9, 1, first), -4, second)

  return <>
    <a className="skip-link" href="#demo">Skip to interactive demo</a>
    <main>
      <div ref={wrap} className="scroll-wrap" style={{ height: `${SCROLL_VH}vh` }}>
        <div className="scene" style={{ height: `max(calc(100vw * ${stageH} / ${stageW}), 100svh)` }}>
          <div className="scene-glow" aria-hidden="true" />
          <div className="scene-grid" aria-hidden="true" />
          <header className="site-nav">
            <a className="brand" href="#overview" onClick={e => { e.preventDefault(); navigate('#overview', 0) }} aria-label="Zap Band — overview">
              <span className="brand-dot" aria-hidden="true" />
              <span className="display">zap<span className="brand-divider"> / </span><span className="brand-cafe">band</span></span>
            </a>
            <nav aria-label="Main navigation" className="nav-links">
              {NAV.map((n, i) => <a className="label" key={n.hash} href={n.hash} aria-current={i === active ? 'location' : undefined} onClick={e => { e.preventDefault(); navigate(n.hash, n.p) }}>{n.label}</a>)}
            </nav>
            <a className="nav-buy label" href="pricing.html">Pricing <span aria-hidden="true">↗</span></a>
          </header>
          <div className="artboard" style={{ width: stageW, height: stageH, transform: `scale(${scale})` }}>
            <div className="backdrop-type display" aria-hidden="true" style={{ ...box(mobile ? -30 : 168, mobile ? 370 : 90), fontSize: mobile ? 138 : 300 }}>ZAP BAND</div>
            <div className="orbit" aria-hidden="true" style={{ ...box(mobile ? 40 : 608, mobile ? 342 : 88, mobile ? 320 : 704, mobile ? 320 : 704), transform: `rotate(${-24 + p * 38}deg)` }} />
            <div className="product-shadow" aria-hidden="true" style={box(mugX + 30, mugY + mugSize * 0.9, mugSize * 0.88, 45)} />
            <img className="hero-product" src={PRODUCT.cutout} width="1280" height="1280" fetchPriority="high" alt="AI-generated design mockup of a graphite Zap Band wristband with a blue indicator. Not a working prototype." style={{ ...box(mugX, mugY, mugSize, mugSize), transform: `rotate(${mugAngle}deg)`, opacity: mobile ? 1 - m1 * (1 - m2) * 0.85 : 1 }} />
            <nav className="index-rail" aria-label="Scene chapters" style={box(stageW - (mobile ? 20 : 40), mobile ? 360 : 380, 20, 220)}>
              {NAV.map((n, i) => <a key={n.hash} className="label" href={n.hash} aria-label={n.label} aria-current={active === i ? 'location' : undefined} style={{ top: i * (mobile ? 48 : 64), color: active === i ? '#83d5ff' : 'rgba(255,255,255,0.32)' }} onClick={e => { e.preventDefault(); navigate(n.hash, n.p) }}>0{i + 1}</a>)}
            </nav>

            <section id="overview" aria-labelledby="product-title" className="hero-group" style={groupStyles(y53)} inert={p > 0.57}>
              <p className="label eyebrow" style={box(0, -40)}>Wearable alarm concept <span aria-hidden="true">/</span> Zap Band</p>
              <h1 id="product-title" aria-label="Your morning. Their peace. Zap Band." style={{ margin: 0 }}>
                {['Your morning.', 'Their peace.'].map((line, i) => <Mask key={line} t={span(copyP, [P.word, P.word2][i])} style={box(0, (mobile ? 53 : 78) * i, mobile ? 350 : 650, mobile ? 64 : 96)}><span className="display hero-line" style={{ fontSize: mobile ? 30 : 57, lineHeight: 1.08 }}>{line}</span></Mask>)}
              </h1>
              <Mask t={span(copyP, P.word3)} style={box(0, mobile ? 126 : 176, mobile ? 342 : 500, 26)}><p className="product-name label">A quieter start, imagined.</p></Mask>
              {['An alarm meant for you. Not the whole room.', 'Explore a wearable concept using adjustable', 'electrical pulses instead of a loud sound.'].map((line, i) => <Mask key={line} t={span(copyP, [P.body1, P.body2, P.body3][i])} style={box(0, (mobile ? 166 : 230) + i * (mobile ? 21 : 25), mobile ? 342 : 470, 30)}><p style={{ margin: 0, fontSize: mobile ? 13.5 : 16, lineHeight: 1.5, color: 'rgba(255,255,255,0.7)' }}>{line}</p></Mask>)}
              <div className="hero-actions" style={{ ...box(0, mobile ? 510 : 348), opacity: span(copyP, P.body3) }}>
                <a href="#demo" className="button button-primary">Try the concept <span aria-hidden="true">↗</span></a>
                <a href="pricing.html" className="button button-ghost">View pricing <span aria-hidden="true">↗</span></a>
              </div>
              <p className="merchant-note" style={{ ...box(0, mobile ? 568 : 412), opacity: span(copyP, P.body3) }}>Design mockup. Safety and effectiveness not yet validated.</p>
              <aside className="glass capacity-card" aria-label="Example wake time" style={{ ...box(mobile ? 0 : groupW - 390, mobile ? 590 : 410, mobile ? 342 : 390, mobile ? 72 : 156), opacity: reduced ? 1 : span(Math.max(p, intro * 4), P.stat) }}>
                <div className="capacity-heading"><span className="label">Your morning<br />reimagined</span><strong className="display">07:00<span>AM</span></strong></div>
                <div className="capacity-line" aria-hidden="true"><span style={{ width: `${100 * (reduced ? 1 : span(Math.max(p, intro * 4), P.stat))}%` }} /></div>
                <div className="capacity-specs"><span>Concept preview</span><span>Your own schedule</span></div>
              </aside>
            </section>

            <section id="details" aria-labelledby="details-title" className="details-group" style={groupStyles(y54)} inert={p < 0.44 || p > 0.86}>
              {CARDS.map((c, i) => {
                const t = span(p, [P.g54In[0] + i * 0.004, P.g54In[1]])
                const positions = mobile ? [[0, 0], [176, 0], [0, 218], [176, 218]] : [[0, 0], [groupW - 255, 0], [116, 240], [groupW - 371, 240]]
                return <article className={`detail-card detail-card-${i}`} key={c.label[0]} style={{ ...box(positions[i][0], positions[i][1], mobile ? 166 : 255, mobile ? 200 : 215), opacity: t }}>
                  <div className="card-photo"><img src={PRODUCT.photo} alt="" width="1500" height="1500" loading="lazy" style={{ objectPosition: c.position, transform: `scale(${c.zoom})`, transformOrigin: c.position }} /><div className="card-scrim" /></div>
                  <span className="card-number label">0{i + 1}</span><h3 className="display">{c.label[0]}<br />{c.label[1]}</h3><p>{c.text}</p>
                </article>
              })}
              <div style={{ ...box(0, mobile ? 457 : 480, groupW), textAlign: 'center' }}>
                <p className="label eyebrow">The idea behind the band</p>
                <h2 className="display" id="details-title" style={{ fontSize: mobile ? 35 : 66, margin: '16px 0' }}>Made for different mornings.</h2>
                <p className="section-copy">A quiet wake-up is the goal.<br />Comfort, control and reliability come next.</p>
              </div>
            </section>

            <section id="ritual" className="ritual-group" aria-labelledby="ritual-title" style={groupStyles(y55)} inert={p < 0.79}>
              <div className="ritual-rule" style={box(0, mobile ? 264 : 404, 56, 2)} />
              <div style={box(0, mobile ? 288 : 430, mobile ? 342 : 600)}><p className="label eyebrow">Shared space. Different schedules.</p><h2 id="ritual-title" className="display" style={{ fontSize: mobile ? 32 : 54, lineHeight: 1.03, margin: '18px 0' }}>Early for you.<br />Quiet for them.</h2></div>
              <div style={box(mobile ? 0 : groupW - 440, mobile ? 432 : 434, mobile ? 332 : 440)}>
                <p className="section-copy">An early class. A shift before sunrise. A new time zone. Zap Band explores a more personal wake-up for students, partners and travelers who share their space.</p>
                <p className="care-note">This is an early concept, not a product available to buy.</p>
                <a href="#demo" className="text-link">Explore your morning <span aria-hidden="true">↗</span></a>
              </div>
            </section>
          </div>
          <div className="scene-bottom"><span className="label">Zap Band <span className="muted">/ Concept 01</span></span><a className="label scroll-cue" href="#details" onClick={e => { e.preventDefault(); navigate('#details', 0.7) }}>Scroll to discover <span aria-hidden="true">↓</span></a></div>
          <div className="progress-track" aria-hidden="true"><span style={{ transform: `scaleX(${p})` }} /></div>
        </div>
      </div>
      <Footer />
    </main>
  </>
}
