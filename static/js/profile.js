if (!currentUser) {
  window.location.href = "login.html";
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function renderFavoriteMeals(favorites) {
  const pinnedRecipes = document.getElementById("pinned-recipes");

  if (!favorites.length) {
    pinnedRecipes.innerHTML = `
      <div class="col-12">
        <div class="card bg-dark border-secondary text-white-50 p-4">
          No favorite meals yet. Open a recipe and tap "Favorite This Meal" to save one here.
        </div>
      </div>
    `;
    return;
  }

  // pinnedRecipes.innerHTML = favorites
  //   .map(
  //     (meal) => `
  //       <div class="col-md-6 col-xl-4">
  //         <a href="meal.html?id=${meal.idMeal}" class="text-decoration-none">
  //           <div class="card h-100 bg-dark border-secondary text-white overflow-hidden">
  //             <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}" style="height: 220px; object-fit: cover;">
  //             <div class="card-body">
  //               <h6 class="card-title mb-2">${meal.strMeal}</h6>
  //               <div class="d-flex flex-wrap gap-2">
  //                 <span class="badge bg-warning text-dark">${meal.strCategory || "Unknown"}</span>
  //                 <span class="badge bg-info">${meal.strArea || "Unknown"}</span>
  //               </div>
  //             </div>
  //           </div>
  //         </a>
  //       </div>
  //     `
  //   )
  //   .join("");

  pinnedRecipes.innerHTML = favorites
    .map((meal) =>
      buildMealCard(meal, {
        href: `meal.html?id=${meal.idMeal}`,
        wrapperClass: "col-md-6 col-xl-4",
      })
    )
    .join("");
}

function renderProfile() {
  const freshUser = getCurrentUser();

  if (!freshUser) {
    window.location.href = "login.html";
    return;
  }

  const favorites = freshUser.favorites || [];
  const mini = document.getElementById("extra-info");
  const highlights = document.getElementById("profile-highlights");
  const joinedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  document.getElementById("profile-username").textContent = `@${freshUser.username}`;
  document.getElementById("profile-display-name").textContent =
    freshUser.profile_name || freshUser.username;
  document.getElementById("profile-bio").textContent = freshUser.bio || "No bio here.";
  document.getElementById("profile-pfp").src =
    freshUser.pfp ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(freshUser.username)}&background=random`;

  mini.innerHTML = "";

  if (freshUser.location) {
    mini.innerHTML += `<li class="mb-1">Location: ${freshUser.location}</li>`;
  }

  if (freshUser.website) {
    mini.innerHTML += `<li class="mb-1">Website: <a href="${freshUser.website}" class="text-info" target="_blank" rel="noopener noreferrer">${freshUser.website}</a></li>`;
  }

  if (!mini.innerHTML) {
    mini.innerHTML = `<li class="mb-1">Add a location or website to personalize your profile.</li>`;
  }

  document.getElementById("profile-followers").textContent = "0";
  document.getElementById("profile-following").textContent = "0";
  document.getElementById("stat-recipes").textContent = (freshUser.creations || []).length;
  document.getElementById("stat-favorites").textContent = favorites.length;
  document.getElementById("stat-reviews").textContent = "0";
  document.getElementById("contribution-count").textContent = (freshUser.creations || []).length;

  highlights.innerHTML = `
    <li class="mb-1">Member since ${joinedDate}</li>
    <li class="mb-1">${favorites.length} favorite meal${favorites.length === 1 ? "" : "s"} saved</li>
  `;

  renderFavoriteMeals(favorites);
}

renderProfile();







// document.getElementById("nav-username").textContent = currentUser.username;
// document.getElementById("nav-pfp").src = currentUser.pfp;

// document.getElementById("username").value = currentUser.username;
// document.getElementById("email").value = currentUser.email;
// document.getElementById("photo").value = currentUser.pfp;

// function updatePreview() {
//   document.getElementById("preview-name").textContent =
//     document.getElementById("username").value;

//   document.getElementById("preview-email").textContent =
//     document.getElementById("email").value;

//   document.getElementById("preview-pfp").src =
//     document.getElementById("photo").value;
// }

// updatePreview();

// document.getElementById("username").addEventListener("input", updatePreview);
// document.getElementById("email").addEventListener("input", updatePreview);
// document.getElementById("photo").addEventListener("input", updatePreview);

// document
//   .getElementById("profile-form")
//   .addEventListener("submit", function (e) {
//     e.preventDefault();

//     let updatedUser = {
//       username: document.getElementById("username").value,
//       email: document.getElementById("email").value,
//       password: currentUser.password,
//       pfp: document.getElementById("photo").value,
//     };

//     let users = JSON.parse(localStorage.getItem("users")) || [];

//     for (let i = 0; i < users.length; i++) {
//       if (users[i].email === currentUser.email) {
//         users[i] = updatedUser;
//         break;
//       }
//     }

//     localStorage.setItem("users", JSON.stringify(users));
//     localStorage.setItem("currentUser", JSON.stringify(updatedUser));

//     alert("Profile updated successfully!");

//     window.location.reload();
//   });
