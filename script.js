import {
  auth,
  db,
  provider,
  signInWithPopup,
  onAuthStateChanged
} from "./firebase.js";

import {
  doc,
  onSnapshot,
  collection
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ================================
// LOGIN
// ================================

const loginBtn = document.getElementById("loginBtn");
const mobileLoginBtn = document.getElementById("mobileLoginBtn");
const heroLogin = document.getElementById("heroLogin");

const loginModal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");
const googleBtn = document.getElementById("googleBtn");

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");


function openLogin() {
  loginModal?.classList.add("active");
  loginModal?.setAttribute("aria-hidden", "false");
}

function closeLogin() {
  loginModal?.classList.remove("active");
  loginModal?.setAttribute("aria-hidden", "true");
}


loginBtn?.addEventListener("click", openLogin);
mobileLoginBtn?.addEventListener("click", openLogin);
heroLogin?.addEventListener("click", openLogin);

closeModal?.addEventListener("click", closeLogin);


loginModal?.addEventListener("click", (e) => {
  if (e.target === loginModal) {
    closeLogin();
  }
});


// ================================
// GOOGLE LOGIN
// ================================

googleBtn?.addEventListener("click", async () => {

  try {

    googleBtn.disabled = true;
    googleBtn.innerHTML = "Signing in...";

    const result =
      await signInWithPopup(auth, provider);

    if (result.user) {

      closeLogin();

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
      "<span>G</span> Continue with Google";

  }

});


// ================================
// AUTH
// ================================

onAuthStateChanged(auth, (user) => {

  if (user) {

    if (loginBtn) {
      loginBtn.textContent =
        "Register Now";
    }

    if (mobileLoginBtn) {
      mobileLoginBtn.textContent =
        "Register Now";
    }

  } else {

    if (loginBtn) {
      loginBtn.textContent =
        "Login / Register";
    }

    if (mobileLoginBtn) {
      mobileLoginBtn.textContent =
        "Login / Register";
    }

  }

});


// ================================
// MOBILE MENU
// ================================

menuBtn?.addEventListener("click", () => {
  mobileMenu?.classList.toggle("active");
});

mobileMenu
  ?.querySelectorAll("a")
  .forEach((link) => {

    link.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
    });

  });


// ================================
// HELPERS
// ================================

function safe(value) {

  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function formatDate(value) {

  if (!value) return "";

  const date =
    new Date(value);

  if (isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


// ================================
// LIVE WEBSITE SETTINGS
// ADMIN LOCATION:
// settings/site
// ================================

const settingsRef =
  doc(db, "settings", "site");


onSnapshot(
  settingsRef,

  (snapshot) => {

    if (!snapshot.exists()) {

      console.log(
        "KPL settings/site not found."
      );

      return;
    }


    const data =
      snapshot.data();


    console.log(
      "🔥 LIVE KPL SETTINGS:",
      data
    );


    // ----------------------------
    // WEBSITE NAME
    // ----------------------------

    if (data.siteName) {

      document.title =
        data.siteName +
        " | Football & Cricket";

    }


    // ----------------------------
    // WEBSITE LOGO
    // ----------------------------

    if (data.logoUrl) {

      document
        .querySelectorAll(".brand-mark")
        .forEach((element) => {

          element.innerHTML = "";

          const img =
            document.createElement("img");

          img.src =
            data.logoUrl;

          img.alt =
            "KPL Official";

          img.style.width =
            "100%";

          img.style.height =
            "100%";

          img.style.objectFit =
            "contain";

          element.appendChild(img);

        });

    }


    // ----------------------------
    // WEBSITE BANNER
    // ----------------------------

    if (data.bannerUrl) {

      document
        .querySelectorAll(".hero-visual")
        .forEach((element) => {

          element.style.backgroundImage =
            `url("${data.bannerUrl}")`;

          element.style.backgroundSize =
            "cover";

          element.style.backgroundPosition =
            "center";

        });

    }


    // ----------------------------
    // UPI
    // ----------------------------

    window.KPL_SETTINGS = data;

  },

  (error) => {

    console.error(
      "❌ Settings error:",
      error
    );

  }
);


// ================================
// LIVE TOURNAMENTS
// ADMIN LOCATION:
// tournaments
// ================================

const tournamentsRef =
  collection(db, "tournaments");


onSnapshot(
  tournamentsRef,

  (snapshot) => {

    const grid =
      document.querySelector(
        ".tournament-grid"
      );

    if (!grid) return;


    grid.innerHTML = "";


    if (snapshot.empty) {

      grid.innerHTML = `
        <div class="empty-card">
          <div class="empty-icon">🏆</div>
          <h3>No tournaments yet</h3>
          <p>New KPL tournaments will appear here.</p>
        </div>
      `;

      return;
    }


    snapshot.forEach((item) => {

      const data =
        item.data();


      const sport =
        data.sport || "Football";


      const isCricket =
        sport.toLowerCase()
          .includes("cricket");


      const icon =
        isCricket
          ? "🏏"
          : "⚽";


      const image =
        data.bannerUrl ||
        data.logoUrl;


      const imageHTML =
        image
          ? `
            <img
              src="${safe(image)}"
              alt="${safe(data.name || "Tournament")}"
              style="
                width:100%;
                height:100%;
                object-fit:cover;
                display:block;
              "
            >
          `
          : `
            <div style="
              width:100%;
              height:100%;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:60px;
            ">
              ${icon}
            </div>
          `;


      const card =
        document.createElement("article");


      card.className =
        "tournament-card";


      card.innerHTML = `

        <div class="tour-image">

          ${imageHTML}

          <span>
            ${safe(sport)}
          </span>

        </div>


        <div class="tour-body">

          <div class="tour-meta">

            <span>
              ${icon} ${safe(sport)}
            </span>

            <span>
              ${safe(
                data.slots
                  ? data.slots + " Slots"
                  : "Upcoming"
              )}
            </span>

          </div>


          <h3>
            ${safe(
              data.name ||
              "KPL Tournament"
            )}
          </h3>


          <p>
            Entry Fee:
            ₹${safe(data.entryFee || "0")}
          </p>


          <p>
            Prize Pool:
            ₹${safe(data.prizePool || "0")}
          </p>


          <p>
            📍 ${safe(data.venue || "")}
          </p>


          <p>
            📅 ${
              safe(
                formatDate(data.date)
              )
            }
          </p>


          <div class="tour-bottom">

            <strong>
              ${
                data.deadline
                  ? "Last Date: " +
                    safe(
                      formatDate(
                        data.deadline
                      )
                    )
                  : "Registration Open"
              }
            </strong>


            <button
              class="small-btn"
              data-register
              data-id="${safe(item.id)}"
            >
              Register →
            </button>

          </div>

        </div>

      `;


      grid.appendChild(card);

    });


    // ============================
    // REGISTER BUTTONS
    // ============================

    grid
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


            const tournamentId =
              button.dataset.id;


            window.location.href =
              "registration.html?tournament=" +
              encodeURIComponent(
                tournamentId
              );

          }
        );

      });

  },

  (error) => {

    console.error(
      "❌ Tournament error:",
      error
    );

  }
);
