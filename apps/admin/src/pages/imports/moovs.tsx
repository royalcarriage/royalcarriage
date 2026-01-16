import dynamic from "next/dynamic";

const AdminApp = dynamic(() => import("../../react/AdminApp"), { ssr: false });

export default function MoovsPage() {
  return <AdminApp activePage="imports-moovs" />;
}
