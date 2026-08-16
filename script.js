import {
  auth,
  provider,
  signInWithPopup,
  onAuthStateChanged
} from "./firebase.js";

import {
  collection,
  onSnapshot,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { db } from "./firebase.js";


// ======================================================
// ELEMENTS
// ======================================================

const grid = document.getElementById("tournamentGrid");

const loginBtn = document.getElementById("loginBtn");
const mobileLoginBtn = document.getElementById("mobileLoginBtn");
const heroLogin = document.getElementById("heroLogin");

const loginModal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");
const googleBtn = document.getElementById("googleBtn");

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");


// ======================================================
// SAFE HTML
// ======================================================

function safe(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ======================================================
// DATE
// ======================================================

function formatDate(value) {

  if (!value) return "TBA";

  try {

    if (
      typeof value === "object" &&
      typeof value.toDate === "function"
    ) {
      return value.toDate().toLocaleDateString("en-IN");
    }

    if (
      typeof value === "object" &&
      value.seconds
    ) {
      return new Date(
        value.seconds * 1000
      ).toLocaleDateString("en-IN");
    }

    const date = new Date(value);

    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN");
    }

  } catch (error) {}

  return safe(value);
}


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

    if (event.target === loginModal) {
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


    } catch (error) {

      console.error(
        "Google login error:",
        error
      );


      googleBtn.disabled = false;

      googleBtn.innerHTML =
        "<span>G</span> Continue with Google";


      if (
        error.code !==
        "auth/popup-closed-by-user"
      ) {

        alert(
          "Google login failed: " +
          error.message
        );

      }

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
  .forEach((link) => {

    link.addEventListener(
      "click",
      () => {

        mobileMenu.classList.remove(
          "active"
        );

      }
    );

  });


// ======================================================
// TOURNAMENT FIELD HELPER
// ======================================================

function getField(
  data,
  fields,
  fallback = ""
) {

  for (const field of fields) {

    if (
      data[field] !== undefined &&
      data[field] !== null &&
      data[field] !== ""
    ) {

      return data[field];

    }

  }

  return fallback;
}


// ======================================================
// LOAD TOURNAMENTS
// ======================================================

function loadTournaments() {

  if (!grid) {

    console.error(
      "tournamentGrid not found"
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
        "LIVE TOURNAMENTS:",
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

          const tournamentId =
            tournamentDoc.id;


          const name =
            getField(
              data,
              [
                "name",
                "tournamentName",
                "title"
              ],
              "KPL Tournament"
            );


          const sport =
            getField(
              data,
              [
                "sport",
                "category",
                "type"
              ],
              "Football"
            );


          const entryFee =
            getField(
              data,
              [
                "entryFee",
                "entry_fee",
                "fee"
              ],
              "TBA"
            );


          const prizePool =
            getField(
              data,
              [
                "prizePool",
                "prize_pool",
                "prize"
              ],
              "TBA"
            );


          const venue =
            getField(
              data,
              [
                "venue",
                "location",
                "ground"
              ],
              "Venue TBA"
            );


          const date =
            getField(
              data,
              [
                "date",
                "matchDate",
                "match_date"
              ],
              ""
            );


          const deadline =
            getField(
              data,
              [
                "deadline",
                "registrationDeadline",
                "registration_deadline"
              ],
              ""
            );


          const logo =
            getField(
              data,
              [
                "logoUrl",
                "logo",
                "imageUrl",
                "image"
              ],
              ""
            );


          const banner =
            getField(
              data,
              [
                "bannerUrl",
                "banner"
              ],
              ""
            );


          const sportLower =
            String(sport).toLowerCase();


          const icon =
            sportLower.includes("cricket")
              ? "🏏"
              : "⚽";


          let imageHTML = "";


          if (banner) {

            imageHTML = `

              <img
                src="${safe(banner)}"
                alt="${safe(name)}"
                style="
                  width:100%;
                  height:100%;
                  object-fit:cover;
                  display:block;
                "
              >

            `;

          } else if (logo) {

            imageHTML = `

              <img
                src="${safe(logo)}"
                alt="${safe(name)}"
                style="
                  width:100%;
                  height:100%;
                  object-fit:contain;
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
                  font-size:65px;
                "
              >
                ${icon}
              </div>

            `;

          }


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
                ${safe(sport)}
              </span>

            </div>


            <div class="tour-body">

              <div class="tour-meta">

                <span>
                  ${icon}
                  ${safe(sport)}
                </span>

                <span>
                  KPL
                </span>

              </div>


              <h3>
                ${safe(name)}
              </h3>


              <p>
                💰 Entry Fee:
                ₹${safe(entryFee)}
              </p>


              <p>
                🏆 Prize Pool:
                ₹${safe(prizePool)}
              </p>


              <p>
                📍 ${safe(venue)}
              </p>


              <p>
                📅 ${formatDate(date)}
              </p>


              <div class="tour-bottom">

                <strong>
                  ${
                    deadline
                      ? "Last Date: " +
                        formatDate(deadline)
                      : "Registration Open"
                  }
                </strong>


                <button
                  type="button"
                  class="small-btn"
                  data-register="true"
                  data-tournament-id="${safe(
                    tournamentId
                  )}"
                >
                  Register →
                </button>

              </div>

            </div>

          `;


          grid.appendChild(card);

        }
      );


      console.log(
        "Register buttons:",
        document.querySelectorAll(
          "[data-register]"
        ).length
      );

    },


    (error) => {

      console.error(
        "Tournament error:",
        error
      );


      grid.innerHTML = `

        <div class="empty-card">

          <div class="empty-icon">
            ❌
          </div>

          <h3>
            Tournament loading failed
          </h3>

          <p>
            ${safe(error.message)}
          </p>

        </div>

      `;

    }

  );

}


// ======================================================
// REGISTER BUTTON
// ======================================================

document.addEventListener(
  "click",
  async (event) => {

    const button =
      event.target.closest(
        "[data-register]"
      );


    if (!button) return;


    event.preventDefault();


    const tournamentId =
      button.dataset.tournamentId;


    if (!tournamentId) {

      alert(
        "Tournament ID missing."
      );

      return;

    }


    if (auth.currentUser) {

      window.location.href =
        "registration.html?tournament=" +
        encodeURIComponent(
          tournamentId
        );

      return;

    }


    try {

      button.disabled = true;

      button.textContent =
        "Login...";


      await signInWithPopup(
        auth,
        provider
      );


      window.location.href =
        "registration.html?tournament=" +
        encodeURIComponent(
          tournamentId
        );


    } catch (error) {

      console.error(
        "Registration login error:",
        error
      );


      button.disabled = false;

      button.textContent =
        "Register →";


      if (
        error.code !==
        "auth/popup-closed-by-user"
      ) {

        alert(
          "Google login failed: " +
          error.message
        );

      }

    }

  }
);


// ======================================================
// LIVE WEBSITE SETTINGS
// settings/site
// ======================================================

async function loadWebsiteSettings() {

  try {

    const settingsRef =
      doc(
        db,
        "settings",
        "site"
      );


    const snap =
      await getDoc(
        settingsRef
      );


    if (!snap.exists()) {

      console.log(
        "settings/site not found"
      );

      return;

    }


    const data =
      snap.data();


    console.log(
      "LIVE WEBSITE SETTINGS:",
      data
    );


    // ==============================================
    // WEBSITE NAME
    // ==============================================

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
        data.siteName +
        " | Football & Cricket";

    }


    // ==============================================
    // WEBSITE LOGO
    // ==============================================

    if (data.logoUrl) {

      const logo =
        document.getElementById(
          "websiteLogo"
        );


      if (logo) {

        logo.innerHTML = `

          <img
            src="${safe(data.logoUrl)}"
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


    // ==============================================
    // WEBSITE BANNER
    // ==============================================

    if (data.bannerUrl) {

      let banner =
        document.getElementById(
          "websiteBanner"
        );


      /*
        Agar index.html mein websiteBanner
        nahi hai, to automatically hero visual
        ke andar banner create hoga.
      */

      if (!banner) {

        const heroVisual =
          document.querySelector(
            ".hero-visual"
          );


        if (heroVisual) {

          banner =
            document.createElement(
              "div"
            );


          banner.id =
            "websiteBanner";


          banner.style.cssText = `
            position:absolute;
            inset:0;
            background-size:cover;
            background-position:center;
            background-repeat:no-repeat;
            z-index:0;
            border-radius:20px;
            opacity:0.75;
          `;


          heroVisual.prepend(
            banner
          );

        }

      }


      if (banner) {

        banner.style.backgroundImage =
          `url("${data.bannerUrl}")`;

        banner.style.backgroundSize =
          "cover";

        banner.style.backgroundPosition =
          "center";

      }

    }


    // ==============================================
    // UPI ID
    // ==============================================

    document
      .querySelectorAll(
        "[data-upi-id]"
      )
      .forEach(
        (element) => {

          if (data.upiId) {

            element.textContent =
              data.upiId;

          }

        }
      );


    // ==============================================
    // PAYMENT QR
    // ==============================================

    document
      .querySelectorAll(
        "[data-payment-qr]"
      )
      .forEach(
        (element) => {

          if (data.upiQrUrl) {

            element.src =
              data.upiQrUrl;

            element.style.display =
              "block";

          }

        }
      );


    // Existing ID support
    const qr =
      document.getElementById(
        "paymentQR"
      );


    if (qr && data.upiQrUrl) {

      qr.src =
        data.upiQrUrl;

      qr.style.display =
        "block";

    }


    // ==============================================
    // CONTACT
    // ==============================================

    document
      .querySelectorAll(
        "[data-contact]"
      )
      .forEach(
        (element) => {

          if (data.contactNumber) {

            element.textContent =
              data.contactNumber;

          }

        }
      );


  } catch (error) {

    console.error(
      "Website settings error:",
      error
    );

  }

}


// ======================================================
// START EVERYTHING
// ======================================================

loadTournaments();

loadWebsiteSettings();


console.log(
  "KPL Public Website Loaded"
);
