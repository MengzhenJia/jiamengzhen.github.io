import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container">
      <section className="hero">
        <h1>页面不存在 / Not Found</h1>
        <p>这个页面不存在或已被移动。</p>
        <Link className="nav-link" href="/">
          返回首页 / Back Home
        </Link>
      </section>
    </div>
  );
}
