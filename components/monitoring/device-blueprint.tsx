import Image from "next/image";

export function DeviceBlueprint() {
  return (
    <figure className="device-scene">
      <div className="blueprint-frame">
        <Image
          className="blueprint-image"
          src="/assets/monitoring-device-blueprint-cutout.png"
          alt="太阳能小火蚁智能监测装置蓝图"
          fill
          sizes="(max-width: 520px) 46vw, (max-width: 920px) 44vw, (max-width: 1180px) 38vw, 41vw"
          preload
        />
        <span className="blueprint-focus" aria-hidden="true" />
      </div>
      <figcaption>DEVICE BLUEPRINT / REV.A</figcaption>
    </figure>
  );
}
