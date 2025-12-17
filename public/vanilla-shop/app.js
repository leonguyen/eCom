// ===== Shop Application - Pure Vanilla JS =====

class ShopApp {
  constructor(containerId) {
    this.containerId = containerId;
    this.products = [];
    this.filteredProducts = [];
    this.currentPage = 1;
    this.itemsPerPage = 4;
    this.searchTerm = '';
  }

  async init() {
    await this.loadData();
    this.render();
    this.initEventHandlers();
  }

  async loadData() {
    try {
      const response = await fetch('products.json');
      const data = await response.json();
      // Flatten all products from categories
      this.products = data.categories.flatMap(cat => 
        cat.products.map(p => ({ ...p, category: cat.name }))
      );
      this.filteredProducts = [...this.products];
    } catch (error) {
      console.error('Failed to load products:', error);
      this.products = [];
      this.filteredProducts = [];
    }
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Build Header
    const header = new Div({ class: 'shop-header' })
      .addChild(new H1().addText('Cửa Hàng Sản Phẩm Việt Nam'));

    // Build Controls
    const controls = new Div({ class: 'controls' })
      .addChild(new Input({
        type: 'text',
        class: 'search-input',
        id: 'search',
        placeholder: 'Tìm kiếm sản phẩm...'
      }))
      .addChild(this.createItemsPerPageSelect());

    // Build Product Area
    const productArea = new Div({ id: 'product-area' });

    // Build App
    const app = new Div({ class: 'container' })
      .addChild(header)
      .addChild(controls)
      .addChild(productArea);

    container.innerHTML = '';
    container.appendChild(app.toHtmlElement());

    this.renderProducts();
  }

  createItemsPerPageSelect() {
    const select = new Select({ class: 'items-select', id: 'itemsPerPage' });
    [2, 4, 6, 8].forEach(num => {
      const attrs = { value: String(num) };
      if (num === this.itemsPerPage) {
        attrs.selected = true;
      }
      const option = new Option(attrs).addText(`${num} / trang`);
      select.addChild(option);
    });
    return select;
  }

  renderProducts() {
    const productArea = document.getElementById('product-area');
    if (!productArea) return;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageProducts = this.filteredProducts.slice(startIndex, endIndex);

    if (this.filteredProducts.length === 0) {
      productArea.innerHTML = '';
      const empty = new Div({ class: 'empty-state' })
        .addChild(new P().addText('Không tìm thấy sản phẩm nào.'))
        .toHtmlElement();
      productArea.appendChild(empty);
      return;
    }

    // Build product grid
    const grid = new Div({ class: 'product-grid' });
    pageProducts.forEach(product => {
      grid.addChild(new ProductCard(product));
    });

    // Build pagination
    const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    const pagination = this.createPagination(totalPages);

    productArea.innerHTML = '';
    productArea.appendChild(grid.toHtmlElement());
    if (totalPages > 1) {
      productArea.appendChild(pagination.toHtmlElement());
    }
  }

  createPagination(totalPages) {
    const pagination = new Div({ class: 'pagination' });

    // Previous button
    const prevBtn = new Button({
      class: `page-btn ${this.currentPage === 1 ? 'disabled' : ''}`,
      'data-page': 'prev'
    }).addText('‹');
    pagination.addChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = new Button({
        class: `page-btn ${i === this.currentPage ? 'active' : ''}`,
        'data-page': String(i)
      }).addText(String(i));
      pagination.addChild(pageBtn);
    }

    // Next button
    const nextBtn = new Button({
      class: `page-btn ${this.currentPage === totalPages ? 'disabled' : ''}`,
      'data-page': 'next'
    }).addText('›');
    pagination.addChild(nextBtn);

    return pagination;
  }

  initEventHandlers() {
    // Search
    const searchInput = document.getElementById('search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.filterProducts();
      });
    }

    // Items per page
    const itemsSelect = document.getElementById('itemsPerPage');
    if (itemsSelect) {
      itemsSelect.addEventListener('change', (e) => {
        this.itemsPerPage = parseInt(e.target.value);
        this.currentPage = 1;
        this.renderProducts();
      });
    }

    // Pagination & Add to cart
    document.addEventListener('click', (e) => {
      // Pagination
      const pageBtn = e.target.closest('.page-btn:not(.disabled)');
      if (pageBtn) {
        const page = pageBtn.dataset.page;
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        
        if (page === 'prev') {
          this.currentPage = Math.max(1, this.currentPage - 1);
        } else if (page === 'next') {
          this.currentPage = Math.min(totalPages, this.currentPage + 1);
        } else {
          this.currentPage = parseInt(page);
        }
        this.renderProducts();
        return;
      }

      // Add to cart
      const cartBtn = e.target.closest('.btn-add-cart:not(.disabled)');
      if (cartBtn) {
        const card = cartBtn.closest('.product-card');
        const productName = card?.querySelector('.product-name')?.textContent;
        if (productName) {
          this.showToast(`Đã thêm "${productName}" vào giỏ hàng!`);
        }
      }
    });
  }

  filterProducts() {
    if (!this.searchTerm) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(p =>
        p.name.toLowerCase().includes(this.searchTerm) ||
        p.description.toLowerCase().includes(this.searchTerm)
      );
    }
    this.currentPage = 1;
    this.renderProducts();
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
