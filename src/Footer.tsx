import { useEffect, useState } from 'react'
const ROUTINES = {
  student: { label: 'Early class', time: '07:00', copy: 'An early lecture for you. A later start for your roommate.' },
  work: { label: 'Early shift', time: '05:30', copy: 'Your workday begins before your partner’s. Imagine a more personal wake-up.' },
  travel: { label: 'Travel day', time: '06:15', copy: 'An early departure in a shared room. One less reason to turn up the volume.' },
} as const
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export default function Footer() {
  const [routine, setRoutine] = useState<keyof typeof ROUTINES>('student')
  const [time, setTime] = useState('07:00')
  const [days, setDays] = useState([0, 1, 2, 3, 4])
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(() => { setRunning(false); setFinished(true) }, 5000)
    return () => window.clearTimeout(timer)
  }, [running])
  const chooseRoutine = (key: keyof typeof ROUTINES) => {
    setRoutine(key); setTime(ROUTINES[key].time); setFinished(false); setRunning(false)
  }
  const reset = () => { setRunning(false); setFinished(false); setTime('07:00'); setDays([0,1,2,3,4]); setRoutine('student') }
  const h = Number(time.split(':')[0]); const minutes = time.split(':')[1] || '00'
  const clock = `${String(h % 12 || 12).padStart(2, '0')}:${minutes}`
  return <footer className="site-footer">
    <div className="footer-panel">
      <section id="demo" className="demo-section" aria-labelledby="demo-title">
        <div className="demo-copy">
          <span className="product-badge label"><span aria-hidden="true" /> Interactive concept</span>
          <h2 id="demo-title" className="display">Make it<br /><span>your morning.</span></h2>
          <p>Different routines deserve different starts. Explore what a simple wake-time interface could feel like.</p>
          <div className="routine-tabs" role="group" aria-label="Choose a morning routine">
            {(Object.keys(ROUTINES) as (keyof typeof ROUTINES)[]).map(key => <button type="button" key={key} aria-pressed={routine === key} onClick={() => chooseRoutine(key)}>{ROUTINES[key].label}</button>)}
          </div>
          <p className="routine-description">{ROUTINES[routine].copy}</p>
          <p className="demo-disclaimer">Visual demo only. No alarm is scheduled, no sound or electrical pulse is produced, and nothing is saved or sent.</p>
        </div>
        <div className={`alarm-console ${running ? 'is-previewing' : ''}`}>
          <div className="console-top"><span className="label">ZAP / WAKE STUDIO</span><span className="console-status">{running ? 'PREVIEWING' : 'CONCEPT MODE'}</span></div>
          <div className="clock-face" aria-hidden="true"><strong>{clock}</strong><span>{h >= 12 ? 'PM' : 'AM'}</span></div>
          <label className="time-label" htmlFor="wake-time">Wake time <input id="wake-time" type="time" value={time} required onChange={e => {setTime(e.target.value);setFinished(false);setRunning(false)}} /></label>
          <div className="day-picker" role="group" aria-label="Choose example days">
            {DAYS.map((day,i) => <button type="button" key={day} aria-pressed={days.includes(i)} onClick={() => {setDays(ds => ds.includes(i) ? ds.filter(d => d !== i) : [...ds, i]);setFinished(false);setRunning(false)}}>{day}</button>)}
          </div>
          <div className="signal-preview" aria-hidden="true">{Array.from({length: 32},(_,i) => <i key={i} style={{animationDelay:`${i*0.035}s`,height:`${12 + Math.sin(i*0.7)**2*22}px`}} />)}</div>
          <p className="preview-status" role="status" aria-live="polite">{!time ? 'Choose a wake time to preview.' : days.length === 0 ? 'Choose at least one day to preview.' : running ? `Previewing ${clock} ${h >= 12 ? 'PM' : 'AM'} · ${DAYS.filter((_,i)=>days.includes(i)).join(', ')}` : finished ? 'Preview complete. No real alarm has been set.' : 'Ready to imagine a different start?'}</p>
          <button type="button" className="button button-primary preview-button" disabled={!time || days.length===0} onClick={() => {setRunning(r=>!r);setFinished(false)}}>{running ? 'Stop preview' : 'Preview my morning'} <span aria-hidden="true">{running ? '■' : '→'}</span></button>
          <button type="button" className="reset-button" onClick={reset}>Reset demo</button>
        </div>
      </section>
      <section id="questions" className="questions" aria-labelledby="questions-title">
        <div><p className="label eyebrow">A good idea starts with good questions</p><h2 id="questions-title" className="display">Still curious?</h2></div>
        <div className="faq-list">
          <details><summary>How would Zap Band work?</summary><p>The proposal is to use adjustable electrical pulses in a wearable alarm, rather than a loud sound. Wristband and patch formats are being explored. The final design and operating specifications have not been established.</p></details>
          <details><summary>Is this a real product I can buy?</summary><p>Not yet. Zap Band is a student venture concept. The image is an AI-generated design mockup, and the demo only illustrates a possible interface. The planned device price is $99.99 USD; a launch date has not been set. <a className="text-link" href="pricing.html">Explore pricing ↗</a></p></details>
          <details><summary>Has safety or effectiveness been proven?</summary><p>No. Safety, comfortable wear and reliable waking are goals that need qualified assessment and testing. This website does not demonstrate those properties or replace your existing alarm.</p></details>
          <details><summary>What is the next step?</summary><p>Learn from real consumers about their waking routines, compare wearable concepts, and investigate whether the idea is practical. Feedback from the classroom AI simulation is exploratory, not evidence of real customer demand.</p></details>
        </div>
      </section>
      <div className="footer-rule" />
      <div className="footer-columns">
        <div className="footer-brand"><span className="brand-dot" aria-hidden="true" /><span className="display">zap / band</span><p>Your morning. Their peace.<br />A quieter start, imagined.</p></div>
        <div><h3 className="label">Explore</h3><a href="pricing.html">Pricing · $99.99 USD</a><a href="#demo">Try the demo</a><a href="#questions">Questions and answers</a></div>
        <div><h3 className="label">Behind the concept</h3><a href="https://andrewvalentino-creator.github.io/my-first-webpage/">Meet Andrew ↗</a><a href="#overview" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); history.replaceState(null, '', '#overview') }}>Back to top ↑</a></div>
      </div>
      <div className="legal-bar"><span>Zap Band · A Fairfield University student venture concept.</span><span>Concept imagery. No product sales or medical claims.</span></div>
      <div className="footer-wordmark display" aria-hidden="true">zap band.</div>
    </div>
  </footer>
}
