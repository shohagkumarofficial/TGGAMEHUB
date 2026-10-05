import {c, W, H, S, rnd, sfx, burst, end, HP} from '../core.js';

function shape(v){c.save();c.fillStyle=['#ff6b4a','#5cc8ff','#3ee0a0','#ffc83d','#ff6b4a','#b48cff','#ff8fb8','#ffb347'][v];c.beginPath();
 if(v==0)c.arc(0,0,19,0,7);
 else if(v==1)c.roundRect(-17,-17,34,34,6);
 else if(v==2){c.moveTo(0,-20);c.lineTo(20,16);c.lineTo(-20,16);c.closePath()}
 else if(v==3){for(let i=0;i<10;i++){const r=i%2?9:20,a=-Math.PI/2+i*Math.PI/5;c.lineTo(Math.cos(a)*r,Math.sin(a)*r)}c.closePath()}
 else if(v==4){c.translate(-19,-17);c.scale(1.6,1.6);c.fill(new Path2D(HP));c.restore();return}
 else if(v==5){c.moveTo(0,-21);c.lineTo(17,0);c.lineTo(0,21);c.lineTo(-17,0);c.closePath()}
 else if(v==6){c.rect(-6,-19,12,38);c.rect(-19,-6,38,12)}
 else{for(let i=0;i<6;i++){const a=i*Math.PI/3;c.lineTo(Math.cos(a)*20,Math.sin(a)*20)}c.closePath()}
 c.fill();c.restore()}
export const mem={ctl:'none',
init(){const a=[0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7];for(let i=15;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}
 this.k=a.map((v,i)=>({v,i,f:0,m:0,t:0}));this.o=[];this.lock=0;this.left=60;this.pairs=0},
tick(f,dt){this.left-=dt/1000;if(this.left<=0){this.left=0;end('Time is up')}},
click(x,y){if(S.over||this.lock)return;const col=Math.floor((x-25)/80),row=Math.floor((y-100)/80);
 if(x<25||y<100||col>3||row>3||(x-25)%80>70||(y-100)%80>70)return;
 const k=this.k[row*4+col];if(k.f||k.m)return;
 k.f=1;k.t=performance.now();this.o.push(k);sfx('tap');
 if(this.o.length==2){const[a,b]=this.o;
  if(a.v==b.v){a.m=b.m=1;this.o=[];this.pairs++;S.score+=50;sfx('coin');
   for(const q of[a,b])burst(25+q.i%4*80+35,100+Math.floor(q.i/4)*80+35,['#ffc83d','#fff7e6'],8,2);
   if(this.pairs==8){S.score+=Math.ceil(this.left)*10;end('You win! 🎉')}}
  else{this.lock=1;sfx('bump');setTimeout(()=>{if(S.cur!==mem||S.over)return;a.f=b.f=0;a.t=b.t=performance.now();this.o=[];this.lock=0},650)}}},
draw(){const T=performance.now(),g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a1f5e');g.addColorStop(1,'#15123b');c.fillStyle=g;c.fillRect(0,0,W,H);
 c.fillStyle='#fff7e6';c.font='700 20px Fredoka,sans-serif';c.textAlign='left';c.fillText('Time '+Math.ceil(this.left)+'s',25,58);c.textAlign='right';c.fillText('Pairs '+this.pairs+'/8',335,58);
 c.fillStyle='#38308a';c.fillRect(25,70,310,8);c.fillStyle=this.left<10?'#ff6b4a':'#3ee0a0';c.fillRect(25,70,310*this.left/60,8);
 this.k.forEach(k=>{const x=25+k.i%4*80+35,y=100+Math.floor(k.i/4)*80+35,p=Math.min(1,(T-k.t)/220),face=k.m||(k.f?p>.5:(k.t&&p<=.5)),sx=k.t&&p<1?Math.max(.04,Math.abs(Math.cos(p*Math.PI))):1;
  c.save();c.translate(x,y);c.scale(sx,1);c.beginPath();c.roundRect(-35,-35,70,70,14);c.fillStyle=face?(k.m?'#2f7a62':'#fff7e6'):'#3a2f8f';c.fill();
  if(face)shape(k.v);else{c.strokeStyle='#5a4fc0';c.lineWidth=3;c.stroke();c.fillStyle='#7b6fe0';c.font='700 30px Fredoka,sans-serif';c.textAlign='center';c.fillText('?',0,10)}
  c.restore()})}};
