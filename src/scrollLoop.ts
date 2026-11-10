import Lenis from 'lenis'
type Tick = (time: number, delta: number) => void
const listeners = new Set<Tick>()
let lenis: Lenis | null = null
export const onFrame = (tick: Tick) => { listeners.add(tick); return () => { listeners.delete(tick) } }
export function startScroll(reduced: boolean) {
  if (!reduced) lenis = new Lenis({ lerp: .09, smoothWheel: true, wheelMultiplier: .85 })
  let frame = 0, last = performance.now()
  const loop = (time: number) => { lenis?.raf(time); const dt = Math.min(.05, (time-last)/1000); last=time; listeners.forEach(fn=>fn(time,dt)); frame=requestAnimationFrame(loop) }
  frame=requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(frame); lenis?.destroy(); lenis=null }
}
export function goTo(y: number, reduced = false) { if (lenis && !reduced) lenis.scrollTo(y,{duration:1.5}); else window.scrollTo({top:y,behavior:reduced?'instant':'smooth'}) }
export function goHash(hash: string) { const el=document.getElementById(hash.replace('#','')); if(el){goTo(el.getBoundingClientRect().top+window.scrollY-80,matchMedia('(prefers-reduced-motion: reduce)').matches);history.replaceState(null,'',hash)} }
