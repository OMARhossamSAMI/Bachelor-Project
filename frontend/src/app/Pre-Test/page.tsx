// app/pre-test/page.tsx

import { Suspense } from "react";
import PreTestClient from "./PreTestClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading pre-test…</div>}>
      <PreTestClient />
    </Suspense>
  );
}
