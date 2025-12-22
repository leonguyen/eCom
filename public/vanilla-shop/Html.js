// ===== Html.js - Composite Pattern for Vanilla JS =====

// Base Class - Composite Pattern
class HtmlElement {
  constructor(tag = null, attrs = {}, children = []) {
    this.tag = tag;
    this.attrs = { ...attrs };
    this.children = children || [];
  }

  setTag(tag) { this.tag = tag; return this; }
  getTag() { return this.tag; }

  setAttr(key, value) {
    if (value === null || value === undefined) delete this.attrs[key];
    else this.attrs[key] = value;
    return this;
  }
  getAttr(key) { return this.attrs[key]; }
  addAttrs(attrs) { Object.entries(attrs).forEach(([k, v]) => this.setAttr(k, v)); return this; }

  addChild(child) { this.children.push(child); return this; }
  addChildren(children) { children.forEach(child => this.addChild(child)); return this; }
  addText(text) { this.children.push(new HtmlText(text)); return this; }
  addRawHtml(html) { this.children.push(new HtmlRaw(html)); return this; }
  clearChildren() { this.children = []; return this; }

  addClass(className) {
    const cur = (this.attrs.class || '').split(' ').filter(Boolean);
    if (!cur.includes(className)) cur.push(className);
    this.attrs.class = cur.join(' ');
    return this;
  }

  setStyle(key, value) {
    const styleObj = this._parseStyle(this.attrs.style || '');
    styleObj[key] = value;
    this.attrs.style = this._stringifyStyle(styleObj);
    return this;
  }
  _parseStyle(style = '') {
    return style.split(';').filter(Boolean)
      .map(s => s.split(':').map(x => x.trim()))
      .reduce((acc, [k, v]) => (k ? { ...acc, [k]: v } : acc), {});
  }
  _stringifyStyle(styleObj) {
    return Object.entries(styleObj).map(([k, v]) => `${k}: ${v}`).join('; ');
  }

  toHtml() {
    if (!this.tag) return this.children.map(c => c.toHtml()).join('');

    const voidTags = new Set(['img', 'input', 'br', 'hr', 'meta', 'link']);
    const attrs = Object.entries(this.attrs)
      .map(([k, v]) => v === true ? k : v === false || v == null ? '' : `${k}="${HtmlElement.escapeAttr(v)}"`)
      .filter(Boolean).join(' ');

    const markupOpen = `<${this.tag}${attrs ? ' ' + attrs : ''}>`;
    if (voidTags.has(this.tag)) return markupOpen;

    return `${markupOpen}${this.children.map(c => c.toHtml()).join('')}</${this.tag}>`;
  }

  toHtmlElement() {
    if (!this.tag) {
      const fragment = document.createDocumentFragment();
      this.children.forEach(child => {
        const el = child.toHtmlElement();
        if (el) fragment.appendChild(el);
      });
      return fragment;
    }

    const element = document.createElement(this.tag);
    for (const key in this.attrs) {
      if (!Object.prototype.hasOwnProperty.call(this.attrs, key)) continue;
      const value = this.attrs[key];
      if (key === 'class') element.className = value;
      else if (key === 'id') element.id = value;
      else if (value === true) element.setAttribute(key, '');
      else if (value !== false && value !== null && value !== undefined) {
        element.setAttribute(key, value);
      }
    }
    this.children.forEach(child => {
      const childElement = child.toHtmlElement();
      if (childElement) element.appendChild(childElement);
    });
    return element;
  }

