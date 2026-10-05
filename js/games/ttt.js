import {c, W, H, S, rnd, hap, sfx, burst, saveBest} from '../core.js';
import {reward, toast, spendLife} from '../economy.js';

const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const win=b=>{for(const[a,d,e]of L)if(b[a]&&b[a]==b[d]&&b[a]==b[e])return b[a];return b.includes(0)?0:3};
function mm(b,t){const w=win(b);if(w)return w==2?1:w==1?-1:0;let m=t==2?-9:9;for(let i=0;i<9;i++)if(!b[i]){b[i]=t;const v=mm(b,3-t);b[i]=0;m=t==2?Math.max(m,v):Math.min(m,v)}return m}
export const ttt={ctl:'none',
init(){this.w=0;this.reset()},
reset(){this.b=Array(9).fill(0);this.res=0;this.lock=0;this.t0=[];this.wl=null},
finish(){const r=win(this.b);if(!r)return 0;this.res=r;
 this.wl=L.find(([a,d,e])=>this.b[a]&&this.b[a]==this.b[d]&&this.b[a]==this.b[e])||null;
 if(r==1){S.score++;this.w=S.score;if(S.score>(S.best[S.cid]||0)){S.best[S.cid]=S.score;saveBest()}hap('success');sfx('win');burst(180,240,['#ffc83d','#ff6b4a','#3ee0a0','#5cc8ff'],40,4.5)}
 else if(r==2){sfx('die');S.shk=10}else sfx('tap');toast(reward('ttt',S.score,r));return 1},
ai(){if(this.res)return;const e=[];this.b.forEach((v,i)=>v||e.push(i));let m;
 if(Math.random()<.3)m=e[rnd(e.length)];else{let bv=-9;for(const i of e){this.b[i]=2;const v=mm(this.b,1);this.b[i]=0;if(v>bv){bv=v;m=i}}}
 this.b[m]=2;this.t0[m]=performance.now();sfx('ai');this.finish();this.lock=0},
click(x,y){if(this.res){if(!spendLife())return;return this.reset()}if(this.lock)return;
 const i=Math.floor((x-30)/100)+3*Math.floor((y-110)/100);if(x<30||x>330||y<110||y>410||this.b[i])return;
 this.b[i]=1;this.t0[i]=performance.now();sfx('tap');if(!this.finish()){this.lock=1;setTimeout(()=>this.ai(),380)}},
draw(){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a2470');g.addColorStop(1,'#15123b');c.fillStyle=g;c.fillRect(0,0,W,H);
 c.strokeStyle='#a9a3d9';c.lineWidth=6;c.lineCap='round';c.beginPath();
 for(let i=1;i<3;i++){c.moveTo(30+i*100,120);c.lineTo(30+i*100,400);c.moveTo(40,110+i*100);c.lineTo(320,110+i*100)}c.stroke();
 const T=performance.now();
 this.b.forEach((v,i)=>{if(!v)return;const x=80+i%3*100,y=160+Math.floor(i/3)*100,k=Math.min(1,(T-(this.t0[i]||0))/260),e=1+2.70158*Math.pow(k-1,3)+1.70158*Math.pow(k-1,2);
  c.save();c.translate(x,y);c.scale(e,e);c.lineWidth=10;
  if(v==1){c.strokeStyle='#ff6b4a';c.beginPath();c.moveTo(-24,-24);c.lineTo(24,24);c.moveTo(24,-24);c.lineTo(-24,24);c.stroke()}
  if(v==2){c.strokeStyle='#5cc8ff';c.beginPath();c.arc(0,0,26,0,7);c.stroke()}
  c.restore()});
 if(this.wl){const q=i=>[80+i%3*100,160+Math.floor(i/3)*100],a=q(this.wl[0]),z=q(this.wl[2]);
  c.save();c.globalAlpha=.55+.45*Math.sin(T*.012);c.strokeStyle='#ffc83d';c.lineWidth=9;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(z[0],z[1]);c.stroke();c.restore()}
 c.fillStyle='#fff7e6';c.font='700 24px Fredoka,sans-serif';c.textAlign='center';
 const m=['Your move (X)','','You win! 🎉','Computer wins','Draw'];
 c.fillText(this.res==0?(this.lock?'Computer is thinking…':m[0]):this.res==1?m[2]:this.res==2?m[3]:m[4],180,70);
 if(this.res){c.fillStyle='#ffc83d';c.font='500 18px Fredoka,sans-serif';c.fillText('Tap to play again',180,450)}}};
