import {useEffect,useRef,useState} from 'react'
import type * as Three from 'three'
import {CHAPTERS,clamp,smooth,type Pose} from './tour'
import {goTo,onFrame} from './scrollLoop'
const BASE=import.meta.env.BASE_URL+'assets/zap-band-3d/'
type Controls = {reset:()=>void;zoom:(factor:number)=>void;wake:()=>void;free:()=>void}
const nothing=()=>{}
export default function ProductTour({reduced}:{reduced:boolean}){
  const root=useRef<HTMLElement>(null),canvasHost=useRef<HTMLDivElement>(null),marker=useRef<HTMLDivElement>(null),leader=useRef<SVGLineElement>(null),progress=useRef<HTMLSpanElement>(null),veil=useRef<HTMLDivElement>(null),wordmark=useRef<HTMLDivElement>(null)
  const [active,setActive]=useState(0),[status,setStatus]=useState<'loading'|'ready'|'fallback'>('loading'),[manual,setManual]=useState(false),[awake,setAwake]=useState(true)
  const actions=useRef<Controls>({reset:nothing,zoom:nothing,wake:nothing,free:nothing}),freeMode=useRef(false),wakeUntil=useRef(0)
  const go=(index:number)=>{const el=root.current;if(!el)return;goTo(el.offsetTop+(el.offsetHeight-innerHeight)*(index/CHAPTERS.length+.035),reduced)}
  useEffect(()=>{
    let cancelled=false,cleanup=nothing
    const run=async()=>{
      const [T,{OrbitControls},{GLTFLoader},{RoomEnvironment}]=await Promise.all([import('three'),import('three/addons/controls/OrbitControls.js'),import('three/addons/loaders/GLTFLoader.js'),import('three/addons/environments/RoomEnvironment.js')])
      if(cancelled||!canvasHost.current)return
      const host=canvasHost.current
      // The query tests the same fallback that an unavailable WebGL context uses.
      if(new URLSearchParams(location.search).get('preview')==='static')throw Error('Static preview requested')
      const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<768?1.5:1.8));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.setClearColor(0,0);renderer.domElement.setAttribute('aria-label','Interactive 3D Zap Band. Drag to rotate, or use the view controls.');host.prepend(renderer.domElement)
      const scene=new T.Scene(),camera=new T.PerspectiveCamera(33,1,.001,10),orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.dampingFactor=.09;orbit.enablePan=false;orbit.enableZoom=false;orbit.enabled=false;orbit.minDistance=.035;orbit.maxDistance=.45;renderer.domElement.style.touchAction='pan-y'
      const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.035);scene.environment=env.texture;room.dispose();pmrem.dispose()
      scene.add(new T.HemisphereLight('#d8e9ff','#302438',.85))
      const key=new T.DirectionalLight('#ffe4c4',3.1);key.position.set(.12,.2,.15);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-.16,right:.16,top:.16,bottom:-.16,near:.01,far:1});key.shadow.bias=-.00004;scene.add(key)
      const edge=new T.DirectionalLight('#42aaff',6.2);edge.position.set(-.14,.05,-.08);scene.add(edge)
      const fill=new T.DirectionalLight('#aa76ff',3.2);fill.position.set(0,-.08,-.15);scene.add(fill)
      const floor=new T.Mesh(new T.PlaneGeometry(2,2),new T.ShadowMaterial({opacity:.28}));floor.rotation.x=-Math.PI/2;floor.position.y=-.011;floor.receiveShadow=true;scene.add(floor)
      let model:Three.Group|undefined,screen:Three.MeshStandardMaterial|undefined,parts:{object:Three.Object3D;base:Three.Vector3}[]=[],lastIndex=-1,lastScroll=window.scrollY,lastAwake=true,visible=true
      const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};const ro=new ResizeObserver(resize);ro.observe(host);resize()
      const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting},{rootMargin:'100px'});if(root.current)visibility.observe(root.current)
      const enableManual=()=>{freeMode.current=true;orbit.enabled=true;renderer.domElement.style.touchAction='none';setManual(true)}
      const resume=()=>{freeMode.current=false;orbit.enabled=false;renderer.domElement.style.touchAction='pan-y';setManual(false)}
      const wake=()=>{wakeUntil.current=performance.now()+3500}
      const pointer=(e:PointerEvent)=>{wake();if(e.pointerType==='mouse')enableManual()}
      renderer.domElement.addEventListener('pointerdown',pointer,true);renderer.domElement.addEventListener('pointermove',wake,{passive:true})
      const lost=(event:Event)=>{event.preventDefault();setStatus('fallback')};renderer.domElement.addEventListener('webglcontextlost',lost)
      actions.current={reset:resume,wake,free:()=>freeMode.current?resume():enableManual(),zoom:factor=>{enableManual();let offset=camera.position.clone().sub(orbit.target),length=clamp(offset.length()*factor,.035,.45);camera.position.copy(orbit.target).add(offset.setLength(length));orbit.update()}}
      const toVec=(v:[number,number,number])=>new T.Vector3(...v).multiplyScalar(.001)
      const pose=(index:number):Pose=>CHAPTERS[clamp(index,0,CHAPTERS.length-1)].pose
      let desiredPosition=toVec(pose(0).position),desiredTarget=toVec(pose(0).target),currentLift=0,currentLight=1
      camera.position.copy(desiredPosition);orbit.target.copy(desiredTarget);camera.lookAt(orbit.target)
      const stop=onFrame((time,dt)=>{
        const section=root.current;if(!section||!visible)return
        const rect=section.getBoundingClientRect(),p=clamp(-rect.top/Math.max(1,section.offsetHeight-innerHeight)),u=Math.min(CHAPTERS.length-1,p*CHAPTERS.length),index=Math.floor(u),local=u-index,travel=reduced?0:smooth((local-.58)/.42),a=pose(index),b=pose(index+1),mix=1-Math.exp(-dt*8)
        if(Math.abs(window.scrollY-lastScroll)>2&&freeMode.current)resume();lastScroll=window.scrollY
        if(index!==lastIndex){lastIndex=index;setActive(index);if(index===8)wakeUntil.current=time+1600}
        desiredPosition.copy(toVec(a.position)).lerp(toVec(b.position),travel);desiredTarget.copy(toVec(a.target)).lerp(toVec(b.target),travel)
        // Pull back a little while traveling, as in the Valmora detail tour.
        desiredPosition.add(desiredPosition.clone().sub(desiredTarget).multiplyScalar(Math.sin(travel*Math.PI)*.16))
        if(innerWidth<768){const offset=desiredPosition.clone().sub(desiredTarget).multiplyScalar(1.12);desiredPosition.copy(desiredTarget).add(offset)}
        if(!freeMode.current){camera.position.lerp(desiredPosition,reduced?1:mix);orbit.target.lerp(desiredTarget,reduced?1:mix);camera.lookAt(orbit.target)}else orbit.update()
        const lift=a.lift+(b.lift-a.lift)*travel;currentLift+= (lift-currentLift)*(reduced?1:mix);parts.forEach(({object,base})=>{object.position.copy(base);object.position.y+=42*currentLift;object.position.z+=16*currentLift})
        const isAwake=index!==8||time<wakeUntil.current;const lit=index===8?(isAwake?1:0):a.light+(b.light-a.light)*travel;currentLight+=(lit-currentLight)*(reduced?1:mix)
        if(screen){screen.emissiveIntensity=currentLight;screen.opacity=1;screen.color.setScalar(0)}
        if(isAwake!==lastAwake){lastAwake=isAwake;setAwake(isAwake)}
        if(progress.current)progress.current.style.transform=`scaleX(${p})`
        if(veil.current)veil.current.style.transform=`translate3d(0,${-smooth(clamp(p/.06))*115}%,0) rotate(${-smooth(clamp(p/.06))*7}deg)`
        if(wordmark.current)wordmark.current.style.opacity=String(index===0?.12*(1-travel):.025)
        if(marker.current&&leader.current){let point=a.point;if(point&&model&&!freeMode.current){let q=toVec(point).project(camera),x=(q.x*.5+.5)*host.clientWidth,y=(-q.y*.5+.5)*host.clientHeight,inside=q.z<1&&Math.abs(q.x)<.95&&Math.abs(q.y)<.95;marker.current.style.opacity=inside?String(1-Math.sin(travel*Math.PI)):'0';marker.current.style.transform=`translate3d(${x}px,${y}px,0)`;leader.current.setAttribute('x1',String(x));leader.current.setAttribute('y1',String(y));leader.current.setAttribute('x2',String(Math.max(12,x-65)));leader.current.setAttribute('y2',String(Math.min(host.clientHeight-20,y+55)));leader.current.style.opacity=inside?'0.6':'0';}else{marker.current.style.opacity='0';leader.current.style.opacity='0'}}
        if(model){model.updateMatrixWorld(true);renderer.render(scene,camera)}
      })
      cleanup=()=>{stop();ro.disconnect();visibility.disconnect();renderer.domElement.removeEventListener('pointerdown',pointer,true);renderer.domElement.removeEventListener('pointermove',wake);renderer.domElement.removeEventListener('webglcontextlost',lost);orbit.dispose();scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material]){for(const value of Object.values(m))if(value instanceof T.Texture)value.dispose();m.dispose()}}});env.texture.dispose();renderer.dispose();renderer.domElement.remove();actions.current={reset:nothing,zoom:nothing,wake:nothing,free:nothing}}
      try{
        // Verify the approved model revision before rendering.
        const response=await fetch(BASE+'model.glb');if(!response.ok)throw Error('Model unavailable');const bytes=await response.arrayBuffer();const manifest=await(await fetch(BASE+'model-manifest.json')).json();if(manifest.schemaVersion!=='venture-3d-handoff/1.0')throw Error('Unsupported handoff');const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');if(hash!==manifest.integrity.checksum)throw Error('Model integrity check failed')
        const gltf=await new GLTFLoader().parseAsync(bytes,BASE);if(cancelled){gltf.scene.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose()});return}model=gltf.scene;scene.add(model)
        model.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true;const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{if(m instanceof T.MeshStandardMaterial)m.envMapIntensity=.85});if(o.name.includes('Three_alarms')||o.name.includes('Three alarms')){screen=o.material as Three.MeshStandardMaterial;screen.toneMapped=false;screen.emissiveIntensity=1}if(!o.name.includes('Silicone'))parts.push({object:o,base:o.position.clone()})}})
        if(!parts.length||!screen)throw Error('Missing product components');setStatus('ready')
      }catch(error){if(!cancelled){console.warn('3D preview unavailable:',error);setStatus('fallback')}}
    }
    run().catch(error=>{if(!cancelled){console.warn('3D unavailable:',error);setStatus('fallback')}})
    return()=>{cancelled=true;cleanup()}
  },[reduced])
  const chapter=CHAPTERS[active]
  return <section ref={root} className={`product-story ${manual?'is-manual':''} ${status==='fallback'?'is-fallback':''}`} id="overview" aria-label="Zap Band interactive product tour">
    <div className="story-pin"><div className="stage-spotlight"/><div className="stage-beam"/><div ref={wordmark} className="stage-wordmark" aria-hidden="true">ZAP BAND</div>
      <div className="story-canvas" ref={canvasHost} data-status={status}>
        {status!=='ready'&&<div className="model-fallback"><img src={BASE+'preview.png'} alt="Confirmed Zap Band model showing the three-alarm display, battery and colored lightning gauge" width="1200" height="900"/><span>{status==='loading'?'Preparing your 3D experience…':'Static product preview · interactive 3D unavailable'}</span></div>}
        <div className="floor-ellipse" aria-hidden="true"/>
        <svg className="hotspot-leader" aria-hidden="true"><line ref={leader}/></svg><div ref={marker} className="feature-reticle" aria-hidden="true"><span/><i/><b>0{active}</b></div>
        <div className="unveil-sheen" ref={veil} aria-hidden="true"/>
      </div>
      <div className={`story-copy ${active===0?'is-intro':''}`} key={chapter.id}><p className="chapter-tag">{chapter.tag}</p>{active===0?<h1>Your morning.<br/><i>Their peace.</i></h1>:<h2>{chapter.title[0]}<br/><i>{chapter.title[1]}</i></h2>}<p className="story-description">{chapter.body}</p>{active===0?<div className="story-ctas"><button className="editorial-link" onClick={()=>go(1)}>Discover the design <span>↓</span></button><a href="pricing.html" className="subtle-link">View pricing ↗</a></div>:<p className="chapter-foot">{chapter.foot}</p>}{active===8&&<button className="wake-screen" onClick={()=>actions.current.wake()}>{awake?'Display awake':'Display asleep'} <span>↗ Wake display</span></button>}</div>
      <div className="tour-hud" aria-hidden="true"><span>DESIGN STUDY / 01</span><span>{active===0?'THE UNVEILING':`DETAIL ${String(active).padStart(2,'0')} / 08`}</span><span>REAL-TIME 3D</span></div>
      <div className="story-controls" aria-label="3D model controls"><span>{manual?'Drag to rotate · scroll to resume':status==='fallback'?'Static preview':'Scroll to explore · drag to rotate'}</span><div><button onClick={()=>actions.current.free()} disabled={status!=='ready'} aria-pressed={manual}>{manual?'Resume tour':'Explore in 3D'}</button><button onClick={()=>actions.current.zoom(.86)} disabled={status!=='ready'} aria-label="Zoom in">+</button><button onClick={()=>actions.current.zoom(1.16)} disabled={status!=='ready'} aria-label="Zoom out">−</button><button onClick={()=>actions.current.reset()} disabled={status!=='ready'} aria-label="Reset 3D view">↺</button></div></div>
      <nav className="tour-stops" aria-label="Product feature chapters">{CHAPTERS.map((c,i)=><button key={c.id} aria-label={i===0?'Overview':c.tag.split(' / ')[1]} aria-current={i===active?'step':undefined} onClick={()=>go(i)}><span/><small>{String(i).padStart(2,'0')}</small></button>)}</nav>
      <div className="story-bottom"><span>ZAP BAND <i>/ A QUIETER START, IMAGINED.</i></span><span>{String(active).padStart(2,'0')} <i>/ 08</i></span></div><div className="story-progress"><span ref={progress}/></div>
    </div><span className="story-anchor" id="details" style={{top:'11.5%'}}/>
  </section>
}