  static escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  static escapeAttr(str) { return HtmlElement.escapeHtml(str).replace(/"/g, '&quot;'); }
}

// Leaf: Plain Text
class HtmlText {
  constructor(text) { this.text = text; }
  toHtml() { return HtmlElement.escapeHtml(this.text); }
  toHtmlElement() { return document.createTextNode(this.text); }
}

// Leaf: Raw HTML
class HtmlRaw {
  constructor(html) { this.html = html; }
  toHtml() { return this.html; }
  toHtmlElement() {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.html;
    if (tempDiv.children.length === 1) return tempDiv.firstElementChild;
    const fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) fragment.appendChild(tempDiv.firstChild);
    return fragment;
  }
}

// Polymorphic Element Classes
class Div extends HtmlElement { constructor(attrs = {}, children = []) { super('div', attrs, children); } }
class Span extends HtmlElement { constructor(attrs = {}, children = []) { super('span', attrs, children); } }
class H1 extends HtmlElement { constructor(attrs = {}, children = []) { super('h1', attrs, children); } }
class H2 extends HtmlElement { constructor(attrs = {}, children = []) { super('h2', attrs, children); } }
class H3 extends HtmlElement { constructor(attrs = {}, children = []) { super('h3', attrs, children); } }
class H4 extends HtmlElement { constructor(attrs = {}, children = []) { super('h4', attrs, children); } }
class P extends HtmlElement { constructor(attrs = {}, children = []) { super('p', attrs, children); } }
class Img extends HtmlElement { constructor(attrs = {}) { super('img', attrs); } }
class Button extends HtmlElement { constructor(attrs = {}, children = []) { super('button', attrs, children); } }
class Ul extends HtmlElement { constructor(attrs = {}, children = []) { super('ul', attrs, children); } }
class Li extends HtmlElement { constructor(attrs = {}, children = []) { super('li', attrs, children); } }
class A extends HtmlElement { constructor(attrs = {}, children = []) { super('a', attrs, children); } }
class Nav extends HtmlElement { constructor(attrs = {}, children = []) { super('nav', attrs, children); } }
class I extends HtmlElement { constructor(attrs = {}, children = []) { super('i', attrs, children); } }
class Input extends HtmlElement { constructor(attrs = {}) { super('input', attrs); } }
class Select extends HtmlElement { constructor(attrs = {}, children = []) { super('select', attrs, children); } }
class Option extends HtmlElement { constructor(attrs = {}, children = []) { super('option', attrs, children); } }

// ===== Reusable Tab Component (Polymorphic) =====
class TabContainer extends Div {
  constructor(id, attrs = {}) {
    super({ id, class: 'tab-container', ...attrs });
    this.tabNav = new Ul({ class: 'tab-nav', role: 'tablist' });
    this.tabContent = new Div({ class: 'tab-content' });
    this.addChildren([this.tabNav, this.tabContent]);
    this.tabs = [];
  }

  addTab(tabId, label, icon = null, isActive = false) {
    const tabItem = new TabItem(tabId, label, icon, isActive);
    const tabPane = new TabPane(tabId, isActive);
    this.tabs.push({ id: tabId, item: tabItem, pane: tabPane });
    this.tabNav.addChild(tabItem);
    this.tabContent.addChild(tabPane);
    return tabPane;
  }

