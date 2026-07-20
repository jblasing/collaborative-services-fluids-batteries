const products = [
  { id:"hydraulic-aw32", category:"hydraulic", name:"AW-32 Hydraulic Fluid", format:"Pails & drums", description:"General-purpose anti-wear hydraulic fluid for mobile and industrial equipment." },
  { id:"hydraulic-aw46", category:"hydraulic", name:"AW-46 Hydraulic Fluid", format:"Pails & drums", description:"Reliable wear protection and oxidation stability for higher-load hydraulic systems." },
  { id:"battery-commercial", category:"batteries", name:"Commercial Batteries", format:"Multiple group sizes", description:"Starting power for trucks, equipment, generators and commercial applications." },
  { id:"battery-deep-cycle", category:"batteries", name:"Deep-Cycle Batteries", format:"12V options", description:"Dependable reserve capacity for repeated cycling and auxiliary power needs." },
  { id:"oil-diesel", category:"oil", name:"Heavy-Duty Diesel Oil", format:"Jugs, pails & drums", description:"Engine protection for diesel fleets, off-road equipment and demanding duty cycles." },
  { id:"oil-gasoline", category:"oil", name:"Gasoline Engine Oil", format:"Cases & bulk", description:"Multi-grade motor oil options for passenger vehicles and gasoline-powered equipment." },
  { id:"def-jug", category:"def", name:"Diesel Exhaust Fluid", format:"2.5-gallon jugs", description:"High-purity DEF for SCR-equipped diesel vehicles and equipment." },
  { id:"def-bulk", category:"def", name:"Bulk DEF Supply", format:"Drums, totes & bulk", description:"Volume DEF solutions for fleets, shops, farms and industrial operations." }
];

const categoryNames = { hydraulic:"Hydraulic Fluid", batteries:"Batteries", oil:"Engine Oil", def:"DEF Fluid" };
let cart = JSON.parse(localStorage.getItem("csfb-cart") || "[]");

const grid = document.querySelector("#product-grid");
const countNodes = document.querySelectorAll("[data-cart-count]");
const cartItems = document.querySelector("[data-cart-items]");
const cartEmpty = document.querySelector("[data-cart-empty]");

function renderProducts(filter = "all") {
  const visible = products.filter(product => filter === "all" || product.category === filter);
  grid.replaceChildren(...visible.map(product => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `<div class="product-visual ${product.category}"><span class="product-tag">${categoryNames[product.category]}</span></div><div class="product-copy"><h3>${product.name}</h3><p>${product.description}</p><div class="product-meta"><span>${product.format}</span><span>Request pricing</span></div><button class="add-button" type="button">Add to Request</button></div>`;
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
  const body = [`Name: ${data.get("name")}`, `Company: ${data.get("company") || "N/A"}`, `Email: ${data.get("email")}`, `Phone: ${data.get("phone") || "N/A"}`, "", "Products requested:", ...lines.map(line => `- ${line}`), "", `Notes: ${data.get("notes") || "None"}`].join("\n");
  window.location.href = `mailto:info@csllc-tx.com?subject=${encodeURIComponent("Fluids & Batteries pricing request")}&body=${encodeURIComponent(body)}`;
});

renderProducts();
saveCart();

