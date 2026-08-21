(function () {
  const PIN_KEY = "strike-lock-pin";
  const PK_KEY = "strike-lock-pk";
  const OPEN_KEY = "strike-open";
  const $ = (id) => document.getElementById(id);
  const lock = $("lock");
  const board = $("board");
  const msg = $("lock-msg");
  const err = $("lock-err");
  const dots = $("lock-dots");
  const pad = $("lock-pad");
  const btnFace = $("btn-face");
  const btnPin = $("btn-use-pin");
  const btnSkip = $("btn-skip-face");

  let mode = "setup";
  let pin = "";
  let pending = "";

  function hasPin() { return Boolean(localStorage.getItem(PIN_KEY)); }
  function hasPk() { return Boolean(localStorage.getItem(PK_KEY)); }
  function canFace() {
    return Boolean(window.PublicKeyCredential);
  }

  async function shaPin(value) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("strike|" + value));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  function b64(buf) {
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(buf))));
  }
  function fromB64(s) {
    const bin = atob(s);
    const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u.buffer;
  }

  function paintDots() {
    const marks = dots.querySelectorAll("span");
    marks.forEach((el, i) => el.classList.toggle("on", i < pin.length));
    dots.classList.remove("bad");
  }
  function showErr(text) {
    err.hidden = !text;
    err.textContent = text || "";
    if (text) dots.classList.add("bad");
  }
  function setMode(next, text) {
    mode = next;
    pin = "";
    paintDots();
    showErr("");
    msg.textContent = text;
    const needPad = next === "setup" || next === "confirm" || next === "unlock";
    pad.hidden = !needPad;
    btnFace.hidden = next !== "face";
    btnPin.hidden = next !== "face";
    btnSkip.hidden = next !== "offer";
    if (next === "offer") {
      pad.hidden = true;
      btnFace.hidden = false;
      btnSkip.hidden = false;
    }
  }

  function openBoard() {
    sessionStorage.setItem(OPEN_KEY, "1");
    lock.hidden = true;
    board.hidden = false;
    if (typeof window.unlockStrike === "function") window.unlockStrike();
  }

  async function registerFace() {
    const userId = crypto.getRandomValues(new Uint8Array(16));
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "STRIKE", id: location.hostname },
        user: { id: userId, name: "strike", displayName: "STRIKE" },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        timeout: 60000,
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
      },
    });
    if (!cred) throw new Error("canceled");
    localStorage.setItem(PK_KEY, JSON.stringify({ id: b64(cred.rawId) }));
  }

  async function askFace() {
    const saved = JSON.parse(localStorage.getItem(PK_KEY) || "null");
    if (!saved) return false;
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rpId: location.hostname,
        allowCredentials: [{ type: "public-key", id: fromB64(saved.id) }],
        userVerification: "required",
        timeout: 60000,
      },
    });
    return Boolean(assertion);
  }

  async function finishPin() {
    if (mode === "setup") {
      pending = pin;
      setMode("confirm", "Enter it again");
      return;
    }
    if (mode === "confirm") {
      if (pin !== pending) {
        showErr("PINs did not match");
        setTimeout(() => setMode("setup", "Set a 4-digit PIN"), 700);
        return;
      }
      localStorage.setItem(PIN_KEY, await shaPin(pin));
      if (canFace()) {
        setMode("offer", "Turn on Face ID");
        btnFace.textContent = "Turn on Face ID";
      } else {
        openBoard();
      }
      return;
    }
    if (mode === "unlock") {
      const ok = (await shaPin(pin)) === localStorage.getItem(PIN_KEY);
      if (!ok) {
        showErr("Wrong PIN");
        pin = "";
        paintDots();
        return;
      }
      openBoard();
    }
  }

  function digit(n) {
    if (pin.length >= 4) return;
    pin += n;
    paintDots();
    showErr("");
    if (pin.length === 4) finishPin();
  }

  pad.innerHTML = ["1","2","3","4","5","6","7","8","9","", "0", "⌫"].map((k) => {
    if (k === "") return "<span></span>";
    const label = k === "⌫" ? "Delete" : k;
    return `<button type="button" data-k="${k}" aria-label="${label}">${k}</button>`;
  }).join("");

  pad.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const k = btn.dataset.k;
    if (k === "⌫") {
      pin = pin.slice(0, -1);
      paintDots();
      showErr("");
      return;
    }
    digit(k);
  });

  btnFace.addEventListener("click", async () => {
    showErr("");
    try {
      if (mode === "offer") {
        await registerFace();
        openBoard();
        return;
      }
      if (await askFace()) openBoard();
    } catch (e) {
      showErr("Face ID canceled");
      setMode("unlock", "Enter your PIN");
    }
  });
  btnSkip.addEventListener("click", () => openBoard());
  btnPin.addEventListener("click", () => setMode("unlock", "Enter your PIN"));

  $("btn-lock")?.addEventListener("click", () => {
    sessionStorage.removeItem(OPEN_KEY);
    $("menu").hidden = true;
    board.hidden = true;
    lock.hidden = false;
    if (hasPk() && canFace()) {
      setMode("face", "Look at the phone");
      btnFace.textContent = "Face ID";
    } else {
      setMode("unlock", "Enter your PIN");
    }
  });

  async function start() {
    if (sessionStorage.getItem(OPEN_KEY) === "1" && hasPin()) {
      openBoard();
      return;
    }
    if (!hasPin()) {
      setMode("setup", "Set a 4-digit PIN");
      return;
    }
    if (hasPk() && canFace()) {
      setMode("face", "Look at the phone");
      btnFace.textContent = "Face ID";
      try {
        if (await askFace()) {
          openBoard();
          return;
        }
      } catch (e) {
        setMode("unlock", "Enter your PIN");
      }
      return;
    }
    setMode("unlock", "Enter your PIN");
  }

  start();
})();
