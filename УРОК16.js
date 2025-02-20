const canvas = document.getElementById("drawingCanvas");
      const ctx = canvas.getContext("2d");
      let isDrawing = false;
      let currentColor = "#000000";
      let currentOpacity = 1;

      // Настройки размеров
      const sizes = {
        pen: 5,
        eraser: 10,
      };
      let currentTool = "pen";

      // Элементы управления
      const penSize = document.getElementById("penSize");
      const sizeDisplay = document.getElementById("sizeDisplay");
      const opacityInput = document.getElementById("opacity");
      const opacityDisplay = document.getElementById("opacityDisplay");

      // Система истории
      let historyStack = [];
      let currentStep = -1;

      // Инициализация
      initializeCanvas();

      function initializeCanvas() {
        ctx.lineCap = "round";
        updateStrokeStyle();
        saveState();
      }

      // Функция конвертации HEX в RGB
      function hexToRgb(hex) {
        hex = hex.replace(/^#/, "");
        let r, g, b;
        if (hex.length === 3) {
          r = parseInt(hex[0] + hex[0], 16);
          g = parseInt(hex[1] + hex[1], 16);
          b = parseInt(hex[2] + hex[2], 16);
        } else {
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
        }
        return { r, g, b };
      }

      // Обновление стиля кисти
      function updateStrokeStyle() {
        if (currentTool === "eraser") {
          ctx.globalAlpha = currentOpacity;
          ctx.globalCompositeOperation = "destination-out";
        } else {
          const rgb = hexToRgb(currentColor);
          ctx.globalAlpha = currentOpacity;
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${currentOpacity})`;
        }
      }

      // История действий
      function saveState() {
        currentStep++;
        if (currentStep < historyStack.length) {
          historyStack.length = currentStep;
        }
        historyStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      }

      function undo() {
        if (currentStep > 0) {
          currentStep--;
          ctx.putImageData(historyStack[currentStep], 0, 0);
        }
      }

      function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        historyStack = [];
        currentStep = -1;
        saveState();
      }

      // Обработчики инструментов
      document.querySelectorAll(".color-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          document
            .querySelectorAll(".color-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");

          currentTool = btn.classList.contains("eraser") ? "eraser" : "pen";
          if (currentTool === "pen") currentColor = btn.dataset.color;

          ctx.lineWidth = sizes[currentTool];
          penSize.value = sizes[currentTool];
          sizeDisplay.textContent = sizes[currentTool];
          updateStrokeStyle();
        });
      });

      // Обработчики изменений
      penSize.addEventListener("input", function () {
        sizes[currentTool] = parseInt(this.value);
        ctx.lineWidth = parseInt(this.value);
        sizeDisplay.textContent = this.value;
      });

      opacityInput.addEventListener("input", function () {
        currentOpacity = parseFloat(this.value);
        opacityDisplay.textContent = `${Math.round(currentOpacity * 100)}%`;
        updateStrokeStyle();
      });

      // Кнопки действий
      document.getElementById("undoBtn").addEventListener("click", undo);
      document
        .getElementById("clearBtn")
        .addEventListener("click", clearCanvas);

      // Обработчики рисования
      canvas.addEventListener("mousedown", startDrawing);
      canvas.addEventListener("mousemove", draw);
      canvas.addEventListener("mouseup", stopDrawing);
      canvas.addEventListener("mouseout", stopDrawing);

      function startDrawing(e) {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
      }

      function draw(e) {
        if (!isDrawing) return;
        ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.stroke();
      }

      function stopDrawing() {
        if (isDrawing) {
          saveState();
          isDrawing = false;
        }
      }