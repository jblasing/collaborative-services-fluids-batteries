const products = window.catalogProducts;
const categoryNames = window.categoryNames;
const batteryCategoryNames = window.batteryCategoryNames;
let cart = JSON.parse(localStorage.getItem("csfb-cart") || "[]");
let activeFilter = "all";
let searchTerm = "";
let showFullCatalog = false;

const grid = document.querySelector("#product-grid");
const countNodes = document.querySelectorAll("[data-cart-count]");
const cartItems = document.querySelector("[data-cart-items]");
const cartEmpty = document.querySelector("[data-cart-empty]");
const productCount = document.querySelector("[data-product-count]");
const storeEmpty = document.querySelector("[data-store-empty]");
const showAllButton = document.querySelector("[data-show-all]");
const searchInput = document.querySelector("[data-catalog-search]");

function matchesProduct(product) {
  const matchesFilter = activeFilter === "all" || product.category === activeFilter || product.subcategory === activeFilter;
  const searchable = [product.name, product.format, product.description, categoryNames[product.category], product.subcategory ? batteryCategoryNames[product.subcategory] : ""]
    .filter(Boolean).join(" ").toLowerCase();
  return matchesFilter && (!searchTerm || searchable.includes(searchTerm));
}

function renderProducts() {
  const matches = products.filter(matchesProduct);
  const shouldLimit = activeFilter === "all" && !searchTerm && !showFullCatalog;
  const visible = shouldLimit ? matches.slice(0, 12) : matches;

  grid.replaceChildren(...visible.map(product => {
    const card = document.createElement("article");
    card.className = "product-card";
    const tag = product.subcategory ? batteryCategoryNames[product.subcategory] : categoryNames[product.category];
    const added = cart.includes(product.id);
    card.innerHTML = `<div class="product-visual ${product.category}${product.image ? " has-image" : ""}">${product.image ? `<img src="${product.image}" alt="${product.name}" loading="lazy">` : ""}<span class="product-tag">${tag}</span></div><div class="product-copy"><h3>${product.name}</h3><p>${product.description}</p><div class="product-meta"><span>${product.format}</span><span>Request pricing</span></div><button class="add-button" type="button" ${added ? "disabled" : ""}>${added ? "Added to Request" : "Add to Request"}</button></div>`;
    card.querySelector("button").addEventListener("click", event => addToCart(product.id, event.currentTarget));
    return card;
  }));

  productCount.textContent = visible.length === matches.length
    ? `${matches.length} product${matches.length === 1 ? "" : "s"}`
    : `Showing ${visible.length} of ${matches.length} products`;
  storeEmpty.hidden = matches.length > 0;
  showAllButton.hidden = !shouldLimit || visible.length === matches.length;
}

function addToCart(id, button) {
  if (!cart.includes(id)) cart.push(id);
  saveCart();
  if (button) {
    button.textContent = "Added to Request";
    button.disabled = true;
  }
  openCart();
}

function saveCart() {
  localStorage.setItem("csfb-cart", JSON.stringify(cart));
  countNodes.forEach(node => node.textContent = cart.length);
  renderCart();
}

function renderCart() {
  const selected = cart.map(id => products.find(product => product.id === id)).filter(Boolean);
  cartEmpty.hidden = selected.length > 0;
  cartItems.replaceChildren(...selected.map(product => {
    const item = document.createElement("div");
    item.className = "cart-item";
    const label = document.createElement("span");
    label.innerHTML = `<b>${product.name}</b><br><small>${product.format}</small>`;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      cart = cart.filter(id => id !== product.id);
      saveCart();
      renderProducts();
    });
    item.append(label, remove);
    return item;
  }));
}

function openCart() {
  document.body.classList.add("cart-open");
  document.querySelector(".cart-drawer").setAttribute("aria-hidden", "false");
}

function closeCart() {
  document.body.classList.remove("cart-open");
  document.querySelector(".cart-drawer").setAttribute("aria-hidden", "true");
}

document.querySelectorAll("[data-open-cart]").forEach(button => button.addEventListener("click", openCart));
document.querySelectorAll("[data-close-cart]").forEach(button => button.addEventListener("click", closeCart));
document.addEventListener("keydown", event => { if (event.key === "Escape") closeCart(); });

document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  showFullCatalog = true;
  document.querySelectorAll("[data-filter]").forEach(item => item.classList.toggle("active", item === button));
  renderProducts();
  document.querySelector("#products").scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelector("#department-nav").classList.remove("open");
  document.querySelector(".retail-menu-toggle").setAttribute("aria-expanded", "false");
}));

document.querySelector("[data-catalog-search-form]").addEventListener("submit", event => {
  event.preventDefault();
  searchTerm = searchInput.value.trim().toLowerCase();
  showFullCatalog = true;
  renderProducts();
  document.querySelector("#products").scrollIntoView({ behavior: "smooth", block: "start" });
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  showFullCatalog = Boolean(searchTerm);
  renderProducts();
});

showAllButton.addEventListener("click", () => {
  showFullCatalog = true;
  renderProducts();
});

const menu = document.querySelector(".retail-menu-toggle");
menu.addEventListener("click", () => {
  const nav = document.querySelector("#department-nav");
  const open = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
});

document.querySelector("[data-request-form]").addEventListener("submit", event => {
  event.preventDefault();
  if (!cart.length) {
    alert("Add at least one product to your request list.");
    return;
  }
  const data = new FormData(event.currentTarget);
  const lines = cart.map(id => products.find(product => product.id === id)).filter(Boolean);
  const body = [
    `Name: ${data.get("name")}`,
    `Company: ${data.get("company") || "N/A"}`,
    `Email: ${data.get("email")}`,
    `Phone: ${data.get("phone") || "N/A"}`,
    "",
    "Products requested:",
    ...lines.map(product => `- ${product.name} (${product.format})`),
    "",
    `Notes: ${data.get("notes") || "None"}`
  ].join("\n");
  window.location.href = `mailto:info@csllc-tx.com?subject=${encodeURIComponent("Fluids & Batteries pricing request")}&body=${encodeURIComponent(body)}`;
});

renderProducts();
saveCart();
