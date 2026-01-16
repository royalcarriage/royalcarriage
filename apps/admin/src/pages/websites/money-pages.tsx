import dynamic from "next/dynamic";

const AdminApp = dynamic(() => import("../../react/AdminApp"), { ssr: false });

export default function MoneyPages() {
  return <AdminApp activePage="money-pages" />;
}
