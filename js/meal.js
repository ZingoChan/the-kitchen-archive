const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const recipeId = params.get("recipe");
const favoriteButton = document.getElementById("favorite-btn");
const saveJsonButton = document.getElementById("save-json-btn");
const favoriteMessage = document.getElementById("favorite-message");
const recipeJsonMessage = document.getElementById("recipe-json-message");
const RECIPE_LIBRARY_KEY = "recipeLibrary";
let activeMeal = null;

function getStoredUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function getRecipeLibrary() {
  return JSON.parse(localStorage.getItem(RECIPE_LIBRARY_KEY)) || [];
}

function saveRecipeLibrary(recipes) {
  localStorage.setItem(RECIPE_LIBRARY_KEY, JSON.stringify(recipes));
}

function saveCurrentUser(updatedUser) {
  const users = getStoredUsers().map((user) =>
    user.uuid === updatedUser.uuid ? updatedUser : user
  );

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(updatedUser));
}

function makeFavoriteMeal(meal) {
  return {
    idMeal: meal.idMeal,
    strMeal: meal.strMeal,
    strMealThumb: meal.strMealThumb,
    strCategory: meal.strCategory,
    strArea: meal.strArea,
    recipeSource: meal.recipeSource || "api",
  };
}

function isMealFavorited(user, mealId) {
  return (user.favorites || []).some((meal) => meal.idMeal === mealId);
}

function getMealAuthor(meal) {
  const author = meal?.author ? String(meal.author).trim() : "";
  return author || "N/A";
}

function getMealFavoriteCount(mealId) {
  if (!mealId) return 0;

  return getStoredUsers().reduce((count, user) => {
    const hasFavoritedMeal = (user.favorites || []).some(
      (meal) => String(meal.idMeal) === String(mealId)
    );

    return hasFavoritedMeal ? count + 1 : count;
  }, 0);
}

function updateFavoriteCount() {
  const favoriteCount = document.getElementById("favorite-count");

  if (!favoriteCount) return;

  favoriteCount.textContent = activeMeal ? String(getMealFavoriteCount(activeMeal.idMeal)) : "0";
}

function updateFavoriteUI() {
  const currentUser = getCurrentUser();

  updateFavoriteCount();

  if (!favoriteButton || !favoriteMessage) return;

  if (!currentUser) {
    favoriteButton.disabled = true;
    favoriteButton.textContent = "Login to Favorite";
    favoriteMessage.textContent = "Sign in first to save this meal to your profile.";
    return;
  }

  favoriteButton.disabled = false;

  if (activeMeal && isMealFavorited(currentUser, activeMeal.idMeal)) {
    favoriteButton.className = "btn btn-warning rounded-pill";
    favoriteButton.textContent = "Remove From Favorites";
    favoriteMessage.textContent = "Saved in your profile favorites.";
    return;
  }

  favoriteButton.className = "btn btn-outline-warning rounded-pill";
  favoriteButton.textContent = "Favorite This Meal";
  favoriteMessage.textContent = "Save this meal so you can find it again later.";
}

