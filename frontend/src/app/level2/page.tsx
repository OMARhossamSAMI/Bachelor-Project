// app/level2/page.tsx

import { Suspense } from "react";
import Level2Client from "./Level2Client";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading level 2…</div>}>
      <Level2Client />
    </Suspense>
  );
}
