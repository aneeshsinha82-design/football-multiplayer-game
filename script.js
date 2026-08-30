const c=document.getElementById('game'),x=c.getContext('2d');
const keys={};let blue,red,ball,scoreB=0,scoreR=0,time=120,over=false;
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','/'].includes(e.key))e.preventDefault()});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
function reset(full=false){blue={x:250,y:300,color:'#258cff',name:'BLUE',skin:'#d99a6c',dir:1,step:0};red={x:750,y:300,color:'#ef3d45',name:'RED',skin:'#8b573b',dir:-1,step:0};ball={x:500,y:300,vx:0,vy:0,spin:0};over=false;if(full){scoreB=scoreR=0;time=120}document.getElementById('message').textContent='Kick off!'}
function move(p,up,down,left,right){let dx=0,dy=0,s=3.5;if(keys[up])dy-=s;if(keys[down])dy+=s;if(keys[left]){dx-=s;p.dir=-1}if(keys[right]){dx+=s;p.dir=1}p.x+=dx;p.y+=dy;if(dx||dy)p.step+=.35;p.x=Math.max(32,Math.min(968,p.x));p.y=Math.max(45,Math.min(555,p.y))}
function kick(p,key){let dx=ball.x-p.x,dy=ball.y-p.y,d=Math.hypot(dx,dy);if(d<55&&keys[key]){ball.vx=dx/d*11;ball.vy=dy/d*11;keys[key]=false;ball.spin+=1}}
function physics(){ball.x+=ball.vx;ball.y+=ball.vy;ball.vx*=.985;ball.vy*=.985;ball.spin+=.15;if(ball.y<15||ball.y>585)ball.vy*=-.8;if(ball.x<0&&ball.y>220&&ball.y<380){scoreR++;goal('RED SCORES!')}if(ball.x>1000&&ball.y>220&&ball.y<380){scoreB++;goal('BLUE SCORES!')}if(ball.x<12||ball.x>988)ball.vx*=-.8;for(const p of [blue,red]){let dx=ball.x-p.x,dy=ball.y-(p.y+8),d=Math.hypot(dx,dy);if(d<30){ball.vx+=dx/d*1.4;ball.vy+=dy/d*1.4}}}
function goal(msg){document.getElementById('message').textContent=msg;setTimeout(()=>reset(),900)}
function footballer(p){
 const bob=Math.sin(p.step)*2,leg=Math.sin(p.step)*6;
 // shadow
 x.beginPath();x.ellipse(p.x,p.y+25,24,8,0,0,Math.PI*2);x.fillStyle='rgba(0,0,0,.25)';x.fill();
 // legs
 x.strokeStyle='#20242b';x.lineWidth=9;x.lineCap='round';x.beginPath();x.moveTo(p.x-8,p.y+12);x.lineTo(p.x-11+leg,p.y+27);x.moveTo(p.x+8,p.y+12);x.lineTo(p.x+11-leg,p.y+27);x.stroke();
 // boots
 x.strokeStyle='#111';x.lineWidth=7;x.beginPath();x.moveTo(p.x-11+leg,p.y+27);x.lineTo(p.x-16+leg,p.y+28);x.moveTo(p.x+11-leg,p.y+27);x.lineTo(p.x+16-leg,p.y+28);x.stroke();
 // torso jersey
 x.fillStyle=p.color;x.beginPath();x.roundRect(p.x-17,p.y-10+bob,34,31,8);x.fill();
 // jersey stripe
 x.fillStyle='rgba(255,255,255,.18)';x.fillRect(p.x-3,p.y-8+bob,6,27);
 // arms
 x.strokeStyle=p.skin;x.lineWidth=8;x.beginPath();x.moveTo(p.x-15,p.y-4+bob);x.lineTo(p.x-23,p.y+10+bob);x.moveTo(p.x+15,p.y-4+bob);x.lineTo(p.x+23,p.y+10+bob);x.stroke();
 // head
 x.beginPath();x.arc(p.x,p.y-25+bob,15,0,Math.PI*2);x.fillStyle=p.skin;x.fill();
 // hair
 x.fillStyle='#1b1512';x.beginPath();x.arc(p.x,p.y-29+bob,15,Math.PI,Math.PI*2);x.lineTo(p.x+13,p.y-23+bob);x.lineTo(p.x-13,p.y-23+bob);x.fill();
 // face
 x.fillStyle='#222';x.beginPath();x.arc(p.x-5,p.y-25+bob,1.5,0,Math.PI*2);x.arc(p.x+5,p.y-25+bob,1.5,0,Math.PI*2);x.fill();
 // name tag
 x.fillStyle='rgba(0,0,0,.5)';x.fillRect(p.x-26,p.y-56,52,17);x.fillStyle='#fff';x.font='bold 11px Arial';x.textAlign='center';x.fillText(p.name,p.x,p.y-44);
}
function drawBall(){x.save();x.translate(ball.x,ball.y);x.rotate(ball.spin);x.beginPath();x.arc(0,0,12,0,Math.PI*2);x.fillStyle='#fff';x.fill();x.strokeStyle='#222';x.lineWidth=2;x.stroke();x.fillStyle='#222';x.beginPath();x.arc(0,0,4,0,Math.PI*2);x.fill();for(let i=0;i<5;i++){let a=i*Math.PI*2/5;x.beginPath();x.arc(Math.cos(a)*7,Math.sin(a)*7,2,0,Math.PI*2);x.fill()}x.restore()}
function draw(){x.clearRect(0,0,1000,600);let g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,'#2ca85b');g.addColorStop(1,'#19743b');x.fillStyle=g;x.fillRect(0,0,1000,600);
 for(let i=0;i<6;i++){x.fillStyle=i%2?'rgba(0,0,0,.035)':'rgba(255,255,255,.025)';x.fillRect(i*167,0,167,600)}
 x.strokeStyle='#fff';x.lineWidth=5;x.strokeRect(25,25,950,550);x.beginPath();x.moveTo(500,25);x.lineTo(500,575);x.arc(500,300,80,0,Math.PI*2);x.stroke();x.strokeRect(25,220,45,160);x.strokeRect(930,220,45,160);
 footballer(blue);footballer(red);drawBall()}
function loop(){if(!over){move(blue,'w','s','a','d');move(red,'arrowup','arrowdown','arrowleft','arrowright');kick(blue,'f');kick(red,'/');physics()}draw();document.getElementById('blue').textContent=scoreB;document.getElementById('red').textContent=scoreR;requestAnimationFrame(loop)}
setInterval(()=>{if(!over&&time>0){time--;let m=Math.floor(time/60),s=time%60;document.getElementById('time').textContent=m+':'+String(s).padStart(2,'0');if(time===0){over=true;document.getElementById('message').textContent='FULL TIME!'}}},1000);
document.getElementById('restart').onclick=()=>{time=120;reset(true);document.getElementById('time').textContent='02:00'};reset(true);loop();