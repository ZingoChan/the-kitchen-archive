let currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (currentUser) {
  document.getElementById("auth-links-login").classList.add("d-none");
  document.getElementById("auth-links-register").classList.add("d-none");
  document.getElementById("user-area").classList.remove("d-none");

  document.getElementById("nav-username").textContent = currentUser.username;

  const pfp = document.getElementById("nav-pfp");
  pfp.src =
    currentUser.pfp ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=random`;
}
