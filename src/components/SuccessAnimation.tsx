import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";
import animationAsset from "@/assets/greentickmove.json.asset.json";

export function SuccessAnimation() {
  const container = useRef<HTMLDivElement>(null);
  const [animationReady, setAnimationReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let animation: AnimationItem | undefined;
    void import("lottie-web").then(({ default: lottie }) => {
      if (disposed || !container.current) return;
      animation = lottie.loadAnimation({
        container: container.current,
        renderer: "canvas",
        loop: true,
        autoplay: true,
        path: animationAsset.url,
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });
      // The JSON is large; only swap away from the static tick once the
      // animation data has actually been fetched, parsed and drawn.
      const onReady = () => {
        if (!disposed) setAnimationReady(true);
      };
      animation.addEventListener("DOMLoaded", onReady);
    });
    return () => {
      disposed = true;
      animation?.destroy();
    };
  }, []);

  return (
    <div className="relative mx-auto h-[74px] w-[74px]" role="img" aria-label="Payment successful">
      {/* Static tick shown instantly while the animation JSON loads */}
      <div
        aria-hidden={animationReady}
        className={`absolute left-1/2 top-1/2 flex h-[134px] w-[134px] -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-opacity duration-300 ${
          animationReady ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <svg className="h-[74px] w-[74px]" viewBox="0 0 74 74" fill="none">
          <circle cx="37" cy="37" r="37" fill="#2D7D4E" />
          <path
            d="M22 38.5L32.5 49L53 27"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div ref={container} className="absolute left-1/2 top-1/2 h-[134px] w-[134px] -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}
