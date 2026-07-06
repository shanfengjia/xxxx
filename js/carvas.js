const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const brushBtn = document.getElementById("brushBtn");
const eraserBtn = document.getElementById("eraserBtn");
const customColorInput = document.getElementById("customColorInput");

let drawing = false;
let color = "#111";
let size = 5;
let isEraser = false;
let lastX = 0;
let lastY = 0;
let history = [];
let step = -1;

// 水墨核心参数，晕染明显
const spread = 0.3;
const layers = 4;
const baseAlpha = 0.28;

document.getElementById("size").oninput = function(){
    size = Number(this.value);
}
customColorInput.oninput = function(){
    color = this.value;
    isEraser = false;
    switchTool(false);
}
function changeColor(c){
    color = c;
    customColorInput.value = c;
    isEraser = false;
    switchTool(false);
}
function switchTool(eraserMode){
    isEraser = eraserMode;
    if(eraserMode){
        brushBtn.classList.remove("active");
        eraserBtn.classList.add("active");
    }else{
        brushBtn.classList.add("active");
        eraserBtn.classList.remove("active");
    }
}
brushBtn.onclick = ()=>switchTool(false);
eraserBtn.onclick = ()=>switchTool(true);

canvas.onmousedown = function(e){
    drawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
    save();
}
canvas.onmousemove = function(e){
    if(!drawing) return;
    drawLine(lastX,lastY,e.offsetX,e.offsetY);
    lastX = e.offsetX;
    lastY = e.offsetY;
}
window.onmouseup = function(){
    drawing = false;
}

// 真正实现多层水墨晕染线条
function drawLine(x1,y1,x2,y2){
    if(isEraser){
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
        return;
    }
    // multiply 叠加，重叠线条自动加深墨色
    ctx.globalCompositeOperation = "multiply";
    let maxW = size*(1+spread);
    // 由外到内多层淡墨扩散
    for(let i=0;i<layers;i++){
        let w = maxW - (maxW - size)*(i/layers);
        let a = baseAlpha + i*0.12;
        ctx.lineWidth = w;
        ctx.lineCap = "round";
        ctx.strokeStyle = hexToRGBA(color,a);
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
}
// 颜色转换工具
function hexToRGBA(hex,a){
    let r = parseInt(hex.slice(1,3),16);
    let g = parseInt(hex.slice(3,5),16);
    let b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
}

// 历史记录
function save(){
    step++;
    history.length = step;
    history.push(canvas.toDataURL());
}
function undo(){
    if(step<=0) return;
    step--;
    let img = new Image();
    img.src = history[step];
    img.onload = ()=>{
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img,0,0);
    }
}
function redo(){
    if(step >= history.length-1) return;
    step++;
    let img = new Image();
    img.src = history[step];
    img.onload = ()=>{
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img,0,0);
    }
}
function clearCanvas(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    save();
}
save();