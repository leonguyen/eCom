// ===== Shop Application - Pure Vanilla JS =====

// Shop App using Html.js Composite Pattern
class ShopApp {
  constructor(containerId) {
    this.containerId = containerId;
    this.data = null;
    this.tabContainer = null;
  }

  async init() {
    await this.loadData();
    this.render();
    this.initController();
    this.initCartHandlers();
  }

  async loadData() {
    try {
      const response = await fetch('products.json');
      this.data = await response.json();
    } catch (error) {
      console.error('Failed to load products:', error);
      this.data = { categories: [] };
    }
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Build Header
    const header = new Div({ class: 'shop-header' })
      .addChild(new H1().addText('Modern Shop'))
      .addChild(new P().addText('Discover our curated collection of premium products'));

    // Build Tab Container
    this.tabContainer = new TabContainer('productTabs');

    // Add tabs for each category
    this.data.categories.forEach((category, index) => {
      const isActive = index === 0;
      const pane = this.tabContainer.addTab(
        category.id,
        category.name,
        category.icon,
        isActive
      );
      
      // Add products to tab pane
      if (category.products.length > 0) {
        pane.addChild(new ProductGrid(category.products));
      } else {
        pane.addChild(this.createEmptyState());
      }
    });

    // Build and mount
    const app = new Div({ class: 'container' })
      .addChild(header)
      .addChild(this.tabContainer);

    container.innerHTML = '';
    container.appendChild(app.toHtmlElement());
  }

  createEmptyState() {
    return new Div({ class: 'empty-state' })
      .addChild(new I({ class: 'fas fa-box-open' }))
      .addChild(new P().addText('No products available in this category'));
  }

  initController() {
    new TabController('productTabs');
  }

  initCartHandlers() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-add-cart:not(.disabled)');
      if (!btn) return;

      const card = btn.closest('.product-card');
      const productId = card?.dataset.productId;
      const productName = card?.querySelector('.product-name')?.textContent;

      if (productName) {
        this.showToast(`${productName} added to cart!`, 'success');
      }
    });
  }

  showToast(message, type = '') {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = new Div({ class: `toast ${type}` })
      .addText(message)
      .toHtmlElement();

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto hide
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
