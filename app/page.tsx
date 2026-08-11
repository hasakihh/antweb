import { LoginDialog } from "@/components/auth/login-dialog";
import { AntTrendChart } from "@/components/monitoring/ant-trend-chart";
import { DeviceBlueprint } from "@/components/monitoring/device-blueprint";
import { TrackField } from "@/components/monitoring/track-field";

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
            <small>A LITTLE FIRE ANT INTELLIGENCE</small>
          </span>
        </div>

        <div className="system-state">
          <span aria-hidden="true" />
          监测网络在线
        </div>
      </header>

      <section className="monitor-content" aria-labelledby="page-title">
        <DeviceBlueprint />

        <div className="entry-point">
          <p className="entry-kicker">BIOSECURITY / SECURE ACCESS</p>
          <h1 id="page-title">
            <span>小火蚁</span>
            <span>智能监测系统</span>
          </h1>
          <LoginDialog />
        </div>

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
