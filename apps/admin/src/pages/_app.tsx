import type { AppProps } from "next/app";
import "../styles/global.css";
import { AuthProvider } from "../state/AuthProvider";
import { ToastProvider } from "../components/ui/Toast";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ToastProvider>
  );
}
