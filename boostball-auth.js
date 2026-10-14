import { initializeApp } from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,  
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Replace these values with your Firebase Web app config.
// Never put service-account private keys here.
const firebaseConfig = {
  apiKey: "AIzaSyB_MCr2rV5nwwg_io-YvrSTufX5J5hgqog",
  authDomain: "boostball-online.firebaseapp.com",
  projectId: "boostball-online",
  appId: "1:992637702158:web:285320d508f5dbfd77ec5f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

let currentProfile = null;

function validUsername(name) {
  return /^[a-zA-Z0-9_]{3,16}$/.test(name);
}

async function ensureProfile(user, requestedUsername) {
  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    currentProfile = snapshot.data();
    return currentProfile;
  }

  const username = requestedUsername ||
    `Player_${user.uid.slice(0, 8)}`;

  if (!validUsername(username)) {
    throw new Error(
      "Username must be 3–16 letters, numbers or underscores."
    );
  }

  const profile = {
    username,
    garage: {
      color: "#168cff",
      finish: "gloss"
    }
  };

  await setDoc(ref, profile);
  currentProfile = profile;

  return profile;
}

const overlay = document.createElement("div");

overlay.id = "boostballAuth";
overlay.innerHTML = `
  <div class="bb-auth-panel">
    <h1>BOOSTBALL</h1>
    <p>YOUR GARAGE. YOUR ACCOUNT.</p>

    <div id="bbAuthLoggedOut">
      <input id="bbUsername"
        placeholder="Username (for new accounts)"
        maxlength="16" autocomplete="username">

      <input id="bbEmail"
        type="email"
        placeholder="Email address"
        autocomplete="email">

      <input id="bbPassword"
        type="password"
        placeholder="Password"
        autocomplete="current-password">

      <button id="bbSignIn">SIGN IN</button>
      <button id="bbSignUp">CREATE ACCOUNT</button>
      <button id="bbGoogle">CONTINUE WITH GOOGLE</button>
      <button id="bbReset">FORGOT PASSWORD?</button>
      <button id="bbGuest">PLAY AS GUEST</button>
    </div>

    <div id="bbAuthLoggedIn" hidden>
      <h2 id="bbWelcome"></h2>
      <button id="bbContinue">CONTINUE TO GAME</button>
      <button id="bbSignOut">SIGN OUT</button>
    </div>

    
<div id="bbAuthError" hidden>
  <button id="bbErrorDot"
          type="button"
          aria-label="Show login error"
          title="Login error">!</button>
  <div id="bbErrorMessage" role="alert" hidden></div>
</div>
`;

const style = document.createElement("style");

style.textContent = `
  #boostballAuth {
    position: fixed;
    inset: 0;
    z-index: 999999;
    display: grid;
    place-items: center;
    background: rgba(7, 9, 24, .96);
    color: white;
    font-family: Arial, sans-serif;
  }

  .bb-auth-panel {
    width: min(380px, 90vw);
    padding: 30px;
    background: #151a35;
    border: 1px solid #7558cc;
    border-radius: 18px;
    text-align: center;
    box-shadow: 0 20px 70px #0009;
  }

  .bb-auth-panel h1 {
    color: #b69aff;
    letter-spacing: 3px;
  }

  .bb-auth-panel input,
  .bb-auth-panel button {
    box-sizing: border-box;
    width: 100%;
    margin: 6px 0;
    padding: 12px;
    border-radius: 8px;
    font: inherit;
  }

  .bb-auth-panel input {
    background: #0c1025;
    color: white;
    border: 1px solid #555d88;
  }

  .bb-auth-panel button {
    cursor: pointer;
    background: #7854db;
    color: white;
    border: 0;
    font-weight: bold;
  }

  #bbGoogle { background: #356bb6; }
  #bbGuest { background: #353c59; }
  #bbReset { background: transparent; }
  
#bbAuthError {
  position: fixed;
  bottom: 18px;
  right: 18px;
  z-index: 1000001;
}

#bbAuthError[hidden],
#bbErrorMessage[hidden] {
  display: none !important;
}

#bbAuthError #bbErrorDot {
  width: 26px;
  height: 26px;
  padding: 0;
  margin: 0;
  border-radius: 50%;
  background: #ed3d51;
  color: white;
  border: 2px solid #ff9da9;
  cursor: pointer;
  font-weight: bold;
}

#bbErrorMessage {
  position: absolute;
  bottom: 36px;
  right: 0;
  width: min(300px, 80vw);
  padding: 12px;
  border-radius: 10px;
  background: #30151e;
  color: #ffd7dc;
  border: 1px solid #ed3d51;
  text-align: left;
  overflow-wrap: anywhere;
}
`;

