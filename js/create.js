const DEFAULT_MEAL_THUMBNAIL = "../static/img/bg.jpg";
const DEFAULT_INGREDIENT_THUMBNAIL = "../static/img/logo-white.png";

function getExampleThumbnailForIngredient(ingredientName) {
  const cleanIngredientName = String(ingredientName || "").trim();

  if (!cleanIngredientName) {
    return "";
  }

  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(
    cleanIngredientName
  )}-Small.png`;
}

function showCreateAlert(message, color) {
  const placeholder = document.getElementById("createAlertPlaceholder");

  if (!placeholder) {
    return;
  }

  placeholder.innerHTML = `
    <div class="alert alert-dismissible fade show mb-0" role="alert" style="
      background: transparent;
      border: 1px solid ${color};
      color: ${color};
      box-shadow: 0 0 8px ${color};
    ">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" style="filter: invert(1) sepia(1) saturate(5) hue-rotate(300deg);"></button>
    </div>
  `;
}

function ingredientRowTemplate() {
  return `
    <div class="ingredient-row ui-item-card">
      <div class="ui-ingredient-card">
        <div class="ui-ingredient-card-head">
          <div>
            <p class="ui-kicker ui-kicker-soft mb-1">Ingredient line</p>
            <h6 class="mb-0">Ingredient details</h6>
          </div>
          <button class="btn btn-outline-danger ui-icon-button ui-remove-button" type="button" onclick="removeRow(this)" aria-label="Remove ingredient">
            <i class="bi bi-trash3" aria-hidden="true"></i>
          </button>
        </div>

        <div class="ui-ingredient-card-body">
          <div class="ui-ingredient-preview-panel">
            <div class="ui-inline-media-preview-wrap ui-ingredient-preview-wrap">
              <img class="ui-inline-media-preview ingredient-thumb-preview" src="${DEFAULT_INGREDIENT_THUMBNAIL}" alt="Ingredient thumbnail preview">
            </div>
            <span class="ui-ingredient-status ingredient-thumb-status">No image</span>
          </div>

          <div class="ui-ingredient-fields">
            <div class="row g-3">
              <div class="col-md-12">
                <label class="form-label">Upload Thumbnail</label>
                <input type="file" class="form-control ui-input ingredient-image-file" accept="image/*">
              </div>
              <div class="col-md-12">
                <label class="form-label">Image Link</label>
                <input type="url" class="form-control ui-input ingredient-image-url" placeholder="https://example.com/ingredient.png">
              </div>
              <div class="col-sm-3">
                <label class="form-label">Amount</label>
                <input type="number" class="form-control ui-input ingredient-amount-input" placeholder="1" min="0" step="any">
              </div>
              <div class="col-sm-4">
                <label class="form-label">Measurement</label>
                <select class="form-select ui-input ui-select ingredient-unit-input">
                  <option value="">Unit</option>
                  <option>tsp</option>
                  <option>tbsp</option>
                  <option>cup</option>
                  <option>ml</option>
                  <option>g</option>
                  <option>kg</option>
                  <option>pcs</option>
                </select>
              </div>
              <div class="col-sm-5">
                <label class="form-label">Ingredient</label>
                <input type="text" class="form-control ui-input ingredient-name-input" placeholder="Ingredient">
              </div>
            </div>

            <p class="ui-help-text mb-0">Upload a file or paste an image link. If you skip both, we'll use the ingredient preview when available.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function setIngredientPreview(row, src, statusText) {
  const preview = row.querySelector(".ingredient-thumb-preview");
  const status = row.querySelector(".ingredient-thumb-status");

  if (preview) {
    preview.src = src || DEFAULT_INGREDIENT_THUMBNAIL;
  }

  if (status) {
    status.textContent = statusText;
  }
}

function refreshIngredientPreview(row) {
  const imageUrlInput = row.querySelector(".ingredient-image-url");
  const ingredientNameInput = row.querySelector(".ingredient-name-input");
  const customUrl = imageUrlInput ? imageUrlInput.value.trim() : "";
  const ingredientName = ingredientNameInput ? ingredientNameInput.value.trim() : "";
  const uploadedImage = typeof row._uploadedIngredientImage === "string"
    ? row._uploadedIngredientImage
    : "";

  if (customUrl) {
    setIngredientPreview(row, customUrl, "Image link");
    return;
  }

  if (uploadedImage) {
    setIngredientPreview(row, uploadedImage, "Uploaded image");
    return;
  }

  const generatedPreview = getExampleThumbnailForIngredient(ingredientName);

  if (generatedPreview) {
    setIngredientPreview(row, generatedPreview, "Ingredient preview");
    return;
  }

  setIngredientPreview(row, DEFAULT_INGREDIENT_THUMBNAIL, "No image");
}

