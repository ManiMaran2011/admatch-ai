import { PBar } from './ui.jsx'

const AGENTS = [
  { icon:'◈', name:'Ad Analyzer',   desc:'GPT-4o Vision' },
  { icon:'⬡', name:'Page Analyzer', desc:'DOM scraper'   },
  { icon:'◉', name:'Gap Detector',  desc:'LLM analysis'  },
  { icon:'✦', name:'CRO Optimizer', desc:'Strategy gen'  },
  { icon:'→', name:'Rewriter',      desc:'HTML patcher'  },
]

export default function StepLoading({ pct, msg }) {
  const active = Math.min(Math.floor((pct/100)*AGENTS.length), AGENTS.length-1)

  return (
    <div className="fadeIn" style={{ textAlign:'center', padding:'60px 0' }}>
      {/* Spinner */}
      <div style={{ position:'relative', width:90, height:90, margin:'0 auto 32px' }}>
        <div style={{ position:'absolute', inset:0, border:'3px solid rgba(124,58,237,.1)', borderTop:'3px solid #7c3aed', borderRadius:'50%', animation:'spin 1s linear infinite', boxShadow:'0 0 32px rgba(124,58,237,.2)' }} />
        <div style={{ position:'absolute', inset:8, border:'3px solid rgba(124,58,237,.06)', borderBottom:'3px solid rgba(124,58,237,.4)', borderRadius:'50%', animation:'spin 1.5s linear infinite reverse' }} />
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, color:'var(--p-light)' }}>◈</div>
      </div>

      <h2 style={{ fontFamily:'var(--fd)', fontSize:26, fontWeight:800, marginBottom:10 }}>Running AI Pipeline…</h2>
      <p className="pulse" style={{ fontSize:14, color:'var(--tx2)', marginBottom:36, minHeight:22 }}>{msg}</p>

      {/* Progress */}
      <div style={{ maxWidth:460, margin:'0 auto 44px' }}>
        <PBar value={pct} />
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
          <span style={{ fontSize:11, color:'var(--tx3)' }}>Processing</span>
          <span style={{ fontSize:11, color:'var(--p-light)', fontWeight:600 }}>{pct}%</span>
        </div>
      </div>

      {/* Agents grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, maxWidth:600, margin:'0 auto' }}>
        {AGENTS.map((a,i)=>{
          const done=i<active, on=i===active
          return (
            <div key={a.name} style={{
              background:done?'rgba(16,185,129,.07)':on?'rgba(124,58,237,.1)':'rgba(255,255,255,.02)',
              border:`1px solid ${done?'rgba(16,185,129,.22)':on?'rgba(124,58,237,.3)':'var(--border)'}`,
              borderRadius:12, padding:'14px 8px', transition:'all .4s',
            }}>
              <div style={{ fontSize:20, marginBottom:7, color:done?'#10b981':on?'#a78bfa':'var(--tx3)' }}>
                {done?'✓':a.icon}
              </div>
              <div style={{ fontSize:11, fontWeight:600, color:done?'#10b981':on?'var(--tx)':'var(--tx3)', marginBottom:2 }}>{a.name}</div>
              <div style={{ fontSize:10, color:'var(--tx3)' }}>{a.desc}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}