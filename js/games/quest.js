import {c, W, H, S, K, hit, hap, sfx, burst, end, cloud} from '../core.js';

export const quest={ctl:'quest',
init(){let s=7,x=0;const R=()=>(s=(s*9301+49297)%233280)/233280;
 this.S=[];this.B=[];this.C=[];this.E=[];
 while(x<100){let n=x?7+Math.floor(R()*6):12;
  this.S.push({x:x*30,y:420,w:n*30,h:60});
  if(n>=9){for(let i=0;i<3;i++)this.B.push({x:(x+3+i)*30,y:330,w:30,h:30});for(let i=0;i<3;i++)this.C.push({x:(x+3+i)*30+15,y:295,g:0})}
  if(n>=8&&x)this.E.push({x:(x+n/2)*30,y:398,w:24,h:22,d:-1,a:x*30+10,b:(x+n)*30-34,dead:0});
  this.C.push({x:(x+n-2)*30,y:385,g:0});
  x+=n+2+Math.floor(R()*2)}
 const l=this.S[this.S.length-1];this.F=l.x+l.w-70;
 this.p={x:40,y:360,vx:0,vy:0,w:22,h:28,g:0};this.cam=0;this.sc=0;this.fd=1;this.jb=0},
tick(f){const p=this.p,sol=this.S.concat(this.B),wg=p.g;
 p.vx=(K.r-K.l)*3.2;if(p.vx)this.fd=p.vx>0?1:-1;
 if(this.jb>0)this.jb--;
 if((K.j||this.jb>0)&&p.g){p.vy=-11.5;p.g=0;this.jb=0;sfx('jump');burst(p.x+11,p.y+p.h,'#e8d9b5',4,1)}
 p.vy=Math.min(p.vy+.6*f,14);
 p.x=Math.max(0,p.x+p.vx*f);
 for(const s of sol)if(hit(p,s))p.x=p.vx>0?s.x-p.w:s.x+s.w;
 const pv=p.vy;p.y+=p.vy*f;p.g=0;
 for(const s of sol)if(hit(p,s)){if(p.vy>0){p.y=s.y-p.h;p.g=1}else{p.y=s.y+s.h;sfx('bump')}p.vy=0}
 if(p.g&&!wg&&pv>4)burst(p.x+11,p.y+p.h,'#e8d9b5',5,1.2);
 for(const e of this.E){if(e.dead)continue;e.x+=e.d*f;if(e.x<e.a)e.d=1;if(e.x>e.b)e.d=-1;
  if(hit(p,e)){if(p.vy>0&&p.y+p.h-e.y<18){e.dead=1;p.vy=-8;this.sc+=100;hap('light');sfx('stomp');burst(e.x+12,e.y+12,['#a0522d','#fff7e6'],10,2)}else return end('You got hit')}}
 for(const o of this.C)if(!o.g&&Math.abs(o.x-p.x-11)<16&&Math.abs(o.y-p.y-14)<20){o.g=1;this.sc+=10;sfx('coin');burst(o.x,o.y,'#ffc83d',6,1.6)}
 if(p.y>H+40)return end('You fell in a pit');
 if(p.x>this.F){this.sc+=500;S.score=this.sc;return end('You win! 🎉')}
 this.cam=Math.max(0,Math.min(p.x-120,this.F+90-W));S.score=this.sc},
draw(){const p=this.p,cam=this.cam|0,T=performance.now();
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#5cc8ff');g.addColorStop(1,'#dff6ff');c.fillStyle=g;c.fillRect(0,0,W,H);
 for(let i=0;i<3;i++)cloud(((i*260-cam*.4)%780+780)%780-100,70+i*50);
 c.save();c.translate(-cam,0);
 for(const s of this.S){c.fillStyle='#8b5a2b';c.fillRect(s.x,s.y,s.w,s.h);c.fillStyle='#4cc552';c.fillRect(s.x,s.y,s.w,10)}
 for(const b of this.B){c.fillStyle='#5a7cff';c.fillRect(b.x,b.y,30,30);c.strokeStyle='#2a3f9c';c.lineWidth=2;c.strokeRect(b.x+1,b.y+1,28,28);c.beginPath();c.moveTo(b.x+5,b.y+5);c.lineTo(b.x+25,b.y+25);c.moveTo(b.x+25,b.y+5);c.lineTo(b.x+5,b.y+25);c.stroke()}
 c.fillStyle='#ffc83d';for(const o of this.C)if(!o.g){c.beginPath();c.ellipse(o.x,o.y+Math.sin(T*.004+o.x)*2,Math.max(1.5,Math.abs(Math.cos(T*.006+o.x))*6),8,0,0,7);c.fill()}
 for(const e of this.E)if(!e.dead){const sq=Math.sin(T*.012+e.x)*1.6;c.fillStyle='#8e5bd9';c.beginPath();c.ellipse(e.x+12,e.y+22,12,15+sq,0,Math.PI,0);c.fill();c.fillStyle='#7340c4';c.fillRect(e.x,e.y+19,24,3);c.fillStyle='#fff';c.beginPath();c.arc(e.x+8,e.y+12,3.4,0,7);c.arc(e.x+16,e.y+12,3.4,0,7);c.fill();c.fillStyle='#15123b';c.fillRect(e.x+7+(e.d>0?1:-1),e.y+11,2.4,3);c.fillRect(e.x+15+(e.d>0?1:-1),e.y+11,2.4,3)}
 c.fillStyle='#fff';c.fillRect(this.F,230,5,190);c.fillStyle='#ff6b4a';c.beginPath();c.moveTo(this.F+5,232);c.lineTo(this.F+45,250);c.lineTo(this.F+5,268);c.fill();
 const x=p.x,y=p.y,d=this.fd;
 c.fillStyle='#1fb8a6';c.fillRect(x+3,y+14,16,14);const rb=p.g&&p.vx?Math.sin(T*.03)*3:0;c.fillStyle='#17496b';c.fillRect(x+2+rb,y+25,9,3);c.fillRect(x+11-rb,y+25,9,3);c.fillStyle='#ffc83d';c.fillRect(x+9,y+18,4,4);c.fillStyle='#ffd2a1';c.fillRect(x+4,y+6,14,10);
 c.fillStyle='#7b4dff';c.fillRect(x+2,y+1,18,7);c.fillStyle='#5a33d6';c.fillRect(x+2,y+6,18,2);c.fillStyle='#ffc83d';c.beginPath();c.arc(x+11,y,3.5,0,7);c.fill();
 c.fillStyle='#15123b';c.fillRect(d>0?x+13:x+6,y+10,3,3);c.fillRect(x+6,y+14,10,1.5);
 c.restore()}};
