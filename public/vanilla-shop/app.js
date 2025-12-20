// ===== Shop Application with Tab UI + Pagination - Pure Vanilla JS =====

class ShopApp {
  constructor(containerId) {
    this.containerId = containerId;
    this.products = []; // For pagination (data.json)
    this.categories = []; // For tabs (tab.json)

    // All Products controls
    this.searchTerm = '';
    this.itemsPerPage = 4;
    this.filteredProducts = [];

    this.paginationController = null;
  }

  async init() {
    await this.loadData();
    this.render();
    this.initTabController();
    this.initPaginationController();
    this.initControls();
    this.initEventHandlers();
  }

  async loadData() {
    try {
      // Load data.json for pagination
      const dataResponse = await fetch('data.json');
      const dataJson = await dataResponse.json();
      this.products = dataJson.products || [];
      this.filteredProducts = this.products;

      // Load tab.json for tabs
      const tabResponse = await fetch('tab.json');
      const tabJson = await tabResponse.json();
      
      if (tabJson.categories) {
        this.categories = tabJson.categories;
      } else if (tabJson.products) {
        // Fallback: auto-generate a single category
        this.categories = [{
          id: 'all',
          name: 'Tất cả sản phẩm',
          icon: 'fas fa-store',
          products: tabJson.products
        }];
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      this.products = [];
      this.categories = [];
    }
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // ===== Section 1: Main Sale - Tab UI (tab.json) =====
    const tabContainer = new TabContainer('product-tabs');
    
    this.categories.forEach((category, index) => {
      const isActive = index === 0;
      const pane = tabContainer.addTab(
        category.id,
        category.name,
        category.icon,
        isActive
      );
      pane.addChild(new ProductGrid(category.products));
    });

    const tabSection = new Div({ class: 'section tab-section main-section' })
      .addChild(new H2({ class: 'section-title' }).addText('Sản Phẩm Nổi Bật'))
      .addChild(tabContainer);

    // ===== Section 2: All Products - Pagination (data.json) =====
    const controls = new Div({ class: 'controls' })
      .addChild(new Input({
        id: 'search',
        type: 'text',
        class: 'search-input',
        placeholder: 'Tìm kiếm sản phẩm...',
        'aria-label': 'Tìm kiếm sản phẩm'
      }))
      .addChild(
        new Select({
          id: 'itemsPerPage',
          class: 'items-select',
          'aria-label': 'Số sản phẩm mỗi trang'
        })
          .addChild(new Option({ value: '2', selected: this.itemsPerPage === 2 }).addText('2 / trang'))
          .addChild(new Option({ value: '4', selected: this.itemsPerPage === 4 }).addText('4 / trang'))
          .addChild(new Option({ value: '6', selected: this.itemsPerPage === 6 }).addText('6 / trang'))
          .addChild(new Option({ value: '8', selected: this.itemsPerPage === 8 }).addText('8 / trang'))
      );

    const paginatedSection = new Div({ class: 'section paginated-section sub-section' })
      .addChild(new H2({ class: 'section-title secondary' }).addText('Tất Cả Sản Phẩm'))
      .addChild(controls)
      .addChild(new PaginatedProductGrid('products-pagination', this.filteredProducts, 1, this.itemsPerPage));

    // Build App
    const header = new Div({ class: 'shop-header' })
      .addChild(new H1().addText('Cửa Hàng Sản Phẩm'));

    const app = new Div({ class: 'container' })
      .addChild(header)
      .addChild(tabSection)
      .addChild(paginatedSection);

    container.innerHTML = '';
    container.appendChild(app.toHtmlElement());
  }

  initTabController() {
    new TabController('product-tabs');
  }

  initPaginationController() {
    this.paginationController = new PaginationController(
      'products-pagination',
      this.filteredProducts,
      this.itemsPerPage
    );
  }

  initControls() {
    const searchEl = document.getElementById('search');
    const itemsEl = document.getElementById('itemsPerPage');

    if (searchEl) {
      searchEl.addEventListener('input', (e) => {
        this.searchTerm = e.target.value || '';
        this.applyFilters();
      });
    }

    if (itemsEl) {
      itemsEl.addEventListener('change', (e) => {
        const next = parseInt(e.target.value, 10);
        if (!isNaN(next)) {
          this.itemsPerPage = next;
          this.applyFilters();
        }
      });
    }
  }

  applyFilters() {
    const term = (this.searchTerm || '').trim().toLowerCase();
    const source = this.products || [];

    this.filteredProducts = !term
      ? source
      : source.filter((p) => {
          const name = (p.title || p.name || '').toLowerCase();
          return name.includes(term);
        });

    if (this.paginationController) {
      this.paginationController.setData(this.filteredProducts, this.itemsPerPage);
    }
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
