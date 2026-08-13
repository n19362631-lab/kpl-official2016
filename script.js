import {
  auth, provider, signInWithPopup, onAuthStateChanged, signOut
} from "./firebase.js";

const modal = document.getElementById("loginModal");
const menu = document.getElementById("mobileMenu");
const loginButtons = [
  document.getElementById("loginBtn"),
  document.getElementById("mobileLoginBtn"),
  document.getElementById("heroLogin")
].filter(Boolean);

function openModal(){
  modal.classList.add("show");
  modal.setAttribute("aria-hidden","false");
}
function closeModal(){
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden","true");
}

loginButtons.forEach(btn => btn.addEventListener("click", () => {
  menu?.classList.remove("show");
  openModal();
}));

document.getElementById("closeModal")?.addEventListener("click", closeModal);
document.querySelectorAll("[data-register]").forEach(b => b.addEventListener("click", openModal));
document.getElementById("menuBtn")?.addEventListener("click", () => menu?.classList.toggle("show"));
modal?.addEventListener("click", e => { if(e.target === modal) closeModal(); });

const googleBtn = document.getElementById("googleBtn");
const modalText = document.querySelector(".modal-box p");
const modalSmall = document.querySelector(".modal-box small");

googleBtn?.addEventListener("click", async () => {
  googleBtn.disabled = true;
  googleBtn.innerHTML = "<span>…</span> Signing in…";
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    closeModal();
    updateLoginUI(user);
    alert(`Welcome, ${user.displayName || "KPL player"}!`);
  } catch (error) {
    console.error(error);
    let message = "Google sign-in failed. Please try again.";
    if (error.code === "auth/popup-closed-by-user") message = "Sign-in window was closed.";
    if (error.code === "auth/unauthorized-domain") message = "This website domain is not authorized in Firebase yet.";
    alert(message);
  } finally {
    googleBtn.disabled = false;
    googleBtn.innerHTML = "<span>G</span> Continue with Google";
  }
});

function updateLoginUI(user){
  loginButtons.forEach(btn => {
    if (user) {
      btn.textContent = user.displayName ? user.displayName.split(" ")[0] : "Account";
      btn.title = "Signed in as " + user.email;
    } else {
      btn.textContent = "Login / Register";
    }
  });
}

onAuthStateChanged(auth, user => {
  updateLoginUI(user);
  if (user) {
    if (modalText) modalText.textContent = `Signed in as ${user.email}. Your KPL tournament dashboard will be available here.`;
    if (modalSmall) modalSmall.textContent = "Google account connected successfully.";
  }
});

window.kplLogout = async () => {
  await signOut(auth);
  updateLoginUI(null);
};

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", () => menu?.classList.remove("show"));
});
