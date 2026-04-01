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

document.getElementById("login").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("Email").value;
  const password = document.getElementById("Password").value;

  let users = JSON.parse(localStorage.getItem("users")) || [];

  let user = users.find(
    (u) =>
      (u.email === email || u.username === email) && u.password === password,
  );

  if (!user) {
    showAlert("Invalid email or password", "red");
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));

  window.location.href = "../index.html";
});
