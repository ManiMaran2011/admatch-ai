import React from 'react'

export function Btn({ children, v='primary', disabled, onClick, style }) {
  const base = {
    display:'inline-flex', alignItems:'center', gap:8,
    fontFamily:'var(--fb)', fontWeight:600, fontSize:15,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border:'none', borderRadius:'var(--r)', transition:'all .2s',
    opacity: disabled ? .36 : 1,
  }
  const vs = {
    primary:{ background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'#fff', padding:'13px 28px', boxShadow: disabled?'none':'0 4px 24px rgba(124,58,237,.35)' },
    ghost:  { background:'rgba(255,255,255,.05)', color:'var(--tx2)', border:'1px solid var(--border)', padding:'11px 20px' },
    danger: { background:'rgba(239,68,68,.1)', color:'#f87171', border:'1px solid rgba(239,68,68,.25)', padding:'11px 20px' },
  }
  return (
    <button disabled={disabled} onClick={disabled?undefined:onClick}
      style={{...base,...vs[v],...style}}
      onMouseEnter={e=>{ if(!disabled)e.currentTarget.style.filter='brightness(1.13)' }}
      onMouseLeave={e=>{ e.currentTarget.style.filter='none' }}>
      {children}
    </button>
  )
}

export function Input({ value, onChange, placeholder, type='text', style }) {
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={e=>onChange(e.target.value)}
      style={{ width:'100%', background:'rgba(255,255,255,.04)', border:'1px solid var(--border)',
        borderRadius:'var(--r)', padding:'12px 16px', color:'var(--tx)', fontSize:15,
        outline:'none', fontFamily:'var(--fb)', transition:'border-color .2s', ...style }}
      onFocus={e=>e.target.style.borderColor='var(--p)'}
      onBlur={e =>e.target.style.borderColor='var(--border)'} />
  )
}

export function Card({ children, style, glow }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)',
      borderRadius:'var(--r-lg)', padding:'20px 24px',
      ...(glow?{boxShadow:'0 0 40px rgba(124,58,237,.12)'}:{}), ...style }}>
      {children}
    </div>
  )
}

export function Badge({ children, color='purple' }) {
  const c = {
    purple:['rgba(124,58,237,.14)','rgba(124,58,237,.3)','#c4b5fd'],
    green: ['rgba(16,185,129,.12)','rgba(16,185,129,.3)','#34d399'],
    blue:  ['rgba(59,130,246,.12)','rgba(59,130,246,.3)','#93c5fd'],
    amber: ['rgba(245,158,11,.12)','rgba(245,158,11,.3)','#fbbf24'],
    red:   ['rgba(239,68,68,.12)', 'rgba(239,68,68,.3)', '#fca5a5'],
  }[color]||['rgba(124,58,237,.14)','rgba(124,58,237,.3)','#c4b5fd']
  return <span style={{ background:c[0], border:`1px solid ${c[1]}`, color:c[2], borderRadius:20, padding:'3px 11px', fontSize:12, fontWeight:500 }}>{children}</span>
}

export function Lbl({ children }) {
  return <div style={{ fontSize:11, fontWeight:600, color:'var(--tx3)', letterSpacing:'.09em', textTransform:'uppercase', marginBottom:8 }}>{children}</div>
}

export function Spin({ size=18, color='#a78bfa' }) {
  return <div style={{ width:size, height:size, flexShrink:0, border:`2px solid rgba(167,139,250,.2)`, borderTop:`2px solid ${color}`, borderRadius:'50%', animation:'spin .75s linear infinite' }} />
}

export function PBar({ value, style }) {
  return (
    <div style={{ width:'100%', height:4, background:'rgba(255,255,255,.06)', borderRadius:2, overflow:'hidden', ...style }}>
      <div style={{ height:'100%', width:`${value}%`, background:'linear-gradient(90deg,#7c3aed,#818cf8)', borderRadius:2, transition:'width .6s ease' }} />
    </div>
  )
}

export function Steps({ steps, cur }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:44 }}>
      {steps.map((s,i)=>{
        const done=cur>i, active=cur===i
        return (
          <React.Fragment key={s.id}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:11, fontWeight:700, transition:'all .35s',
                background: done?'#7c3aed':active?'rgba(124,58,237,.18)':'rgba(255,255,255,.04)',
                border:`1.5px solid ${done?'#7c3aed':active?'#7c3aed':'rgba(255,255,255,.08)'}`,
                color: done?'#fff':active?'#a78bfa':'var(--tx3)' }}>
                {done?'✓':i+1}
              </div>
              <span style={{ fontSize:12, fontWeight:active?600:400, color:cur>=i?'#a78bfa':'var(--tx3)', whiteSpace:'nowrap' }}>{s.label}</span>
            </div>
            {i<steps.length-1 && <div style={{ flex:1, height:1, minWidth:12, background:cur>i?'#7c3aed':'var(--border)', transition:'background .5s' }} />}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export function Ring({ score }) {
  const pct=Math.round(score*100)
  const col=pct>=80?'#10b981':pct>=60?'#f59e0b':'#ef4444'
  const r=22, c=2*Math.PI*r
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <svg width={54} height={54} viewBox="0 0 54 54">
        <circle cx={27} cy={27} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={4}/>
        <circle cx={27} cy={27} r={r} fill="none" stroke={col} strokeWidth={4}
          strokeDasharray={`${(pct/100)*c} ${c}`} strokeLinecap="round"
          transform="rotate(-90 27 27)" style={{transition:'stroke-dasharray 1s ease'}}/>
        <text x={27} y={32} textAnchor="middle" fontSize={13} fontWeight={700} fill={col}>{pct}%</text>
      </svg>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:col }}>{pct>=80?'High Match':pct>=60?'Good Match':'Partial Match'}</div>
        <div style={{ fontSize:11, color:'var(--tx3)' }}>Confidence score</div>
      </div>
    </div>
  )
}

export function InfoRow({ label, value, icon }) {
  return (
    <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'11px 14px' }}>
      <div style={{ fontSize:10, color:'var(--tx3)', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4 }}>
        {icon&&<span style={{marginRight:5}}>{icon}</span>}{label}
      </div>
      <div style={{ fontSize:13, color:'var(--tx)', lineHeight:1.5 }}>{value||'—'}</div>
    </div>
  )
}