import { Suspense } from "react";
import FormClient from "./FormClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading form…</div>}>
      <FormClient />
    </Suspense>
  );
}
