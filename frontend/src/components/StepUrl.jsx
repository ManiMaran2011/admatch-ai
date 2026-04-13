import { Btn, Input, Lbl, Card, Spin } from './ui.jsx'

const AGENTS = [
  ['◈','Ad Analyzer',  'GPT-4o Vision reads your ad'],
  ['⬡','Page Analyzer','Scrapes & parses landing page DOM'],
  ['◉','Gap Detector', 'Finds every message-match gap'],
  ['✦','CRO Optimizer','Generates surgical change plan'],
  ['→','Rewriter',     'Applies changes to real HTML'],
]

export default function StepUrl({ adMode, adUrl, adPreview, adFile, pageUrl, setPageUrl, error, loading, onBack, onRun, canRun }) {
  const thumb = adPreview || adUrl
  const lbl   = adMode==='upload' ? (adFile?.name||'Uploaded image') : adUrl

  return (
    <div className="fadeUp">
      <div style={{ marginBottom:36 }}>
        <div style={{ fontSize:12, color:'var(--p-light)', fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:10 }}>Step 2 of 4</div>
        <h1 style={{ fontFamily:'var(--fd)', fontSize:'clamp(28px,4.5vw,42px)', fontWeight:900, lineHeight:1.1, marginBottom:12,
          background:'linear-gradient(135deg,#f0eeff 20%,#60a5fa)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          Set your Landing Page
        </h1>
        <p style={{ color:'var(--tx2)', fontSize:15, maxWidth:520 }}>
          The 5-agent pipeline will scrape, analyze, gap-check, optimize, and rewrite it to match your ad.
        </p>
      </div>

      {/* Ad confirmed */}
      <Card style={{ display:'flex', gap:14, alignItems:'center', marginBottom:24, padding:'13px 18px' }}>
        <div style={{ width:46, height:46, borderRadius:10, background:'rgba(124,58,237,.1)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {thumb ? <img src={thumb} style={{ width:46, height:46, objectFit:'cover' }} alt="" onError={e=>e.target.style.display='none'} /> : <span style={{ fontSize:20, color:'var(--p)' }}>◈</span>}
        </div>
        <div style={{ overflow:'hidden' }}>
          <div style={{ fontSize:11, color:'var(--tx3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:3 }}>✓ Ad Creative Ready</div>
          <div style={{ fontSize:13, color:'var(--p-light)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{lbl.slice(0,64)}</div>
        </div>
      </Card>

      <Lbl>Landing Page URL</Lbl>
      <Input type="url" value={pageUrl} onChange={setPageUrl} placeholder="https://yoursite.com/landing-page" />

      <div style={{ marginTop:10, padding:'10px 14px', background:'rgba(59,130,246,.05)', border:'1px solid rgba(59,130,246,.15)', borderRadius:8, fontSize:13, color:'#93c5fd', lineHeight:1.6 }}>
        ℹ The backend scrapes the real page HTML — your layout and styles are 100% preserved. Only text nodes are changed.
      </div>

      {error && (
        <div style={{ marginTop:10, padding:'11px 14px', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:8, color:'#f87171', fontSize:13 }}>
          ✕ {error}
        </div>
      )}

      {/* Pipeline preview */}
      <Card style={{ marginTop:20 }}>
        <div style={{ fontSize:11, color:'var(--tx3)', fontWeight:600, letterSpacing:'.07em', textTransform:'uppercase', marginBottom:14 }}>5-Agent Pipeline</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {AGENTS.map(([icon, name, desc])=>(
            <div key={name} style={{ display:'flex', gap:12, alignItems:'center' }}>
              <div style={{ width:28, height:28, borderRadius:7, background:'rgba(124,58,237,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'var(--p-light)', flexShrink:0 }}>{icon}</div>
              <div>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--tx)' }}>{name}</span>
                <span style={{ fontSize:12, color:'var(--tx3)', marginLeft:8 }}>— {desc}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ marginTop:32, display:'flex', justifyContent:'space-between' }}>
        <Btn v="ghost" onClick={onBack}>← Back</Btn>
        <Btn disabled={!canRun||loading} onClick={onRun}>
          {loading ? <><Spin size={15} /> Running pipeline…</> : '✦ Run 5-Agent Pipeline'}
        </Btn>
      </div>
    </div>
  )
}