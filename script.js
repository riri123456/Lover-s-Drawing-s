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
  
