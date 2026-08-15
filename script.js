```js
import {
  auth,
  provider,
  signInWithPopup,
  onAuthStateChanged
} from "./firebase.js";

import {
  doc,
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { db } from "./firebase.js";


// ======================================================
// ELEMENTS
// ======================================================

const grid =
  document.getElementById("tournamentGrid");

const loginBtn =
  document.getElementById("loginBtn");

const mobileLoginBtn =
  document.getElementById("mobileLoginBtn");

const heroLogin =
  document.getElementById("heroLogin");

const loginModal =
  document.getElementById("loginModal");

const closeModal =
  document.getElementById("closeModal");

const googleBtn =
  document.getElementById("googleBtn");

const menuBtn =
  document.getElementById("menuBtn");

const mobileMenu =
  document.getElementById("mobileMenu");


// ======================================================
// LOGIN MODAL
// ======================================================

function openLogin() {

  if (!loginModal) return;

  loginModal.classList.add("active");

  loginModal.setAttribute(
    "aria-hidden",
    "false"
  );
}


function closeLogin() {

  if (!loginModal) return;

  loginModal.classList.remove("active");

  loginModal.setAttribute(
    "aria-hidden",
    "true"
  );
}


loginBtn?.addEventListener(
  "click",
  openLogin
);


mobileLoginBtn?.addEventListener(
  "click",
  openLogin
);


heroLogin?.addEventListener(
  "click",
  openLogin
);


closeModal?.addEventListener(
  "click",
  closeLogin
);


loginModal?.addEventListener(
  "click",
  (event) => {

    if (
      event.target === loginModal
    ) {
      closeLogin();
    }

  }
);


// ======================================================
// GOOGLE LOGIN
// ======================================================

googleBtn?.addEventListener(
  "click",
  async () => {

    try {

      googleBtn.disabled = true;

      googleBtn.innerHTML =
        "<span>G</span> Signing in...";


      await signInWithPopup(
        auth,
        provider
      );


      closeLogin();


      window.location.href =
        "registration.html";


    } catch (error) {

      console.error(
        "Google login error:",
        error
      );


      alert(
        "Google login failed. Please try again."
      );


      googleBtn.disabled = false;

      googleBtn.innerHTML =
        "<span>G</span> Continue with Google";

    }

  }
);


// ======================================================
// AUTH STATE
// ======================================================

onAuthStateChanged(
  auth,
  (user) => {

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

  }
);


// ======================================================
// MOBILE MENU
// ======================================================

menuBtn?.addEventListener(
  "click",
  () => {

    mobileMenu?.classList.toggle(
      "active"
    );

  }
);


mobileMenu
  ?.querySelectorAll("a")
  .forEach(
    (link) => {

      link.addEventListener(
        "click",
        () => {

          mobileMenu.classList.remove(
            "active"
          );

        }
      );

    }
  );


// ======================================================
// HELPERS
// ======================================================

function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
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

  if (!value) {
    return "-";
  }


  // Firestore Timestamp
  if (
    typeof value === "object" &&
    typeof value.toDate === "function"
  ) {

    return value
      .toDate()
      .toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );

  }


  // Firestore timestamp object
  if (
    typeof value === "object" &&
    value.seconds
  ) {

    return new Date(
      value.seconds * 1000
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  }


  const date =
    new Date(value);


  if (
    isNaN(
      date.getTime()
    )
  ) {

    return String(value);

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


// ======================================================
// TOURNAMENT LIVE DATA
// ======================================================

function loadTournaments() {

  if (!grid) {

    console.error(
      "❌ tournamentGrid not found in index.html"
    );

    return;

  }


  grid.innerHTML = `

    <div class="empty-card">

      <div class="empty-icon">
        ⚡
      </div>

      <h3>
        Loading tournaments...
      </h3>

      <p>
        Fetching latest KPL tournaments.
      </p>

    </div>

  `;


  const tournamentsRef =
    collection(
      db,
      "tournaments"
    );


  onSnapshot(

    tournamentsRef,

    (snapshot) => {

      console.log(
        "🔥 Tournaments loaded:",
        snapshot.size
      );


      grid.innerHTML = "";


      if (snapshot.empty) {

        grid.innerHTML = `

          <div class="empty-card">

            <div class="empty-icon">
              🏆
            </div>

            <h3>
              No tournaments available
            </h3>

            <p>
              New KPL tournaments will appear here.
            </p>

          </div>

        `;

        return;

      }


      snapshot.forEach(
        (tournamentDoc) => {

          const data =
            tournamentDoc.data();


          const id =
            tournamentDoc.id;


          const sport =
            data.sport ||
            "Football";


          const sportLower =
            String(sport)
              .toLowerCase();


          const icon =
            sportLower.includes(
              "cricket"
            )
              ? "🏏"
              : "⚽";


          const name =
            data.name ||
            "KPL Tournament";


          const entryFee =
            data.entryFee ??
            0;


          const prizePool =
            data.prizePool ??
            0;


          const venue =
            data.venue ||
            "Venue TBA";


          const date =
            formatDate(
              data.date
            );


          const deadline =
            formatDate(
              data.deadline
            );


          const minPlayers =
            data.minPlayers ??
            "";


          const maxPlayers =
            data.maxPlayers ??
            "";


          let playerText =
            "";


          if (
            minPlayers &&
            maxPlayers
          ) {

            playerText =
              `${minPlayers}-${maxPlayers} Players`;

          } else if (
            maxPlayers
          ) {

            playerText =
              `${maxPlayers} Players`;

          } else {

            playerText =
              "Team Registration";

          }


          // ==========================================
          // IMAGE
          // ==========================================

          const image =
            data.bannerUrl ||
            data.logoUrl ||
            "";


          let imageHTML;


          if (image) {

            imageHTML = `

              <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(name)}"
                style="
                  width:100%;
                  height:100%;
                  object-fit:cover;
                  display:block;
                "
              >

            `;

          } else {

            imageHTML = `

              <div
                style="
                  width:100%;
                  height:100%;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  font-size:60px;
                "
              >
                ${icon}
              </div>

            `;

          }


          // ==========================================
          // CARD
          // ==========================================

          const card =
            document.createElement(
              "article"
            );


          card.className =
            "tournament-card";


          card.innerHTML = `

            <div class="tour-image">

              ${imageHTML}

              <span>
                ${escapeHTML(sport)}
              </span>

            </div>


            <div class="tour-body">

              <div class="tour-meta">

                <span>
                  ${icon}
                  ${escapeHTML(sport)}
                </span>

                <span>
                  ${escapeHTML(playerText)}
                </span>

              </div>


              <h3>
                ${escapeHTML(name)}
              </h3>


              <p>
                Entry Fee:
                ₹${escapeHTML(entryFee)}
              </p>


              <p>
                Prize Pool:
                ₹${escapeHTML(prizePool)}
              </p>


              <p>
                📍
                ${escapeHTML(venue)}
              </p>


              <p>
                📅
                ${escapeHTML(date)}
              </p>


              <div class="tour-bottom">

                <strong>
                  ${
                    data.deadline
                      ? `Last Date: ${escapeHTML(deadline)}`
                      : "Registration Open"
                  }
                </strong>


                <button
                  type="button"
                  class="small-btn"
                  data-register
                  data-tournament-id="${escapeHTML(id)}"
                >
                  Register →
                </button>

              </div>

            </div>

          `;


          grid.appendChild(
            card
          );

        }
      );


      console.log(
        "✅ Register buttons created:",
        grid.querySelectorAll(
          "[data-register]"
        ).length
      );

    },


    (error) => {

      console.error(
        "❌ Tournament Firebase error:",
        error
      );


      grid.innerHTML = `

        <div class="empty-card">

          <div class="empty-icon">
            ⚠️
          </div>

          <h3>
            Could not load tournaments
          </h3>

          <p>
            ${escapeHTML(error.message)}
          </p>

        </div>

      `;

    }

  );

}


// ======================================================
// REGISTER BUTTON
// EVENT DELEGATION
// ======================================================

document.addEventListener(
  "click",
  async (event) => {

    const button =
      event.target.closest(
        "[data-register]"
      );


    if (!button) {
      return;
    }


    event.preventDefault();
    event.stopPropagation();


    const tournamentId =
      button.dataset.tournamentId;


    console.log(
      "🟢 Register clicked:",
      tournamentId
    );


    if (!tournamentId) {

      alert(
        "Tournament ID missing."
      );

      return;

    }


    // ----------------------------------------------
    // USER ALREADY LOGGED IN
    // ----------------------------------------------

    if (auth.currentUser) {

      window.location.href =
        `registration.html?tournament=${encodeURIComponent(
          tournamentId
        )}`;

      return;

    }


    // ----------------------------------------------
    // USER NOT LOGGED IN
    // ----------------------------------------------

    try {

      button.disabled =
        true;

      button.textContent =
        "Login...";


      await signInWithPopup(
        auth,
        provider
      );


      // Login successful

      window.location.href =
        `registration.html?tournament=${encodeURIComponent(
          tournamentId
        )}`;


    } catch (error) {

      console.error(
        "❌ Registration login error:",
        error
      );


      button.disabled =
        false;

      button.textContent =
        "Register →";


      // If popup was closed,
      // don't show scary error.

      if (
        error.code !==
        "auth/popup-closed-by-user"
      ) {

        alert(
          "Login failed. Please try again."
        );

      }

    }

  }
);


// ======================================================
// LIVE WEBSITE SETTINGS
// settings/site
// ======================================================

function loadWebsiteSettings() {

  const settingsRef =
    doc(
      db,
      "settings",
      "site"
    );


  onSnapshot(

    settingsRef,

    (snapshot) => {

      if (!snapshot.exists()) {

        console.log(
          "No settings/site document."
        );

        return;

      }


      const data =
        snapshot.data();


      console.log(
        "🔥 Live settings:",
        data
      );


      // ------------------------------------------
      // SITE NAME
      // ------------------------------------------

      if (data.siteName) {

        const websiteName =
          document.getElementById(
            "websiteName"
          );


        if (websiteName) {

          websiteName.textContent =
            data.siteName;

        }


        document.title =
          `${data.siteName} | Football & Cricket`;

      }


      // ------------------------------------------
      // LOGO
      // ------------------------------------------

      if (data.logoUrl) {

        const logo =
          document.getElementById(
            "websiteLogo"
          );


        if (logo) {

          logo.innerHTML = `

            <img
              src="${escapeHTML(data.logoUrl)}"
              alt="KPL Official"
              style="
                width:100%;
                height:100%;
                object-fit:contain;
              "
            >

          `;

        }

      }

    },


    (error) => {

      console.error(
        "❌ Settings error:",
        error
      );

    }

  );

}


// ======================================================
// START
// ======================================================

loadWebsiteSettings();

loadTournaments();


console.log(
  "🚀 KPL Public Website Started"
);
```
