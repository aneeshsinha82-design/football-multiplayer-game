const board=document.getElementById('board'),statusEl=document.getElementById('status');
const icons={r:'♜',n:'♞',b:'♝',q:'♛',k:'♚',p:'♟'};
let state,turn,selected=null,moves=[],history=[],castling,enPassant=null,gameOver=false,lastMove=null;

function clone(){return {state:state.map(r=>r.slice()),turn,castling:{...castling},enPassant:enPassant&&[...enPassant],lastMove:lastMove&&JSON.parse(JSON.stringify(lastMove))}}
function fresh(){state=[
['r','n','b','q','k','b','n','r'],['p','p','p','p','p','p','p','p'],
['','','','','','','',''],['','','','','','','',''],['','','','','','','',''],['','','','','','','',''],
['P','P','P','P','P','P','P','P'],['R','N','B','Q','K','B','N','R']];
turn='w';selected=null;moves=[];history=[];castling={wK:true,wQ:true,bK:true,bQ:true};enPassant=null;gameOver=false;lastMove=null;render()}
const color=p=>p?(p===p.toUpperCase()?'w':'b'):null;
const inb=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
const enemyOf=c=>c==='w'?'b':'w';

function pseudoMoves(r,c,attack=false){
 const p=state[r][c];if(!p)return[];const side=color(p),t=p.toLowerCase(),out=[];
 const add=(R,C)=>{if(!inb(R,C))return;const q=state[R][C];if(q&&q.toLowerCase()==='k')return;if(attack||color(q)!==side)out.push([R,C])};
 const slide=dirs=>{for(const[dr,dc]of dirs){let R=r+dr,C=c+dc;while(inb(R,C)){if(!state[R][C])out.push([R,C]);else{if(state[R][C].toLowerCase()!=='k'&&(attack||color(state[R][C])!==side))out.push([R,C]);break}R+=dr;C+=dc}}};
 if(t==='p'){let d=side==='w'?-1:1,start=side==='w'?6:1;if(attack){for(const dc of[-1,1])if(inb(r+d,c+dc))out.push([r+d,c+dc]);return out}if(inb(r+d,c)&&!state[r+d][c]){out.push([r+d,c]);if(r===start&&!state[r+2*d][c])out.push([r+2*d,c])}for(const dc of[-1,1]){let R=r+d,C=c+dc;if(inb(R,C)&&state[R][C].toLowerCase()!=='k'&&color(state[R][C])===enemyOf(side))out.push([R,C]);if(enPassant&&enPassant[0]===R&&enPassant[1]===C)out.push([R,C])}}
 if(t==='n')[[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([a,b])=>add(r+a,c+b));
 if(t==='b')slide([[1,1],[1,-1],[-1,1],[-1,-1]]);
 if(t==='r')slide([[1,0],[-1,0],[0,1],[0,-1]]);
 if(t==='q')slide([[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]);
 if(t==='k'){for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(a||b)add(r+a,c+b);
   if(!attack&&!isInCheck(side)){let row=side==='w'?7:0;
    if(c===4&&castling[side+'K']&&state[row][7]===(side==='w'?'R':'r')&&!state[row][5]&&!state[row][6]&&!isSquareAttacked(row,5,enemyOf(side))&&!isSquareAttacked(row,6,enemyOf(side)))out.push([row,6]);
    if(c===4&&castling[side+'Q']&&state[row][0]===(side==='w'?'R':'r')&&!state[row][1]&&!state[row][2]&&!state[row][3]&&!isSquareAttacked(row,3,enemyOf(side))&&!isSquareAttacked(row,2,enemyOf(side)))out.push([row,2]);
   }}
 return out;
}
function findKing(side){for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(state[r][c]===(side==='w'?'K':'k'))return[r,c];return null}
function isSquareAttacked(r,c,by){for(let R=0;R<8;R++)for(let C=0;C<8;C++)if(color(state[R][C])===by&&pseudoMoves(R,C,true).some(m=>m[0]===r&&m[1]===c))return true;return false}
function isInCheck(side){const k=findKing(side);return k?isSquareAttacked(k[0],k[1],enemyOf(side)):true}
function makeMove(fr,fc,tr,tc,simulate=false){
 const piece=state[fr][fc],side=color(piece),target=state[tr][tc];state[tr][tc]=piece;state[fr][fc]='';
 if(piece.toLowerCase()==='p'&&enPassant&&tr===enPassant[0]&&tc===enPassant[1]&&!target)state[fr][tc]='';
 if(piece.toLowerCase()==='k'&&Math.abs(tc-fc)===2){const row=fr;if(tc===6){state[row][5]=state[row][7];state[row][7]=''}else{state[row][3]=state[row][0];state[row][0]=''}}
 if(piece==='K'){castling.wK=false;castling.wQ=false}if(piece==='k'){castling.bK=false;castling.bQ=false}
 if(fr===7&&fc===0)castling.wQ=false;if(fr===7&&fc===7)castling.wK=false;if(fr===0&&fc===0)castling.bQ=false;if(fr===0&&fc===7)castling.bK=false;
 if(tr===7&&tc===0)castling.wQ=false;if(tr===7&&tc===7)castling.wK=false;if(tr===0&&tc===0)castling.bQ=false;if(tr===0&&tc===7)castling.bK=false;
 enPassant=null;if(piece.toLowerCase()==='p'&&Math.abs(tr-fr)===2)enPassant=[(tr+fr)/2,fc];
 if(piece.toLowerCase()==='p'&&(tr===0||tr===7))state[tr][tc]=side==='w'?'Q':'q';
 if(!simulate)lastMove={fr,fc,tr,tc};
}
function legalMoves(r,c){const side=color(state[r][c]);if(side!==turn)return[];return pseudoMoves(r,c).filter(([tr,tc])=>{const save=clone();makeMove(r,c,tr,tc,true);const bad=isInCheck(side);state=save.state;turn=save.turn;castling=save.castling;enPassant=save.enPassant;lastMove=save.lastMove;return !bad})}
function allLegal(side){const old=turn;turn=side;let a=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(color(state[r][c])===side)a.push(...legalMoves(r,c));turn=old;return a}
function finishStatus(){const check=isInCheck(turn),available=allLegal(turn);if(!available.length){gameOver=true;statusEl.textContent=check?(turn==='w'?'Checkmate — Black wins!':'Checkmate — White wins!'):'Draw — Stalemate';return}statusEl.textContent=check?(turn==='w'?'White is in CHECK — you must escape the check!':'Black is in CHECK — you must escape the check!'):(turn==='w'?'White to move':'Black to move')}
function render(){board.innerHTML='';for(let r=0;r<8;r++)for(let c=0;c<8;c++){const d=document.createElement('div'),p=state[r][c];d.className='sq '+((r+c)%2?'dark':'light');
 if(selected&&selected[0]===r&&selected[1]===c)d.classList.add('selected');if(lastMove&&((lastMove.fr===r&&lastMove.fc===c)||(lastMove.tr===r&&lastMove.tc===c)))d.classList.add('last');
 if(moves.some(m=>m[0]===r&&m[1]===c))d.classList.add(p?'capture':'legal');
 if((c===0||r===7)){const label=document.createElement('small');label.className='coord';label.textContent=c===0?8-r:String.fromCharCode(97+c);d.appendChild(label)}
 if(p){const s=document.createElement('span');s.className='piece '+(color(p)==='w'?'white':'black');s.textContent=icons[p.toLowerCase()];d.appendChild(s)}d.onclick=()=>click(r,c);board.appendChild(d)}finishStatus()}
function click(r,c){if(gameOver)return;const p=state[r][c];if(selected&&moves.some(m=>m[0]===r&&m[1]===c)){history.push(clone());makeMove(selected[0],selected[1],r,c);selected=null;moves=[];turn=enemyOf(turn);render();return}if(p&&color(p)===turn){selected=[r,c];moves=legalMoves(r,c)}else{selected=null;moves=[]}render()}
document.getElementById('restart').onclick=fresh;document.getElementById('undo').onclick=()=>{const h=history.pop();if(h){state=h.state;turn=h.turn;castling=h.castling;enPassant=h.enPassant;lastMove=h.lastMove;selected=null;moves=[];gameOver=false;render()}};fresh();