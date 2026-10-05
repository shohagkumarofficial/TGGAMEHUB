import {c, S, rnd, hap, sfx, burst, end} from '../core.js';

export const snake={ctl:'dpad',
init(){this.s=[{x:9,y:12},{x:8,y:12},{x:7,y:12}];this.d={x:1,y:0};this.q=[];this.t=0;this.food()},
food(){do{this.f={x:rnd(18),y:rnd(24)}}while(this.s.some(o=>o.x==this.f.x&&o.y==this.f.y))},
dir(x,y){const l=this.q.length?this.q[this.q.length-1]:this.d;if(l.x+x==0&&l.y+y==0)return;if(this.q.length<3){this.q.push({x,y});sfx('move')}},
tick(f,dt){this.t+=dt;if(this.t<115)return;this.t=0;
 if(this.q.length)this.d=this.q.shift();
 const h={x:this.s[0].x+this.d.x,y:this.s[0].y+this.d.y};
 if(h.x<0||h.y<0||h.x>=18||h.y>=24||this.s.some(o=>o.x==h.x&&o.y==h.y))return end('Snake crashed');
 this.s.unshift(h);if(h.x==this.f.x&&h.y==this.f.y){S.score+=10;hap('light');sfx('eat');burst(this.f.x*20+10,this.f.y*20+10,['#ff6b4a','#3ee0a0','#ffc83d'],12,2.2);this.food()}else this.s.pop()},
draw(){for(let y=0;y<24;y++)for(let x=0;x<18;x++){c.fillStyle=(x+y)%2?'#123a3a':'#164444';c.fillRect(x*20,y*20,20,20)}
 const f=this.f;c.fillStyle='#ff6b4a';c.beginPath();c.arc(f.x*20+10,f.y*20+11,7.5+Math.sin(performance.now()*.008)*1.3,0,7);c.fill();c.fillStyle='#3ee0a0';c.fillRect(f.x*20+10,f.y*20,3,5);
 this.s.forEach((o,i)=>{c.fillStyle=i?(i%2?'#3ee0a0':'#2fc98c'):'#7dffc9';c.beginPath();c.roundRect(o.x*20+1,o.y*20+1,18,18,i?6:9);c.fill()});
 const h=this.s[0],d=this.d;c.fillStyle='#15123b';
 const ex=d.x?[[6,5],[6,14]]:[[5,6],[14,6]];
 for(const[a,b]of ex){c.beginPath();c.arc(h.x*20+(d.x>0?a+4:d.x<0?a-2:a),h.y*20+(d.y>0?b+4:d.y<0?b-2:b),2.2,0,7);c.fill()}}};
