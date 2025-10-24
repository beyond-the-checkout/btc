import AdminLinksClient from "app/app.chko.sh/(dashboard)/[slug]/links/page-client";
import { Suspense } from "react";

export default function AdminLinks() {
  return (
    <Suspense>
      <AdminLinksClient />
    </Suspense>
  );
}
