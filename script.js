// 🔥 Firebase config (YOU will replace this)
const firebaseConfig = {
    apiKey: "AIzaSyAkPSp60QVHDaTS4_oSgJqyUjACKrP9iPc",
    authDomain: "lover-s-drawings.firebaseapp.com",
    projectId: "lover-s-drawings",
    storageBucket: "lover-s-drawings.firebasestorage.app",
    messagingSenderId: "214319920314",
    appId: "1:214319920314:web:7c7613d238d5a9e11efe83"
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();


const auth = firebase.auth();

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
  
  let drawing = false;
  
  // ✍️ Drawing logic
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
  drawing = false;
    saveHistory();
}

  
  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDraw);
  canvas.addEventListener("mouseleave", stopDraw);
  
  canvas.addEventListener("touchstart", startDraw);
  canvas.addEventListener("touchmove", draw);
  canvas.addEventListener("touchend", stopDraw);
  
  // 💾 Save drawing
  document.getElementById("saveBtn").onclick = async () => {
    const image = canvas.toDataURL("image/png");
  
    await db.collection("drawings").doc("shared").set({
      image,
      updated: Date.now()
    });
  
    document.getElementById("status").innerText = "Saved 💙";
  };

// 🧹 Clear canvas button
document.getElementById("clearBtn").onclick = async () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff"; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  document.getElementById("status").innerText = "Canvas cleared ✨";

  // Delete saved drawing
  //await db.collection("drawings").doc("shared").delete();
};

const history = [];
let historyStep = -1;

// Call this function **after every stroke**
function saveHistory() {
  // If we undo some steps and then draw again, remove future redo states
  history.splice(historyStep + 1);
  
  // Save current canvas as data URL
  history.push(canvas.toDataURL());
  historyStep++;
}

// Undo function
function undo() {
  if (historyStep > 0) {
    historyStep--;
    let img = new Image();
    img.src = history[historyStep];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    document.getElementById("status").innerText = "Undid last stroke ✨";
  }
}

// Redo function
function redo() {
  if (historyStep < history.length - 1) {
    historyStep++;
    let img = new Image();
    img.src = history[historyStep];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    document.getElementById("status").innerText = "Redid stroke ✨";
  }
}

// Add event listeners for undo/redo buttons
document.getElementById("undoBtn").onclick = undo;
document.getElementById("redoBtn").onclick = redo;

  
  // 📥 Load latest drawing
  async function loadDrawing() {
    const doc = await db.collection("drawings").doc("shared").get();
    if (doc.exists) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = doc.data().image;
    }
  }
  
  loadDrawing();
  
