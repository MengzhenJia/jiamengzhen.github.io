import type { AppProps } from "next/app";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="main-content">
        <Component {...pageProps} />
      </main>
      <SiteFooter />
    </div>
  );
}
