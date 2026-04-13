import { useRef, useEffect } from 'react'
import { Btn, Card, Badge, InfoRow, Ring } from './ui.jsx'

/* ── Preview ─────────────────────────────────────────────────────────────── */
function Preview({ html, url }) {
  const ref = useRef(null)
  useEffect(()=>{
    const f=ref.current; if(!f||!html) return
    const d=f.contentDocument||f.contentWindow?.document
    if(!d) return; d.open(); d.write(html); d.close()
  },[html])

  const dl = () => {
    const a=document.createElement('a')
    a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}))
    a.download='personalized-page.html'; a.click()
  }

  return (
    <div>
      <div style={{ display:'flex', gap:10, marginBottom:12, alignItems:'center' }}>
        <div style={{ flex:1, background:'rgba(255,255,255,.03)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 14px', fontSize:12, color:'var(--tx3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>🔒 {url}</div>
        <Btn v="ghost" onClick={dl} style={{ fontSize:12, padding:'8px 14px', whiteSpace:'nowrap' }}>⬇ Download HTML</Btn>
      </div>
      <div style={{ border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
        <div style={{ background:'rgba(255,255,255,.03)', padding:'9px 14px', display:'flex', gap:6, alignItems:'center' }}>
          {['#ef4444','#f59e0b','#10b981'].map(c=><div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }} />)}
          <div style={{ flex:1, background:'rgba(255,255,255,.04)', borderRadius:5, marginLeft:8, padding:'3px 12px', fontSize:11, color:'var(--tx3)' }}>{url}</div>
        </div>
        <iframe ref={ref} style={{ width:'100%', height:580, border:'none', display:'block', background:'#fff' }} title="Personalized page" sandbox="allow-same-origin" />
      </div>
    </div>
  )
}

/* ── Ad Analysis ─────────────────────────────────────────────────────────── */
function AdPanel({ a }) {
  return (
    <div style={{ background:'rgba(124,58,237,.04)', border:'1px solid rgba(124,58,237,.14)', borderRadius:14, padding:22 }}>
      <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.12em', color:'var(--p)', marginBottom:16, textTransform:'uppercase' }}>Agent 1 — Ad Intelligence Report</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
        {[['Headline',a.headline,'✦'],['Value Proposition',a.value_proposition,'◎'],
          ['Offer',a.offer||'—','⬡'],['Intent',a.intent,'→'],
          ['Tone',a.tone,'◈'],['CTA Copy',a.cta_copy,'🎯'],
          ['Emotional Hook',a.emotional_hook,'♡'],['Urgency',a.urgency_signals||'None','⚡'],
        ].map(([l,v,i])=><InfoRow key={l} label={l} value={v} icon={i} />)}
      </div>
      {a.key_benefits?.length>0&&(
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:'var(--tx3)', marginBottom:7, textTransform:'uppercase', letterSpacing:'.08em' }}>◇ Key Benefits</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>{a.key_benefits.map(b=><Badge key={b} color="purple">{b}</Badge>)}</div>
        </div>
      )}
      {a.keywords?.length>0&&(
        <div>
          <div style={{ fontSize:10, color:'var(--tx3)', marginBottom:7, textTransform:'uppercase', letterSpacing:'.08em' }}>⬡ Keywords</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>{a.keywords.map(k=><Badge key={k} color="blue">{k}</Badge>)}</div>
        </div>
      )}
      <div style={{ marginTop:16, display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ fontSize:11, color:'var(--tx3)' }}>Agent confidence:</div>
        <div style={{ background:a.confidence>.7?'rgba(16,185,129,.12)':'rgba(245,158,11,.12)', border:`1px solid ${a.confidence>.7?'rgba(16,185,129,.3)':'rgba(245,158,11,.3)'}`, color:a.confidence>.7?'#34d399':'#fbbf24', borderRadius:20, padding:'2px 10px', fontSize:12 }}>
          {Math.round(a.confidence*100)}%
        </div>
      </div>
    </div>
  )
}

