import {
  auth,
  db,
  provider,
  signInWithPopup,
  onAuthStateChanged
} from "./firebase.js";

import {
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ===============================
// ELEMENTS
// ===============================

const loginBtn = document.getElementById("loginBtn");
const mobileLoginBtn = document.getElementById("mobileLoginBtn");
const heroLogin = document.getElementById("heroLogin");

const loginModal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");
const googleBtn = document.getElementById("googleBtn");

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");


// ===============================
// LOGIN MODAL
// ===============================

function openLogin() {
  if (!loginModal) return;

  loginModal.classList.add("active");
  loginModal.setAttribute("aria-hidden", "false");
}

function closeLogin() {
  if (!loginModal) return;

  loginModal.classList.remove("active");
  loginModal.setAttribute("aria-hidden", "true");
}


loginBtn?.addEventListener("click", openLogin);
mobileLoginBtn?.addEventListener("click", openLogin);
heroLogin?.addEventListener("click", openLogin);

closeModal?.addEventListener("click", closeLogin);


loginModal?.addEventListener("click", (event) => {
  if (event.target === loginModal) {
    closeLogin();
  }
});


// ===============================
// GOOGLE LOGIN
// ===============================

googleBtn?.addEventListener("click", async () => {

  try {

    googleBtn.disabled = true;
    googleBtn.innerHTML = "Signing in...";

    const result =
      await signInWithPopup(
        auth,
        provider
      );

    if (result.user) {

      closeLogin();

      // Registration page
      window.location.href =
        "registration.html";

    }

  } catch (error) {

    console.error(error);

    alert(
      "Google login failed. Please try again."
    );

    googleBtn.disabled = false;

    googleBtn.innerHTML =
      '<span>G</span> Continue with Google';

  }

});


// ===============================
// AUTH STATE
// ===============================

onAuthStateChanged(auth, (user) => {

  if (!user) {

    if (loginBtn) {
      loginBtn.textContent =
        "Login / Register";
    }

    return;
  }


  if (loginBtn) {
    loginBtn.textContent =
      "Register Now";
  }


  if (mobileLoginBtn) {
    mobileLoginBtn.textContent =
      "Register Now";
  }

});


// ===============================
// MOBILE MENU
// ===============================

menuBtn?.addEventListener("click", () => {

  mobileMenu?.classList.toggle("active");

});


mobileMenu
  ?.querySelectorAll("a")
  .forEach((link) => {

    link.addEventListener("click", () => {

      mobileMenu.classList.remove(
        "active"
      );

    });

  });


// ===============================
// FIRESTORE LIVE SETTINGS
// ===============================

const settingsRef =
  doc(
    db,
    "siteSettings",
    "main"
  );


onSnapshot(
  settingsRef,
  (snapshot) => {

    if (!snapshot.exists()) {

      console.log(
        "siteSettings/main not found yet."
      );

      return;
    }


    const data =
      snapshot.data();


    console.log(
      "KPL settings updated:",
      data
    );


    // -------------------------------
    // WEBSITE LOGO
    // -------------------------------

    if (data.websiteLogo) {

      document
        .querySelectorAll(
          ".brand-mark"
        )
        .forEach((element) => {

          element.innerHTML =
            `<img src="${data.websiteLogo}" alt="KPL">`;

        });

    }


    // -------------------------------
    // WEBSITE NAME
    // -------------------------------

    if (data.websiteName) {

      document
        .querySelectorAll(
          ".brand b"
        )
        .forEach((element) => {

          element.textContent =
            data.websiteName;

        });

    }


    // -------------------------------
    // FOOTBALL TOURNAMENT
    // -------------------------------

    if (data.football) {

      const football =
        data.football;


      const card =
        document.querySelector(
          ".football-card"
        );

      if (card) {

        const title =
          card.querySelector("b");

        const small =
          card.querySelector("small");

        if (title && football.name) {
          title.textContent =
            football.name;
        }

        if (small && football.status) {
          small.textContent =
            football.status;
        }

      }


      const tournamentCards =
        document.querySelectorAll(
          ".tournament-card"
        );


      if (
        tournamentCards[0] &&
        football.name
      ) {

        const title =
          tournamentCards[0]
            .querySelector("h3");

        if (title) {
          title.textContent =
            football.name;
        }

      }

    }


    // -------------------------------
    // CRICKET TOURNAMENT
    // -------------------------------

    if (data.cricket) {

      const cricket =
        data.cricket;


      const cards =
        document.querySelectorAll(
          ".tournament-card"
        );


      if (
        cards[1] &&
        cricket.name
      ) {

        const title =
          cards[1].querySelector("h3");

        if (title) {
          title.textContent =
            cricket.name;
        }

      }

    }


    // -------------------------------
    // CONTACT
    // -------------------------------

    if (data.contact) {

      document
        .querySelectorAll(
          "[data-contact]"
        )
        .forEach((element) => {

          element.textContent =
            data.contact;

        });

    }


    // -------------------------------
    // UPI ID
    // -------------------------------

    if (data.upiId) {

      document
        .querySelectorAll(
          "[data-upi]"
        )
        .forEach((element) => {

          element.textContent =
            data.upiId;

        });

    }

  },

  (error) => {

    console.error(
      "Firestore settings error:",
      error
    );

  }
);


// ===============================
// REGISTER BUTTONS
// ===============================

document
  .querySelectorAll(
    "[data-register]"
  )
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        if (!auth.currentUser) {

          openLogin();

          return;
        }


        window.location.href =
          "registration.html";

      }
    );

  });
