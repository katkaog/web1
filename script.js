let canvas = document.getElementById("graph");
let context = canvas.getContext("2d");
function drawGraph() {
  let centerX = canvas.width / 2;
  let centerY = canvas.height / 2;
  let scale = 120;

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
function drawPoint(pointResult) {
let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
let scale = 120;

let pointX = centerX + pointResult.x / pointResult.r * scale;
let pointY = centerY - pointResult.y / pointResult.r * scale;

context.beginPath();
context.arc(pointX, pointY, 4, 0, Math.PI * 2);

if (pointResult.hit) {
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
let R = null;
let savedResults = localStorage.getItem("pointResults");
let results = [];
  if (savedResults !== null) {
    results = JSON.parse(savedResults);
  }
let resultTable = document.getElementById("result");
function addResultToTable(pointResult) {
  let row = resultTable.insertRow();
  let xCell = row.insertCell();
  xCell.textContent = pointResult.x;
  let yCell = row.insertCell();
  yCell.textContent = pointResult.y;
  let rCell = row.insertCell();
  rCell.textContent = pointResult.r;
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
buttons.forEach(function(button) {
  button.addEventListener("click", function() {
    buttons.forEach(function(otherButton) {
      otherButton.classList.remove("selected");
    });
    button.classList.add("selected");
    R = Number(button.value);
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
            timestamp: timestamp
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
