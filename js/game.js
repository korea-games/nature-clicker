(()=>{
'use strict';
const W=320,H=180;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const lo=document.createElement('canvas');lo.width=W;lo.height=H;const g=lo.getContext('2d');
const STAGES=['씨앗','새싹','풀밭','꽃밭','나무','숲','세계수'];
const STAGE_COST=[100,800,5000,25000,110000,450000];
const UP=[
 {k:'click',name:'손끝 강화',desc:'클릭당 잎 +1',base:10,mul:1.45},
 {k:'wind',name:'바람 강화',desc:'기본 회전 속도 +0.12',base:25,mul:1.5},
 {k:'root',name:'뿌리 강화',desc:'회전으로 얻는 잎 x1.3',base:60,mul:1.8},
 {k:'stage',name:'성장',desc:'',base:0,mul:1},
];
const SAVE='natureClicker.v1',BEST='natureClicker.best';
let S;
function fresh(){return{leaves:0,click:0,wind:0,root:0,stage:0,omega:0,ang:0,t:0,clicks:0,done:false,started:false};}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE));if(s&&typeof s.leaves==='number')return Object.assign(fresh(),s);}catch(e){}return fresh();}
function save(){try{localStorage.setItem(SAVE,JSON.stringify(S));}catch(e){}}
S=load();
let best=+localStorage.getItem(BEST)||0;
const stageMul=()=>Math.pow(1.8,S.stage);
const baseSpin=()=>0.05+S.wind*0.12;
const spinCap=()=>baseSpin()+1.2;
const clickGain=()=>(1+S.click)*stageMul();
const perSec=()=>S.omega*6*Math.pow(1.3,S.root)*stageMul();
function cost(u){if(u.k==='stage')return S.stage<6?STAGE_COST[S.stage]:Infinity;return Math.floor(u.base*Math.pow(u.mul,S[u.k]));}
function buy(i){const u=UP[i],c=cost(u);if(S.done||S.leaves<c)return false;S.leaves-=c;
 if(u.k==='stage'){S.stage++;burst(40);beep(660,.12);if(S.stage>=6){S.done=true;if(!best||S.t<best){best=S.t;localStorage.setItem(BEST,best);}}}
 else{S[u.k]++;beep(520,.06);}save();return true;}
function tap(){if(S.done)return;S.started=true;S.leaves+=clickGain();S.clicks++;S.omega=Math.min(spinCap(),S.omega+0.09);furKick();
 floats.push({x:CX+(Math.random()*30-15),y:CY-R()-8,v:'+'+fmt(clickGain()),l:1});beep(300+Math.random()*80,.03);}
function step(dt){if(S.started&&!S.done)S.t+=dt;
 const b=baseSpin();if(S.started)S.omega+=(b-S.omega)*Math.min(1,dt*0.6);if(S.omega<b&&S.started)S.omega=b;
 S.ang+=S.omega*Math.PI*2*dt*0.25;if(!S.done)S.leaves+=perSec()*dt;}
