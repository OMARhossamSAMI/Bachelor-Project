import { Suspense } from "react";
import Level1Client from "./Level1Client";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading Level 1…</div>}>
      <Level1Client />
    </Suspense>
  );
}
