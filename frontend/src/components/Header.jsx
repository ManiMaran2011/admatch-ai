export default function Header() {
  return (
    <header style={{
      borderBottom:'1px solid var(--border)', padding:'13px 40px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      position:'sticky', top:0,
      background:'rgba(7,7,13,0.88)', backdropFilter:'blur(16px)',
      WebkitBackdropFilter:'blur(16px)', zIndex:100,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:11 }}>
        <div style={{
          width:36, height:36, borderRadius:10,
          background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:16, color:'#fff', boxShadow:'0 4px 18px rgba(124,58,237,.45)',
        }}>◈</div>
        <div>
          <div style={{ fontFamily:'var(--fd)', fontWeight:800, fontSize:18,
            background:'linear-gradient(90deg,#a78bfa,#60a5fa)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            AdMatch AI
          </div>
          <div style={{ fontSize:11, color:'var(--tx3)', marginTop:1 }}>Agentic Ad → Landing Page Personalization</div>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:20 }}>
        <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer"
          style={{ fontSize:12, color:'var(--tx3)', textDecoration:'none' }}
          onMouseEnter={e=>e.target.style.color='var(--p-light)'}
          onMouseLeave={e=>e.target.style.color='var(--tx3)'}>
          API Docs ↗
        </a>
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--tx3)' }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 6px var(--green)' }} />
          5-Agent Pipeline
        </div>
      </div>
    </header>
  )
}