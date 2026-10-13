let canvas = document.getElementById("graph");
let context = canvas.getContext("2d");
let basePixelsUnit = 30;
let defaultGraphR = 4;
let graphScale = defaultGraphR * basePixelsUnit;
function drawGraph() {
  let centerX = canvas.width / 2;
  let centerY = canvas.height / 2;
  let scale = graphScale;

  context.fillStyle = "lightpink";
  context.fillRect(centerX, centerY, scale / 2, scale);
  context.beginPath();
  context.moveTo(centerX, centerY);
  context.arc(
    centerX,
    centerY,
    scale / 2,
    -Math.PI / 2,
    0
  );
  context.closePath();
  context.fill();
  context.beginPath();
  context.moveTo(centerX - scale, centerY);
  context.lineTo(centerX, centerY);
  context.lineTo(centerX, centerY + scale / 2);
  context.closePath();
  context.fill();
  context.beginPath();

  context.moveTo(20, centerY);
  context.lineTo(canvas.width - 20, centerY);

  context.moveTo(centerX, canvas.height - 20);
  context.lineTo(centerX, 20);

  context.moveTo(canvas.width - 30, centerY - 5);
  context.lineTo(canvas.width - 20, centerY);
  context.lineTo(canvas.width - 30, centerY + 5);

  context.moveTo(centerX - 5, 30);
  context.lineTo(centerX, 20);
  context.lineTo(centerX + 5, 30);
  context.strokeStyle = "black";
  context.lineWidth = 2;
  context.stroke();

  context.fillStyle = "black";
  context.font = "16px sans-serif";

  context.fillText("X", canvas.width - 18, centerY - 10);
  context.fillText("Y", centerX + 10, 18);

  let marks = [scale, scale / 2, -scale / 2, -scale];

  context.beginPath();

  marks.forEach(function(offset) {
    context.moveTo(centerX + offset, centerY - 5);
    context.lineTo(centerX + offset, centerY + 5);

    context.moveTo(centerX - 5, centerY + offset);
    context.lineTo(centerX + 5, centerY + offset);
  });

  context.stroke();
  context.fillText("-R", centerX - scale - 10, centerY - 10);
  context.fillText("-R/2", centerX - scale / 2 - 18, centerY - 10);
  context.fillText("R/2", centerX + scale / 2 - 12, centerY - 10);
  context.fillText("R", centerX + scale - 5, centerY - 10);

  context.fillText("R", centerX + 10, centerY - scale + 5);
  context.fillText("R/2", centerX + 10, centerY - scale / 2 + 5);
  context.fillText("-R/2", centerX + 10, centerY + scale / 2 + 5);
  context.fillText("-R", centerX + 10, centerY + scale + 5);
}
drawGraph();

function checkHit(x, y, radius) {
  let decimalX = new Decimal(x);
  let decimalY = new Decimal(y);
  let decimalR = new Decimal(radius);
  let halfR = decimalR.div(2);

  let inCircle = decimalX.gte(0) && decimalY.gte(0) && decimalX.pow(2).plus(decimalY.pow(2)).lte(halfR.pow(2));
  let inSquare = decimalX.gte(0) && decimalX.lte(halfR) && decimalY.lte(0) && decimalY.gte(decimalR.neg());
  let inTriangle = decimalX.lte(0) && decimalX.gte(decimalR.neg()) && decimalY.lte(0) && decimalY.gte(halfR.neg()) && decimalY.gte(decimalX.plus(decimalR).neg().div(2));
  return inCircle || inSquare || inTriangle;
}
function checkCanvasHit(pointX, pointY) {
  let centerX = canvas.width / 2;
  let centerY = canvas.height / 2;

  let x = pointX - centerX;
  let y = centerY - pointY;
  let scale = graphScale;

  let inCircle = x >= 0 && y >= 0 && x ** 2 + y ** 2 <= (scale / 2) ** 2;
  let inSquare = x >= 0 && x <= scale / 2 && y <= 0 && y >= -scale;
  let inTriangle = x <= 0 && x >= -scale && y <= 0 && y >= -scale / 2 && y >= -(x + scale) / 2;
  return inCircle || inSquare || inTriangle;
}

function drawPoint(pointResult) {
  let centerX = canvas.width / 2;
  let centerY = canvas.height / 2;
  let pointX;
  let pointY;

  if (pointResult.movesWithGraph) {
    pointX = centerX + pointResult.relativeX * graphScale;
    pointY = centerY - pointResult.relativeY * graphScale;
  } else {
    pointX = pointResult.canvasX;
    pointY = pointResult.canvasY;
  }

  let pointHit = checkCanvasHit(pointX, pointY);

  context.beginPath();
  context.arc(pointX, pointY, 4, 0, Math.PI * 2);

  if (pointHit) {
    context.fillStyle = "green";
  } else {
    context.fillStyle = "red";
  }

  context.fill();
}

let form = document.getElementById("points");
let yInput = document.getElementById("y");
let xSelect = document.getElementById("x");
let buttons = document.querySelectorAll(".r-button");
let errorMessage = document.getElementById("error");
let clearButton = document.getElementById("clear");
let R = null;
let savedResults = localStorage.getItem("pointResults");
let results = [];
  if (savedResults !== null) {
    results = JSON.parse(savedResults);
  }
