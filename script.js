import { auth, provider, signInWithPopup } from "./firebase.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { db } from "./firebase.js";

const grid = document.getElementById("tournamentGrid");


// ===============================
// HTML SAFE
// ===============================

function safe(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ===============================
// DATE
// ===============================

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

    const d = new Date(value);

    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-IN");
    }

  } catch (e) {}

  return safe(value);
}


// ===============================
// GET FIELD
// Different admin field names
// will all work
// ===============================

function getField(data, names, fallback = "") {

  for (const name of names) {

    if (
      data[name] !== undefined &&
      data[name] !== null &&
      data[name] !== ""
    ) {
      return data[name];
    }

  }

  return fallback;
}


// ===============================
// LOAD TOURNAMENTS
// ===============================

function loadTournaments() {

  if (!grid) {

    console.error(
      "tournamentGrid not found"
    );

    return;

  }


  grid.innerHTML = `
    <div class="empty-card">
      <div class="empty-icon">⚡</div>
      <h3>Loading tournaments...</h3>
      <p>Fetching latest KPL tournaments.</p>
    </div>
  `;


  console.log(
    "Connecting to Firestore tournaments..."
  );


  const tournamentsRef =
    collection(db, "tournaments");


  onSnapshot(

    tournamentsRef,

    (snapshot) => {

      console.log(
        "Firestore connected."
      );

      console.log(
        "Tournament count:",
        snapshot.size
      );


      grid.innerHTML = "";


      if (snapshot.empty) {

        grid.innerHTML = `
          <div class="empty-card">
            <div class="empty-icon">🏆</div>

            <h3>No tournaments available</h3>

            <p>
              Add a tournament from the Admin Panel.
            </p>
          </div>
        `;

        return;

      }


      snapshot.forEach((docSnap) => {

        const data =
          docSnap.data();

        const tournamentId =
          docSnap.id;


        console.log(
          "Tournament:",
          tournamentId,
          data
        );


        // ===========================
        // FIELD NAMES
        // ===========================

        const name =
          getField(
            data,
            [
              "name",
              "tournamentName",
              "title",
              "tournament"
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


        const entryFee =
          getField(
            data,
            [
              "entryFee",
              "entry_fee",
              "fee",
              "entry"
            ],
            "TBA"
          );


        const prizePool =
          getField(
            data,
            [
              "prizePool",
              "prize_pool",
              "prize",
              "prizeMoney"
            ],
            "TBA"
          );


        const date =
          getField(
            data,
            [
              "date",
              "matchDate",
              "match_date",
              "tournamentDate"
            ],
            ""
          );


        const deadline =
          getField(
            data,
            [
              "deadline",
              "registrationDeadline",
              "registration_deadline",
              "lastDate"
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
              "image",
              "bannerUrl",
              "banner"
            ],
            ""
          );


        const sportText =
          String(sport).toLowerCase();


        const icon =
          sportText.includes("cricket")
            ? "🏏"
            : "⚽";


        // ===========================
        // IMAGE
        // ===========================

        let imageHTML = "";


        if (logo) {

          imageHTML = `
            <img
              src="${safe(logo)}"
              alt="${safe(name)}"
              style="
                width:100%;
                height:100%;
                object-fit:cover;
                display:block;
              "
              onerror="
                this.style.display='none';
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
                font-size:70px;
              "
            >
              ${icon}
            </div>
          `;

        }


        // ===========================
        // CARD
        // ===========================

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
              📅 Match:
              ${formatDate(date)}
            </p>


            ${
              deadline
                ? `
                  <p>
                    ⏰ Registration:
                    ${formatDate(deadline)}
                  </p>
                `
                : ""
            }


            <div class="tour-bottom">

              <strong>
                Registration Open
              </strong>


              <button
                type="button"
                class="small-btn"
                data-register="true"
                data-tournament-id="${safe(tournamentId)}"
              >
                Register →
              </button>

            </div>

          </div>

        `;


        grid.appendChild(card);

      });


      console.log(
        "Register buttons:",
        document.querySelectorAll(
          "[data-register]"
        ).length
      );

    },


    (error) => {

      console.error(
        "FIREBASE ERROR:",
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


// ===============================
// REGISTER BUTTON
// ===============================

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
      button.getAttribute(
        "data-tournament-id"
      );


    console.log(
      "Register clicked:",
      tournamentId
    );


    if (!tournamentId) {

      alert(
        "Tournament ID missing."
      );

      return;

    }


    // Already logged in
    if (auth.currentUser) {

      window.location.href =
        "registration.html?tournament=" +
        encodeURIComponent(
          tournamentId
        );

      return;

    }


    // Login
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
        "LOGIN ERROR:",
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


// ===============================
// START
// ===============================

loadTournaments();

console.log(
  "KPL Public Website Started"
);