// audio
let ac=null;function beep(f,d){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),gn=ac.createGain();o.type='square';o.frequency.value=f;gn.gain.value=.04;gn.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(gn).connect(ac.destination);o.start();o.stop(ac.currentTime+d);}catch(e){}}
function fmt(n){n=Math.floor(n);if(n>=1e6)return (n/1e6).toFixed(1)+'M';if(n>=1e4)return (n/1e3).toFixed(1)+'K';return ''+n;}
function tfmt(s){s=Math.floor(s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
// layout
const CX=105,CY=96;const R=()=>14+S.stage*3.5;
let floats=[],parts=[];
function burst(n){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=20+Math.random()*40;parts.push({x:CX,y:CY,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1});}}
// stars bg deterministic
const stars=[];{let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<60;i++)stars.push([r()*W,r()*H,r()]);}
function px(x,y,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),1,1);}
function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);}
// sphere texture: deterministic hash noise in (lon,lat)
function hsh(i,j){let h=(i*374761393+j*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967295;}
function vn(u,v){const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,a=hsh(i,j),b=hsh(i+1,j),c=hsh(i,j+1),d=hsh(i+1,j+1),su=fu*fu*(3-2*fu),sv=fv*fv*(3-2*fv);return a+(b-a)*su+(c-a)*sv+(a-b-c+d)*su*sv;}
const LONS=48;// texture wraps every LONS units of longitude
function noise(lon,lat,sc){const u=lon/6.2832*LONS*sc,v=lat*LONS/6.2832*sc,P=LONS*sc;const uu=((u%P)+P)%P;
 const i=Math.floor(uu),j=Math.floor(v),fu=uu-i,fv=v-j,w=k=>k%P,a=hsh(i,j),b=hsh(w(i+1),j),c=hsh(i,j+1),d=hsh(w(i+1),j+1),su=fu*fu*(3-2*fu),sv=fv*fv*(3-2*fv);return a+(b-a)*su+(c-a)*sv+(a-b-c+d)*su*sv;}
function grassAmt(lon,lat){const cov=COVER[S.stage];if(cov<=0)return 0;const n1=noise(lon,lat,0.35),n2=noise(lon,lat,1.3);const a=Math.max(0,Math.min(1,(cov-n1)/0.09)),b=Math.max(0,Math.min(1,(n2-0.12)/0.08));return a*b;}
const COVER=[0,0.08,0.45,0.6,0.7,0.8,0.9];
// surface features (lon,lat) fixed on sphere
const feats=[];{let s=11;const r=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<140;i++)feats.push({lon:r()*6.2832,lat:Math.asin(r()*1.8-0.9),t:r(),ph:r()*6.28,c:i%3});}
const STR=[];{let s=5;const r=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<1400;i++)STR.push({lon:r()*6.2832,lat:Math.asin(r()*2-1),len:2+r()*2,ph:r()*6.28});}
// rim fur like Space Runner: spring strands, kicked by clicks
let fur=new Float32Array(200),furV=new Float32Array(200);
function furKick(){for(let i=0;i<fur.length;i++)furV[i]+=(Math.random()-.5)*14;}
function furStep(dt){for(let i=0;i<fur.length;i++){furV[i]+=(-90*fur[i]-7*furV[i])*dt;fur[i]+=furV[i]*dt;}}
function proj(lon,lat,r){const L=lon+S.ang,x=Math.cos(lat)*Math.sin(L),z=Math.cos(lat)*Math.cos(L),y=-Math.sin(lat);return[CX+x*r,CY+y*r,z];}
function band(nx,ny,nz){const l=Math.max(0,-0.5*nx-0.55*ny+0.67*nz);return l>0.62?3:l>0.3?2:1;}
const PG=['#204e22','#285e28','#367c32','#4c9a3e'],PD=['#301e10','#3e2616','#5a3a22','#74502e'],PR=['#3a3a42','#4a4a52','#6a6a72','#8a8a90'];
const SHD='rgba(16,36,12,0.38)';
const SG=[['#0e2416','#1a3e20'],['#1a3e20','#2e6a2c'],['#2e6a2c','#4e9a3c'],['#4e9a3c','#90d46c']];
const TC=[['#08180c','#10281a','#0a1c10'],['#10281a','#1e4a24','#0e2416'],['#1e4a24','#2e6e2c','#14321a'],['#2e6e2c','#4c9a3e','#1a3e20']];
function drawPlanet(time){
 const r=R(),cov=COVER[S.stage];
 const D=2*r+3,M=new Int8Array(D*D).fill(-1),SH=new Int8Array(D*D),o=r+1;
 for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){if(x*x+y*y>r*r)continue;
  const nx=x/r,ny=y/r,nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));
  const lat=Math.asin(-ny),lon=Math.atan2(nx,nz)-S.ang;
  const n1=noise(lon,lat,0.35),n2=noise(lon,lat,1.3);const k=(y+o)*D+x+o;
  M[k]=(n1<cov&&n2>0.12)?0:(n2<0.14?1:2);SH[k]=band(nx,ny,nz);}
 for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const k=(y+o)*D+x+o,m=M[k];if(m<0)continue;
  const pal=m===0?PG:m===1?PR:PD;let sh=SH[k];
  if(m!==0&&M[k-D-1]===0)sh=Math.max(0,sh-1);// soft shadow line where grass meets bare ground
  px(CX+x,CY+y,pal[sh]);}
 // features on front face
 const list=feats.map(f=>{const[sx,sy,z]=proj(f.lon,f.lat,r);return{f,sx,sy,z};}).filter(o=>o.z>0.08).sort((a,b)=>a.z-b.z);
 for(const{f,sx,sy,z}of list){const fb=band((sx-CX)/r,(sy-CY)/r,z);
  const ga=grassAmt(f.lon,f.lat);const sway=Math.sin(time*2.4+f.ph)*(0.4+S.omega*0.25);
  if(S.stage===0){continue;}
  if(hsh(f.ph*1000|0,7)>=ga)continue;
  if(S.stage===1&&f.t>0.15)continue;
  let kind='grass';if(S.stage>=3&&f.t>0.72)kind='flower';if(S.stage>=4&&f.t>0.86)kind='tree';if(S.stage>=5&&f.t>0.6)kind='tree';
  if(kind==='grass'){continue;const h=S.stage===1?1:Math.max(1,Math.round(ga*(2+(f.t*10|0)%2)));for(let k=1;k<=h;k++)px(sx+Math.round(sway*k/h),sy-k,k===h?'#8ed06a':'#5aa844');}
  else if(kind==='flower'){rect(sx+1,sy,1,1,SHD);px(sx,sy-1,'#2e6a2c');px(sx+Math.round(sway*.6),sy-2,'#4c9a3e');px(sx+Math.round(sway),sy-3,['#e05a70','#e8c840','#b080e0'][f.c]);}
  else{g.fillStyle=SHD;g.fillRect(Math.round(sx)+1,Math.round(sy),2,1);g.fillRect(Math.round(sx)+2,Math.round(sy)+1,1,1);const big=S.stage>=6&&f.t>0.93,th=big?6:3;for(let k=1;k<=th;k++)px(sx,sy-k,'#3a200e');
   const cr=big?3.2:1.8,cx=sx+Math.round(sway*.4),cy=sy-th-cr+1;
   for(let yy=-3;yy<=3;yy++)for(let xx=-3;xx<=3;xx++){if(xx*xx+yy*yy>cr*cr)continue;px(cx+xx,cy+yy,(xx+yy>cr-0.5)?'#24552a':(xx+yy<-0.5)?'#3c7a30':'#2e6a2c');}}
 }
 // seed: single pixel riding the surface
 if(S.stage===0){const[sx,sy,z]=proj(0.4,0.25,r);if(z>0)px(sx,sy,'#fff0a0');}
 // grass strands: attached to sphere points, drawn along projected surface normal.
 // back-side strands show only the part poking past the rim, so they rise/fall smoothly.
 if(S.stage>=1){g.fillStyle=SHD;for(let j=0;j<STR.length;j++){const q=STR[j],ga=grassAmt(q.lon,q.lat);if(ga<0.3)continue;const[bx,by,z]=proj(q.lon,q.lat,r);if(z<0.15)continue;
  const L=q.len*ga*z;g.fillRect(Math.round(bx)+1,Math.round(by)+1,1,1);if(L>1.6)g.fillRect(Math.round(bx)+2,Math.round(by)+1,1,1);}}
 if(S.stage>=1)for(let j=0;j<STR.length;j++){const q=STR[j],ga=grassAmt(q.lon,q.lat);if(ga<=0.001)continue;
  const L=q.len*ga,lo2=q.lon+S.ang,x=Math.cos(q.lat)*Math.sin(lo2),z=Math.cos(q.lat)*Math.cos(lo2),y=-Math.sin(q.lat),rho=Math.hypot(x,y);
  if(rho<1e-3)continue;const dx=x/rho,dy=y/rho,b0=r*rho,b1=(r+L)*rho;const st=z<0?Math.max(b0,r):b0;if(b1<=st)continue;
  const sb=band(x,y,z),sw=fur[j%fur.length]+Math.sin(performance.now()/420+q.ph)*0.25*(1+S.omega*0.4);
  for(let d=st;d<b1;d+=1){const seg=Math.min(1,b1-d),t=(d-b0)/Math.max(1e-3,b1-b0);
   g.globalAlpha=seg;px(CX+dx*(d+seg)-dy*sw*t,CY+dy*(d+seg)+dx*sw*t,t<0.34?'#2e6a2c':t<0.67?'#4c9a3e':'#8ed06a');}
  g.globalAlpha=1;}
}
window.__visLen=(j)=>{const q=STR[j],r=R(),ga=grassAmt(q.lon,q.lat),L=q.len*ga,lo2=q.lon+S.ang,x=Math.cos(q.lat)*Math.sin(lo2),z=Math.cos(q.lat)*Math.cos(lo2),y=-Math.sin(q.lat),rho=Math.hypot(x,y);const b0=r*rho,b1=(r+L)*rho,st=z<0?Math.max(b0,r):b0;return Math.max(0,b1-st);};
const LEAF=['.....aa','...abcb','..abcba','.abcbba','.abcba.','.abba..','.da....','d......'];
let hover=-1,lastT=0;
function rows(){return UP.map((u,i)=>({x:200,y:44+i*30,w:112,h:26}));}
function render(time){
 g.fillStyle='#10141c';g.fillRect(0,0,W,H);
 for(const s of stars)px(s[0],s[1],s[2]>.7?'#6a7490':'#30384c');
 drawPlanet(time);
 for(const p of parts)px(p.x,p.y,'#a8f090');
 LEAF.forEach((row,j)=>[...row].forEach((ch,i)=>{if(ch!=='.')px(7+i,6+j,{a:'#2a6a2c',b:'#4c9a3e',c:'#8ed06a',d:'#5a3418'}[ch]);}));
 // panel
 rows().forEach((r,i)=>{const u=UP[i],c=cost(u),ok=S.leaves>=c&&!S.done;
  rect(r.x,r.y,r.w,r.h,hover===i&&ok?'#2c4a34':'#1c2632');rect(r.x,r.y,r.w,1,ok?'#6ad060':'#3a4658');rect(r.x,r.y+r.h-1,r.w,1,'#0a0e14');});
 // upscale
 const sc=Math.max(1,Math.floor(Math.min(innerWidth/W,innerHeight/H)));cv.width=innerWidth;cv.height=innerHeight;
 const ox=Math.floor((innerWidth-W*sc)/2),oy=Math.floor((innerHeight-H*sc)/2);
 ctx.imageSmoothingEnabled=false;ctx.fillStyle='#10141c';ctx.fillRect(0,0,cv.width,cv.height);ctx.drawImage(lo,ox,oy,W*sc,H*sc);
 view={sc,ox,oy};
 const T=(s,x,y,size,col,al)=>{ctx.font='bold '+Math.round(size*sc)+'px monospace';ctx.fillStyle=col;ctx.textAlign=al||'left';ctx.textBaseline='top';ctx.fillText(s,ox+x*sc,oy+y*sc);};
 T(fmt(S.leaves),17,5,10,'#c8f0a0');
 T('초당 잎 +'+fmt(perSec())+'   클릭당 잎 +'+fmt(clickGain()),8,19,6,'#8898b0');
 T('회전 속도 '+S.omega.toFixed(2)+' (최대 '+spinCap().toFixed(2)+')',8,27,6,'#8898b0');
 T('단계 '+(S.stage+1)+'/7  '+STAGES[S.stage],200,8,8,'#f0e090');
 T('시간 '+tfmt(S.t)+(best?'   최고 기록 '+tfmt(best):''),200,22,6,'#8898b0');
 rows().forEach((r,i)=>{const u=UP[i],c=cost(u),ok=S.leaves>=c&&!S.done;
  const nm=u.k==='stage'?(S.stage<6?['새싹으로','풀밭으로','꽃밭으로','나무로','숲으로','세계수로'][S.stage]+' 성장':'다 자랐어요'):u.name+' Lv.'+S[u.k];
  const ds=u.k==='stage'?'얻는 잎 전부 x1.8':u.desc;
  T(nm,r.x+4,r.y+3,7,ok?'#e8f0e0':'#8090a0');T(ds,r.x+4,r.y+14,5.5,'#7888a0');
  T(c===Infinity?'-':fmt(c),r.x+r.w-4,r.y+14,6,ok?'#c8f0a0':'#a06060','right');});
 if(!S.started)T('행성을 클릭해서 돌려 보세요',CX,CY+R()+22,7,'#e8f0e0','center');
 for(const f of floats){ctx.globalAlpha=f.l;T(f.v,f.x,f.y,6,'#c8f0a0','center');}ctx.globalAlpha=1;
 if(S.done){ctx.fillStyle='rgba(8,12,18,.78)';ctx.fillRect(0,0,cv.width,cv.height);
  T('세계수가 자랐어요!',W/2,52,14,'#f0e090','center');T('걸린 시간 '+tfmt(S.t),W/2,80,9,'#e8f0e0','center');
  T('최고 기록 '+tfmt(best)+'   클릭 '+S.clicks+'번',W/2,96,7,'#8898b0','center');T('클릭하면 처음부터 다시 시작해요',W/2,122,7,'#c8f0a0','center');}
}
let view={sc:1,ox:0,oy:0};
function toLo(e){return[(e.clientX-view.ox)/view.sc,(e.clientY-view.oy)/view.sc];}
function hit(x,y){return rows().findIndex(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);}
cv.addEventListener('pointerdown',e=>{const[x,y]=toLo(e);
 if(S.done){S=fresh();save();return;}
 const h=hit(x,y);if(h>=0){buy(h);return;}
 if(Math.hypot(x-CX,y-CY)<R()+20)tap();});
cv.addEventListener('pointermove',e=>{const[x,y]=toLo(e);hover=hit(x,y);cv.style.cursor=hover>=0||Math.hypot(x-CX,y-CY)<R()+20?'pointer':'default';});
let saveT=0;
function frame(ts){const dt=Math.min(.1,(ts-lastT)/1000||0);lastT=ts;step(dt);furStep(dt);
 for(const f of floats){f.y-=dt*20;f.l-=dt*1.2;}floats=floats.filter(f=>f.l>0);
 for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;}parts=parts.filter(p=>p.l>0);
 saveT+=dt;if(saveT>2){saveT=0;save();}
 render(ts/1000);requestAnimationFrame(frame);}
addEventListener('pagehide',save);
requestAnimationFrame(frame);
window.__nc={get S(){return S},step,tap,buy,cost:i=>cost(UP[i]),perSec,reset(){S=fresh();save();}};
})();
