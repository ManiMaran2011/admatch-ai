import Header      from './components/Header.jsx'
import StepAd      from './components/StepAd.jsx'
import StepUrl     from './components/StepUrl.jsx'
import StepLoading from './components/StepLoading.jsx'
import StepResult  from './components/StepResult.jsx'
import { Steps }   from './components/ui.jsx'
import { usePersonalize } from './hooks/usePersonalize.js'

export default function App() {
  const p = usePersonalize()

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Header />

      {/* Background orbs */}
      <div style={{ position:'fixed', top:'20%', left:'50%', transform:'translate(-50%,-50%)', width:800, height:800, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,.05) 0%, transparent 65%)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:'10%', right:'5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,.04) 0%, transparent 65%)', pointerEvents:'none', zIndex:0 }} />

      <main style={{ maxWidth:880, margin:'0 auto', padding:'48px 24px 80px', position:'relative', zIndex:1 }}>
        {p.step !== 2 && <Steps steps={p.steps} cur={p.step} />}

        {p.step===0 && <StepAd adMode={p.adMode} setAdMode={p.setAdMode} adUrl={p.adUrl} setAdUrl={p.setAdUrl} adPreview={p.adPreview} onFile={p.onFile} onNext={()=>p.go(1)} canNext={p.canGo0} />}

        {p.step===1 && <StepUrl adMode={p.adMode} adUrl={p.adUrl} adPreview={p.adPreview} adFile={p.adFile} pageUrl={p.pageUrl} setPageUrl={p.setPageUrl} error={p.error} loading={p.loading} onBack={()=>p.go(0)} onRun={p.run} canRun={p.canGo1} />}

        {p.step===2 && <StepLoading pct={p.pct} msg={p.msg} />}

        {p.step===3 && p.result && <StepResult result={p.result} tab={p.tab} setTab={p.setTab} onReset={p.reset} />}
      </main>
    </div>
  )
}