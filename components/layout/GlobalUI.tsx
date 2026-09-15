"use client";

import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { BackToTop } from "@/components/ui/BackToTop";
import { BambooSprout } from "@/components/ui/BambooSprout";
import { FarewellTitle } from "./FarewellTitle";

export function GlobalUI() {
  return (
    <>
      <FarewellTitle />
      <ScrollProgress />
      <BackToTop />
      <BambooSprout />
    </>
  );
}
