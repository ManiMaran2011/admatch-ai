import { useRef } from 'react'
import { Btn, Input, Lbl, Card } from './ui.jsx'

export default function StepAd({ adMode, setAdMode, adUrl, setAdUrl, adPreview, onFile, onNext, canNext }) {
  const ref = useRef(null)
  return (
    <div className="fadeUp">
      {/* Heading */}
      <div style={{ marginBottom:36 }}>
        <div style={{ fontSize:12, color:'var(--p-light)', fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:10 }}>
          Step 1 of 4
        </div>
        <h1 style={{ fontFamily:'var(--fd)', fontSize:'clamp(28px,4.5vw,42px)', fontWeight:900, lineHeight:1.1, marginBottom:12,
          background:'linear-gradient(135deg,#f0eeff 20%,#a78bfa 70%,#60a5fa)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          Input your Ad Creative
        </h1>
        <p style={{ color:'var(--tx2)', fontSize:15, maxWidth:500 }}>
          Agent 1 uses GPT-4o Vision to extract your ad's value proposition, audience, tone, and CTA intent.
        </p>
      </div>

      {/* Mode toggle */}
      <div style={{ display:'flex', gap:8, marginBottom:24 }}>
        {[['url','🔗 Image URL'],['upload','⬆ Upload File']].map(([m,lbl])=>(
          <button key={m} onClick={()=>setAdMode(m)} style={{
            fontFamily:'var(--fb)', fontSize:13, cursor:'pointer', padding:'9px 20px',
            borderRadius:'var(--r)', transition:'all .2s',
            background:adMode===m?'rgba(124,58,237,.16)':'rgba(255,255,255,.03)',
            color:adMode===m?'#a78bfa':'var(--tx3)',
            border:`1px solid ${adMode===m?'rgba(124,58,237,.4)':'var(--border)'}`,
          }}>{lbl}</button>
        ))}
      </div>

      {adMode==='url' ? (
        <div>
          <Lbl>Ad Image URL</Lbl>
          <Input type="url" value={adUrl} onChange={setAdUrl} placeholder="https://example.com/ad-creative.jpg" />
          {adUrl && (
            <div style={{ marginTop:14, borderRadius:14, overflow:'hidden', border:'1px solid var(--border)', maxHeight:300, display:'flex', justifyContent:'center', background:'rgba(255,255,255,.02)' }}>
              <img src={adUrl} alt="preview" style={{ maxHeight:300, maxWidth:'100%', objectFit:'contain' }} onError={e=>e.target.style.display='none'} />
            </div>
          )}
        </div>
      ) : (
        <>
          <input ref={ref} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>onFile(e.target.files?.[0])} />
          <div onClick={()=>ref.current?.click()}
            onDrop={e=>{e.preventDefault();onFile(e.dataTransfer.files?.[0])}}
            onDragOver={e=>e.preventDefault()}
            style={{
              border:`2px dashed ${adPreview?'rgba(124,58,237,.5)':'rgba(124,58,237,.22)'}`,
              borderRadius:18, padding:'52px 24px', textAlign:'center', cursor:'pointer',
              background:adPreview?'rgba(124,58,237,.05)':'rgba(255,255,255,.02)', transition:'all .2s',
            }}>
            {adPreview
              ? <img src={adPreview} alt="preview" style={{ maxHeight:240, maxWidth:'100%', borderRadius:10, objectFit:'contain' }} />
              : <>
                  <div style={{ fontSize:42, marginBottom:12, color:'var(--p)', className:'float' }}>◈</div>
                  <div style={{ color:'var(--p-light)', fontWeight:600, marginBottom:6 }}>Drop your ad creative here</div>
                  <div style={{ color:'var(--tx3)', fontSize:13 }}>or click to browse · PNG, JPG, WebP, GIF</div>
                </>
            }
          </div>
        </>
      )}

      {/* Agent info card */}
      <Card style={{ marginTop:20, padding:'14px 18px', display:'flex', gap:14, alignItems:'flex-start' }}>
        <div style={{ width:32, height:32, borderRadius:8, background:'rgba(124,58,237,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>◈</div>
        <div style={{ fontSize:13, color:'var(--tx2)', lineHeight:1.65 }}>
          <strong style={{ color:'var(--tx)', display:'block', marginBottom:3 }}>Agent 1 — Ad Analyzer</strong>
          Extracts: headline, value prop, offer, audience, intent, tone, CTA, emotional hook, urgency signals, and keywords.
        </div>
      </Card>

      <div style={{ marginTop:32, display:'flex', justifyContent:'flex-end' }}>
        <Btn disabled={!canNext} onClick={onNext}>Continue → Set Landing Page</Btn>
      </div>
    </div>
  )
}