const SHEET_ID = "12EJSRapRlkacv_DPzk3PKup42O1-x0KVSDKKjHvs3Rk";
const SHEET_NAME = "Sheet1";
const URL = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`;

const menuEl = document.getElementById("menu");
const catEl = document.getElementById("categories");

let data = [];
let categories = [];

fetch(URL)
  .then(res => res.json())
  .then(json => {
    data = json.filter(i => i.available === "yes");
    categories = [...new Set(data.map(i => i.category))];
    renderCategories();
    renderMenu(categories[0]);
  });

function renderCategories() {
  categories.forEach((cat, index) => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    if (index === 0) btn.classList.add("active");
    btn.onclick = () => {
      document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderMenu(cat);
    };
    catEl.appendChild(btn);
  });
}

function renderMenu(category) {
  menuEl.innerHTML = "";
  data.filter(i => i.category === category).forEach(item => {
    menuEl.innerHTML += `
      <div class="item">
        <img loading="lazy" src="${item.image_url}" alt="${item.name}">
        <div>
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <div class="price">₹${item.price}</div>
          ${item.calories ? `<div class="cal">${item.calories} kcal</div>` : ""}
        </div>
      </div>
    `;
  });
}