function toggleFavorite() {
  const currentUser = getCurrentUser();

  if (!currentUser || !activeMeal) {
    updateFavoriteUI();
    return;
  }

  const favoriteMeal = makeFavoriteMeal(activeMeal);
  const favorites = currentUser.favorites || [];
  const existingIndex = favorites.findIndex((meal) => meal.idMeal === activeMeal.idMeal);

  if (existingIndex >= 0) {
    currentUser.favorites = favorites.filter((meal) => meal.idMeal !== activeMeal.idMeal);
  } else {
    currentUser.favorites = [favoriteMeal, ...favorites];
  }

  saveCurrentUser(currentUser);
  updateFavoriteUI();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeCustomRecipe(recipe) {
  if (!recipe || typeof recipe !== "object") {
    throw new Error("That JSON file does not look like a recipe.");
  }

  const normalizedIngredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
        .map((ingredient) => {
          const name = ingredient?.name ? String(ingredient.name).trim() : "";

          return {
            amount: ingredient?.amount ? String(ingredient.amount).trim() : "",
            unit: ingredient?.unit ? String(ingredient.unit).trim() : "",
            name,
            image: ingredient?.image
              ? String(ingredient.image).trim()
              : name
                ? getIngredientImage(name)
                : "",
            measure: ingredient?.measure ? String(ingredient.measure).trim() : "",
          };
        })
        .filter((ingredient) => ingredient.name)
    : [];

  const fallbackIngredients = [];
  for (let index = 1; index <= 20; index += 1) {
    const name = recipe[`strIngredient${index}`];

    if (!name || !String(name).trim()) {
      continue;
    }

    fallbackIngredients.push({
      amount: "",
      unit: "",
      name: String(name).trim(),
      image: getIngredientImage(String(name).trim()),
      measure: recipe[`strMeasure${index}`] ? String(recipe[`strMeasure${index}`]).trim() : "",
    });
  }

  const ingredients = normalizedIngredients.length ? normalizedIngredients : fallbackIngredients;
  const now = new Date().toISOString();

  return {
    idMeal: String(recipe.idMeal || crypto.randomUUID()),
    strMeal: String(recipe.strMeal || "Untitled Recipe").trim(),
    strMealThumb: String(recipe.strMealThumb || "../static/img/bg.jpg").trim(),
    strDescription: String(recipe.strDescription || "").trim(),
    strCategory: String(recipe.strCategory || "Custom").trim(),
    strArea: String(recipe.strArea || "Personal").trim(),
    strInstructions: String(recipe.strInstructions || "").trim(),
    strYoutube: String(recipe.strYoutube || "").trim(),
    ingredients,
    author: String(recipe.author || "unknown").trim(),
    authorUuid: String(recipe.authorUuid || "").trim(),
    createdAt: String(recipe.createdAt || now),
    dateModified: String(recipe.dateModified || recipe.createdAt || now),
    recipeSource: String(recipe.recipeSource || "custom"),
  };
}

function upsertRecipeLibrary(recipe) {
  const library = getRecipeLibrary();
  const nextLibrary = library.filter((entry) => entry.idMeal !== recipe.idMeal);
  nextLibrary.unshift(recipe);
  saveRecipeLibrary(nextLibrary);
}

function getUserRecipes() {
  const users = getStoredUsers();
  return users.flatMap((user) => user.creations || []);
}

function findStoredRecipeById(mealId) {
  if (!mealId) return null;

  const storedRecipe = [...getRecipeLibrary(), ...getUserRecipes()].find(
    (recipe) => recipe && String(recipe.idMeal) === String(mealId)
  );

  return storedRecipe ? normalizeCustomRecipe(storedRecipe) : null;
}

function getIngredientLabel(ingredient) {
  if (!ingredient) return "";

  if (ingredient.measure) {
    return `${ingredient.measure} ${ingredient.name}`.trim();
  }

  return `${ingredient.amount || ""} ${ingredient.unit || ""} ${ingredient.name || ""}`
    .replace(/\s+/g, " ")
    .trim();
}

function getIngredientImage(ingredientName, customImage) {
  if (customImage) {
    return customImage;
  }

  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(
    ingredientName
  )}-Small.png`;
}

function getMealIngredients(meal) {
  if (Array.isArray(meal.ingredients) && meal.ingredients.length) {
    return meal.ingredients
      .filter((ingredient) => ingredient?.name)
      .map((ingredient) => ({
        name: ingredient.name,
        label: getIngredientLabel(ingredient),
        image: getIngredientImage(ingredient.name, ingredient.image),
      }));
  }

  const ingredients = [];
  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`];
    const measure = meal[`strMeasure${index}`];

    if (ingredient && String(ingredient).trim()) {
      ingredients.push({
        name: String(ingredient).trim(),
        label: `${measure || ""} ${ingredient}`.replace(/\s+/g, " ").trim(),
        image: getIngredientImage(String(ingredient).trim()),
      });
    }
  }

  return ingredients;
}

