import { useState, useCallback } from 'react'
import { personalizePage } from '../api/client'

const STEPS = [
  { id:'ad',      label:'Ad Creative'  },
  { id:'url',     label:'Landing Page' },
  { id:'loading', label:'AI Pipeline'  },
  { id:'result',  label:'Result'       },
]

const MSGS = [
  { pct:8,   msg:'Uploading ad creative…'                      },
  { pct:20,  msg:'Agent 1 — GPT-4o Vision reading your ad…'   },
  { pct:35,  msg:'Agent 2 — Scraping & parsing landing page…' },
  { pct:52,  msg:'Agent 3 — Detecting message-match gaps…'    },
  { pct:68,  msg:'Agent 4 — Generating CRO strategy…'         },
  { pct:80,  msg:'Guardrails — Validating for hallucinations…' },
  { pct:92,  msg:'Agent 5 — Applying surgical HTML changes…'  },
  { pct:100, msg:'Done!'                                        },
]

export function usePersonalize() {
  const [step,       setStep]       = useState(0)
  const [adMode,     setAdMode]     = useState('url')
  const [adUrl,      setAdUrl]      = useState('')
  const [adFile,     setAdFile]     = useState(null)
  const [adPreview,  setAdPreview]  = useState('')
  const [pageUrl,    setPageUrl]    = useState('')
  const [pct,        setPct]        = useState(0)
  const [msg,        setMsg]        = useState('')
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState(null)
  const [tab,        setTab]        = useState('preview')

  const simulate = useCallback(() => {
    let i = 0
    const tick = () => {
      if (i >= MSGS.length - 1) return
      const { pct: p, msg: m } = MSGS[i++]
      setPct(p); setMsg(m)
      setTimeout(tick, i < 2 ? 600 : i < 5 ? 1600 : 2200)
    }
    tick()
  }, [])

  const onFile = useCallback((f) => {
    if (!f) return
    setAdFile(f)
    const r = new FileReader()
    r.onload = e => setAdPreview(e.target.result)
    r.readAsDataURL(f)
  }, [])

  const go = useCallback((n) => { setError(''); setStep(n) }, [])

  const run = useCallback(async () => {
    setError(''); setLoading(true); setStep(2); setPct(0); simulate()
    try {
      const data = await personalizePage({
        landingPageUrl: pageUrl,
        adImageUrl:  adMode === 'url'    ? adUrl  : undefined,
        adImageFile: adMode === 'upload' ? adFile : undefined,
      })
      setResult(data); setPct(100); setTab('preview'); setStep(3)
    } catch (e) {
      setError(e?.response?.data?.detail || e?.response?.data?.error || e?.message || 'Something went wrong.')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }, [adMode, adUrl, adFile, pageUrl, simulate])

  const reset = useCallback(() => {
    setStep(0); setAdMode('url'); setAdUrl(''); setAdFile(null)
    setAdPreview(''); setPageUrl(''); setPct(0); setMsg('')
    setError(''); setLoading(false); setResult(null); setTab('preview')
  }, [])

  return {
    step, steps: STEPS, adMode, setAdMode,
    adUrl, setAdUrl, adFile, adPreview,
    pageUrl, setPageUrl,
    pct, msg, error, loading, result,
    tab, setTab,
    canGo0: adMode === 'upload' ? !!adFile : adUrl.trim().length > 10,
    canGo1: pageUrl.trim().startsWith('http'),
    onFile, go, run, reset,
  }
}