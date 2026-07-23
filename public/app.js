const products = window.catalogProducts;
const categoryNames = window.categoryNames;
const batteryCategoryNames = window.batteryCategoryNames;
let cart = JSON.parse(localStorage.getItem("csfb-cart") || "[]");

const grid = document.querySelector("#product-grid");
const countNodes = document.querySelectorAll("[data-cart-count]");
const cartItems = document.querySelector("[data-cart-items]");
const cartEmpty = document.querySelector("[data-cart-empty]");

function renderProducts(filter = "all") {
  const visible = products.filter(product => filter === "all" || product.category === filter || product.subcategory === filter);
  grid.replaceChildren(...visible.map(product => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `<div class="product-visual ${product.category}${product.image ? " has-image" : ""}">${product.image ? `<img src="${product.image}" alt="${product.name}" loading="lazy">` : ""}<span class="product-tag">${product.subcategory ? batteryCategoryNames[product.subcategory] : categoryNames[product.category]}</span></div><div class="product-copy"><h3>${product.name}</h3><p>${product.description}</p><div class="product-meta"><span>${product.format}</span><span>Request pricing</span></div><button class="add-button" type="button">Add to Request</button></div>`;
    card.querySelector("button").addEventListener("click", () => addToCart(product.id));
    return card;
  }));
}

function addToCart(id) {
  if (!cart.includes(id)) cart.push(id);
  saveCart();
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
    remove.addEventListener("click", () => { cart = cart.filter(id => id !== product.id); saveCart(); });
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
  document.querySelectorAll("[data-filter]").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  renderProducts(button.dataset.filter);
}));

const menu = document.querySelector(".menu-toggle");
menu.addEventListener("click", () => {
  const nav = document.querySelector("#site-nav");
  const open = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
});

document.querySelector("[data-request-form]").addEventListener("submit", event => {
  event.preventDefault();
  if (!cart.length) { alert("Add at least one product to your request list."); return; }
  const data = new FormData(event.currentTarget);
  const lines = cart.map(id => products.find(product => product.id === id)?.name).filter(Boolean);
  const smsConsent = data.get("smsConsent") === "yes";
  const body = [`Name: ${data.get("name")}`, `Company: ${data.get("company") || "N/A"}`, `Email: ${data.get("email")}`, `Phone: ${data.get("phone") || "N/A"}`, `SMS consent: ${smsConsent ? "Yes - optional checkbox selected" : "No"}`, `Consent recorded: ${new Date().toISOString()}`, "", "Products requested:", ...lines.map(line => `- ${line}`), "", `Notes: ${data.get("notes") || "None"}`].join("\n");
  window.location.href = `mailto:info@csllc-tx.com?subject=${encodeURIComponent("Fluids & Batteries pricing request")}&body=${encodeURIComponent(body)}`;
});

renderProducts();
saveCart();

