const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const download = document.getElementById("download");
const countText = document.getElementById("count");
const countdownEl = document.getElementById("countdown");
const filterSelect = document.getElementById("filter");
const ctx = canvas.getContext("2d");

let shots = 0;
const maxShots = 3;
let images = [];
let currentFilter = "none";
let currentSticker = "💖";

/* ขนาดรูป */
const CUT_SIZE = 360;        // 1 รูป = 360x360
const FINAL_WIDTH = CUT_SIZE * 3; // 1080
const FINAL_HEIGHT = CUT_SIZE;    // 360

/* เปิดกล้อง */
navigator.mediaDevices.getUserMedia({
  video: { width: 1280, height: 720 }
}).then(stream => {
  video.srcObject = stream;
});

/* ฟิลเตอร์ */
function changeFilter() {
  currentFilter = filterSelect.value;
  video.style.filter = currentFilter;
}

/* เลือกสติ๊กเกอร์ */
function selectSticker(sticker) {
  currentSticker = sticker;
}

/* เริ่มนับถอยหลัง */
function startCountdown() {
  if (shots >= maxShots) {
    alert("ถ่ายครบแล้วค่ะ 💕");
    return;
  }

  let count = 3;
  countdownEl.innerText = count;

  const timer = setInterval(() => {
    count--;
    if (count === 0) {
      clearInterval(timer);
      countdownEl.innerText = "";
      takePhoto();
    } else {
      countdownEl.innerText = count;
    }
  }, 1000);
}

/* ถ่ายรูป */
function takePhoto() {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = CUT_SIZE;
  tempCanvas.height = CUT_SIZE;
  const tempCtx = tempCanvas.getContext("2d");

  tempCtx.filter = currentFilter;

  /* ครอปเป็นสี่เหลี่ยมตรงกลาง */
  const size = Math.min(video.videoWidth, video.videoHeight);
  const sx = (video.videoWidth - size) / 2;
  const sy = (video.videoHeight - size) / 2;

  tempCtx.drawImage(
    video,
    sx, sy, size, size,
    0, 0, CUT_SIZE, CUT_SIZE
  );

  /* กรอบ */
  tempCtx.strokeStyle = "#ff9acb";
  tempCtx.lineWidth = 16;
  tempCtx.strokeRect(0, 0, CUT_SIZE, CUT_SIZE);

  /* สติ๊กเกอร์ */
  tempCtx.font = "56px sans-serif";
  tempCtx.fillText(currentSticker, CUT_SIZE - 80, 70);

  images.push(tempCanvas);
  shots++;
  countText.innerText = `ถ่ายไปแล้ว: ${shots} / 3`;

  if (shots === maxShots) {
    combinePhotos();
  }
}

/* รวม 3 รูปแนวนอน */
function combinePhotos() {
  canvas.width = FINAL_WIDTH;
  canvas.height = FINAL_HEIGHT;

  for (let i = 0; i < maxShots; i++) {
    ctx.drawImage(images[i], i * CUT_SIZE, 0);
  }

  ctx.font = "32px sans-serif";
  ctx.fillText("プリクラ 💖", 20, FINAL_HEIGHT - 20);

  canvas.style.display = "block";
  download.href = canvas.toDataURL("image/png");
}


