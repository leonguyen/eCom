import { useEffect } from "react";

const VanillaShop = () => {
  useEffect(() => {
    document.title = "Cửa Hàng Sản Phẩm – Tab UI";

    const ensureMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    ensureMeta(
      "description",
      "Cửa hàng sản phẩm dạng tab UI (Vanilla JS) hiển thị trong trang riêng."
    );

    const canonicalHref = `${window.location.origin}/vanilla-shop`;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalHref);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">Cửa Hàng Sản Phẩm</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trang /vanilla-shop để tránh lỗi 404 khi mở đường dẫn thư mục.
        </p>
        <a
          href="/vanilla-shop/index.html"
          className="mt-3 inline-flex text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/90"
        >
          Mở file gốc (index.html)
        </a>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <iframe
            title="Cửa hàng sản phẩm (Vanilla JS)"
            src="/vanilla-shop/index.html"
            loading="lazy"
            className="h-[85vh] w-full"
          />
        </div>
      </section>
    </main>
  );
};

export default VanillaShop;
