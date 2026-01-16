import dynamic from "next/dynamic";

const AdminApp = dynamic(() => import("../../react/AdminApp"), { ssr: false });

export default function PublishPage() {
  return <AdminApp activePage="seo-publish" />;
}