/* ── Gap Report ──────────────────────────────────────────────────────────── */
function GapPanel({ g }) {
  const sevColor = { high:'var(--red)', medium:'var(--amber)', low:'var(--green)' }
  return (
    <div>
      {/* Score */}
      <div style={{ display:'flex', gap:14, marginBottom:20, flexWrap:'wrap' }}>
        <Card style={{ flex:1, minWidth:200 }}>
          <div style={{ fontSize:11, color:'var(--tx3)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.07em' }}>Initial Match Score</div>
          <div style={{ fontSize:36, fontWeight:800, fontFamily:'var(--fd)',
            color:g.overall_match_score>.6?'var(--green)':g.overall_match_score>.3?'var(--amber)':'var(--red)' }}>
            {Math.round(g.overall_match_score*100)}%
          </div>
          <div style={{ fontSize:12, color:'var(--tx3)', marginTop:4 }}>Before personalization</div>
        </Card>
        <Card style={{ flex:1, minWidth:200 }}>
          <div style={{ fontSize:11, color:'var(--tx3)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.07em' }}>Gaps Found</div>
          <div style={{ fontSize:36, fontWeight:800, fontFamily:'var(--fd)', color:'var(--p-light)' }}>{g.gaps?.length||0}</div>
          <div style={{ fontSize:12, color:'var(--tx3)', marginTop:4 }}>
            {g.gaps?.filter(x=>x.severity==='high').length||0} high · {g.gaps?.filter(x=>x.severity==='medium').length||0} medium
          </div>
        </Card>
      </div>

      {/* Summary */}
      <Card style={{ marginBottom:16, background:'rgba(124,58,237,.04)', border:'1px solid rgba(124,58,237,.14)' }}>
        <div style={{ fontSize:11, color:'var(--p-light)', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>Agent 3 — Gap Analysis Summary</div>
        <div style={{ fontSize:14, color:'var(--tx2)', lineHeight:1.7 }}>{g.summary}</div>
      </Card>

      {/* Gap list */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {(g.gaps||[]).map((gap,i)=>(
          <div key={i} style={{ background:'rgba(255,255,255,.02)', border:`1px solid ${gap.severity==='high'?'rgba(239,68,68,.2)':gap.severity==='medium'?'rgba(245,158,11,.2)':'rgba(16,185,129,.15)'}`, borderRadius:12, padding:'14px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontSize:13, fontWeight:600, color:'var(--tx)', textTransform:'capitalize' }}>{gap.field?.replace('_',' ')}</span>
              <span style={{ fontSize:11, fontWeight:600, color:sevColor[gap.severity], background:`${sevColor[gap.severity]}18`, border:`1px solid ${sevColor[gap.severity]}40`, borderRadius:20, padding:'2px 10px' }}>{gap.severity}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
              <div style={{ background:'rgba(239,68,68,.06)', border:'1px solid rgba(239,68,68,.15)', borderRadius:8, padding:'8px 12px' }}>
                <div style={{ fontSize:10, color:'#f87171', marginBottom:3, textTransform:'uppercase', letterSpacing:'.07em' }}>Ad says</div>
                <div style={{ fontSize:12, color:'var(--tx2)' }}>{gap.ad_value}</div>
              </div>
              <div style={{ background:'rgba(245,158,11,.06)', border:'1px solid rgba(245,158,11,.15)', borderRadius:8, padding:'8px 12px' }}>
                <div style={{ fontSize:10, color:'#fbbf24', marginBottom:3, textTransform:'uppercase', letterSpacing:'.07em' }}>Page says</div>
                <div style={{ fontSize:12, color:'var(--tx2)' }}>{gap.page_value}</div>
              </div>
            </div>
            <div style={{ fontSize:12, color:'var(--tx3)', borderTop:'1px solid var(--border)', paddingTop:8 }}>
              💡 {gap.suggestion}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── CRO Changes ─────────────────────────────────────────────────────────── */
function ChangesPanel({ plan, validation, ms, applied }) {
  return (
    <div>
      {/* Stats row */}
      <div style={{ display:'flex', gap:12, marginBottom:18, flexWrap:'wrap' }}>
        <Card style={{ flex:1, minWidth:180 }}><Ring score={plan.confidence_score||0} /></Card>
        <Card style={{ flex:1, minWidth:160 }}>
          <div style={{ fontSize:10, color:'var(--tx3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4 }}>Time</div>
          <div style={{ fontSize:24, fontWeight:800, fontFamily:'var(--fd)', color:'#60a5fa' }}>{ms?(ms/1000).toFixed(1)+'s':'—'}</div>
        </Card>
        <Card style={{ flex:1, minWidth:160 }}>
          <div style={{ fontSize:10, color:'var(--tx3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4 }}>Changes Applied</div>
          <div style={{ fontSize:24, fontWeight:800, fontFamily:'var(--fd)', color:'var(--green)' }}>{applied?.length||0}</div>
        </Card>
      </div>

      {/* Summary */}
      <Card style={{ marginBottom:14, background:'rgba(16,185,129,.04)', border:'1px solid rgba(16,185,129,.16)' }}>
        <div style={{ fontSize:11, color:'var(--green)', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>Agent 4 — CRO Changes Summary</div>
        <div style={{ fontSize:14, color:'var(--tx2)', lineHeight:1.7 }}>{plan.changes_summary}</div>
      </Card>

      {/* Suggestions */}
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
        {(plan.suggestions||[]).map((s,i)=>(
          <div key={i} style={{ background:'rgba(255,255,255,.02)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:12, fontWeight:600, color:'var(--p-light)', textTransform:'uppercase', letterSpacing:'.07em' }}>{s.element}</span>
              <Badge color="purple">{s.cro_principle}</Badge>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
              <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px' }}>
                <div style={{ fontSize:10, color:'var(--tx3)', marginBottom:3, textTransform:'uppercase', letterSpacing:'.07em' }}>Before</div>
                <div style={{ fontSize:12, color:'var(--tx2)' }}>{s.original||'—'}</div>
              </div>
              <div style={{ background:'rgba(16,185,129,.05)', border:'1px solid rgba(16,185,129,.15)', borderRadius:8, padding:'8px 12px' }}>
                <div style={{ fontSize:10, color:'var(--green)', marginBottom:3, textTransform:'uppercase', letterSpacing:'.07em' }}>After</div>
                <div style={{ fontSize:12, color:'var(--tx)' }}>{s.replacement}</div>
              </div>
            </div>
            <div style={{ fontSize:12, color:'var(--tx3)' }}>↳ {s.reason}</div>
          </div>
        ))}
      </div>

      {/* Guardrails result */}
      <Card style={{ background: validation.passed?'rgba(16,185,129,.04)':'rgba(245,158,11,.04)', border:`1px solid ${validation.passed?'rgba(16,185,129,.16)':'rgba(245,158,11,.2)'}` }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:10, color:validation.passed?'var(--green)':'var(--amber)' }}>
          {validation.passed?'✓ Guardrails Passed':'⚠ Guardrails Warnings'}
        </div>
        {validation.warnings?.length>0&&(
          <div style={{ marginBottom:8 }}>{validation.warnings.map((w,i)=><div key={i} style={{ fontSize:12, color:'#fbbf24', marginBottom:3 }}>⚠ {w}</div>)}</div>
        )}
        {validation.issues?.length>0&&(
          <div>{validation.issues.map((iss,i)=><div key={i} style={{ fontSize:12, color:'#f87171', marginBottom:3 }}>✕ {iss}</div>)}</div>
        )}
        {validation.passed && !validation.warnings?.length && (
          <div style={{ fontSize:12, color:'var(--green)' }}>No hallucinations detected. All changes validated.</div>
        )}
      </Card>
    </div>
  )
}

/* ── Main ────────────────────────────────────────────────────────────────── */
const TABS=[
  {id:'preview', label:'🖥 Preview'},
  {id:'ad',      label:'◈ Ad Analysis'},
  {id:'gaps',    label:'◉ Gap Report'},
  {id:'changes', label:'✦ CRO Changes'},
]

export default function StepResult({ result, tab, setTab, onReset }) {
  const { personalized_html, ad_analysis, page_analysis, gap_report, cro_plan, validation, original_url, processing_time_ms, changes_applied } = result

  const dl = () => {
    const a=document.createElement('a')
    a.href=URL.createObjectURL(new Blob([personalized_html],{type:'text/html'}))
    a.download='personalized-page.html'; a.click()
  }

  return (
    <div className="fadeUp">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, flexWrap:'wrap', gap:14 }}>
        <div>
          <h1 style={{ fontFamily:'var(--fd)', fontSize:'clamp(22px,3.5vw,32px)', fontWeight:900, marginBottom:6,
            background:'linear-gradient(135deg,#f0eeff 30%,#10b981)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Pipeline Complete ✓
          </h1>
          <p style={{ color:'var(--tx2)', fontSize:14 }}>5 agents ran · {changes_applied?.length||0} changes applied · {(processing_time_ms/1000).toFixed(1)}s total</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <Btn v="ghost" onClick={onReset} style={{ fontSize:13 }}>↺ Start Over</Btn>
          <Btn onClick={dl} style={{ fontSize:13, padding:'10px 20px' }}>⬇ Export HTML</Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:24, background:'rgba(255,255,255,.03)', border:'1px solid var(--border)', borderRadius:10, padding:4, width:'fit-content', flexWrap:'wrap' }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            fontFamily:'var(--fb)', fontSize:13, cursor:'pointer', padding:'7px 16px',
            borderRadius:7, transition:'all .2s',
            color:tab===t.id?'var(--tx)':'var(--tx3)',
            background:tab===t.id?'rgba(124,58,237,.2)':'transparent',
            border:tab===t.id?'1px solid rgba(124,58,237,.3)':'1px solid transparent',
          }}>{t.label}</button>
        ))}
      </div>

      {tab==='preview' && <Preview html={personalized_html} url={original_url} />}
      {tab==='ad'      && <AdPanel a={ad_analysis} />}
      {tab==='gaps'    && <GapPanel g={gap_report} />}
      {tab==='changes' && <ChangesPanel plan={cro_plan} validation={validation} ms={processing_time_ms} applied={changes_applied} />}
    </div>
  )
}