import { LoginForm } from "./login-form";

function SignalField() {
  return (
    <div className="signal-field" aria-hidden="true">
      <svg
        className="signal-canvas"
        viewBox="0 0 1600 760"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="signal-blur" x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="node-blur" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        <g className="signal-grid">
          <path d="M0 354H1600" />
          <path d="M0 430H1600" />
          <path d="M310 180V590" />
          <path d="M520 180V590" />
          <path d="M800 180V590" />
          <path d="M1080 180V590" />
          <path d="M1290 180V590" />
        </g>

        <path
          className="signal-haze"
          filter="url(#signal-blur)"
          d="M-120 494 C 150 478, 320 318, 558 360 S 890 432, 1114 360 S 1422 340, 1720 378"
        />
        <path
          className="signal-track signal-track-secondary"
          d="M-120 512 C 150 490, 318 340, 558 380 S 890 450, 1114 378 S 1422 354, 1720 394"
        />
        <path
          className="signal-track signal-track-primary"
          d="M-120 494 C 150 478, 320 318, 558 360 S 890 432, 1114 360 S 1422 340, 1720 378"
        />
        <path
          className="signal-trace"
          d="M-100 466 C 176 454, 328 296, 574 342 S 900 407, 1122 338 S 1410 321, 1700 356"
        />

        <g className="signal-node node-one">
          <circle className="node-glow" filter="url(#node-blur)" cx="558" cy="360" r="12" />
          <circle className="node-ring" cx="558" cy="360" r="11" />
          <circle className="node-core" cx="558" cy="360" r="3" />
        </g>
        <g className="signal-node node-two">
          <circle className="node-glow" filter="url(#node-blur)" cx="1114" cy="360" r="12" />
          <circle className="node-ring" cx="1114" cy="360" r="11" />
          <circle className="node-core" cx="1114" cy="360" r="3" />
        </g>
      </svg>
    </div>
  );
}

export default function Home() {
  return (
    <main className="login-page">
      <SignalField />

      <header className="site-header">
        <div className="brand-lockup" aria-label="小火蚁智能监测平台">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span className="brand-copy">
            <strong>小火蚁监测</strong>
            <small>FIRE ANT INTELLIGENCE</small>
          </span>
        </div>

        <div className="access-meta" aria-hidden="true">
          <span>REMOTE MONITORING</span>
          <span>SECURE ACCESS / 01</span>
        </div>
      </header>

      <section className="login-stage" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="hero-kicker">
            <span />
            入侵生物智能监测系统
          </p>
          <h1 id="page-title">小火蚁智能监测</h1>
          <p className="hero-summary">让每一个诱捕点持续可见。</p>
        </div>

        <LoginForm />
      </section>

      <footer className="site-footer">
        <span>MONITOR · ANALYZE · RESPOND</span>
        <span>ANT-VIGIL / ACCESS PORTAL</span>
      </footer>
    </main>
  );
}
