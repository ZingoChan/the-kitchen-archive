function showAlert(message, color) {
  const placeholder = document.getElementById("liveAlertPlaceholder");
  placeholder.innerHTML = `
    <div class="alert alert-dismissible fade show" role="alert" style="
      background: transparent;
      border: 1px solid ${color};
      color: ${color};
      box-shadow: 0 0 8px ${color};
    ">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" style="filter: invert(1) sepia(1) saturate(5) hue-rotate(300deg);"></button>
    </div>`;
}

document.getElementById("signup").addEventListener("submit", function (event) {
  event.preventDefault();

  // lay thong tin
  let username = document.getElementById("Username").value;
  let email = document.getElementById("Email").value;
  let password = document.getElementById("Password").value;
  let passwordConfirm = document.getElementById("ConfirmPassword").value;

  // check thong tin
  if (!username || !email || !password || !passwordConfirm) {
    showAlert("Please fill out the form", "red");
    return;
  }

  // check password
  if (password !== passwordConfirm) {
    showAlert("Passwords do not match", "red");
    return;
  }

  // gui thong tin len server
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // check reg
  for (let index = 0; index < users.length; index++) {
    if (users[index].username === username) {
      showAlert("Username already exists", "yellow");
      return;
    }
  }

  // Random
  let UUID = crypto.randomUUID();
  currentUser = {
    username: username,
    profile_name: username,
    email: email,
    password: password,
    uuid: UUID,
    favorites: [],
    pfp: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
    creations: [],
    bio: "",
    location: "",                                                
    website: "",
    social_media: [],
  };

  users.push(currentUser);

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  window.location.href = "../index.html";
  setTimeout(() => (window.location.href = "login.html"), 1500);
});
