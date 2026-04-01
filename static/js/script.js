const categories = [
  "Beef",
  "Chicken",
  "Seafood",
  "Dessert",
  "Breakfast",
  "Pork",
  "Lamb",
  "Vegan",
  "Vegetarian",
  "Starter",
  "Side",
];

const INITIAL_VISIBLE_MEALS = 40;
const SHOW_MORE_BATCH = 20;

let allMeals = [];
let visibleMeals = 0;

function shuffleArray(items) {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function getUniqueMeals(meals) {
  const seen = new Set();

  return meals.filter((meal) => {
    if (seen.has(meal.idMeal)) return false;
    seen.add(meal.idMeal);
    return true;
  });
}

function renderMeals() {
  const grid = document.getElementById("recipe-grid");
  const button = document.getElementById("show-more-btn");

  if (!grid || !button) return;

  const mealsToShow = allMeals.slice(0, visibleMeals);

  grid.innerHTML = mealsToShow
    .map((meal) =>
      buildMealCard(meal, {
        href: `./page/meal.html?id=${meal.idMeal}`,
        wrapperClass: "col-sm-6 col-lg-4 col-xl-3",
      })
    )
    .join("");

  if (visibleMeals >= allMeals.length) {
    button.classList.add("d-none");
  } else {
    button.classList.remove("d-none");
  }
}

function showMoreMeals() {
  visibleMeals = Math.min(visibleMeals + SHOW_MORE_BATCH, allMeals.length);
  renderMeals();
}

function renderHomepageShell() {
  const main = document.getElementById("recipe-scrolls");
  if (!main) return;

  main.innerHTML = `
    <section class="container py-5">
      <div class="d-flex flex-column flex-lg-row align-items-lg-end justify-content-between gap-3 mb-4">
        <div>
          <p class="text-warning text-uppercase small fw-semibold mb-2">Discover</p>
          <h2 class="text-white mb-2">Randomized Recipe Collection</h2>
          <p class="text-white-50 mb-0">Freshly shuffled meals from across the archive.</p>
        </div>
      </div>

      <div id="recipe-grid" class="row g-4"></div>

      <div class="text-center mt-4">
        <button id="show-more-btn" type="button" class="btn btn-warning rounded-pill px-4 py-2">
          Show More
        </button>
      </div>
    </section>
  `;

  document.getElementById("show-more-btn").addEventListener("click", showMoreMeals);
}

function loadHomepageMeals() {
  Promise.all(
    categories.map((category) =>
      fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
        .then((res) => res.json())
        .then((data) => data.meals || [])
    )
  ).then((results) => {
    allMeals = shuffleArray(getUniqueMeals(results.flat()));
    visibleMeals = Math.min(INITIAL_VISIBLE_MEALS, allMeals.length);
    renderMeals();
  });
}

function randomMeal() {
  fetch("https://www.themealdb.com/api/json/v1/1/random.php")
    .then((res) => res.json())
    .then((data) => {
      const meal = data.meals[0];
      window.location.href = `page/meal.html?id=${meal.idMeal}`;
    });
}

renderHomepageShell();
loadHomepageMeals();
