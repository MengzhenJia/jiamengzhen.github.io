import { site } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>
          {site.name} · {site.titleZh} / {site.titleEn}
        </p>
        <p>Powered by Notion + GitHub Pages.</p>
      </div>
    </footer>
  );
}
