import {c, W, H, TAU, S, rnd, angd, hap, sfx, burst, end} from '../core.js';

const OR=[52,90,128],OM=[3,2,1],CX=180,CY=250;
export const orbit={ctl:'orbit',
init(){this.fo=0;this.th=-Math.PI/2;this.r=OR[1];this.ri=1;this.ni=1;this.el=0;this.acc=0;this.bonus=0;this.V=[];this.S=[];this.tr=[];this.ts=60;this.ss=90;this.hint=4},
hop(d){if(S.over)return;const n=Math.max(0,Math.min(2,this.ri+d));if(n==this.ri)return;this.ri=n;sfx(d>0?'tap':'ai')},
hits(v){if(Math.abs(this.r-OR[v.i])>14)return false;return Math.abs(angd(this.th-v.a-this.fo))<v.w/2+9/OR[v.i]},
spawn(){/* a new dark arc never overlaps another one and never appears right in front of the player, so one ring is always free */
 for(let n=0;n<14;n++){const i=rnd(3),len=i==0?55+rnd(30):70+rnd(45),w=len/OR[i],a=Math.random()*TAU,hw=w/2+.24;
  if(Math.abs(angd(a+this.fo-(this.th+.35)))<hw+.85)continue;
  if(this.V.some(v=>Math.abs(angd(a-v.a))<hw+v.w/2+.24))continue;
  this.V.push({i,a,w,t:0,on:0});return}},
tick(f,dt){const s=dt/1000;this.el+=s;this.hint-=s;
 this.r+=(OR[this.ri]-this.r)*Math.min(1,.22*f);
 const sp=2.1+Math.min(1.1,this.el*.01);this.fo=(this.fo+.0025*f)%TAU;
 this.th=(this.th+sp/this.r*f)%TAU;
 this.ni=this.r<(OR[0]+OR[1])/2?0:this.r<(OR[1]+OR[2])/2?1:2;
 this.acc+=s*3*OM[this.ni];
 this.tr.push({x:CX+Math.cos(this.th)*this.r,y:CY+Math.sin(this.th)*this.r});if(this.tr.length>16)this.tr.shift();
 this.ts-=f;
 if(this.ts<=0&&this.V.length<6){this.ts=Math.max(45,95-this.el*.8);this.spawn()}
 for(const v of this.V){v.t+=f;
  if(v.t>=70&&!v.on){v.on=1;let n=0;while(this.hits(v)&&n++<30)v.a=(v.a+.1)%TAU}
  if(v.on&&this.hits(v)){S.score=Math.floor(this.acc+this.bonus);return end('Swallowed by the void')}}
 this.V=this.V.filter(v=>v.t<320);
 this.ss-=f;
 if(this.ss<=0&&this.S.length<2){this.ss=110+rnd(100);this.S.push({i:rnd(3),a:(this.th+1.2+Math.random()*3)%TAU,t:0})}
 for(const k of this.S){k.t+=f;
  if(Math.abs(this.r-OR[k.i])<16&&Math.abs(angd(this.th-k.a))*OR[k.i]<16){k.t=999;this.bonus+=15*OM[k.i];sfx('coin');hap('light');
   burst(CX+Math.cos(k.a)*OR[k.i],CY+Math.sin(k.a)*OR[k.i],['#ffc83d','#fff7e6'],10,2)}}
 this.S=this.S.filter(k=>k.t<420);
 S.score=Math.floor(this.acc+this.bonus)},
draw(){const T=performance.now(),g=c.createRadialGradient(CX,CY,10,CX,CY,330);g.addColorStop(0,'#2b1f6b');g.addColorStop(1,'#0b0926');c.fillStyle=g;c.fillRect(0,0,W,H);
 c.fillStyle='#fff7e6';for(let i=0;i<46;i++){c.globalAlpha=.25+.35*Math.abs(Math.sin(T*.001*(1+i%4)+i));c.fillRect((i*83)%W,(i*127+i*i*3)%H,i%5?1.5:2.5,i%5?1.5:2.5)}c.globalAlpha=1;
 c.lineWidth=2;OR.forEach((r,i)=>{c.strokeStyle=i==this.ri?'rgba(255,200,61,.55)':'rgba(169,163,217,.25)';c.beginPath();c.arc(CX,CY,r,0,TAU);c.stroke()});
 c.fillStyle='rgba(169,163,217,.75)';c.font='600 12px Fredoka,sans-serif';c.textAlign='center';OR.forEach((r,i)=>c.fillText('x'+OM[i],CX,CY-r-5));
 const pu=1+Math.sin(T*.004)*.08,cg=c.createRadialGradient(CX,CY,2,CX,CY,34*pu);cg.addColorStop(0,'rgba(255,230,140,1)');cg.addColorStop(.4,'rgba(255,180,50,.55)');cg.addColorStop(1,'rgba(255,180,50,0)');
 c.fillStyle=cg;c.beginPath();c.arc(CX,CY,34*pu,0,TAU);c.fill();
 c.fillStyle='#ffe08a';c.beginPath();for(let i=0;i<10;i++){const r=(i%2?7:16)*pu,a=-Math.PI/2+i*Math.PI/5+T*.0004;c.lineTo(CX+Math.cos(a)*r,CY+Math.sin(a)*r)}c.closePath();c.fill();
 for(const v of this.V){const a0=v.a+this.fo-v.w/2,a1=v.a+this.fo+v.w/2,R=OR[v.i];
  if(v.t<70){c.save();c.globalAlpha=.35+.45*Math.abs(Math.sin(v.t*.18));c.setLineDash([6,6]);c.strokeStyle='#ff6b9a';c.lineWidth=3;c.beginPath();c.arc(CX,CY,R,a0,a1);c.stroke();c.restore()}
  else{c.save();c.globalAlpha=v.t>300?(320-v.t)/20:1;c.lineCap='round';c.strokeStyle='#e0407e';c.lineWidth=26;c.beginPath();c.arc(CX,CY,R,a0,a1);c.stroke();c.strokeStyle='#150a30';c.lineWidth=18;c.beginPath();c.arc(CX,CY,R,a0,a1);c.stroke();c.restore()}}
 for(const k of this.S){const R=OR[k.i],x=CX+Math.cos(k.a)*R,y=CY+Math.sin(k.a)*R,p=1+Math.sin(T*.01+k.a)*.15;
  c.save();c.globalAlpha=k.t>380?(420-k.t)/40:1;c.translate(x,y);c.rotate(T*.003);c.scale(p,p);c.fillStyle='rgba(255,200,61,.3)';c.beginPath();c.arc(0,0,13,0,TAU);c.fill();
  c.fillStyle='#ffc83d';c.beginPath();c.moveTo(0,-9);c.lineTo(7,0);c.lineTo(0,9);c.lineTo(-7,0);c.closePath();c.fill();c.restore()}
 this.tr.forEach((q,i)=>{const u=i/this.tr.length;c.globalAlpha=u*.5;c.fillStyle='#ffe08a';c.beginPath();c.arc(q.x,q.y,1+u*4,0,TAU);c.fill()});c.globalAlpha=1;
 const px=CX+Math.cos(this.th)*this.r,py=CY+Math.sin(this.th)*this.r,pg=c.createRadialGradient(px,py,1,px,py,16);
 pg.addColorStop(0,'rgba(255,247,230,1)');pg.addColorStop(.4,'rgba(255,200,61,.6)');pg.addColorStop(1,'rgba(255,200,61,0)');
 c.fillStyle=pg;c.beginPath();c.arc(px,py,16,0,TAU);c.fill();c.fillStyle='#fff7e6';c.beginPath();c.arc(px,py,4.5,0,TAU);c.fill();
 c.textAlign='left';c.font='700 18px Fredoka,sans-serif';c.fillStyle=['#ffc83d','#5cc8ff','#a9a3d9'][this.ni];c.fillText('Ring x'+OM[this.ni],14,28);
 if(this.hint>0){c.globalAlpha=Math.min(1,this.hint);c.textAlign='center';c.font='600 15px Fredoka,sans-serif';c.fillStyle='#fff7e6';c.fillText('Hop rings to dodge the dark arcs',CX,H-44);c.fillStyle='#ffc83d';c.fillText('Inner ring = more points',CX,H-22);c.globalAlpha=1}}};