function bindIngredientRow(row) {
  const imageUrlInput = row.querySelector(".ingredient-image-url");
  const imageFileInput = row.querySelector(".ingredient-image-file");
  const ingredientNameInput = row.querySelector(".ingredient-name-input");
  const preview = row.querySelector(".ingredient-thumb-preview");

  if (preview) {
    preview.addEventListener("error", () => {
      const ingredientName = ingredientNameInput ? ingredientNameInput.value.trim() : "";
      const generatedPreview = getExampleThumbnailForIngredient(ingredientName);
      const shouldUseGeneratedPreview =
        imageUrlInput &&
        imageUrlInput.value.trim() &&
        generatedPreview &&
        preview.currentSrc !== generatedPreview;

      if (shouldUseGeneratedPreview) {
        if (imageUrlInput) {
          imageUrlInput.value = "";
        }

        refreshIngredientPreview(row);
        return;
      }

      delete row._uploadedIngredientImage;
      setIngredientPreview(row, DEFAULT_INGREDIENT_THUMBNAIL, "No image");
    });
  }

  if (imageUrlInput) {
    imageUrlInput.addEventListener("input", () => {
      if (imageUrlInput.value.trim() && imageFileInput) {
        imageFileInput.value = "";
        delete row._uploadedIngredientImage;
      }

      refreshIngredientPreview(row);
    });
  }

  if (imageFileInput) {
    imageFileInput.addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];

      if (!file) {
        delete row._uploadedIngredientImage;
        refreshIngredientPreview(row);
        return;
      }

      if (imageUrlInput) {
        imageUrlInput.value = "";
      }

      const reader = new FileReader();
      reader.onload = () => {
        row._uploadedIngredientImage = String(reader.result || "");
        refreshIngredientPreview(row);
      };
      reader.readAsDataURL(file);
    });
  }

  if (ingredientNameInput) {
    ingredientNameInput.addEventListener("input", () => {
      refreshIngredientPreview(row);
    });
  }

  refreshIngredientPreview(row);
}

function bindMealThumbnailControls() {
  const fileInput = document.getElementById("meal-thumbnail-file");
  const preview = document.getElementById("mealThumbnailPreview");
  const previewCard = document.getElementById("mealThumbnailPreviewCard");

  if (!fileInput || !preview || !previewCard) {
    return;
  }

  function setMealPreview(src, isVisible) {
    preview.src = src || DEFAULT_MEAL_THUMBNAIL;
    previewCard.classList.toggle("d-none", !isVisible);
  }

  preview.addEventListener("error", () => {
    setMealPreview(DEFAULT_MEAL_THUMBNAIL, false);
  });

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];

    if (!file) {
      setMealPreview(DEFAULT_MEAL_THUMBNAIL, false);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setMealPreview(reader.result, true);
    };
    reader.readAsDataURL(file);
  });

  setMealPreview(DEFAULT_MEAL_THUMBNAIL, false);
}

function updateIngredientCount() {
  const count = document.querySelectorAll("#ingredientsList .ingredient-row").length;
  document.getElementById("ingredientsCount").textContent = count;
  document.getElementById("ingredientsCountLabel").textContent = `ingredient line${count === 1 ? "" : "s"}`;
}

function addRow() {
  document.getElementById("ingredientsList").insertAdjacentHTML("beforeend", ingredientRowTemplate());
  bindIngredientRow(document.querySelector("#ingredientsList .ingredient-row:last-child"));
  updateIngredientCount();
}

function removeRow(button) {
  const rows = document.querySelectorAll("#ingredientsList .ingredient-row");

  if (rows.length === 1) {
    rows[0].querySelectorAll("input").forEach((input) => {
      input.value = "";
    });

    delete rows[0]._uploadedIngredientImage;

    const select = rows[0].querySelector("select");
    if (select) {
      select.selectedIndex = 0;
    }

    refreshIngredientPreview(rows[0]);
    return;
  }

  button.closest(".ingredient-row").remove();
  updateIngredientCount();
}

