function generateQR() {
  const text = document.getElementById("qr-text").value;
  const canvas = document.getElementById("qr-canvas");
  const errorMessage = document.getElementById("error-message");
  const downloadBtn = document.getElementById("download-btn");

  errorMessage.textContent = "";
  downloadBtn.classList.add("hidden");
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

  if (!text) {
    errorMessage.textContent = "Por favor ingresa un texto";
    return;
  }

  const options = {
    width: parseInt(document.getElementById("qr-size").value),
    margin: parseInt(document.getElementById("qr-margin").value),
    errorCorrectionLevel: document.getElementById("error-level").value,
    color: {
      dark: document.getElementById("dark-color").value + "ff",
      light: document.getElementById("light-color").value + "ff",
    },
  };
  canvas.hidden = false;
  QRCode.toCanvas(canvas, text, options, (error) => {
    if (error) {
      errorMessage.textContent = `Error: ${error.message}`;
      console.error(error);
    } else {
      downloadBtn.classList.remove("hidden");
      adjustCanvasSize(canvas);
      console.log("QR generado con éxito!");
    }
  });
}

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

function downloadQR() {
  const canvas = document.getElementById("qr-canvas");
  const link = document.createElement("a");
  link.download = "qrcode.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
