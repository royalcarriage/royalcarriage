import dynamic from "next/dynamic";

const AdminApp = dynamic(() => import("../../react/AdminApp"), { ssr: false });

export default function RoiPage() {
  return <AdminApp activePage="roi" />;
}
