import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";
import animationAsset from "@/assets/greentickmove.json.asset.json";

export function SuccessAnimation() {
  const container = useRef<HTMLDivElement>(null);

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
    });
    return () => {
      disposed = true;
      animation?.destroy();
    };
  }, []);

  return (
    <div className="relative mx-auto h-[74px] w-[74px]" role="img" aria-label="Payment successful">
      <div ref={container} className="absolute left-1/2 top-1/2 h-[134px] w-[134px] -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}