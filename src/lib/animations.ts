"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** 모션 줄이기 설정이 아닐 때만 애니메이션을 실행한다. */
const NO_MOTION_PREF = "(prefers-reduced-motion: no-preference)";

/** scope 안의 [data-reveal] 요소를 아래에서 올라오며 등장시킨다. */
export function useHeroReveal(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!scope.current) return;
    const mm = gsap.matchMedia(scope.current);
    mm.add(NO_MOTION_PREF, () => {
      gsap.from("[data-reveal]", {
        yPercent: 110,
        opacity: 0,
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.12,
      });
    });
    return () => mm.revert();
  }, [scope]);
}

/** scope가 화면에 들어오면 [data-scroll-item] 요소를 순서대로 등장시킨다. */
export function useScrollReveal(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!scope.current) return;
    const mm = gsap.matchMedia(scope.current);
    mm.add(NO_MOTION_PREF, () => {
      gsap.from("[data-scroll-item]", {
        opacity: 0,
        y: 32,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: scope.current, start: "top 80%" },
      });
    });
    return () => mm.revert();
  }, [scope]);
}
