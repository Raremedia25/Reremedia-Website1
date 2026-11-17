"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { DemoProps } from "./registry";

function Loading() {
  return (
    <div className="grid min-h-[560px] place-items-center rounded-2xl border border-ink-200 bg-white text-sm text-ink-500" role="status">
      Loading the demo…
    </div>
  );
}

// Each demo is its own chunk, so a visitor only downloads the one they open.
const COMPONENTS: Record<string, ComponentType<DemoProps>> = {
  pos: dynamic(() => import("./PosDemo"), { loading: Loading }),
  ikimina: dynamic(() => import("./IkiminaDemo"), { loading: Loading }),
  bistro: dynamic(() => import("./BistroDemo"), { loading: Loading }),
  certificates: dynamic(() => import("./CertificateDemo"), { loading: Loading }),
  transport: dynamic(() => import("./TransportDemo"), { loading: Loading }),
  exam: dynamic(() => import("./ExamDemo"), { loading: Loading }),
  audit: dynamic(() => import("./AuditDemo"), { loading: Loading }),
};

export function DemoRunner({ demoKey, ...props }: DemoProps & { demoKey: string }) {
  const Demo = COMPONENTS[demoKey];
  return Demo ? <Demo {...props} /> : null;
}
