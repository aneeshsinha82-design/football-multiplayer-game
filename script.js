const board=document.getElementById('board'),statusEl=document.getElementById('status');
const icons={r:'♜',n:'♞',b:'♝',q:'♛',k:'♚',p:'♟'};
let state,turn,selected,moves,history;
function fresh(){state=[
['r','n','b','q','k','b','n','r'],
['p','p','p','p','p','p','p','p'],
['','','','','','','',''],['','','','','','','',''],['','','','','','','',''],['','','','','','','',''],
['P','P','P','P','P','P','P','P'],
['R','N','B','Q','K','B','N','R']];turn='w';selected=null;moves=[];history=[];render()}
function color(p){return p&&p===p.toUpperCase()?'w':p?'b':null}
function inb(r,c){return r>=0&&r<8&&c>=0&&c<8}
function slide(r,c,dirs,res){for(const[dR,dC]of dirs){let R=r+dR,C=c+dC;while(inb(R,C)){if(!state[R][C])res.push([R,C]);else{if(color(state[R][C])!==turn)res.push([R,C]);break}R+=dR;C+=dC}}}
function legal(r,c){const p=state[r][c],t=p.toLowerCase(),res=[],enemy=turn==='w'?'b':'w';
if(t==='p'){let d=turn==='w'?-1:1,start=turn==='w'?6:1;if(inb(r+d,c)&&!state[r+d][c]){res.push([r+d,c]);if(r===start&&!state[r+2*d][c])res.push([r+2*d,c])}for(const dc of[-1,1])if(inb(r+d,c+dc)&&color(state[r+d][c+dc])===enemy)res.push([r+d,c+dc])}
if(t==='n')for(const[a,b]of[[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]])if(inb(r+a,c+b)&&color(state[r+a][c+b])!==turn)res.push([r+a,c+b]);
if(t==='b')slide(r,c,[[1,1],[1,-1],[-1,1],[-1,-1]],res);if(t==='r')slide(r,c,[[1,0],[-1,0],[0,1],[0,-1]],res);if(t==='q')slide(r,c,[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]],res);
if(t==='k')for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if((a||b)&&inb(r+a,c+b)&&color(state[r+a][c+b])!==turn)res.push([r+a,c+b]);return res}
function render(){board.innerHTML='';for(let r=0;r<8;r++)for(let c=0;c<8;c++){let d=document.createElement('div'),p=state[r][c];d.className='sq '+((r+c)%2?'dark':'light');if(selected&&selected[0]===r&&selected[1]===c)d.classList.add('selected');if(moves.some(m=>m[0]===r&&m[1]===c))d.classList.add(p?'capture':'legal');if(p){let s=document.createElement('span');s.className='piece '+(color(p)==='w'?'white':'black');s.textContent=icons[p.toLowerCase()];d.appendChild(s)}d.onclick=()=>click(r,c);board.appendChild(d)}statusEl.textContent=(turn==='w'?'White':'Black')+' to move'}
function click(r,c){const p=state[r][c];if(selected&&moves.some(m=>m[0]===r&&m[1]===c)){history.push({state:state.map(a=>a.slice()),turn});let piece=state[selected[0]][selected[1]];state[r][c]=piece;state[selected[0]][selected[1]]='';if(piece.toLowerCase()==='p'&&(r===0||r===7))state[r][c]=turn==='w'?'Q':'q';selected=null;moves=[];turn=turn==='w'?'b':'w';render();return}if(p&&color(p)===turn){selected=[r,c];moves=legal(r,c)}else{selected=null;moves=[]}render()}
document.getElementById('restart').onclick=fresh;document.getElementById('undo').onclick=()=>{let h=history.pop();if(h){state=h.state;turn=h.turn;selected=null;moves=[];render()}};fresh();