import Link from "next/link";
import { site } from "@/data/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand">
          <Link href="/" className="brand-title">
            {site.name}
          </Link>
          <span className="brand-subtitle">
            {site.titleZh} / {site.titleEn}
          </span>
        </div>
        <nav className="nav">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.labelZh} / {item.labelEn}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