  getPane(tabId) {
    const tab = this.tabs.find(t => t.id === tabId);
    return tab ? tab.pane : null;
  }
}

class TabItem extends Li {
  constructor(tabId, label, icon = null, isActive = false) {
    super({ class: 'tab-item', role: 'presentation' });
    const link = new A({
      class: `tab-link${isActive ? ' active' : ''}`,
      href: `#${tabId}`,
      'data-tab': tabId,
      role: 'tab',
      'aria-selected': isActive ? 'true' : 'false'
    });
    if (icon) link.addChild(new I({ class: icon }));
    link.addChild(new Span({ class: 'tab-label' }).addText(label));
    this.addChild(link);
  }
}

class TabPane extends Div {
  constructor(tabId, isActive = false) {
    super({
      id: tabId,
      class: `tab-pane${isActive ? ' active' : ''}`,
      role: 'tabpanel'
    });
  }
}

// ===== Product Card Component (Polymorphic) =====
class ProductCard extends Div {
  constructor(product) {
    super({ class: 'product-card' });
    
    // Use first image from images array, or fallback
    const imageUrl = product.images?.[0] || product.image || '';
    const productName = product.title || product.name || 'Sản phẩm';
    const productPrice = product.price || '';
    const productLink = product.link || '#';
    
    const imageContainer = new Div({ class: 'product-image' })
      .addChild(new Img({ src: imageUrl, alt: productName, loading: 'lazy' }));
    
    // Check stock for old format
    if (product.inStock === false) {
      imageContainer.addChild(new Span({ class: 'out-of-stock-badge' }).addText('Hết hàng'));
    }

    const info = new Div({ class: 'product-info' })
      .addChild(new Div({ class: 'product-name' }).addText(productName))
      .addChild(new Div({ class: 'product-price' }).addText(productPrice || 'Liên hệ'))
      .addChild(new A({
        class: 'btn-add-cart',
        href: productLink,
        target: '_blank',
        rel: 'noopener noreferrer'
      }).addText('Mua ngay'));

    this.addChildren([imageContainer, info]);
  }
}

// ===== Product Grid Component =====
class ProductGrid extends Div {
  constructor(products = []) {
    super({ class: 'product-grid' });
    products.forEach(product => this.addChild(new ProductCard(product)));
  }
}

// ===== Pagination Component =====
class Pagination extends Div {
  constructor(containerId, currentPage, totalPages) {
    super({ class: 'pagination', 'data-container': containerId, 'aria-label': 'Điều hướng trang' });

    // Prev button (‹)
    const prevBtn = new Button({
      class: `pagination-btn prev${currentPage <= 1 ? ' disabled' : ''}`,
      'data-page': currentPage - 1,
      disabled: currentPage <= 1,
      'aria-label': 'Trang trước'
    }).addText('‹');
    this.addChild(prevBtn);

    // Dots (slide indicators)
    if (totalPages > 1) {
      const dots = new Div({ class: 'pagination-dots', role: 'list', 'aria-label': 'Chọn trang' });
      for (let i = 1; i <= totalPages; i++) {
        const dotBtn = new Button({
          class: `pagination-btn dot${i === currentPage ? ' active' : ''}`,
          'data-page': i,
          'aria-label': `Trang ${i}`,
          title: `Trang ${i}`,
          type: 'button'
        }).addText('•');
        dots.addChild(dotBtn);
      }
      this.addChild(dots);
    }

    // Next button (›)
    const nextBtn = new Button({
      class: `pagination-btn next${currentPage >= totalPages ? ' disabled' : ''}`,
      'data-page': currentPage + 1,
      disabled: currentPage >= totalPages,
      'aria-label': 'Trang sau'
    }).addText('›');
    this.addChild(nextBtn);
  }
}


// ===== Paginated Product Grid Component =====
class PaginatedProductGrid extends Div {
  constructor(containerId, products = [], currentPage = 1, itemsPerPage = 4) {
    super({ id: containerId, class: 'paginated-products' });

    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = products.slice(startIndex, endIndex);

    // Empty state
    if (!currentProducts.length) {
      this.addChild(new Div({ class: 'empty-state' }).addText('Không tìm thấy sản phẩm nào.'));
      return;
    }

    // Product grid
    this.addChild(new ProductGrid(currentProducts));

    // Pagination controls
    if (totalPages > 1) {
      this.addChild(new Pagination(containerId, currentPage, totalPages));
    }
  }
}

// Tab Controller - handles tab switching
class TabController {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.init();
  }

  init() {
    if (!this.container) return;
    this.container.addEventListener('click', (e) => {
      const link = e.target.closest('.tab-link');
      if (!link) return;
      e.preventDefault();
      this.switchTab(link.dataset.tab);
    });
  }

  switchTab(tabId) {
    // Update nav
    this.container.querySelectorAll('.tab-link').forEach(link => {
      link.classList.toggle('active', link.dataset.tab === tabId);
      link.setAttribute('aria-selected', link.dataset.tab === tabId ? 'true' : 'false');
    });
    // Update panes
    this.container.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === tabId);
    });
  }
}

// ===== Pagination Controller =====
class PaginationController {
  constructor(containerId, products, itemsPerPage = 4, onPageChange = null) {
    this.containerId = containerId;
    this.products = products;
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this.onPageChange = onPageChange;
    this.init();
  }

  init() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.pagination-btn');
      if (!btn) return;
      if (btn.disabled) return;

      const pagination = btn.closest('.pagination');
      if (!pagination || pagination.dataset.container !== this.containerId) return;

      const page = parseInt(btn.dataset.page, 10);
      if (!isNaN(page) && page !== this.currentPage) {
        this.goToPage(page);
      }
    });
  }

  setData(products, itemsPerPage) {
    this.products = products || [];
    this.itemsPerPage = itemsPerPage || this.itemsPerPage;
    this.currentPage = 1;
    this.render(true);
  }

  goToPage(page) {
    const totalPages = Math.ceil(this.products.length / this.itemsPerPage) || 1;
    if (page < 1 || page > totalPages) return;

    this.currentPage = page;
    this.render(true);

    if (this.onPageChange) {
      this.onPageChange(page);
    }
  }

  render(shouldScroll = false) {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const newGrid = new PaginatedProductGrid(
      this.containerId,
      this.products,
      this.currentPage,
      this.itemsPerPage
    ).addClass('page-enter');

    const nextEl = newGrid.toHtmlElement();
    container.replaceWith(nextEl);

    if (shouldScroll && nextEl && typeof nextEl.scrollIntoView === 'function') {
      requestAnimationFrame(() => {
        nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }
}
