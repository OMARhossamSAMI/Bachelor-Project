// app/level3/page.tsx

import { Suspense } from "react";
import Level3Client from "./Level3Client";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading level 3…</div>}>
      <Level3Client />
    </Suspense>
  );
}