document.head.appendChild(style);
document.body.appendChild(overlay);

const el = id => document.getElementById(id);


function status(message) {
  const error = el("bbAuthError");
  const popup = el("bbErrorMessage");

  error.hidden = !message;
  popup.hidden = true;
  popup.textContent = message;
}

el("bbErrorDot").onclick = () => {
  const popup = el("bbErrorMessage");
  popup.hidden = !popup.hidden;
};

function closeOverlay() {
  overlay.style.display = "none";
}

function showOverlay() {
  overlay.style.display = "grid";
}


async function run(action) {
  status("");

  try {
    await action();
  } catch (error) {
    console.error("Boostball authentication:", error);
    status(error.message || "Authentication failed.");
  }
}

  try {
    await action();
    status("");
  } catch (error) {
    console.error("Boostball authentication:", error);
    status(error.message || "Authentication failed.");
  }
}

el("bbSignUp").onclick = () => run(async () => {
  const username = el("bbUsername").value.trim();
  const email = el("bbEmail").value.trim();
  const password = el("bbPassword").value;

  if (!validUsername(username)) {
    throw new Error(
      "Choose a username with 3–16 letters, numbers or underscores."
    );
  }

  const result = await createUserWithEmailAndPassword(
    auth, email, password
  );

  
await setDoc(
  doc(db, "users", result.user.uid),
  {
    username,
    garage: {
      color: "#168cff",
      finish: "gloss"
    }
  }
);

currentProfile = {
  username,
  garage: {
    color: "#168cff",
    finish: "gloss"
  }
};

el("bbWelcome").textContent = `Welcome, ${username}!`;
});

el("bbSignIn").onclick = () => run(async () => {
  const result = await signInWithEmailAndPassword(
    auth,
    el("bbEmail").value.trim(),
    el("bbPassword").value
  );

  await ensureProfile(result.user);
});

el("bbGoogle").onclick = () => run(async () => {
  const result = await signInWithPopup(
    auth, googleProvider
  );

  await ensureProfile(result.user);
});

el("bbReset").onclick = () => run(async () => {
  const email = el("bbEmail").value.trim();

  if (!email) {
    throw new Error("Enter your email address first.");
  }

  await sendPasswordResetEmail(auth, email);
  status("If this email is registered, check your inbox.");
});


el("bbGuest").onclick = () => run(async () => {
  await signInAnonymously(auth);
  await ensureProfile(auth.currentUser);
  closeOverlay();
});

el("bbContinue").onclick = closeOverlay;

el("bbSignOut").onclick = () => run(async () => {
  await signOut(auth);
  currentProfile = null;
  showOverlay();
});

onAuthStateChanged(auth, async user => {
  if (!user) {
    currentProfile = null;
    el("bbAuthLoggedOut").hidden = false;
    el("bbAuthLoggedIn").hidden = true;
    showOverlay();
    return;
  }

  try {
    const profile = await ensureProfile(user);

    el("bbWelcome").textContent =
      `Welcome, ${profile.username}!`;

    el("bbAuthLoggedOut").hidden = true;
    el("bbAuthLoggedIn").hidden = false;

    // Other game systems can listen for this.
    window.dispatchEvent(
      new CustomEvent("boostball-auth-ready", {
        detail: {
          uid: user.uid,
          username: profile.username
        }
      })
    );
  } catch (error) {
    console.error(error);
    status("Signed in, but your profile could not load.");
  }
});

// Expose a small interface to the main game.
window.BoostballAuth = {
  getUser: () => auth.currentUser,
  getProfile: () => currentProfile,
  open: showOverlay,
  logout: () => signOut(auth)
};
