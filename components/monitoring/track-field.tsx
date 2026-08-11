import Image from "next/image";

const antPositions = ["one", "two", "three", "four"];

export function TrackField() {
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

      {antPositions.map((position) => (
        <span className={`route-ant route-ant-${position}`} key={position}>
          <Image
            src="/assets/fire-ant.png"
            alt=""
            fill
            sizes="90px"
          />
        </span>
      ))}
    </div>
  );
}
