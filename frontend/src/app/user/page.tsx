// app/user/page.tsx

import { Suspense } from "react";
import UserClient from "./UserClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading dashboard…</div>}>
      <UserClient />
    </Suspense>
  );
}