let resultTable = document.getElementById("result");
function addResultToTable(pointResult) {
  let row = resultTable.insertRow(0);
  let xCell = row.insertCell();
  xCell.textContent = pointResult.x;
  let yCell = row.insertCell();
  yCell.textContent = pointResult.y;
  let rCell = row.insertCell();
  if (pointResult.r === null || pointResult.r === undefined) {
    rCell.textContent = "Не указан";
  } else {
    rCell.textContent = Number(pointResult.r).toLocaleString("ru-RU", {
      maximumFractionDigits: 2
  });
}
  let hitCell = row.insertCell();
  if (pointResult.hit) {
    hitCell.textContent = "Попадание";
  } else {
    hitCell.textContent = "Промах";
  }
  let timeCell = row.insertCell();
  timeCell.textContent = new Date(pointResult.timestamp).toLocaleString("ru-RU");
}
results.forEach(function(pointResult) {
  addResultToTable(pointResult);
  drawPoint(pointResult);
});
function redrawCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawGraph();

  results.forEach(function(pointResult) {
    drawPoint(pointResult);
  });
}
canvas.addEventListener("wheel", function(event) {
  event.preventDefault();

  if (event.deltaY < 0) {
    graphScale = graphScale + 10;
  } else {
    graphScale = graphScale - 10;
  }

  graphScale = Math.max(30, Math.min(180, graphScale));

  redrawCanvas();
}, { passive: false });

canvas.addEventListener("click", function(event) {
  errorMessage.hidden = true;

  let canvasRect = canvas.getBoundingClientRect();

  let canvasX =
    (event.clientX - canvasRect.left) *
    (canvas.width / canvasRect.width);

  let canvasY =
    (event.clientY - canvasRect.top) *
    (canvas.height / canvasRect.height);

  let centerX = canvas.width / 2;
  let centerY = canvas.height / 2;

  let clickedX;
  let clickedY;
  let movesWithGraph;
  let relativeX;
  let relativeY;
  let radiusForCheck;
  let rWasSelected;

  if (R === null) {
    clickedX = (canvasX - centerX) / basePixelsUnit;
    clickedY = (centerY - canvasY) / basePixelsUnit;

    radiusForCheck = graphScale / basePixelsUnit;
    rWasSelected = false;
    movesWithGraph = false;
    relativeX = null;
    relativeY = null;
  } else {
    let pixelsUnit = graphScale / R;

    clickedX = (canvasX - centerX) / pixelsUnit;
    clickedY = (centerY - canvasY) / pixelsUnit;

    radiusForCheck = R;
    rWasSelected = true;
    movesWithGraph = true;
    relativeX = (canvasX - centerX) / graphScale;
    relativeY = (centerY - canvasY) / graphScale;
  }

  let hit = checkCanvasHit(canvasX, canvasY);

  let pointResult = {
    x: clickedX.toString(),
    y: clickedY.toString(),
    r: radiusForCheck,
    hit: hit,
    timestamp: Date.now(),
    rWasSelected: rWasSelected,
    movesWithGraph: movesWithGraph,
    relativeX: relativeX,
    relativeY: relativeY,
    canvasX: canvasX,
    canvasY: canvasY
  };

  addResultToTable(pointResult);
  drawPoint(pointResult);
  results.push(pointResult);

  localStorage.setItem(
    "pointResults",
    JSON.stringify(results)
  );
});

clearButton.addEventListener("click", function() {
  results = [];
  localStorage.removeItem("pointResults");
  resultTable.textContent = "";
  redrawCanvas();
});

buttons.forEach(function(button) {
  button.addEventListener("click", function() {
    buttons.forEach(function(otherButton) {
      otherButton.classList.remove("selected");
    });

    button.classList.add("selected");
    R = Number(button.value);
    graphScale = R * basePixelsUnit;
    redrawCanvas();
  });
});

form.addEventListener("submit", function(event) {
  event.preventDefault();
  errorMessage.hidden = true;
  let yText = yInput.value.trim();
  if (yText === ""){
    errorMessage.textContent = "Введите Y";
    errorMessage.hidden = false;
  } else {
    let normalizedY = yText.replace(",", ".");
    if (/^-?\d+([.,]\d+)?$/.test(yText)) {
      let digitsCount = normalizedY.replace(/[-.]/g, "").length;
      Decimal.set({ precision: Math.max(40, digitsCount * 2 + 10) });
      let y = new Decimal(normalizedY);
      if (y.gt(-5) && y.lt(3)){
        let x = Number(xSelect.value);
        if (R === null) {
          errorMessage.textContent = "Выберите R";
          errorMessage.hidden = false;
        } else {
          let decimalX = new Decimal(x);
          let decimalR = new Decimal(R);
          let halfR = decimalR.div(2);
          let inCircle = decimalX.gte(0) && y.gte(0) && decimalX.pow(2).plus(y.pow(2)).lte(halfR.pow(2));
          let inSquare = decimalX.gte(0) && decimalX.lte(halfR) && y.lte(0) && y.gte(decimalR.neg());
          let inTriangle = decimalX.lte(0) && decimalX.gte(decimalR.neg()) && y.lte(0) && y.gte(halfR.neg()) && y.gte(decimalX.plus(decimalR).neg().div(2));
          let hit = inCircle || inSquare || inTriangle;
          let timestamp = Date.now();
          
          let pointResult = {
            x: x,
            y: normalizedY,
            r: R,
            hit: hit,
            timestamp: timestamp,
            rWasSelected: true,
            movesWithGraph: true,
            relativeX: Number(x) / R,
            relativeY: Number(normalizedY) / R
          };
          
          addResultToTable(pointResult);
          drawPoint(pointResult);
          results.push(pointResult);
          localStorage.setItem("pointResults", JSON.stringify(results));
        }
      } else {
        errorMessage.textContent = "Y должен быть больше -5 и меньше 3";
        errorMessage.hidden = false;
      }
    } else {
      errorMessage.textContent = "Y должен быть числом";
      errorMessage.hidden = false;
    }
  }
});