function getDownloadableIngredients(meal) {
  if (Array.isArray(meal.ingredients) && meal.ingredients.length) {
    return meal.ingredients
      .map((ingredient) => {
        const name = ingredient?.name ? String(ingredient.name).trim() : "";

        return {
          amount: ingredient?.amount ? String(ingredient.amount).trim() : "",
          unit: ingredient?.unit ? String(ingredient.unit).trim() : "",
          name,
          image: ingredient?.image
            ? String(ingredient.image).trim()
            : name
              ? getIngredientImage(name)
              : "",
          measure: ingredient?.measure ? String(ingredient.measure).trim() : "",
        };
      })
      .filter((ingredient) => ingredient.name);
  }

  const ingredients = [];
  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`];
    const measure = meal[`strMeasure${index}`];

    if (!ingredient || !String(ingredient).trim()) {
      continue;
    }

    ingredients.push({
      amount: "",
      unit: "",
      name: String(ingredient).trim(),
      image: getIngredientImage(String(ingredient).trim()),
      measure: measure ? String(measure).trim() : "",
    });
  }

  return ingredients;
}

function buildDownloadableRecipe(meal) {
  const exportedRecipe = normalizeCustomRecipe({
    ...meal,
    ingredients: getDownloadableIngredients(meal),
    recipeSource: meal.recipeSource || (recipeId ? "custom" : "api"),
  });

  if (!exportedRecipe.author || exportedRecipe.author === "unknown") {
    exportedRecipe.author = meal.author ? String(meal.author).trim() : "The Kitchen Archive";
  }

  return exportedRecipe;
}

function downloadRecipeJson(recipe) {
  const safeName = (recipe.strMeal || "recipe")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const blob = new Blob([JSON.stringify(recipe, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${safeName || "recipe"}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderIngredients(meal) {
  const container = document.getElementById("ingredients");
  const ingredients = getMealIngredients(meal);

  container.innerHTML = ingredients
    .map(
      (ingredient) => `
        <div class="ingredient-grid-item">
          <div class="ingredient-card">
            <img src="${escapeHtml(ingredient.image)}" alt="${escapeHtml(ingredient.name)}">
            <p>${escapeHtml(ingredient.label || ingredient.name)}</p>
          </div>
        </div>`
    )
    .join("");

  document.getElementById("ingredient-count").textContent = ingredients.length;
}

function renderInstructions(meal) {
  const container = document.getElementById("instructions");
  const instructions = String(meal.strInstructions || "").trim();
  const steps = instructions ? instructions.split(/\n+/) : [];

  container.innerHTML = "";

  if (!steps.length) {
    container.innerHTML = "<li>The author has not added any instructions.</li>";
    return;
  }

  steps.forEach((step) => {
    if (step.trim()) {
      container.innerHTML += `<li>${escapeHtml(step.trim())}</li>`;
    }
  });
}

function renderVideo(meal) {
  const container = document.getElementById("video");
  const fallback = document.getElementById("video-fallback");

  if (!meal || !meal.strYoutube) {
    container.classList.add("d-none");
    fallback.classList.remove("d-none");
    container.src = "";
    return;
  }

  try {
    const url = new URL(meal.strYoutube);
    let videoId = "";

    if (url.searchParams.get("v")) {
      videoId = url.searchParams.get("v");
    } else if (url.hostname.includes("youtu.be")) {
      videoId = url.pathname.slice(1);
    } else if (url.pathname.includes("/shorts/")) {
      videoId = url.pathname.split("/shorts/")[1];
    }

    if (!videoId) throw new Error("Invalid YouTube link");

    container.classList.remove("d-none");
    fallback.classList.add("d-none");
    container.src = `https://www.youtube.com/embed/${videoId}`;
  } catch {
    container.classList.add("d-none");
    fallback.classList.remove("d-none");
    container.src = "";
  }
}

