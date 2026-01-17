import dynamic from "next/dynamic";

const AdminApp = dynamic(() => import("../../react/AdminApp"), { ssr: false });

export default function SiteHealthPage() {
  return <AdminApp activePage="site-health" />;
}
