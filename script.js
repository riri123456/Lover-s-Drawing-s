// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAkPSp60QVHDaTS4_oSgJqyUjACKrP9iPc",
  authDomain: "lover-s-drawings.firebaseapp.com",
  projectId: "lover-s-drawings",
  storageBucket: "lover-s-drawings.firebasestorage.app",
  messagingSenderId: "214319920314",
  appId: "1:214319920314:web:7c7613d238d5a9e11efe83"
};

// 🔥 Init Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// 🔐 Anonymous auth (REQUIRED for your rules)
auth.signInAnonymously().catch(err => {
  console.error("Auth error:", err);
});

// 🎨 Canvas setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 300;
canvas.height = 300;

ctx.lineWidth = 4;
ctx.lineCap = "round";
ctx.strokeStyle = "#000";
ctx.fillStyle = "#fff";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;

// 🧠 Undo / redo history
const history = [];
let historyStep = -1;

function saveHistory() {
  history.splice(historyStep + 1);
  history.push(canvas.toDataURL());
  historyStep++;
}

// ✍️ Drawing helpers
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches ? e.touches[0] : e;
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  };
}

function startDraw(e) {
  drawing = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
  if (!drawing) return;
  const pos = getPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}

function stopDraw() {
  if (!drawing) return;
  drawing = false;
  saveHistory();
}

// 🖱 Mouse + touch events
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mouseleave", stopDraw);

canvas.addEventListener("touchstart", startDraw);
canvas.addEventListener("touchmove", draw);
canvas.addEventListener("touchend", stopDraw);

// 💾 Save drawing to Firestore
document.getElementById("saveBtn").onclick = async () => {
  const image = canvas.toDataURL("image/png");

  await db.collection("drawings").doc("shared").set({
    image,
    updated: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById("status").innerText = "Saved 💙";
};

// 🧹 Clear canvas
document.getElementById("clearBtn").onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveHistory();
  document.getElementById("status").innerText = "Canvas cleared ✨";
};

// ↩ Undo
document.getElementById("undoBtn").onclick = () => {
  if (historyStep > 0) {
    historyStep--;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = history[historyStep];
    document.getElementById("status").innerText = "Undid ✨";
  }
};

// ↪ Redo
document.getElementById("redoBtn").onclick = () => {
  if (historyStep < history.length - 1) {
    historyStep++;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = history[historyStep];
    document.getElementById("status").innerText = "Redid ✨";
  }
};

// 🔄 REAL-TIME SYNC (this is the magic)
db.collection("drawings").doc("shared")
  .onSnapshot(doc => {
    if (!doc.exists) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      saveHistory();
    };
    img.src = doc.data().image;
  });

