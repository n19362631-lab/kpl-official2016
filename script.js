import {
  auth,
  provider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "./firebase.js";

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
  modal?.classList.add("show");
  modal?.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal?.classList.remove("show");
  modal?.setAttribute("aria-hidden", "true");
}

loginButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    menu?.classList.remove("show");
    openModal();
  });
});

document.getElementById("closeModal")?.addEventListener("click", closeModal);

document.querySelectorAll("[data-register]").forEach(btn => {
  btn.addEventListener("click", openModal);
});

document.getElementById("menuBtn")?.addEventListener("click", () => {
  menu?.classList.toggle("show");
});

modal?.addEventListener("click", e => {
  if (e.target === modal) closeModal();
});

function setGoogleButtonLoading(loading) {
  if (!googleBtn) return;

  googleBtn.disabled = loading;

  if (loading) {
    googleBtn.innerHTML = "<span>…</span> Signing in…";
  } else {
    googleBtn.innerHTML = "<span>G</span> Continue with Google";
  }
}

function handleLoginSuccess(user) {
  closeModal();

  updateLoginUI(user);

  if (modalText) {
    modalText.textContent =
      `Signed in as ${user.email}. You can now register for KPL tournaments.`;
  }

  if (modalSmall) {
    modalSmall.textContent = "Google account connected successfully.";
  }

  alert(`Welcome, ${user.displayName || "KPL Player"}!`);
}

googleBtn?.addEventListener("click", async () => {
  setGoogleButtonLoading(true);

  try {
    const result = await signInWithPopup(auth, provider);

    if (result?.user) {
      handleLoginSuccess(result.user);
    }

  } catch (error) {
    console.error("Google login error:", error);

    // Mobile browsers often block popup authentication.
    // Automatically fall back to redirect login.
    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/popup-cancelled-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      try {
        await signInWithRedirect(auth, provider);
        return;
      } catch (redirectError) {
        console.error("Redirect login error:", redirectError);
      }
    }

    let message = "Google sign-in failed. Please try again.";

    if (error.code === "auth/unauthorized-domain") {
      message =
        "This domain is not authorized in Firebase. Add kplofficial.online to Firebase Authorized Domains.";
    }

    if (error.code === "auth/operation-not-allowed") {
      message =
        "Google Login is disabled in Firebase. Enable Google sign-in.";
    }

    if (error.code === "auth/network-request-failed") {
      message =
        "Network error. Check your internet connection and try again.";
    }

    alert(message);
    setGoogleButtonLoading(false);
  }
});

// Handles users returning from Google redirect login
getRedirectResult(auth)
  .then(result => {
    if (result?.user) {
      handleLoginSuccess(result.user);
    }
  })
  .catch(error => {
    console.error("Redirect result error:", error);

    if (error.code === "auth/unauthorized-domain") {
      alert(
        "kplofficial.online is not authorized in Firebase Authentication."
      );
    }

    setGoogleButtonLoading(false);
  });

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

window.kplLogout = async () => {
  try {
    await signOut(auth);
    updateLoginUI(null);
  } catch (error) {
    console.error("Logout error:", error);
  }
};

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", () => {
    menu?.classList.remove("show");
  });
});
