import dynamic from "next/dynamic";

const AdminApp = dynamic(() => import("../react/AdminApp"), { ssr: false });

export default function UsersPage() {
  return <AdminApp activePage="users" />;
}
