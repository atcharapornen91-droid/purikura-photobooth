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

let currentFacing = "user";
let currentStream = null;

const CUT = 360;

/* เปิดกล้อง */
async function startCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop());
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: currentFacing }
  });

  currentStream = stream;
  video.srcObject = stream;
}

startCamera();

/* ฟิลเตอร์ */
function changeFilter() {
  const v = filterSelect.value;
  if (v === "oldmoney" || v === "omgrain") {
    currentFilter =
      "brightness(0.8) contrast(0.7) saturate(0.85) sepia(0.25)";
  } else {
    currentFilter = v;
  }
  video.style.filter = currentFilter;
}

/* สลับกล้อง */
function switchCamera() {
  currentFacing = currentFacing === "user" ? "environment" : "user";
  startCamera();
}

/* สติ๊กเกอร์ */
function selectSticker(s) {
  currentSticker = s;
}

/* นับถอยหลัง */
function startCountdown() {
  if (shots >= maxShots) return;

  let c = 3;
  countdownEl.innerText = c;

  const timer = setInterval(() => {
    c--;
    if (c === 0) {
      clearInterval(timer);
      countdownEl.innerText = "";
      takePhoto();
    } else {
      countdownEl.innerText = c;
    }
  }, 1000);
}

/* Grain */
function addGrain(ctx, w, h) {
  const img = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const g = (Math.random() - 0.5) * 20;
    img.data[i] += g;
    img.data[i + 1] += g;
    img.data[i + 2] += g;
  }
  ctx.putImageData(img, 0, 0);
}

/* ถ่าย */
function takePhoto() {
  const temp = document.createElement("canvas");
  temp.width = CUT;
  temp.height = CUT;
  const tctx = temp.getContext("2d");

  tctx.filter = currentFilter;

  const size = Math.min(video.videoWidth, video.videoHeight);
  const sx = (video.videoWidth - size) / 2;
  const sy = (video.videoHeight - size) / 2;

  tctx.drawImage(video, sx, sy, size, size, 0, 0, CUT, CUT);

  if (filterSelect.value === "omgrain") {
    addGrain(tctx, CUT, CUT);
  }

  tctx.font = "48px sans-serif";
  tctx.fillText(currentSticker, CUT - 70, 60);

  images.push(temp);
  shots++;
  countText.innerText = `ถ่ายไปแล้ว: ${shots} / 3`;

  if (shots === maxShots) combine();
}

/* รวม 3 รูป */
function combine() {
  canvas.width = CUT * 3;
  canvas.height = CUT;

  images.forEach((img, i) => {
    ctx.drawImage(img, i * CUT, 0);
  });

  canvas.style.display = "block";
  download.href = canvas.toDataURL("image/png");
}

