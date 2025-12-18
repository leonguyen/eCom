// ===== Shop Application with Tab UI - Pure Vanilla JS =====

class ShopApp {
  constructor(containerId) {
    this.containerId = containerId;
    this.products = [];
    this.categories = [];
  }

  async init() {
    await this.loadData();
    this.render();
    this.initTabController();
    this.initEventHandlers();
  }

  async loadData() {
    try {
      const response = await fetch('data.json');
      const data = await response.json();
      
      // Handle both formats: { products: [...] } or { categories: [...] }
      if (data.products) {
        this.products = data.products;
        // Auto-generate a single "All Products" category
        this.categories = [{
          id: 'all',
          name: 'Tất cả sản phẩm',
          icon: 'fas fa-store',
          products: this.products
        }];
      } else if (data.categories) {
        this.categories = data.categories;
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      this.categories = [];
    }
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Build Header
    const header = new Div({ class: 'shop-header' })
      .addChild(new H1().addText('Cửa Hàng Sản Phẩm'));

    // Build Tab Container with categories
    const tabContainer = new TabContainer('product-tabs');
    
    this.categories.forEach((category, index) => {
      const isActive = index === 0;
      const pane = tabContainer.addTab(
        category.id,
        category.name,
        category.icon,
        isActive
      );
      // Add product grid to each tab pane
      pane.addChild(new ProductGrid(category.products));
    });

    // Build App
    const app = new Div({ class: 'container' })
      .addChild(header)
      .addChild(tabContainer);

    container.innerHTML = '';
    container.appendChild(app.toHtmlElement());
  }

  initTabController() {
    new TabController('product-tabs');
  }

  initEventHandlers() {
    // Toast on external link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('.btn-add-cart');
      if (link && link.tagName === 'A') {
        const card = link.closest('.product-card');
        const productName = card?.querySelector('.product-name')?.textContent;
        if (productName) {
          this.showToast(`Đang mở "${productName}"...`);
        }
      }
    });
  }

  showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = new Div({ class: 'toast' })
      .addText(message)
      .toHtmlElement();

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new ShopApp('app');
  app.init();
});
