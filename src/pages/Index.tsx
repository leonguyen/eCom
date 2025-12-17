import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Basic SEO (no extra deps)
    document.title = "Modern Shop – Premium Products";

    const ensureMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    ensureMeta("description", "Modern Shop tab UI with premium products across categories.");

    const canonicalHref = `${window.location.origin}/`;
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
        <h1 className="text-2xl font-semibold tracking-tight">Modern Shop</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tab UI demo (Vanilla JS) embedded inside the React home page.
        </p>
        <a
          href="/vanilla-shop/index.html"
          className="mt-3 inline-flex text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/90"
        >
          Open full page
        </a>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <iframe
            title="Modern Shop tab UI"
            src="/vanilla-shop/index.html"
            loading="lazy"
            className="h-[78vh] w-full"
          />
        </div>
      </section>
    </main>
  );
};

export default Index;

