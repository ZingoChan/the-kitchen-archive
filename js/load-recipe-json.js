function setupRecipeJsonLoader(options) {
  const {
    input,
    message,
    normalizeRecipe,
    saveRecipe,
    redirectTo,
  } = options || {};

  if (!input) {
    return;
  }

  function showMessage(text, isError) {
    if (!message) {
      return;
    }

    message.textContent = text;
    message.classList.toggle("text-danger", Boolean(isError));
    message.classList.toggle("text-white-50", !isError);
  }

  input.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ""));
        const recipe = normalizeRecipe(parsed);

        saveRecipe(recipe);
        showMessage(`Loaded ${recipe.strMeal} from ${file.name}.`, false);
        window.location.href = redirectTo(recipe);
      } catch (error) {
        showMessage(error.message || "That JSON file could not be loaded.", true);
      }
    };

    reader.onerror = () => {
      showMessage("That JSON file could not be read.", true);
    };

    reader.readAsText(file);
  });
}

window.setupRecipeJsonLoader = setupRecipeJsonLoader;
