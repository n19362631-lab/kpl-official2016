    import {
  auth,
  provider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "./firebase.js";

import {
  signInWithRedirect,
  getRedirectResult
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const modal = document.getElementById("loginModal");
const menu = document.getElementById("mobileMenu");

const loginButtons = [
  document.getElementById("loginBtn"),
  document.getElementById("mobileLoginBtn"),
  document.getElementById("heroLogin")
].filter(Boolean);

const googleBtn = document.getElementById("googleBtn");
const modalText = document.querySelector(".modal-box p");
const modalSmall = document.querySelector(".modal-box small");

function openModal() {
  if (!modal) return;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

function updateLoginUI(user) {
  loginButtons.forEach(btn => {
    if (user) {
      btn.textContent = user.displayName
        ? user.displayName.split(" ")[0]
        : "Account";

      btn.title = "Signed in as " + user.email;
    } else {
      btn.textContent = "Login / Register";
      btn.title = "";
    }
  });
}

function setGoogleButton(text, disabled = false) {
  if (!googleBtn) return;

  googleBtn.disabled = disabled;
  googleBtn.innerHTML = `<span>G</span> ${text}`;
}

function loginSuccess(user) {
  if (!user) return;

  closeModal();
  updateLoginUI(user);

  if (modalText) {
    modalText.textContent =
      `Signed in as ${user.email}. You can now register for KPL tournaments.`;
  }

  if (modalSmall) {
    modalSmall.textContent =
      "Google account connected successfully.";
  }

  setGoogleButton("Continue with Google", false);
}

loginButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    menu?.classList.remove("show");
    openModal();
  });
});

document.getElementById("closeModal")?.addEventListener("click", closeModal);

document.querySelectorAll("[data-register]").forEach(btn => {
  btn.addEventListener("click", () => {

    const user = auth.currentUser;

    if (user) {
      // User already logged in
      window.location.href = "register.html";
    } else {
      // User not logged in
      openModal();
    }

  });
});

document.getElementById("menuBtn")?.addEventListener("click", () => {
  menu?.classList.toggle("show");
});

modal?.addEventListener("click", e => {
  if (e.target === modal) closeModal();
});


/* GOOGLE LOGIN */
googleBtn?.addEventListener("click", async () => {

  setGoogleButton("Signing in...", true);

  try {
    /*
      First try normal popup login.
    */
    const result = await signInWithPopup(auth, provider);

    if (result?.user) {
      loginSuccess(result.user);
    }

  } catch (error) {

    console.error("Google popup login error:", error);

    /*
      If popup doesn't work on mobile/browser,
      automatically use Google redirect login.
    */

    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/popup-cancelled-by-user" ||
      error.code === "auth/cancelled-popup-request" ||
      error.code === "auth/operation-not-supported-in-this-environment"
    ) {

      try {
        await signInWithRedirect(auth, provider);
        return;

      } catch (redirectError) {

        console.error(
          "Google redirect login error:",
          redirectError
        );

        setGoogleButton("Continue with Google", false);

        alert(
          "Google login start nahi ho paya. Please try again."
        );

        return;
      }
    }

    let message =
      "Google sign-in failed. Please try again.";

    if (error.code === "auth/unauthorized-domain") {
      message =
        "kplofficial.online Firebase Authorized Domains mein add nahi hai.";
    }

    if (error.code === "auth/operation-not-allowed") {
      message =
        "Firebase mein Google Login enabled nahi hai.";
    }

    if (error.code === "auth/network-request-failed") {
      message =
        "Internet connection problem. Please try again.";
    }

    alert(message);

    setGoogleButton("Continue with Google", false);
  }
});


/*
  Handles Google redirect result
  when user returns to kplofficial.online
*/

getRedirectResult(auth)
  .then(result => {

    if (result?.user) {
      loginSuccess(result.user);
    }

  })
  .catch(error => {

    console.error(
      "Google redirect result error:",
      error
    );

    if (error.code === "auth/unauthorized-domain") {
      alert(
        "kplofficial.online Firebase Authorized Domains mein add nahi hai."
      );
    }

    setGoogleButton("Continue with Google", false);
  });


/*
  Firebase authentication state
*/

onAuthStateChanged(auth, user => {

  updateLoginUI(user);

  if (user) {

    if (modalText) {
      modalText.textContent =
        `Signed in as ${user.email}. You can now register for KPL tournaments.`;
    }

    if (modalSmall) {
      modalSmall.textContent =
        "Google account connected successfully.";
    }
  }
});


/*
  Logout
*/

window.kplLogout = async () => {

  try {

    await signOut(auth);

    updateLoginUI(null);

  } catch (error) {

    console.error("Logout error:", error);

  }
};


/*
  Close mobile menu after navigation
*/

document.querySelectorAll('a[href^="#"]').forEach(a => {

  a.addEventListener("click", () => {
    menu?.classList.remove("show");
  });

});
