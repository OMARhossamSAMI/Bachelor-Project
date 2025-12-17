// app/post-test/page.tsx

import { Suspense } from "react";
import PostTestClient from "./PostTestClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading post-test…</div>}>
      <PostTestClient />
    </Suspense>
  );
}
