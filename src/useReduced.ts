import {useEffect,useState} from 'react'
export function useReduced(){const [v,set]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);useEffect(()=>{let q=matchMedia('(prefers-reduced-motion: reduce)'),f=()=>set(q.matches);q.addEventListener('change',f);return()=>q.removeEventListener('change',f)},[]);return v}
