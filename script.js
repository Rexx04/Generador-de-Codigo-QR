// --- Función para mostrar/ocultar el input de color final de degradado y actualizar etiquetas ---
function toggleGradientInput() {
  const colorType = document.getElementById("color-type").value;
  const gradientGroup = document.getElementById("gradient-color-group");
  const gradientAngleGroup = document.getElementById("gradient-angle-group");
  const darkLabel = document.getElementById("dark-color-label");
  const lightLabel = document.getElementById("light-color-label");
  // Actualiza visibilidad y etiquetas según el tipo de color
  if (colorType === "gradient") {
    gradientGroup.style.display = "block";
    gradientAngleGroup.style.display = "block";
    darkLabel.textContent = "Color de inicio";
    lightLabel.textContent = "Color de fondo";
  } else {
    gradientGroup.style.display = "none";
    gradientAngleGroup.style.display = "none";
    darkLabel.textContent = "Color de código";
    lightLabel.textContent = "Color de fondo";
  }
}
window.addEventListener('DOMContentLoaded', toggleGradientInput);

// --- Dibuja el logotipo en el centro del QR ---
function drawLogoOnQR(canvas) {
  const logoInput = document.getElementById("logo-input");
  const logoSize = parseInt(document.getElementById("logo-size").value) || 80;
  if (!logoInput.files || logoInput.files.length === 0) return; // No hay imagen
  const file = logoInput.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const ctx = canvas.getContext("2d");
      const x = (canvas.width - logoSize) / 2;
      const y = (canvas.height - logoSize) / 2;
      ctx.drawImage(img, x, y, logoSize, logoSize);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// --- Función principal para generar el QR ---
function generateQR() {
  // Obtiene referencias a los elementos
  const text = document.getElementById("qr-text").value;
  const canvas = document.getElementById("qr-canvas");
  const errorMessage = document.getElementById("error-message");
  const downloadBtn = document.getElementById("download-btn");
  const colorType = document.getElementById("color-type").value;
  const darkColor = document.getElementById("dark-color").value;
  const gradientColor = document.getElementById("gradient-color").value;
  const lightColor = document.getElementById("light-color").value;

  // Limpia mensajes y canvas
  errorMessage.textContent = "";
  downloadBtn.classList.add("hidden");
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

  // Valida el texto
  if (!text) {
    errorMessage.textContent = "Por favor ingresa un texto";
    return;
  }

  // Opciones para la librería QRCode
  const options = {
    width: parseInt(document.getElementById("qr-size").value),
    margin: parseInt(document.getElementById("qr-margin").value),
    errorCorrectionLevel: document.getElementById("error-level").value,
    color: {
      dark: darkColor + "ff",
      light: lightColor + "ff",
    },
  };
  canvas.hidden = false;

  // Genera el QR y aplica degradado si corresponde
  QRCode.toCanvas(canvas, text, options, (error) => {
    if (error) {
      errorMessage.textContent = `Error: ${error.message}`;
      console.error(error);
    } else {
      if (colorType === "gradient") {
        applyGradientToQR(canvas, darkColor, gradientColor);
      }
      drawLogoOnQR(canvas); // Dibuja el logotipo si se seleccionó
      downloadBtn.classList.remove("hidden");
      adjustCanvasSize(canvas);
      console.log("QR generado con éxito!");
    }
  });
}

// --- Aplica un degradado con ángulo personalizado al QR ya generado en el canvas ---
function applyGradientToQR(canvas, colorStart, colorEnd) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Convierte color hex a array RGB
  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const num = parseInt(hex, 16);
    return [num >> 16, (num >> 8) & 255, num & 255];
  }
  const rgbStart = hexToRgb(colorStart);
  const rgbEnd = hexToRgb(colorEnd);
  const tolerance = 32; // Tolerancia para comparar colores

  // Obtiene el ángulo del input
  const angleInput = document.getElementById("gradient-angle");
  const angle = angleInput ? parseInt(angleInput.value) : 90;
  // Calcula el vector de dirección del gradiente
  const rad = (angle % 360) * Math.PI / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  // Normaliza para que cubra el canvas
  const len = Math.abs(width * dx) + Math.abs(height * dy);

  // Recorre cada píxel y aplica el gradiente según el ángulo
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // Compara el color del píxel con el color de inicio
      if (
        Math.abs(data[idx] - rgbStart[0]) < tolerance &&
        Math.abs(data[idx + 1] - rgbStart[1]) < tolerance &&
        Math.abs(data[idx + 2] - rgbStart[2]) < tolerance
      ) {
        // Calcula la posición relativa sobre el gradiente
        const proj = (x * dx + y * dy) / len;
        const t = Math.min(Math.max(proj, 0), 1);
        const r = Math.round(rgbStart[0] * (1 - t) + rgbEnd[0] * t);
        const g = Math.round(rgbStart[1] * (1 - t) + rgbEnd[1] * t);
        const b = Math.round(rgbStart[2] * (1 - t) + rgbEnd[2] * t);
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

// --- Ajusta el tamaño del canvas para que se adapte al contenedor ---
function adjustCanvasSize(canvas) {
  const container = canvas.parentElement;
  const containerWidth = container.clientWidth;
  if (canvas.width > containerWidth) {
    const scale = containerWidth / canvas.width;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${canvas.height * scale}px`;
  } else {
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
  }
}

// --- Descarga la imagen del QR generado ---
function downloadQR() {
  const canvas = document.getElementById("qr-canvas");
  const link = document.createElement("a");
  link.download = "qrcode.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
