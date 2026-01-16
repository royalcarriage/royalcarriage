import dynamic from "next/dynamic";

const AdminApp = dynamic(() => import("../../react/AdminApp"), { ssr: false });

export default function AdsPage() {
  return <AdminApp activePage="imports-ads" />;
}
