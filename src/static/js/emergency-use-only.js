function createBase() {
  localStorage.setItem("users", JSON.stringify([]));
  localStorage.setItem("currentUser", JSON.stringify({}));
}

function clearBase() {
  localStorage.removeItem("users");
  localStorage.removeItem("currentUser");
}

function clearStroage() {
  localStorage.clear();
}