function printDate(meal) {
  const date = meal.dateModified || meal.createdAt || "N/A";
  document.getElementById("date").textContent = `Modified: ${date}`;
  document.getElementById("info-date").textContent = date;
}

function renderSummary(meal) {
  const summary = document.getElementById("recipe-summary");
  const parts = [
    meal.strMeal,
    meal.strArea ? `is a ${meal.strArea.toLowerCase()} recipe` : "is a recipe",
    meal.strCategory ? `from the ${meal.strCategory.toLowerCase()} category` : "",
  ].filter(Boolean);

  summary.textContent = `${parts.join(" ")}. Read the ingredients, follow the steps, and use the video guide if you want a quick visual walkthrough.`;
}

function renderMeal(meal) {
  activeMeal = meal;
  const authorLabel = getMealAuthor(meal);

  document.getElementById("thumbnail").src = meal.strMealThumb || "../static/img/bg.jpg";
  document.getElementById("name").textContent = meal.strMeal;
  document.title = `${meal.strMeal} | Recipe | The Kitchen Archive`;

  document.getElementById("category").textContent = meal.strCategory || "Unknown";
  document.getElementById("area").textContent = meal.strArea || "Unknown";
  document.getElementById("info-category").textContent = meal.strCategory || "Unknown";
  document.getElementById("info-area").textContent = meal.strArea || "Unknown";
  document.getElementById("author").textContent = `Author: ${authorLabel}`;
  document.getElementById("info-author").textContent = authorLabel;

  renderSummary(meal);
  printDate(meal);
  renderIngredients(meal);
  renderInstructions(meal);
  renderVideo(meal);
  updateFavoriteUI();
  updateSaveJsonUI();
  showRecipeMessage(`Ready to save ${meal.strMeal} as JSON.`);
}

function showRecipeMessage(message, isError = false) {
  if (!recipeJsonMessage) return;

  recipeJsonMessage.textContent = message;
  recipeJsonMessage.classList.toggle("text-danger", isError);
  recipeJsonMessage.classList.toggle("text-white-50", !isError);
}

function updateSaveJsonUI() {
  if (!saveJsonButton) return;

  saveJsonButton.disabled = !activeMeal;
}

function handleSaveJson() {
  try {
    if (!activeMeal) {
      throw new Error("Wait for a recipe to load before saving JSON.");
    }

    const recipe = buildDownloadableRecipe(activeMeal);
    downloadRecipeJson(recipe);
    showRecipeMessage(`Saved ${recipe.strMeal} as JSON.`);
  } catch (error) {
    showRecipeMessage(error.message || "Recipe JSON could not be saved.", true);
  }
}

async function loadApiMeal(mealId) {
  const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
  const data = await response.json();
  const meal = data.meals && data.meals[0];

  if (!meal) {
    throw new Error("Recipe not found.");
  }

  return meal;
}

async function loadMeal() {
  try {
    const localMeal = findStoredRecipeById(recipeId || id);

    if (localMeal) {
      renderMeal(localMeal);
      return;
    }

    if (!id) {
      throw new Error("Choose a recipe to view.");
    }

    const meal = await loadApiMeal(id);
    renderMeal(meal);
  } catch (error) {
    updateSaveJsonUI();
    showRecipeMessage(error.message || "Recipe could not be loaded.", true);
  }
}

if (favoriteButton) {
  favoriteButton.addEventListener("click", toggleFavorite);
}

if (saveJsonButton) {
  saveJsonButton.addEventListener("click", handleSaveJson);
}

updateSaveJsonUI();
loadMeal();

function randomMeal() {
  fetch("https://www.themealdb.com/api/json/v1/1/random.php")
    .then((res) => res.json())
    .then((data) => {
      const meal = data.meals[0];
      window.location.href = "meal.html?id=" + meal.idMeal;
    });
}
