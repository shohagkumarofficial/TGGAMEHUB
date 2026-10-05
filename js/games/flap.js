import {c, W, H, S, sfx, burst, end, cloud} from '../core.js';

export const flap={ctl:'tap',lbl:'Flap',
init(){this.y=230;this.v=0;this.P=[];this.t=70;this.a=0},
tap(){if(!S.over){this.v=-7.4;sfx('flap');burst(72,this.y+6,'#fff7e6',3,.8)}},
tick(f){this.v+=.45*f;this.y+=this.v*f;this.t+=f;this.a+=f;
 if(this.t>85){this.t=0;this.P.push({x:W+20,g:140+Math.random()*180,s:0})}
 for(const p of this.P){p.x-=2.4*f;if(!p.s&&p.x+50<80){p.s=1;S.score++;sfx('point')}
  if(93>p.x&&67<p.x+50&&(this.y-12<p.g-65||this.y+12>p.g+65))return end('Bird crashed')}
 this.P=this.P.filter(p=>p.x>-60);
 if(this.y>H-40||this.y<-20)end('Bird fell')},
draw(){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#ff9f6b');g.addColorStop(1,'#ffe3a8');c.fillStyle=g;c.fillRect(0,0,W,H);
 cloud(80,90);cloud(260,160);
 for(const p of this.P){c.fillStyle='#2fc98c';c.fillRect(p.x,0,50,p.g-65);c.fillRect(p.x,p.g+65,50,H);c.fillStyle='#3ee0a0';c.fillRect(p.x-4,p.g-85,58,20);c.fillRect(p.x-4,p.g+65,58,20)}
 c.fillStyle='#8b5a2b';c.fillRect(0,H-40,W,40);c.fillStyle='#4cc552';c.fillRect(0,H-40,W,8);
 c.save();c.translate(80,this.y);c.rotate(Math.max(-.5,Math.min(1,this.v/12)));
 c.fillStyle='#ffc83d';c.beginPath();c.ellipse(0,0,16,12,0,0,7);c.fill();
 c.fillStyle='#ff9f1c';c.beginPath();c.ellipse(-4,3+Math.sin(this.a*.4)*3,9,5,0,0,7);c.fill();
 c.fillStyle='#fff';c.beginPath();c.arc(8,-4,5,0,7);c.fill();c.fillStyle='#15123b';c.beginPath();c.arc(10,-4,2.2,0,7);c.fill();
 c.fillStyle='#ff6b4a';c.beginPath();c.moveTo(14,0);c.lineTo(25,3);c.lineTo(14,7);c.fill();c.restore()}};
                   
