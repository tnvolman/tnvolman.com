  const OWNERS = ["me","us","agent"];
  const OWNER_LABEL = { me: "Me", us: "Us", agent: "Agent" };
  const LAWS = [
    "If it is not on the board, it does not exist.",
    "Three strikes. Then rest.",
    "Cold lanes get the first strike.",
  ];
  const KEY_TERMS = [
    { id:"pull", label:"The Pull", means:"The sentence at the top. Where these 30 days are going.", onBoard:"If you forget why you are doing this, look there. That is the magnet." },
    { id:"strike", label:"Strike", means:"One action you will actually do today. Not a wish. Not a list.", onBoard:"Three only. Then you stop. Rest is part of the system." },
    { id:"heat", label:"Heat", means:"How alive that lane is right now. Tap the bars. Do not dress it up.", onBoard:"Empty = cold. Four bars = hot. Night: mark it honest." },
    { id:"cold", label:"Cold lane", means:"The quiet one. The one you skipped or starved.", onBoard:"It gets tomorrow’s first strike. That is law 3." },
    { id:"owner", label:"Owner", means:"Who is responsible for the lane. Tap the chip to change it.", onBoard:"Me = you. Us = you and Tawny. Agent = a Forge agent." },
    { id:"thirty", label:"30 days", means:"The finish line for this window. One outcome per lane.", onBoard:"If it will not fit in 30 days, it does not go on this board." },
    { id:"week", label:"This week", means:"The one move that feeds the 30-day outcome.", onBoard:"Not a list. One line. If you need two, you do not have it yet." },
    { id:"fire", label:"Weekly Fire", means:"Friday review. Eight minutes. Standing. Then close it.", onBoard:"Four questions. Tomorrow’s first strike comes from question 2." },
    { id:"mind", label:"MIND plate", means:"How you eat so the brain holds. Dinner is the meal.", onBoard:"Tap MIND on the strikes row for the week’s dinners, breakfasts, and snacks." },
    { id:"neuromag", label:"Neuro-Mag", means:"Magnesium L-threonate. A brain mineral. Take it at night.", onBoard:"Same strike as lights out. Every night. Not optional this window." },
    { id:"snowball", label:"Snowball", means:"Dave Ramsey. Smallest debt first. Extra money hits that one only.", onBoard:"Zero new debt. One extra payment this window." },
    { id:"lights", label:"Lights out", means:"In bed. Screens off. Sleep starting at 10:30.", onBoard:"Brain lane lives or dies here. Protect it like a shift change." },
    { id:"sessions", label:"Sessions", means:"A timed block of real work. Not scrolling. Not planning.", onBoard:"Brain: movement, three a week. Forge: 45 minutes, three a week." },
    { id:"presence", label:"Presence", means:"Someone felt you were actually there. Body and attention.", onBoard:"Tawny. The Lord. Or one other. A leftover text does not count." },
    { id:"identity", label:"Identity", means:"Who you were this week. Not what you checked off.", onBoard:"Weekly Fire: finish the sentence. I am a man who…" },
    { id:"laws", label:"The laws", means:"The three rules that keep the board honest.", onBoard:"Not on the board = it does not exist. Three strikes. Cold lane first." },
    { id:"park", label:"Park it", means:"Anything that does not fit a lane. Get it out of your head.", onBoard:"If it belongs on the board, move it. If not, leave it here." },
  ];
  const DINNERS = [
    { day:"Sun", strike:"MIND plate · rotisserie + salad", plate:"Rotisserie chicken, big salad, roasted vegetables" },
    { day:"Mon", strike:"MIND plate · chicken + salad + broccoli", plate:"Baked chicken thighs, spinach salad, roasted broccoli" },
    { day:"Tue", strike:"MIND plate · salmon + sweet potato", plate:"Salmon, roasted sweet potato, green beans" },
    { day:"Wed", strike:"MIND plate · stir-fry + rice", plate:"Turkey or chicken stir-fry, vegetables, brown rice" },
    { day:"Thu", strike:"MIND plate · chicken + beans salad", plate:"Baked chicken, mixed salad with beans, olive oil" },
    { day:"Fri", strike:"MIND plate · burger + salad", plate:"Lean burger, no bun, big salad, roasted vegetables" },
    { day:"Sat", strike:"MIND plate · fish + quinoa + greens", plate:"Baked fish or chicken, quinoa, steamed broccoli" },
  ];
  const BREAKFASTS = [
    "Greek yogurt + berries + almonds",
    "Scrambled or fried eggs at home + apple",
    "Overnight oats + blueberries + walnuts",
    "Clean protein bar + banana",
    "Cottage cheese cup + berries",
    "Turkey roll-ups + grapes",
    "Peanut butter on toast + banana",
  ];
  const SNACKS = ["Almonds (handful)","Jerky or turkey sticks","Apple, banana, or orange","Protein bar","Carrots or snap peas","Nut butter packet"];
  const PREP = ["Wash fruit and portion nuts.","Wash and bag greens.","Pre-cook a few chicken thighs.","Keep frozen berries and spinach."];
  const ICONS = { brain:"⬡", debt:"$", forge:"⚒", covenant:"♥", kingdom:"✝", key:"⚿" };

  const KEY = "strike-board-v1";
  const todayKey = (d = new Date()) => {
    const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,"0"), day = String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
  };
  const todaysMind = (d = new Date()) => DINNERS[d.getDay()];
  const addDays = (iso, n) => {
    const [y,m,d] = iso.split("-").map(Number);
    const dt = new Date(y, m-1, d); dt.setDate(dt.getDate()+n); return todayKey(dt);
  };
  const daysBetween = (a,b) => {
    const [y1,m1,d1]=a.split("-").map(Number), [y2,m2,d2]=b.split("-").map(Number);
    return Math.round((Date.UTC(y2,m2-1,d2)-Date.UTC(y1,m1-1,d1))/86400000);
  };
  const fmt = (iso) => {
    const [y,m,d]=iso.split("-").map(Number);
    return new Date(y,m-1,d).toLocaleDateString("en-US",{month:"short",day:"numeric"});
  };

  function seed(startedOn) {
    return {
      northStar: "A whole man. A free house. A Forge that funds the Kingdom.",
      startedOn, windowDays: 30, strikeDate: startedOn, lastReview: null, mindV2: true, keyNotes: {},
      strikes: [
        { id:"s1", text:"Lights out 10:30 · Neuro-Mag", done:false },
        { id:"s2", text: todaysMind().strike, done:false },
        { id:"s3", text:"20 unhurried minutes with Tawny", done:false },
      ],
      lanes: [
        { id:"brain", name:"Brain", roman:"I", why:"Protect the mind. Everything runs on it.", outcome:"Sleep 10:30. Neuro-Mag. 3 sessions. MIND plate.", weekly:"Neuro-Mag nightly. Three sessions. Dinners as written.", heat:2, owner:"me" },
        { id:"debt", name:"Debt", roman:"II", why:"Freedom is oxygen. Snowball only.", outcome:"One extra snowball. Zero new debt.", weekly:"20-min money meeting, Sunday", heat:1, owner:"us" },
        { id:"forge", name:"Forge", roman:"III", why:"Ship. Do not stew.", outcome:"Ship one thing that can earn.", weekly:"Three 45-min sessions. One target.", heat:2, owner:"me" },
        { id:"covenant", name:"Covenant", roman:"IV", why:"She feels the man, not the project.", outcome:"One unhurried evening with her.", weekly:"Phone down. 90 minutes. Just her.", heat:2, owner:"us" },
        { id:"kingdom", name:"Kingdom", roman:"V", why:"Presence over performance.", outcome:"Word before screens. Serve one.", weekly:"Sunday present. One text of courage.", heat:3, owner:"me" },
      ],
    };
  }

  function load() {
    let s;
    try { s = JSON.parse(localStorage.getItem(KEY) || "null"); } catch { s = null; }
    const today = todayKey();
    if (!s || !s.lanes) s = seed(today);
    if (!s.keyNotes) s.keyNotes = {};
    const brain = s.lanes.find(l => l.id === "brain");
    if (brain && (String(brain.outcome).includes("Three walks") || s.strikes.some(x => (x.text||"").includes("Forge strike")))) {
      brain.outcome = "Sleep 10:30. Neuro-Mag. 3 sessions. MIND plate.";
      brain.weekly = "Neuro-Mag nightly. Three sessions. Dinners as written.";
      s.strikes[0].text = "Lights out 10:30 · Neuro-Mag";
      s.strikes[1].text = todaysMind().strike;
      s.mindV2 = true;
    }
    if (s.strikeDate !== today) {
      s.strikeDate = today;
      s.strikes = s.strikes.map((x,i) => ({ ...x, done:false, text: x.id==="s2" ? todaysMind().strike : x.text }));
    }
    return s;
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }

  let state = load();
  let fire = { step:0, cold:null, smallest:"", identity:"", presence:"" };

  const $ = (id) => document.getElementById(id);
  function toast(msg) {
    const t = $("toast"); t.textContent = msg; t.style.display = "block";
    setTimeout(() => t.style.display = "none", 1600);
  }
  function closeSheet() {
    $("overlay").classList.remove("open");
    $("sheet").hidden = true;
    $("sheet").innerHTML = "";
  }
  function openSheet(html) {
    $("sheet").innerHTML = html;
    $("sheet").hidden = false;
    $("overlay").classList.add("open");
    $("sheet").querySelector(".x")?.addEventListener("click", closeSheet);
  }

  function bindEdit(el, onSave) {
    el.addEventListener("blur", () => {
      const next = (el.textContent || "").replace(/\s+/g," ").trim();
      if (next) onSave(next); else el.textContent = onSave.__cur || next;
    });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); el.blur(); }
    });
  }

  function render() {
    const today = todayKey();
    const dayNum = Math.min(state.windowDays, Math.max(1, daysBetween(state.startedOn, today)+1));
    const ended = daysBetween(state.startedOn, today) >= state.windowDays;
    const remaining = Math.max(0, state.windowDays - dayNum + 1);
    const end = addDays(state.startedOn, state.windowDays-1);
    $("day-label").textContent = ended ? "Window complete" : `Day ${dayNum} of ${state.windowDays}`;
    $("window-label").innerHTML = `${fmt(state.startedOn)} – ${fmt(end)}${ended?"":` · ${remaining} left`}`;
    $("day-bar").style.width = (ended?100:Math.round(dayNum/state.windowDays*100)) + "%";
    $("pull").textContent = state.northStar;

    const done = state.strikes.filter(s => s.done).length;
    $("strike-count").textContent = `${done}/3`;
    $("strikes").innerHTML = state.strikes.map((s,i) => `
      <article class="card">
        <div class="strike">
          <button class="num ${s.done?"done":""}" data-toggle="${s.id}" aria-label="${s.done?"Undo":"Complete"} ${s.text}">${s.done?"✓":String(i+1).padStart(2,"0")}</button>
          <p class="editable" data-strike="${s.id}" contenteditable="true" spellcheck="false" style="margin:.4rem 0 0;line-height:1.35">${esc(s.text)}</p>
        </div>
      </article>
    `).join("") + (done===3 ? `<p class="display muted span-3" style="font-size:1.125rem">Three strikes. Rest.</p>` : "");

    $("lanes").innerHTML = state.lanes.map(lane => {
      const cold = lane.heat <= 1;
      return `<article class="card ${cold?"cold":""}">
        <div class="row">
          <div style="display:flex;gap:.5rem;align-items:center">
            <span style="width:2rem;height:2rem;display:grid;place-items:center;background:var(--elevated);border-radius:4px;color:var(--muted)">${ICONS[lane.id]}</span>
            <div><p class="kicker" style="margin:0">${lane.roman}</p><h3 class="display" style="margin:0;font-size:1.125rem;font-weight:500">${lane.name}</h3></div>
          </div>
          <button class="chip" data-owner="${lane.id}">${OWNER_LABEL[lane.owner]}</button>
        </div>
        <div class="heat" role="group" aria-label="${lane.name} heat">
          ${[1,2,3,4].map(n => `<button data-heat="${lane.id}:${n}" aria-label="Set ${lane.name} heat to ${n}"><i class="${n<=lane.heat?"on":""}"></i></button>`).join("")}
        </div>
        <p class="editable muted" data-field="${lane.id}:why" contenteditable="true" spellcheck="false" style="margin:0;font-size:.875rem">${esc(lane.why)}</p>
        <div><p class="kicker" style="margin:0">30 days</p>
          <p class="editable" data-field="${lane.id}:outcome" contenteditable="true" spellcheck="false" style="margin:.25rem 0 0;font-size:.875rem">${esc(lane.outcome)}</p></div>
        <div style="margin-top:auto"><p class="kicker" style="margin:0">This week</p>
          <p class="editable" data-field="${lane.id}:weekly" contenteditable="true" spellcheck="false" style="margin:.25rem 0 0;font-size:.875rem">${esc(lane.weekly)}</p></div>
      </article>`;
    }).join("") + keyCard();

    $("laws").innerHTML = `<p class="kicker" style="margin:0 0 .5rem">Three laws</p>` +
      LAWS.map((l,i)=>`<li style="display:flex;gap:.75rem;font-size:.875rem;color:var(--muted);margin:.35rem 0"><span class="display" style="width:1.25rem;color:var(--fg)">${String(i+1).padStart(2,"0")}</span>${l}</li>`).join("");

    bindAll();
  }

  function keyCard() {
    return `<article class="card">
      <div class="row">
        <div style="display:flex;gap:.5rem;align-items:center">
          <span style="width:2rem;height:2rem;display:grid;place-items:center;background:var(--elevated);border-radius:4px;color:var(--muted)">${ICONS.key}</span>
          <div><p class="kicker" style="margin:0">VI</p><h3 class="display" style="margin:0;font-size:1.125rem;font-weight:500">The Key</h3></div>
        </div>
      </div>
      <p class="muted" style="margin:0;font-size:.875rem">Tap a word. Read it. Keep yours.</p>
      <div class="chips">${KEY_TERMS.map(t => {
        const kept = Boolean((state.keyNotes[t.id]||"").trim());
        return `<button class="key-chip ${kept?"kept":""}" data-key="${t.id}">${t.label}</button>`;
      }).join("")}</div>
    </article>`;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&" + "amp;")
      .replace(/</g, "&" + "lt;")
      .replace(/>/g, "&" + "gt;")
      .replace(/"/g, "&" + "quot;");
  }

  function bindAll() {
    bindEdit($("pull"), (v) => { state.northStar = v; save(); });
    document.querySelectorAll("[data-toggle]").forEach(btn => btn.addEventListener("click", () => {
      const s = state.strikes.find(x => x.id === btn.dataset.toggle);
      if (s) { s.done = !s.done; save(); render(); }
    }));
    document.querySelectorAll("[data-strike]").forEach(el => bindEdit(el, (v) => {
      const s = state.strikes.find(x => x.id === el.dataset.strike);
      if (s) { s.text = v; save(); }
    }));
    document.querySelectorAll("[data-owner]").forEach(btn => btn.addEventListener("click", () => {
      const lane = state.lanes.find(l => l.id === btn.dataset.owner);
      const i = OWNERS.indexOf(lane.owner);
      lane.owner = OWNERS[(i+1)%OWNERS.length]; save(); render();
    }));
    document.querySelectorAll("[data-heat]").forEach(btn => btn.addEventListener("click", () => {
      const [id, n] = btn.dataset.heat.split(":");
      const lane = state.lanes.find(l => l.id === id);
      const v = Number(n);
      lane.heat = lane.heat === v ? 0 : v; save(); render();
    }));
    document.querySelectorAll("[data-field]").forEach(el => bindEdit(el, (v) => {
      const [id, field] = el.dataset.field.split(":");
      const lane = state.lanes.find(l => l.id === id);
      if (lane) { lane[field] = v; save(); }
    }));
    document.querySelectorAll("[data-key]").forEach(btn => btn.addEventListener("click", () => openKey(btn.dataset.key)));
  }

  function openKey(id) {
    const t = KEY_TERMS.find(x => x.id === id); if (!t) return;
    const note = state.keyNotes[t.id] || "";
    openSheet(`<button class="x" aria-label="Close">✕</button>
      <p class="kicker">The Key</p>
      <h2>${esc(t.label)}</h2>
      <p style="font-size:1rem;line-height:1.55;margin:.75rem 0 0">${esc(t.means)}</p>
      <p class="muted" style="font-size:.875rem;line-height:1.5">${esc(t.onBoard)}</p>
      <p class="kicker">Your note</p>
      <textarea class="field" id="key-note" placeholder="What this means for you. Keep it here.">${esc(note)}</textarea>`);
    $("key-note").addEventListener("input", (e) => {
      state.keyNotes[t.id] = e.target.value; save();
    });
  }

  function openMind() {
    const today = todaysMind();
    openSheet(`<button class="x" aria-label="Close">✕</button>
      <p class="kicker">Brain · rotating plate</p>
      <h2>MIND</h2>
      <p class="muted">Dinner is the meal. Breakfast and snacks stay portable. No fridge at work.</p>
      <div class="today-box"><p class="kicker">Today · ${today.day}</p><p class="display" style="font-size:1.125rem;margin:.5rem 0 0">${esc(today.plate)}</p></div>
      <ol style="padding:0;list-style:none;margin:1rem 0">
        ${DINNERS.map(r => `<li style="display:flex;gap:.75rem;padding:.35rem .5rem;border-radius:4px;font-size:.875rem;${r.day===today.day?"background:var(--elevated)":"color:var(--muted)"}"><span class="display" style="width:2rem;color:var(--fg)">${r.day}</span>${esc(r.plate)}</li>`).join("")}
      </ol>
      <p class="kicker">Breakfast · pick one</p>
      <p class="muted" style="font-size:.875rem;line-height:1.5">${BREAKFASTS.join(" · ")}</p>
      <p class="kicker">Desk snacks · keep two</p>
      <p class="muted" style="font-size:.875rem;line-height:1.5">${SNACKS.join(" · ")}</p>
      <p class="kicker">Sunday prep</p>
      <p class="muted" style="font-size:.875rem;line-height:1.5">${PREP.join(" ")}</p>`);
  }

  function openFire() {
    fire = { step:0, cold: fire.cold, smallest:"", identity:"", presence:"" };
    paintFire();
  }
  function paintFire() {
    const steps = [
      { n:"01", title:"Which lane went cold?", hint:"Tap the empty one. Do not explain it." },
      { n:"02", title:"What is the smallest strike that heats it?", hint:"Six words or fewer. If it feels big, cut it in half." },
      { n:"03", title:"What identity did I keep?", hint:"Finish the sentence. This is the memory, not the task list." },
      { n:"04", title:"Who felt my presence?", hint:"If no one felt you, that is the data. Do not dress it up." },
    ];
    const q = steps[fire.step];
    let body = "";
    if (fire.step === 0) {
      body = state.lanes.map(l => `<button class="lane-pick ${fire.cold===l.id?"on":""}" data-cold="${l.id}"><span class="display">${l.roman}</span> ${l.name} · heat ${l.heat}</button>`).join("");
    } else if (fire.step === 1) {
      body = `<input class="field" id="fire-in" style="min-height:2.75rem" placeholder="Six words or fewer" value="${esc(fire.smallest)}" />`;
    } else if (fire.step === 2) {
      body = `<p class="muted">I am a man who</p><input class="field" id="fire-in" style="min-height:2.75rem" placeholder="kept the lights out" value="${esc(fire.identity)}" />`;
    } else {
      body = ["Tawny","The Lord","One other"].map(p => `<button class="lane-pick ${fire.presence===p?"on":""}" data-pres="${p}">${p}</button>`).join("") +
        (fire.presence==="One other" ? `<input class="field" id="fire-in" style="min-height:2.75rem;margin-top:.5rem" placeholder="Name" />` : "");
    }
    const can = (fire.step===0 && fire.cold) || (fire.step===1 && fire.smallest.trim()) || (fire.step===2 && fire.identity.trim()) || (fire.step===3 && fire.presence);
    openSheet(`<button class="x" aria-label="Close">✕</button>
      <p class="kicker">Weekly Fire · ${q.n}</p>
      <h2>${q.title}</h2>
      <p class="muted">${q.hint}</p>
      <div style="margin:1rem 0">${body}</div>
      <div style="display:flex;gap:.5rem;justify-content:flex-end">
        ${fire.step?`<button class="quiet" id="fire-back">Back</button>`:""}
        <button class="solid" id="fire-next" ${can?"":"disabled"}>${fire.step===3?"Close the fire":"Next"}</button>
      </div>`);
    $("sheet").querySelectorAll("[data-cold]").forEach(b => b.addEventListener("click", () => { fire.cold = b.dataset.cold; paintFire(); }));
    $("sheet").querySelectorAll("[data-pres]").forEach(b => b.addEventListener("click", () => { fire.presence = b.dataset.pres; paintFire(); }));
    const inp = $("fire-in");
    if (inp) inp.addEventListener("input", (e) => {
      if (fire.step===1) fire.smallest = e.target.value;
      if (fire.step===2) fire.identity = e.target.value;
      if (fire.step===3) fire.presence = "One other · " + e.target.value.trim();
      $("fire-next").disabled = !(e.target.value.trim());
    });
    $("fire-back")?.addEventListener("click", () => { fire.step--; paintFire(); });
    $("fire-next")?.addEventListener("click", () => {
      if (fire.step < 3) { fire.step++; paintFire(); return; }
      const presence = fire.presence;
      state.lastReview = { at: todayKey(), coldLane: fire.cold, smallest: fire.smallest.trim(), identity: fire.identity.trim(), presence };
      const lane = state.lanes.find(l => l.id === fire.cold);
      if (lane) lane.heat = 0;
      if (state.strikes[0]) { state.strikes[0].text = fire.smallest.trim() || state.strikes[0].text; state.strikes[0].done = false; }
      save(); closeSheet(); render(); toast("Fire closed");
    });
  }

  function toNotion() {
    const end = addDays(state.startedOn, state.windowDays-1);
    const lines = ["# STRIKE","","**30-Day Magnet Board**","","Window: "+fmt(state.startedOn)+" → "+fmt(end),"","## The Pull",state.northStar,"","## Five Lanes",""];
    state.lanes.forEach(l => {
      lines.push(`### ${l.roman}. ${l.name.toUpperCase()} · ${OWNER_LABEL[l.owner]}`, l.why, "", `- **30 days:** ${l.outcome}`, `- **This week:** ${l.weekly}`, "");
    });
    lines.push("## Today’s 3 Strikes","");
    state.strikes.forEach((s,i) => lines.push(`- [${s.done?"x":" "}] ${i+1}. ${s.text}`));
    return lines.join("\n");
  }

  $("overlay").addEventListener("click", closeSheet);
  $("btn-mind").addEventListener("click", openMind);
  $("btn-fire").addEventListener("click", openFire);
  $("btn-print").addEventListener("click", () => window.print());
  $("btn-copy").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(toNotion()); toast("Copied for Notion"); }
    catch { toast("Copy failed — use print"); }
  });
  $("btn-more").addEventListener("click", () => {
    const m = $("menu"); m.hidden = !m.hidden;
    $("btn-more").setAttribute("aria-expanded", String(!m.hidden));
  });
  $("btn-new").addEventListener("click", () => {
    const today = todayKey();
    state.startedOn = today; state.strikeDate = today; state.lastReview = null;
    state.strikes.forEach(s => { s.done = false; if (s.id==="s2") s.text = todaysMind().strike; });
    state.lanes.forEach(l => l.heat = 2);
    save(); $("menu").hidden = true; render(); toast("New 30-day window");
  });
  $("btn-seed").addEventListener("click", () => {
    state = seed(todayKey()); save(); $("menu").hidden = true; render(); toast("Board restored");
  });
  document.addEventListener("click", (e) => {
    if (!$("menu").contains(e.target) && e.target !== $("btn-more")) $("menu").hidden = true;
  });

  render();
