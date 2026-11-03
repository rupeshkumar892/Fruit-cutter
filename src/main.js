import "./style.css";

const canvas=document.querySelector("#game"), ctx=canvas.getContext("2d");
const scoreEl=document.querySelector("#score"), levelEl=document.querySelector("#level"), livesEl=document.querySelector("#lives");
const start=document.querySelector("#start"), message=document.querySelector("#message");
const finalScore=document.querySelector("#finalScore"), play=document.querySelector("#play"), restart=document.querySelector("#restart"), pauseBtn=document.querySelector("#pause"), installBtn=document.querySelector("#install");

let W=0,H=0,dpr=1,score=0,lives=3,level=1,running=false,paused=false,last=0,spawn=0,drag=null,fruits=[],particles=[],trail=[];
let deferredPrompt=null;

const kinds=[
  {name:"apple",emoji:"🍎",color:"#e43d30"},
  {name:"orange",emoji:"🍊",color:"#f29b29"},
  {name:"watermelon",emoji:"🍉",color:"#e94b4b"},
  {name:"strawberry",emoji:"🍓",color:"#ed3e50"},
  {name:"banana",emoji:"🍌",color:"#ffd84d"},
  {name:"pineapple",emoji:"🍍",color:"#d9a62b"},
  {name:"kiwi",emoji:"🥝",color:"#8abf45"}
];

function resize(){dpr=Math.min(devicePixelRatio||1,2);W=canvas.clientWidth;H=canvas.clientHeight;canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener("resize",resize);resize();

function reset(){score=0;lives=3;level=1;fruits=[];particles=[];trail=[];scoreEl.textContent=0;livesEl.textContent=3;levelEl.textContent=1}
function startGame(){reset();running=true;paused=false;start.classList.add("hidden");message.classList.add("hidden");last=performance.now();requestAnimationFrame(loop)}
function gameOver(){running=false;message.classList.remove("hidden");finalScore.textContent=`Final score: ${score}`}

function spawnFruit(){
  const bomb=Math.random()<Math.min(.12,.04+level*.008), k=kinds[Math.floor(Math.random()*kinds.length)];
  fruits.push({x:W*(.12+Math.random()*.76),y:H+55,vx:(Math.random()-.5)*(120+level*8),vy:-(650+Math.random()*260+level*20),r:28+Math.random()*13,bomb,k,rot:Math.random()*6.28,vr:(Math.random()-.5)*5,cut:false});
}
function slice(f){if(f.cut)return;f.cut=true;if(f.bomb){lives--;livesEl.textContent=lives;burst(f.x,f.y,"#ff453a",22);if(lives<=0)gameOver();return}score+=10;level=1+Math.floor(score/100);scoreEl.textContent=score;levelEl.textContent=level;burst(f.x,f.y,f.k.color,18)}

function burst(x,y,color,n){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=80+Math.random()*300;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:2+Math.random()*5,life:.5+Math.random()*.45,color})}}
function pointer(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function hit(x,y,f){return Math.hypot(x-f.x,y-f.y)<f.r*1.15}

canvas.addEventListener("pointerdown",e=>{drag=pointer(e);trail.push({...drag,t:performance.now()})});
canvas.addEventListener("pointermove",e=>{if(!drag||!running||paused)return;const p=pointer(e);for(const f of fruits)if(!f.cut&&hit(p.x,p.y,f))slice(f);drag=p;trail.push({...p,t:performance.now()});if(trail.length>16)trail.shift()});
canvas.addEventListener("pointerup",()=>drag=null);
canvas.addEventListener("pointercancel",()=>drag=null);

function drawFruit(f){
  ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.rot);
  if(f.bomb){ctx.fillStyle="#141414";ctx.beginPath();ctx.arc(0,0,f.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#f4a33b";ctx.lineWidth=4;ctx.stroke();ctx.fillStyle="#ffb23e";ctx.fillRect(-3,-f.r-8,6,10);ctx.restore();return}
  const g=ctx.createRadialGradient(-f.r*.3,-f.r*.4,2,0,0,f.r);g.addColorStop(0,"#fff");g.addColorStop(.15,f.k.color);g.addColorStop(1,"#161616");
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,f.r,0,Math.PI*2);ctx.fill();
  ctx.font=`${f.r*1.25}px serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(f.k.emoji,0,3);
  ctx.restore()
}
function draw(){
  ctx.clearRect(0,0,W,H);
  for(const p of particles){ctx.globalAlpha=Math.max(0,p.life*1.5);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
  for(const f of fruits)drawFruit(f);
  if(trail.length>1){ctx.lineCap="round";ctx.lineJoin="round";ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);for(let i=1;i<trail.length;i++)ctx.lineTo(trail[i].x,trail[i].y);ctx.strokeStyle="rgba(235,255,255,.85)";ctx.lineWidth=7;ctx.shadowBlur=18;ctx.shadowColor="#bff";ctx.stroke();ctx.shadowBlur=0}
}
function loop(t){
  if(!running)return;
  const dt=Math.min(.032,(t-last)/1000);last=t;
  if(!paused){
    spawn+=dt;const interval=Math.max(.32,1.05-level*.035);
    if(spawn>interval){spawn=0;spawnFruit();if(Math.random()<.2+level*.01)spawnFruit()}
    for(const f of fruits){f.x+=f.vx*dt;f.vy+=900*dt;f.y+=f.vy*dt;f.rot+=f.vr*dt}
    fruits=fruits.filter(f=>f.cut||f.y<H+90);
    for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=600*dt;p.life-=dt}
    particles=particles.filter(p=>p.life>0);
    trail=trail.filter(p=>t-p.t<130);
  }
  draw();requestAnimationFrame(loop)
}
play.onclick=startGame;restart.onclick=startGame;
pauseBtn.onclick=()=>{if(!running)return;paused=!paused;pauseBtn.textContent=paused?"▶":"Ⅱ"};

addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false});
installBtn.onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;installBtn.hidden=true};

if("serviceWorker" in navigator) addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
