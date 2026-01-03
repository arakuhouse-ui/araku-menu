const SHEET_ID = "12EJSRapRlkacv_DPzk3PKup42O1-x0KVSDKKjHvs3Rk";
const SHEET_NAME = "Sheet1";
const URL = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`;

const menuEl = document.getElementById("menu");
const catEl = document.getElementById("categories");
const searchEl = document.getElementById("search");

let data = [];
let categories = [];
let activeCategory = "";

const flavourConfig = {
  syrupPrice: 40,
  premiumPrice: 75,
  syrup: ["Vanilla", "Hazelnut", "Caramel", "Irish", "Cinnamon"],
  premium: ["Nutella", "Pistachio", "White Chocolate", "Lotus Biscoff"]
};

const addonConfig = {
  items: [
    "Oat Milk (+₹40)",
    "Almond Milk (+₹40)",
    "Extra Shot (+₹50)"
  ]
};


const subgroupCovers = {
  "Hot Coffee & Tea": "images/covers/hot-coffee.webp",
  "Cold Coffee & Frappe": "images/covers/cold-coffee.webp",
  "Matcha & Speciality": "images/covers/matcha.webp",
  "Signature Coffee": "images/covers/signature-coffee.webp",

  "Cold Refreshers": "images/covers/cold-refreshers.webp",
  "Dessert Drinks": "images/covers/dessert-drinks.webp",

  "Soups & Starters": "images/covers/soups-starters.webp",
  "Egg & Breakfast": "images/covers/egg-breakfast.webp",
  "Breads & Handhelds": "images/covers/breads-handhelds.webp",
  "Pastas": "images/covers/pastas.webp",
  "Rice & Bowls": "images/covers/rice-bowls.webp"
};


fetch(URL)
  .then(res => res.json())
  .then(json => {
    data = json.filter(i => i.available === "yes");
    categories = [...new Set(data.map(i => i.category))];
    activeCategory = categories[0];
    renderCategories();
    renderItems(data.filter(i => i.category === activeCategory));
  });

function getTypeIcon(type) {
  if (type === "veg") return "🟢";
  if (type === "egg") return "🟡";
  if (type === "nonveg") return "🔴";
  return "";
}

function renderBestSeller(flag) {
  if (flag !== "yes") return "";
  return `<span class="badge">⭐ Best Seller</span>`;
}


function renderCategories() {
  catEl.innerHTML = "";
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    if (cat === activeCategory) btn.classList.add("active");

    btn.onclick = () => {
      activeCategory = cat;
      searchEl.value = "";
      document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderItems(data.filter(i => i.category === activeCategory));
    };

    catEl.appendChild(btn);
  });
}

function renderItems(items) {
  menuEl.innerHTML = "";

  if (!items || items.length === 0) {
    menuEl.innerHTML = "<p style='padding:12px'>No items available</p>";
    return;
  }

  const grouped = {};

  items.forEach(item => {
    const subgroup = item.subgroup && item.subgroup.trim()
      ? item.subgroup.trim()
      : "All Items";

    if (!grouped[subgroup]) {
      grouped[subgroup] = [];
    }
    grouped[subgroup].push(item);
  });

  Object.keys(grouped).forEach(subgroup => {
  const cover = subgroupCovers[subgroup] || "";

  const section = document.createElement("div");
  section.className = "subgroup";

  section.innerHTML = `
    <div class="subgroup-header" onclick="toggleSubgroup(this)">
      ${cover
  ? `<img src="${cover}" alt="${subgroup}">`
  : `<div class="subgroup-placeholder"></div>`
}
      <div class="subgroup-overlay">
        <h2>${subgroup}</h2>
        <span class="chevron">⌄</span>
      </div>
    </div>

    <div class="subgroup-items">
      ${grouped[subgroup].map(item => `
        <div class="item">
          <img loading="lazy" src="${item.image_url}" alt="${item.name}">
          <div>
            <h3>
              ${item.name}
              <span style="margin-left:6px">${getTypeIcon(item.type)}</span>
            </h3>
            <p>${item.description}</p>
            <div class="price">₹${item.price}</div>
            ${item.protein ? `<div class="cal">Protein: ${item.protein}g</div>` : ""}
            ${renderFlavours(item.flavour_group)}
            ${renderAddons(item.addons)}
          </div>
        </div>
      `).join("")}
    </div>
  `;

  menuEl.appendChild(section);
});

}

function renderAddons(enabled) {
  if (enabled !== "yes") return "";

  return `
    <div class="addons">
      <div class="addon-title">Add-ons</div>
      <div class="addon-line">
        ${addonConfig.items.join(" | ")}
      </div>
    </div>
  `;
}


function toggleSubgroup(header) {
  const allItems = document.querySelectorAll(".subgroup-items");
  const allChevrons = document.querySelectorAll(".chevron");

  const items = header.nextElementSibling;
  const chevron = header.querySelector(".chevron");

  // Close all others
  allItems.forEach(el => {
    if (el !== items) el.classList.remove("open");
  });
  allChevrons.forEach(ch => ch.textContent = "⌄");

  // Toggle current
  if (!items.classList.contains("open")) {
    items.classList.add("open");
    chevron.textContent = "⌃";
  } else {
    items.classList.remove("open");
    chevron.textContent = "⌄";
  }
}


function renderFlavours(enabled) {
  if (enabled !== "yes") return "";

  return `
    <div class="flavours">
      <div class="flavour-title">Flavor add-on</div>
      <div class="flavour-line">
         flavours (+₹${flavourConfig.syrupPrice}):
        ${flavourConfig.syrup.join(" | ")}
      </div>
      <div class="flavour-line">
        Premium flavours (+₹${flavourConfig.premiumPrice}):
        ${flavourConfig.premium.join(" | ")}
      </div>
    </div>
  `;
}

function renderSpice(level) {
  if (level === "mild") return "🌶️";
  if (level === "medium") return "🌶️🌶️";
  if (level === "spicy") return "🌶️🌶️🌶️";
  return "";
}






searchEl.addEventListener("input", e => {
  const value = e.target.value.toLowerCase().trim();
  if (!value) {
    renderItems(data.filter(i => i.category === activeCategory));
    return;
  }
  const results = data.filter(i =>
    i.name.toLowerCase().includes(value) ||
    i.description.toLowerCase().includes(value)
  );
  renderItems(results);
});
