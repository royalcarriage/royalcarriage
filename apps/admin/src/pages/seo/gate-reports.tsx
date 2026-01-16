import dynamic from "next/dynamic";

const AdminApp = dynamic(() => import("../../react/AdminApp"), { ssr: false });

export default function GateReportsPage() {
  return <AdminApp activePage="seo-gate-reports" />;
}
