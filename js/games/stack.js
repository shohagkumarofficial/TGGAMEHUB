import {c, W, H, S, sfx, burst, end} from '../core.js';

export const stack={ctl:'tap',lbl:'Drop',
init(){this.B=[{x:80,w:200}];this.n=0;this.cy=0;this.cyT=0;this.fall=[];this.dead=0;this.mk(0)},
mk(n){const w=this.B[this.B.length-1].w;this.cur={x:n%2?10:W-10-w,w,d:n%2?1:-1,sp:Math.min(6.5,2.4+n*.14)}},
tap(){if(S.over)return;const t=this.B[this.B.length-1],u=this.cur,l=Math.max(u.x,t.x),r=Math.min(u.x+u.w,t.x+t.w),o=r-l,sy=H-70-this.B.length*26+this.cy;
 if(o<=0){this.fall.push({x:u.x,w:u.w,y:sy,vy:0,j:this.B.length});this.dead=1;return end('Tower fell')}
 if(Math.abs(u.x-t.x)<5){this.B.push({x:t.x,w:t.w});sfx('point');burst(t.x+t.w/2,sy+13,['#ffc83d','#fff7e6'],10,2)}
 else{this.B.push({x:l,w:o});sfx('tap');this.fall.push({x:u.x<t.x?u.x:r,w:u.w-o,y:sy,vy:0,j:this.B.length-1})}
 this.n++;S.score=this.n;this.cyT=Math.max(0,(this.B.length-9)*26);this.mk(this.n)},
tick(f){const u=this.cur;u.x+=u.d*u.sp*f;if(u.x+u.w>W-10){u.x=W-10-u.w;u.d=-1}if(u.x<10){u.x=10;u.d=1}
 this.cy+=(this.cyT-this.cy)*.12*Math.min(f,2)},
draw(){const cm=this.cy,g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a2470');g.addColorStop(1,'#15123b');c.fillStyle=g;c.fillRect(0,0,W,H);
 c.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<30;i++)c.fillRect((i*97)%W,((i*61)%H+cm*.2)%H,2,2);
 c.fillStyle='#241f5e';c.fillRect(0,H-44+cm,W,80);
 const blk=(x,y,w,j)=>{c.fillStyle='hsl('+((j*24+190)%360)+' 70% 58%)';c.fillRect(x,y,w,26);c.fillStyle='rgba(255,255,255,.25)';c.fillRect(x,y,w,5);c.fillStyle='rgba(0,0,0,.2)';c.fillRect(x,y+22,w,4)};
 this.B.forEach((b,j)=>{const y=H-70-j*26+cm;if(y<H&&y>-26)blk(b.x,y,b.w,j)});
 if(!this.dead)blk(this.cur.x,H-70-this.B.length*26+cm,this.cur.w,this.B.length);
 for(const q of this.fall){q.vy+=.5;q.y+=q.vy;blk(q.x,q.y,q.w,q.j)}
 this.fall=this.fall.filter(q=>q.y<H+40);
 c.fillStyle='rgba(255,247,230,.9)';c.font='700 44px Fredoka,sans-serif';c.textAlign='center';c.fillText(this.n,W/2,70)}};
