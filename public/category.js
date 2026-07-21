const products = window.catalogProducts;
const batteryCategoryNames = window.batteryCategoryNames;
const params = new URLSearchParams(window.location.search);
const requestedCategory = params.get("category") || "batteries";
const validCategories = new Set(["batteries", ...Object.keys(batteryCategoryNames)]);
const category = validCategories.has(requestedCategory) ? requestedCategory : "batteries";

const pageDetails = {
  batteries: ["All Batteries", "Search our complete battery catalog by product name, group size, specification, or SKU."],
  "standard-auto": ["Standard Auto Batteries", "Flooded automotive batteries across common group sizes."],
  "agm-auto": ["AGM Auto Batteries", "AGM automotive and dual-purpose batteries for demanding applications."],
  "heavy-truck": ["Heavy-Duty Truck Batteries", "Commercial flooded and AGM batteries for trucks and heavy equipment."],
  "golf-cart": ["Golf Cart Batteries", "Standard, AGM, lead deep-cycle, and lithium golf-cart options."],
  "marine-deep-cycle": ["Marine & Deep-Cycle Batteries", "Starting, dual-purpose, deep-cycle, and AGM marine batteries."]
};

const [title, description] = pageDetails[category];
document.title = `${title} | Collaborative Services`;
document.querySelector("[data-category-title]").textContent = title;
document.querySelector("[data-category-description]").textContent = description;
document.querySelector(`[data-category-link="${category}"]`)?.classList.add("active");

const categoryProducts = products.filter(product =>
  product.category === "batteries" && (category === "batteries" || product.subcategory === category)
);
const grid = document.querySelector("#category-product-grid");
const search = document.querySelector("#catalog-search");
const resultCount = document.querySelector("[data-result-count]");
const empty = document.querySelector("[data-catalog-empty]");
let cart = JSON.parse(localStorage.getItem("csfb-cart") || "[]");

function updateCartCount() {
  document.querySelectorAll("[data-cart-count]").forEach(node => node.textContent = cart.length);
}

function addToRequest(id, button) {
  if (!cart.includes(id)) {
    cart.push(id);
    localStorage.setItem("csfb-cart", JSON.stringify(cart));
  }
  updateCartCount();
  button.textContent = "Added";
  button.disabled = true;
}

function render(query = "") {
  const term = query.trim().toLowerCase();
  const visible = categoryProducts.filter(product =>
    !term || [product.name, product.format, product.description].some(value => value.toLowerCase().includes(term))
  );

  grid.replaceChildren(...visible.map(product => {
    const card = document.createElement("article");
    card.className = "product-card";
    const added = cart.includes(product.id);
    card.innerHTML = `<div class="product-visual batteries${product.image ? " has-image" : ""}">${product.image ? `<img src="${product.image}" alt="${product.name}" loading="lazy">` : ""}<span class="product-tag">${batteryCategoryNames[product.subcategory]}</span></div><div class="product-copy"><h3>${product.name}</h3><p>${product.description}</p><div class="product-meta"><span>${product.format}</span><span>Request pricing</span></div><button class="add-button" type="button" ${added ? "disabled" : ""}>${added ? "Added" : "Add to Request"}</button></div>`;
    card.querySelector("button").addEventListener("click", event => addToRequest(product.id, event.currentTarget));
    return card;
  }));

  resultCount.textContent = `${visible.length} product${visible.length === 1 ? "" : "s"} found`;
  empty.hidden = visible.length > 0;
}

search.addEventListener("input", () => render(search.value));
updateCartCount();
render();
