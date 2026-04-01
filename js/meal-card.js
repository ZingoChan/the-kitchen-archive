function buildMealCard(meal, options = {}) {
  const {
    href = "#",
    wrapperClass = "recipe-card",
    imageHeight = "200px",
  } = options;

  return `
    <div class="${wrapperClass}">
      <div class="card text-bg-dark h-100">
        <a href="${href}" class="text-decoration-none text-white d-block h-100">
          <img
            src="${meal.strMealThumb}"
            class="card-img"
            alt="${meal.strMeal}"
            style="height:${imageHeight}; object-fit:cover;"
          >
          <div class="card-img-overlay d-flex flex-column justify-content-end">
            <h6 class="card-title text-white mb-0">${meal.strMeal}</h6>
          </div>
        </a>
      </div>
    </div>
  `;
}