function collectIngredients() {
  return Array.from(document.querySelectorAll("#ingredientsList .ingredient-row"))
    .map((row) => {
      const amount = row.querySelector(".ingredient-amount-input")?.value.trim() || "";
      const unit = row.querySelector(".ingredient-unit-input")?.value.trim() || "";
      const name = row.querySelector(".ingredient-name-input")?.value.trim() || "";
      const customImageUrl = row.querySelector(".ingredient-image-url")?.value.trim() || "";
      const uploadedImage = typeof row._uploadedIngredientImage === "string"
        ? row._uploadedIngredientImage
        : "";
      const image = customImageUrl || uploadedImage || getExampleThumbnailForIngredient(name);

      return {
        amount,
        unit,
        name,
        image,
      };
    })
    .filter((ingredient) => ingredient.name);
}

function buildRecipePayload() {
  const mealName = document.getElementById("recipe-name").value.trim();
  const description = document.getElementById("recipe-description")?.value.trim() || "";
  const instructions = document.getElementById("recipe-instructions").value.trim();
  const videoTutorial = document.getElementById("recipe-video").value.trim();
  const mealThumbnail = document.getElementById("mealThumbnailPreview").src;
  const ingredients = collectIngredients();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  return {
    idMeal: crypto.randomUUID(),
    strMeal: mealName,
    strMealThumb: mealThumbnail === DEFAULT_MEAL_THUMBNAIL ? "" : mealThumbnail,
    strDescription: description,
    strYoutube: videoTutorial,
    strInstructions: instructions,
    ingredients,
    author: currentUser ? currentUser.username : "unknown",
    authorUuid: currentUser ? currentUser.uuid : "",
    createdAt: new Date().toISOString(),
  };
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

function saveRecipeToLibrary(recipe) {
  const existingRecipes = JSON.parse(localStorage.getItem(RECIPE_LIBRARY_KEY)) || [];
  const updatedRecipes = existingRecipes.filter((entry) => entry.idMeal !== recipe.idMeal);

  updatedRecipes.unshift({
    ...recipe,
    recipeSource: "custom",
  });

  localStorage.setItem(RECIPE_LIBRARY_KEY, JSON.stringify(updatedRecipes));
}

function saveRecipeToUser(recipe) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const users = JSON.parse(localStorage.getItem("users")) || [];

  if (!currentUser) {
    throw new Error("You need to log in before saving a recipe.");
  }

  const updatedUser = {
    ...currentUser,
    creations: [...(currentUser.creations || []), recipe],
  };

  const updatedUsers = users.map((user) =>
    user.uuid === updatedUser.uuid ? updatedUser : user,
  );
  const userExists = updatedUsers.some((user) => user.uuid === updatedUser.uuid);

  if (!userExists) {
    updatedUsers.push(updatedUser);
  }

  localStorage.setItem("users", JSON.stringify(updatedUsers));
  localStorage.setItem("currentUser", JSON.stringify(updatedUser));
}

function validateRecipe(recipe) {
  if (!recipe.strMeal) {
    return "Recipe name is required.";
  }

  if (!recipe.strInstructions) {
    return "Instructions are required.";
  }

  if (!recipe.ingredients.length) {
    return "Add at least one ingredient.";
  }

  return "";
}

function resetCreateForm() {
  document.getElementById("create-recipe").reset();
  document.getElementById("mealThumbnailPreview").src = DEFAULT_MEAL_THUMBNAIL;
  document.getElementById("mealThumbnailPreviewCard")?.classList.add("d-none");
  const ingredientList = document.getElementById("ingredientsList");

  ingredientList.innerHTML = ingredientRowTemplate();
  bindIngredientRow(ingredientList.querySelector(".ingredient-row"));
  updateIngredientCount();
}

function bindCreateForm() {
  const form = document.getElementById("create-recipe");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    try {
      const recipe = buildRecipePayload();
      const validationError = validateRecipe(recipe);

      if (validationError) {
        showCreateAlert(validationError, "red");
        return;
      }

      saveRecipeToUser(recipe);
      saveRecipeToLibrary(recipe);
      downloadRecipeJson(recipe);
      resetCreateForm();
      showCreateAlert("Recipe saved to your creations and downloaded as JSON.", "#f3b33d");
      setTimeout(() => {
        window.location.href = `meal.html?recipe=${encodeURIComponent(recipe.idMeal)}`;
      }, 500);
    } catch (error) {
      showCreateAlert(error.message || "Something went wrong while saving the recipe.", "red");
    }
  });
}

bindMealThumbnailControls();
document.querySelectorAll("#ingredientsList .ingredient-row").forEach(bindIngredientRow);
bindCreateForm();
updateIngredientCount();

window.addRow = addRow;
window.removeRow = removeRow;
