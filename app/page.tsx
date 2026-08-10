import Image from "next/image";
import { AntTrendChart } from "./ant-trend-chart";
import { LoginForm } from "./login-form";

function AntMarker({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 40"
      role="img"
      aria-label="一只沿轨道朝监测装置爬行的小火蚁"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M23 17 13 9M24 21 10 21M23 25 13 33M39 16 50 8M40 20 54 20M39 24 51 32" />
        <path d="M49 16c6-5 8-9 8-12M49 17c8-1 11-3 13-6" />
      </g>
      <ellipse cx="17" cy="21" rx="8" ry="6" fill="currentColor" />
      <ellipse cx="31" cy="21" rx="6" ry="5" fill="currentColor" />
      <ellipse cx="45" cy="21" rx="8" ry="7" fill="currentColor" />
      <circle cx="49" cy="19" r="1.1" fill="var(--page-black)" />
    </svg>
  );
}

function TrackField() {
  return (
    <div className="track-field" aria-hidden="true">
      <svg className="track-map" viewBox="0 0 1600 900" preserveAspectRatio="none">
        <defs>
          <filter id="track-soften" x="-10%" y="-120%" width="120%" height="340%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <path
          className="track-haze"
          filter="url(#track-soften)"
          d="M-90 704 C 168 704, 265 615, 438 638 S 667 742, 825 691 S 1112 558, 1690 626"
        />
        <path
          className="track-edge track-edge-top"
          d="M-90 686 C 168 686, 265 597, 438 620 S 667 724, 825 673 S 1112 540, 1690 608"
        />
        <path
          className="track-edge"
          d="M-90 722 C 168 722, 265 633, 438 656 S 667 760, 825 709 S 1112 576, 1690 644"
        />
        <path
          className="track-center"
          d="M-90 704 C 168 704, 265 615, 438 638 S 667 742, 825 691 S 1112 558, 1690 626"
        />
      </svg>

      <AntMarker className="route-ant route-ant-one" />
      <AntMarker className="route-ant route-ant-two" />
      <AntMarker className="route-ant route-ant-three" />
      <AntMarker className="route-ant route-ant-four" />
    </div>
  );
}

function DeviceBlueprint() {
  return (
    <figure className="device-scene">
      <div className="blueprint-frame">
        <Image
          className="blueprint-image"
          src="/assets/monitoring-device-blueprint.png"
          alt="太阳能小火蚁智能监测装置蓝图"
          fill
          sizes="(max-width: 760px) 74vw, (max-width: 1180px) 31vw, 36vw"
          preload
        />
        <span className="blueprint-focus" aria-hidden="true" />
      </div>
      <figcaption>
        <span>DEVICE BLUEPRINT / REV.A</span>
        <strong>诱捕装置 03</strong>
      </figcaption>
    </figure>
  );
}

export default function Home() {
  return (
    <main className="monitor-page">
      <TrackField />

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

        <div className="system-state">
          <span aria-hidden="true" />
          监测网络在线
        </div>
      </header>

      <section className="monitor-content" aria-labelledby="page-title">
        <div className="portal-column">
          <div className="hero-copy">
            <p className="hero-kicker">BIOSECURITY / SECURE ACCESS</p>
            <h1 id="page-title">
              <span>小火蚁</span>
              <span>智能监测</span>
            </h1>
            <p className="hero-summary">连接每一个诱捕点，读取现场变化。</p>
          </div>
          <LoginForm />
        </div>

        <DeviceBlueprint />
        <AntTrendChart />
      </section>

      <aside className="field-note" aria-label="装置状态">
        <span>OPTICAL NODE</span>
        <strong>03 / READY</strong>
      </aside>

      <footer className="site-footer">
        <span>MONITOR · ANALYZE · RESPOND</span>
        <span>ANT-VIGIL / ACCESS PORTAL</span>
      </footer>
    </main>
  );
}
