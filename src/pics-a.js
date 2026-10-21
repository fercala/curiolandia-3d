/* ---------- Dibujos PA: lugares, oficios, objetos y vehiculos ---------- */
const PA_oct=(r,cy)=>[...Array(8)].map((_,i)=>{const a=(22.5+45*i)*Math.PI/180;return `${(r*Math.cos(a)).toFixed(1)},${(cy+r*Math.sin(a)).toFixed(1)}`}).join(' ');
const PA_win=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#BFEAF7" ${sw(4)}/><path d="M${x+w/2} ${y} V${y+h} M${x} ${y+h/2} H${x+w}" ${sw(2.5)}/>`;

/* persona con brazos, ropa, sombrero y objetos extra (basada en person()) */
const PA_P=(o,x={})=>{let s=person(o);
 if(x.R)s=s.replace('M20 -6 Q30 10 28 26',x.R[0]).replace('<circle cx="28" cy="28"',`<circle cx="${x.R[1]}" cy="${x.R[2]}"`);
 if(x.L)s=s.replace('M-20 -6 Q-30 10 -28 26',x.L[0]).replace('<circle cx="-28" cy="28"',`<circle cx="${x.L[1]}" cy="${x.L[2]}"`);
 const am=s.match(/<path d="(M-20 [^"]*)" fill="none" stroke="#[0-9A-Fa-f]{6}" stroke-width="10" stroke-linecap="round"\/>/);
 const bi=s.search(/<path d="M-1[46] -12 H1[46]/);
 s=s.slice(0,bi)+`<path d="${am[1]}" fill="none" stroke="${K}" stroke-width="15" stroke-linecap="round"/>`+s.slice(bi);
 s=s.replace(am[0],(x.mid||'')+am[0]+(x.hold||''));
 s=s.replace(/<\/g>$/,(x.top||'')+'</g>');
 if(x.T){const rt=1.08*x.T-2.32,f=Math.min(1,114/(56-rt)),ty=56-56*f;s=`<g transform="translate(0 ${ty.toFixed(1)}) scale(${f.toFixed(3)})">${s}</g>`}
 return s};
const PA_star=(cx,cy,r,c)=>`<polygon points="${[...Array(10)].map((_,i)=>{const a=(-90+36*i)*Math.PI/180,q=i%2?r*.45:r;return `${(cx+q*Math.cos(a)).toFixed(1)},${(cy+q*Math.sin(a)).toFixed(1)}`}).join(' ')}" fill="${c}" ${sw(2)}/>`;
const PA_hat=`<path d="M-14 -48 Q-28 -54 -22 -68 Q-20 -82 -6 -78 Q2 -90 12 -78 Q26 -80 24 -66 Q28 -54 14 -48 Z" fill="#FFFFFF" ${sw(4)}/><rect x="-15" y="-50" width="30" height="10" rx="2" fill="#FFFFFF" ${sw(4)}/>`;

const PA_heart=(x,y,r,c,w=3)=>`<path d="M${x} ${y+r*.9} C${x-r*1.6} ${y-r*.1} ${x-r*.9} ${y-r*1.3} ${x} ${y-r*.45} C${x+r*.9} ${y-r*1.3} ${x+r*1.6} ${y-r*.1} ${x} ${y+r*.9} Z" fill="${c}" ${sw(w)}/>`;
const PA_spiral=(cx,cy,st,n)=>{let d=`M${cx} ${cy}`,x=cx;for(let i=1;i<=n;i++){const r=st*i/2;x=i%2?cx+st*(i+1)/2:cx-st*i/2;d+=` A${r} ${r} 0 0 1 ${x} ${cy}`}return d};

const PA_wh=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#5B5F6B" ${sw()}/><circle cx="${x}" cy="${y}" r="${r*.4}" fill="#E4ECF4" ${sw(2.5)}/>`;
const PA_lens=(b,c)=>{const w=13*b/46;return `<path d="M0 -58 C${b*.74} -58 ${b} -34 ${b} -14 C${b*.96} 4 ${w*1.5} 16 ${w} 22 H${-w} C${-w*1.5} 16 ${-b*.96} 4 ${-b} -14 C${-b} -34 ${-b*.74} -58 0 -58 Z" fill="${c}" ${sw(b>40?5:3)}/>`};

Object.assign(PICS,{
escuela:`<rect x="-54" y="-2" width="108" height="56" fill="#FFD66B" ${sw()}/>`+
 `<path d="M-58 0 L-50 -12 H50 L58 0 Z" fill="#FF6B5E" ${sw()}/>`+
 PA_win(-47,8,18,15)+PA_win(-47,30,18,15)+PA_win(29,8,18,15)+PA_win(29,30,18,15)+
 `<path d="M-9 -34 V-48 H9 V-34 Z" fill="#FF8A7A" ${sw(4)}/><path d="M-5 -36 V-42 Q-5 -46 0 -46 Q5 -46 5 -42 V-36 Z" fill="#FFC93C" ${sw(2.5)}/>`+
 `<path d="M-13 -46 L0 -58 L13 -46 Z" fill="#FF6B5E" ${sw(4)}/>`+
 `<rect x="-22" y="-22" width="44" height="76" fill="#FFC93C" ${sw()}/>`+
 `<path d="M-28 -20 L0 -40 L28 -20 Z" fill="#FF6B5E" ${sw()}/>`+
 `<circle cx="0" cy="-4" r="11" fill="#FFFFFF" ${sw(4)}/><path d="M0 -4 V-11 M0 -4 H5" ${sw(3)}/>`+
 `<path d="M-12 54 V28 Q-12 18 0 18 Q12 18 12 28 V54 Z" fill="#A86B43" ${sw(4)}/><path d="M0 19 V54" ${sw(3)}/>`,

hospital:`<rect x="-54" y="0" width="108" height="54" fill="#E4ECF4" ${sw()}/>`+
 `<rect x="-58" y="-6" width="116" height="8" rx="2" fill="#B8B0A6" ${sw(4)}/>`+
 PA_win(-48,10,16,13)+PA_win(-48,32,16,13)+PA_win(32,10,16,13)+PA_win(32,32,16,13)+
 `<rect x="-24" y="-26" width="48" height="80" fill="#FFFFFF" ${sw()}/>`+
 `<rect x="-28" y="-32" width="56" height="8" rx="2" fill="#B8B0A6" ${sw(4)}/>`+
 `<rect x="-17" y="-16" width="12" height="11" rx="2" fill="#7FD3F0" ${sw(3)}/><rect x="5" y="-16" width="12" height="11" rx="2" fill="#7FD3F0" ${sw(3)}/>`+
 `<rect x="-17" y="2" width="12" height="11" rx="2" fill="#7FD3F0" ${sw(3)}/><rect x="5" y="2" width="12" height="11" rx="2" fill="#7FD3F0" ${sw(3)}/>`+
 `<rect x="-20" y="20" width="40" height="7" rx="2" fill="#FF5A5A" ${sw(3)}/>`+
 `<rect x="-14" y="27" width="28" height="27" fill="#7FD3F0" ${sw(4)}/><path d="M0 27 V54" ${sw(3)}/>`+
 `<path d="M-6 -58 H6 V-48 H16 V-36 H6 V-26 H-6 V-36 H-16 V-48 H-6 Z" fill="#FF5A5A" ${sw(4)}/>`,

parque:`<path d="M-44 26 V-8" stroke="${K}" stroke-width="13" stroke-linecap="round"/><path d="M-44 26 V-8" stroke="#A86B43" stroke-width="7" stroke-linecap="round"/>`+
 `<path d="M-56 -22 Q-60 -44 -42 -46 Q-36 -60 -22 -50 Q-8 -46 -14 -30 Q-10 -14 -28 -14 Q-38 -6 -48 -12 Q-60 -12 -56 -22 Z" fill="#5FA84E" ${sw()}/>`+
 `<path d="M18 30 L25 -36 M58 30 L51 -36" ${sw(6)}/><path d="M22 -36 H54" ${sw(7)}/><path d="M18 30 L25 -36 M58 30 L51 -36" stroke="#5B8DEF" stroke-width="2.5" stroke-linecap="round"/>`+
 `<path d="M31 -36 V2 M45 -36 V2" ${sw(2.5)}/><rect x="27" y="0" width="22" height="7" rx="3" fill="#FFC93C" ${sw(3)}/>`+
 `<path d="M-26 22 V-20 M-14 22 V-20" ${sw(4)}/><path d="M-26 10 H-14 M-26 -2 H-14 M-26 -14 H-14" ${sw(3)}/>`+
 `<path d="M-16 -24 H-8 Q0 -24 4 -4 Q8 16 18 16 V24 Q2 24 -4 0 Q-6 -14 -12 -14 H-16 Z" fill="#FF6B5E" ${sw(4)}/>`+
 `<path d="M-58 54 V34 Q-48 14 0 14 Q48 14 58 34 V54 Z" fill="#7CC86E" ${sw()}/><path d="M-40 34 l4 -6 l4 6 M24 40 l4 -6 l4 6 M-6 44 l4 -6 l4 6" fill="none" stroke="#5FA84E" stroke-width="3" stroke-linecap="round"/>`,

piscina:`<path d="M-44 -46 H44 L58 52 H-58 Z" fill="#DDF3FB" ${sw()}/>`+
 `<path d="M-36 -46 L-37 -30 M-18 -46 L-18 -30 M0 -46 V-30 M18 -46 V-30 M36 -46 L37 -30 M-52 10 H-40 M40 10 H52 M-30 38 L-32 52 M0 38 V52 M30 38 L32 52" stroke="#9FCFE4" stroke-width="3"/>`+
 `<path d="M-36 -30 H36 L46 38 H-46 Z" fill="#5BB8E6" ${sw(4)}/>`+
 `<path d="M-30 -12 q6 -4 12 0 t12 0 M10 4 q6 -4 12 0 t12 0 M-34 26 q6 -4 12 0 t12 0" fill="none" stroke="#BFEAF7" stroke-width="3.5" stroke-linecap="round"/>`+
 `<path d="M12 -8 H30 M12 -18 H30" stroke="#B8B0A6" stroke-width="4" stroke-linecap="round" opacity=".8"/>`+
 `<path d="M12 -2 V-44 Q12 -52 18 -52 Q22 -52 22 -44 M30 -2 V-44 Q30 -52 36 -52 Q40 -52 40 -44" fill="none" stroke="${K}" stroke-width="9" stroke-linecap="round"/>`+
 `<path d="M12 -2 V-44 Q12 -52 18 -52 Q22 -52 22 -44 M30 -2 V-44 Q30 -52 36 -52 Q40 -52 40 -44" fill="none" stroke="#B8B0A6" stroke-width="4" stroke-linecap="round"/>`+
 `<ellipse cx="-14" cy="16" rx="22" ry="13" fill="#FF5A5A" ${sw(4)}/><ellipse cx="-14" cy="15" rx="9" ry="5" fill="#5BB8E6" ${sw(3)}/>`+
 `<path d="M-34 12 l6 2 M6 12 l-6 2 M-19 26 l2 -6 M-8 4 l-2 5" stroke="#FFFFFF" stroke-width="6"/>`,

tienda:`<rect x="-52" y="-40" width="104" height="94" fill="#FFE08A" ${sw()}/>`+
 `<rect x="-56" y="-58" width="112" height="20" rx="4" fill="#7CC86E" ${sw()}/><circle cx="0" cy="-47" r="6" fill="#FF5A5A" ${sw(3)}/><path d="M0 -53 q2 -4 5 -4" ${sw(2.5)}/>`+
 [0,1,2,3,4,5,6,7].map(i=>{const x=-56+i*14;return `<path d="M${x} -38 H${x+14} V-24 A7 7 0 0 1 ${x} -24 Z" fill="${i%2?'#FFFFFF':'#FF6B5E'}" ${sw(4)}/>`}).join('')+
 `<rect x="-44" y="-6" width="50" height="44" rx="3" fill="#BFEAF7" ${sw(4)}/>`+
 `<rect x="-44" y="26" width="50" height="12" fill="#C98A4B" ${sw(4)}/>`+
 `<circle cx="-34" cy="18" r="7" fill="#FF5A5A" ${sw(3)}/><circle cx="-20" cy="18" r="7" fill="#FFA94D" ${sw(3)}/><circle cx="-6" cy="18" r="7" fill="#7CC86E" ${sw(3)}/>`+
 `<ellipse cx="-30" cy="5" rx="8" ry="6" fill="#FFD66B" ${sw(3)}/><circle cx="-16" cy="2" r="4" fill="#9B8AD9" ${sw(2.5)}/><circle cx="-11" cy="7" r="4" fill="#9B8AD9" ${sw(2.5)}/><circle cx="-19" cy="8" r="4" fill="#9B8AD9" ${sw(2.5)}/><path d="M2 2 Q0 -4 -4 4 Q-6 12 0 12 Q6 12 4 4 Z" fill="#9FDC8F" ${sw(2.5)}/>`+
 `<rect x="14" y="-6" width="30" height="60" rx="2" fill="#A86B43" ${sw(4)}/><rect x="20" y="1" width="18" height="22" rx="2" fill="#BFEAF7" ${sw(3)}/><circle cx="38" cy="32" r="3" fill="#FFC93C" ${sw(2)}/>`,

calendario:`<path d="M-48 -44 H48 V48 Q48 54 42 54 H-42 Q-48 54 -48 48 Z" fill="#FFFFFF" ${sw()}/>`+
 `<path d="M-48 -22 V-38 Q-48 -44 -42 -44 H42 Q48 -44 48 -38 V-22 Z" fill="#FF6B5E" ${sw()}/>`+
 [-14,2,18,34].map(y=>[-43,-25,-7,11,29].map(x=>`<rect x="${x}" y="${y}" width="14" height="12" rx="2" fill="${x==11&&y==2?'#FFD66B':'#DDF3FB'}"/>`).join('')).join('')+
 `<circle cx="18" cy="8" r="12" fill="none" stroke="#FF5A5A" stroke-width="4"/>`+
 `<path d="M-24 -32 V-50 Q-24 -56 -18 -56 Q-12 -56 -12 -50 M24 -32 V-50 Q24 -56 18 -56 Q12 -56 12 -50" fill="none" stroke="${K}" stroke-width="9" stroke-linecap="round"/>`+
 `<path d="M-24 -32 V-50 Q-24 -56 -18 -56 Q-12 -56 -12 -50 M24 -32 V-50 Q24 -56 18 -56 Q12 -56 12 -50" fill="none" stroke="#B8B0A6" stroke-width="4" stroke-linecap="round"/>`,

semaforo:`<rect x="-6" y="34" width="12" height="18" fill="#5B5F6B" ${sw(4)}/><rect x="-18" y="48" width="36" height="8" rx="3" fill="#5B5F6B" ${sw(4)}/>`+
 `<rect x="-24" y="-58" width="48" height="94" rx="12" fill="#5B5F6B" ${sw()}/>`+
 [[-38,'#FF5A5A'],[-12,'#FFC93C'],[14,'#7CC86E']].map(([y,c])=>`<circle cx="0" cy="${y}" r="15" fill="${c}" opacity=".35"/><circle cx="0" cy="${y}" r="11" fill="${c}" ${sw(3)}/><circle cx="-4" cy="${y-4}" r="3.5" fill="#FFFFFF" opacity=".8"/>`).join(''),

pasoCebra:`<rect x="-58" y="-54" width="116" height="110" rx="6" fill="#E4D3B8" ${sw(4)}/>`+
 `<path d="M-34 -54 H34 L51 56 H-51 Z" fill="#6B7280" ${sw(4)}/>`+
 `<path d="M-34 -54 L-51 56 M34 -54 L51 56" stroke="#B8B0A6" stroke-width="3"/>`+
 `<path d="M0 -50 V-38 M0 -28 V-16 M0 46 V56" stroke="#FFD66B" stroke-width="5" stroke-linecap="round"/>`+
 [0,1,2,3,4].map(i=>{const hw=y=>42+0.155*y,X=(y,f)=>(-hw(y)+2*hw(y)*f).toFixed(1),f0=0.07+i*0.19,f1=f0+0.12,t=-6,b=34;return `<path d="M${X(t,f0)} ${t} H${X(t,f1)} L${X(b,f1)} ${b} H${X(b,f0)} Z" fill="#FFFFFF" ${sw(3)}/>`}).join(''),

stop:`<rect x="-5" y="18" width="10" height="38" fill="#B8B0A6" ${sw(4)}/>`+
 `<polygon points="${PA_oct(42,-17)}" fill="#FF5A5A" ${sw()}/>`+
 `<polygon points="${PA_oct(34,-17)}" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round"/>`+
 `<rect x="-24" y="-24" width="48" height="14" rx="3" fill="#FFFFFF" ${sw(3)}/>`,

mapa:`<path d="M-56 -38 L-20 -46 L-20 44 L-56 52 Z" fill="#FFE08A" ${sw()}/><path d="M-20 -46 L18 -38 L18 52 L-20 44 Z" fill="#FFD66B" ${sw()}/><path d="M18 -38 L56 -46 L56 44 L18 52 Z" fill="#FFE08A" ${sw()}/>`+
 `<path d="M-56 -4 Q-40 -10 -30 2 Q-20 12 -4 6" fill="none" stroke="#5BB8E6" stroke-width="7" stroke-linecap="round"/>`+
 `<path d="M-42 38 Q-30 20 -10 26 Q12 32 16 10 Q20 -12 34 -22" fill="none" stroke="#FF5A5A" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="0.1 9"/>`+
 `<path d="M-38 -20 V-12" ${sw(4)}/><path d="M-38 -40 L-28 -20 H-48 Z" fill="#5FA84E" ${sw(3)}/>`+
 `<path d="M30 -34 L44 -20 M44 -34 L30 -20" stroke="${K}" stroke-width="9" stroke-linecap="round"/><path d="M30 -34 L44 -20 M44 -34 L30 -20" stroke="#FF5A5A" stroke-width="5" stroke-linecap="round"/>`,
bombera:PA_P({skin:'#F2C29B',hair:'#FFD66B',style:'long',shirt:'#E8B84A',pants:'#E8B84A'},{T:-58,
 mid:`<path d="M0 -12 V22" ${sw(2.5)}/><rect x="-22" y="4" width="44" height="7" fill="#E4ECF4" ${sw(2.5)}/><rect x="-17" y="36" width="12" height="5" fill="#E4ECF4" ${sw(2)}/><rect x="5" y="36" width="12" height="5" fill="#E4ECF4" ${sw(2)}/>`,
 hold:`<path d="M-33 18 H-23 M23 18 H33" stroke="#E4ECF4" stroke-width="4"/>`,
 top:`<path d="M-19 -36 Q-19 -58 0 -58 Q19 -58 19 -36 Z" fill="#FF5A5A" ${sw(4)}/><path d="M0 -58 V-52" ${sw(3)}/><path d="M-27 -36 Q0 -42 27 -36 Q29 -30 23 -30 Q0 -34 -23 -30 Q-29 -30 -27 -36 Z" fill="#E04F44" ${sw(3.5)}/><path d="M-7 -52 H7 V-45 Q7 -39 0 -37 Q-7 -39 -7 -45 Z" fill="#FFC93C" ${sw(2.5)}/>`}),
medico:PA_P({skin:'#8D5A3B',hair:'#4A3428',style:'short',shirt:'#FFFFFF',pants:'#6B7280'},{
 mid:`<path d="M-16 -12 H16 Q23 -10 23 0 L25 36 H-25 L-23 0 Q-23 -10 -16 -12 Z" fill="#FFFFFF" ${sw(4)}/><path d="M-8 -12 L0 2 L8 -12 Z" fill="#5B8DEF" ${sw(3)}/><path d="M-8 -12 L-2 8 M8 -12 L2 8 M0 6 V36" ${sw(2.5)}/><rect x="9" y="12" width="10" height="9" rx="1" fill="#FFFFFF" ${sw(2.5)}/><path d="M14 13.5 V19.5 M11 16.5 H17" stroke="#FF5A5A" stroke-width="2.5"/>`+
  `<path d="M-10 -11 Q-15 6 -7 14 M10 -11 Q15 4 9 12" fill="none" stroke="${K}" stroke-width="6" stroke-linecap="round"/><path d="M-10 -11 Q-15 6 -7 14 M10 -11 Q15 4 9 12" fill="none" stroke="#FF6B5E" stroke-width="3" stroke-linecap="round"/><circle cx="-6" cy="16" r="5" fill="#B8B0A6" ${sw(3)}/><circle cx="9" cy="13" r="2.5" fill="${K}"/>`}),
policia:PA_P({skin:'#D9A07A',hair:'#4A3428',style:'long',shirt:'#34497A',pants:'#34497A'},{T:-60,
 R:['M20 -6 Q34 -8 36 -26',37,-30],
 mid:`<path d="M-8 -12 L0 -3 L8 -12 Z" fill="#7FD3F0" ${sw(2.5)}/><rect x="-22" y="15" width="44" height="6" fill="${K}"/><rect x="-4" y="14" width="8" height="8" rx="1" fill="#FFC93C" ${sw(2)}/>${PA_star(-11,0,6.5,'#FFC93C')}`,
 top:`<path d="M-17 -42 L-23 -54 Q0 -62 23 -54 L17 -42 Z" fill="#34497A" ${sw(4)}/><rect x="-18" y="-45" width="36" height="6" fill="#2A3A60" ${sw(3)}/><path d="M-17 -40 Q0 -35 17 -40 L19 -36 Q0 -29 -19 -36 Z" fill="${K}"/>${PA_star(0,-51,6,'#FFC93C')}`}),
panadero:PA_P({skin:'#F2C29B',hair:'#8A5A3C',style:'short',shirt:'#5BB8E6',pants:'#6B7280'},{T:-88,
 mid:`<path d="M-13 -4 L-10 -12 M13 -4 L10 -12" ${sw(3)}/><path d="M-15 -4 H15 L19 38 H-19 Z" fill="#FFFFFF" ${sw(4)}/><rect x="-8" y="14" width="16" height="10" rx="2" fill="#FFFFFF" ${sw(2.5)}/>`,
 hold:`<g transform="translate(34 6) rotate(-66)"><rect x="-38" y="-8" width="76" height="16" rx="8" fill="#FFA94D" ${sw(4)}/><path d="M-24 -4 l7 8 M-8 -4 l7 8 M8 -4 l7 8 M24 -4 l6 7" stroke="#FFE08A" stroke-width="3.5" stroke-linecap="round"/></g>`,
 top:`<path d="M-11 -21 Q-6 -28 0 -24 Q6 -28 11 -21 Q5 -19 0 -22 Q-5 -19 -11 -21 Z" fill="#8A5A3C" ${sw(2)}/>${PA_hat}`}),
cocinera:PA_P({skin:'#8D5A3B',hair:'#4A3428',style:'long',shirt:'#FFFFFF',pants:'#6B7280'},{T:-74,
 R:['M20 -6 Q34 -6 36 -18',36,-20],
 mid:`<path d="M-15 -2 H15 L19 38 H-19 Z" fill="#FF8A7A" ${sw(4)}/><path d="M-10 -13 L0 0 L10 -13 Z" fill="#FF5A5A" ${sw(3)}/><circle cx="-8" cy="-6" r="2" fill="${K}"/><circle cx="8" cy="-6" r="2" fill="${K}"/>`,
 hold:`<path d="M36 -14 V-46" stroke="${K}" stroke-width="8" stroke-linecap="round"/><path d="M36 -14 V-46" stroke="#C98A4B" stroke-width="4" stroke-linecap="round"/><ellipse cx="36" cy="-54" rx="7" ry="10" fill="#C98A4B" ${sw(3)}/>`+
  `<path d="M-30 24 H-36" ${sw(5)}/><rect x="-58" y="20" width="24" height="22" rx="5" fill="#B8B0A6" ${sw(4)}/><rect x="-60" y="16" width="28" height="6" rx="3" fill="#B8B0A6" ${sw(3)}/><path d="M-52 10 q-4 -5 0 -10 M-42 10 q-4 -5 0 -10" fill="none" stroke="#B8B0A6" stroke-width="3" stroke-linecap="round"/>`,
 top:`<path d="M-16 -46 Q-30 -48 -25 -62 Q-18 -74 0 -71 Q18 -74 25 -62 Q30 -48 16 -46 Z" fill="#FFFFFF" ${sw(4)}/><rect x="-16" y="-48" width="32" height="8" rx="2" fill="#FFFFFF" ${sw(4)}/>`}),
cartero:PA_P({skin:'#D9A07A',hair:'#8A5A3C',style:'short',shirt:'#FFC93C',pants:'#5B8DEF'},{T:-58,
 mid:`<path d="M-8 -12 L0 -4 L8 -12" fill="#5B8DEF" ${sw(2.5)}/><path d="M-15 -11 L18 14" stroke="${K}" stroke-width="8" stroke-linecap="round"/><path d="M-15 -11 L18 14" stroke="#A86B43" stroke-width="4" stroke-linecap="round"/>`,
 hold:`<g transform="translate(22 4) rotate(-14)"><rect x="-11" y="-9" width="22" height="16" fill="#FFFFFF" ${sw(3)}/><path d="M-11 -9 L0 -1 L11 -9" fill="none" ${sw(2.5)}/></g><rect x="10" y="8" width="30" height="24" rx="5" fill="#A86B43" ${sw(4)}/><path d="M10 12 Q10 8 15 8 H35 Q40 8 40 12 V18 Q25 24 10 18 Z" fill="#C98A4B" ${sw(3)}/><circle cx="25" cy="20" r="2.5" fill="#FFC93C"/>`,
 top:`<path d="M-17 -40 Q-18 -58 0 -58 Q18 -58 17 -40 Z" fill="#5B8DEF" ${sw(4)}/><path d="M-18 -40 Q0 -34 18 -40 Q21 -35 14 -33 Q0 -30 -14 -33 Q-21 -35 -18 -40 Z" fill="#4A78D0" ${sw(3)}/><circle cx="0" cy="-49" r="5" fill="#FFC93C" ${sw(2.5)}/>`}),
granjera:PA_P({skin:'#F2C29B',hair:'#C9443A',style:'pig',shirt:'#FF6B5E',pants:'#5B8DEF'},{T:-60,
 L:['M-20 -6 Q-34 -8 -36 -22',-36,-24],
 mid:`<path d="M-12 -6 L-15 -12 M12 -6 L15 -12" stroke="${K}" stroke-width="7" stroke-linecap="round"/><path d="M-12 -6 L-15 -12 M12 -6 L15 -12" stroke="#5B8DEF" stroke-width="3.5" stroke-linecap="round"/><path d="M-13 -6 H13 V22 H-13 Z" fill="#5B8DEF" ${sw(3)}/><rect x="-6" y="2" width="12" height="8" rx="1" fill="#5B8DEF" ${sw(2.5)}/><circle cx="-9" cy="-2" r="2.5" fill="#FFC93C"/><circle cx="9" cy="-2" r="2.5" fill="#FFC93C"/>`,
 hold:`<path d="M-26 -42 q-2 -12 -10 -16 M-26 -42 q4 -12 12 -14 M-26 -42 q-8 -6 -18 -4" fill="none" stroke="${K}" stroke-width="8" stroke-linecap="round"/><path d="M-26 -42 q-2 -12 -10 -16 M-26 -42 q4 -12 12 -14 M-26 -42 q-8 -6 -18 -4" fill="none" stroke="#7CC86E" stroke-width="4" stroke-linecap="round"/><path d="M-30 -44 Q-20 -44 -22 -36 L-50 6 Q-52 8 -53 5 L-35 -38 Q-34 -44 -30 -44 Z" fill="#FFA94D" ${sw(3.5)}/><path d="M-30 -30 l4 2 M-38 -16 l4 2 M-44 -4 l3 2" ${sw(2)}/>`,
 top:`<ellipse cx="0" cy="-42" rx="32" ry="7" fill="#FFD66B" ${sw(4)}/><path d="M-16 -42 Q-17 -60 0 -60 Q17 -60 16 -42 Z" fill="#FFD66B" ${sw(4)}/><path d="M-16 -46 H16" stroke="#FF6B5E" stroke-width="5"/><path d="M-16 -42 Q-17 -60 0 -60 Q17 -60 16 -42" fill="none" ${sw(4)}/>`}),
peluquero:PA_P({skin:'#D9A07A',hair:'#8A5A3C',style:'curly',shirt:'#9B8AD9',pants:'#5B5F6B'},{T:-62,
 L:['M-20 -6 Q-34 -8 -38 -24',-38,-26],R:['M20 -6 Q34 -8 38 -24',38,-26],
 mid:`<path d="M-8 -12 L0 -2 L8 -12" fill="#FFFFFF" ${sw(2.5)}/><rect x="-22" y="14" width="44" height="6" fill="#5B5F6B" ${sw(2.5)}/>`,
 hold:`<rect x="-45" y="-62" width="8" height="34" rx="2" fill="#3FC1B0" ${sw(3)}/><path d="M-37 -58 H-30 M-37 -52 H-30 M-37 -46 H-30 M-37 -40 H-30 M-37 -34 H-30" stroke="${K}" stroke-width="3.5" stroke-linecap="round"/>`+
  `<path d="M34 -34 L46 -62 L40 -36 Z M42 -34 L30 -62 L36 -36 Z" fill="#E4ECF4" ${sw(3)}/><circle cx="33" cy="-30" r="5.5" fill="none" stroke="${K}" stroke-width="6"/><circle cx="43" cy="-30" r="5.5" fill="none" stroke="${K}" stroke-width="6"/><circle cx="33" cy="-30" r="5.5" fill="none" stroke="#FF5A5A" stroke-width="3"/><circle cx="43" cy="-30" r="5.5" fill="none" stroke="#FF5A5A" stroke-width="3"/><circle cx="38" cy="-40" r="2" fill="${K}"/>`}),
manguera:`<g transform="translate(-4 8)">`+(()=>{const d=PA_spiral(-26,6,12,5)+' C10 36 30 46 38 26';return `<path d="${d}" fill="none" stroke="${K}" stroke-width="15" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#FF6B5E" stroke-width="8" stroke-linecap="round"/>`})()+
 `<g transform="translate(38 26) rotate(12)"><path d="M-7 2 L-4 -22 H4 L7 2 Z" fill="#FFC93C" ${sw(3.5)}/><rect x="-8" y="-4" width="16" height="7" rx="2" fill="#FFA94D" ${sw(3)}/></g>`+
 `<path d="M40 -4 L30 -30 M43 -4 L45 -36 M46 -2 L55 -24" stroke="#5BB8E6" stroke-width="6" stroke-linecap="round"/>`+
 `<ellipse cx="24" cy="-40" rx="3.5" ry="4.5" fill="#7FD3F0" ${sw(2)}/><ellipse cx="38" cy="-48" rx="3.5" ry="4.5" fill="#7FD3F0" ${sw(2)}/><ellipse cx="54" cy="-40" rx="3.5" ry="4.5" fill="#7FD3F0" ${sw(2)}/></g>`,
fonendo:`<g transform="translate(0 4)"><path d="M-34 -46 Q-38 -18 -18 -6 M-2 -46 Q2 -18 -18 -6" fill="none" stroke="${K}" stroke-width="9" stroke-linecap="round"/><path d="M-34 -46 Q-38 -18 -18 -6 M-2 -46 Q2 -18 -18 -6" fill="none" stroke="#B8B0A6" stroke-width="4" stroke-linecap="round"/>`+
 `<circle cx="-36" cy="-50" r="6" fill="#5B5F6B" ${sw(3)}/><circle cx="0" cy="-50" r="6" fill="#5B5F6B" ${sw(3)}/>`+
 `<path d="M-18 -6 V24 Q-18 48 4 48 Q26 48 26 30 V20" fill="none" stroke="${K}" stroke-width="13" stroke-linecap="round"/><path d="M-18 -6 V24 Q-18 48 4 48 Q26 48 26 30 V20" fill="none" stroke="#5B8DEF" stroke-width="7" stroke-linecap="round"/>`+
 `<circle cx="-18" cy="-6" r="5" fill="#B8B0A6" ${sw(3)}/><circle cx="26" cy="8" r="17" fill="#B8B0A6" ${sw()}/><circle cx="26" cy="8" r="10" fill="#E4ECF4" ${sw(3)}/><path d="M20 4 q3 -4 7 -4" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/></g>`,
silbato:`<g transform="translate(5 6) scale(1.08)"><path d="M38 -6 C58 -46 -10 -66 -22 -38 C-28 -24 14 -32 38 -6" fill="none" stroke="${K}" stroke-width="8" stroke-linecap="round"/><path d="M38 -6 C58 -46 -10 -66 -22 -38 C-28 -24 14 -32 38 -6" fill="none" stroke="#5B8DEF" stroke-width="4" stroke-linecap="round"/>`+
 `<circle cx="38" cy="-4" r="6" fill="none" stroke="${K}" stroke-width="4"/>`+
 `<path d="M-54 -12 H10 A26 26 0 1 1 -14.7 6 H-54 Z" fill="#FF6B5E" ${sw()}/><rect x="-54" y="-12" width="10" height="18" rx="2" fill="#E04F44" ${sw(4)}/><rect x="-12" y="-12" width="14" height="7" fill="${K}"/>`+
 `<path d="M24 0 a14 14 0 0 1 4 18" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity=".7"/></g>`,
carta:`<g transform="rotate(-6) scale(.97)"><rect x="-54" y="-34" width="108" height="72" rx="5" fill="#FFFFFF" ${sw()}/><path d="M-54 38 L-10 4 M54 38 L10 4" fill="none" stroke="#B8B0A6" stroke-width="3.5" stroke-linecap="round"/>`+
 `<path d="M-54 -32 L0 10 L54 -32" fill="#FFF6E6" ${sw(4)}/><rect x="28" y="-28" width="20" height="24" fill="#FFFFFF" ${sw(2.5)}/><rect x="32" y="-24" width="12" height="16" fill="#7FD3F0"/><circle cx="38" cy="-17" r="3.5" fill="#FFD66B"/>${PA_heart(0,10,14,'#FF5A5A',3.5)}</g>`,
tijeras:`<g transform="translate(0 3)"><path d="M24 -56 L7 6 L-5 2 Z" fill="#E4ECF4" ${sw(4)}/><path d="M2 2 L-16 28" stroke="${K}" stroke-width="11" stroke-linecap="round"/><path d="M2 2 L-16 28" stroke="#B8B0A6" stroke-width="5" stroke-linecap="round"/><circle cx="-21" cy="37" r="12" fill="none" stroke="${K}" stroke-width="16"/><circle cx="-21" cy="37" r="12" fill="none" stroke="#FF5A5A" stroke-width="9"/>`+
 `<path d="M-24 -56 L-7 6 L5 2 Z" fill="#E4ECF4" ${sw(4)}/><path d="M-2 2 L16 28" stroke="${K}" stroke-width="11" stroke-linecap="round"/><path d="M-2 2 L16 28" stroke="#B8B0A6" stroke-width="5" stroke-linecap="round"/><circle cx="21" cy="37" r="12" fill="none" stroke="${K}" stroke-width="16"/><circle cx="21" cy="37" r="12" fill="none" stroke="#FF5A5A" stroke-width="9"/>`+
 `<circle cx="0" cy="2" r="5" fill="#B8B0A6" ${sw(3)}/><path d="M-16 -40 L-10 -18" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/></g>`,
sarten:`<g transform="translate(-2 -4)"><g transform="rotate(-25 -12 4)"><rect x="24" y="-2" width="12" height="12" fill="#5B5F6B" ${sw(4)}/><rect x="34" y="-5" width="27" height="18" rx="8" fill="#A86B43" ${sw()}/><circle cx="54" cy="4" r="3" fill="${K}"/></g>`+
 `<circle cx="-12" cy="4" r="42" fill="#5B5F6B" ${sw()}/><circle cx="-12" cy="4" r="33" fill="#6B7280"/>`+
 `<path d="M-38 4 Q-40 -18 -18 -22 Q4 -26 10 -8 Q18 12 2 22 Q-16 32 -30 20 Q-38 14 -38 4 Z" fill="#FFFFFF" ${sw(3.5)}/><circle cx="-12" cy="0" r="11" fill="#FFC93C" ${sw(3)}/><circle cx="-15" cy="-3" r="3" fill="#FFFFFF" opacity=".8"/></g>`,
lupa:`<g transform="translate(-2 -2)"><g transform="translate(14 14) rotate(45)"><rect x="4" y="-7" width="14" height="14" fill="#5B5F6B" ${sw(4)}/><rect x="16" y="-10" width="34" height="20" rx="10" fill="#FF6B5E" ${sw()}/></g>`+
 `<circle cx="-12" cy="-12" r="38" fill="#5B8DEF" ${sw()}/><circle cx="-12" cy="-12" r="28" fill="#BFEAF7" ${sw(4)}/><path d="M-30 -18 Q-28 -30 -16 -32" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/></g>`,
campana:`<path d="M-44 -22 q-6 10 0 20 M-52 -30 q-8 18 0 36 M44 -22 q6 10 0 20 M52 -30 q8 18 0 36" fill="none" ${sw(4)}/>`+
 `<circle cx="0" cy="42" r="9" fill="#FFA94D" ${sw(4)}/><circle cx="0" cy="-48" r="7" fill="none" ${sw(5)}/>`+
 `<path d="M0 -42 Q-28 -42 -30 -12 Q-31 12 -44 24 Q-46 30 -38 30 H38 Q46 30 44 24 Q31 12 30 -12 Q28 -42 0 -42 Z" fill="#FFC93C" ${sw()}/>`+
 `<rect x="-46" y="26" width="92" height="10" rx="5" fill="#FFA94D" ${sw(4)}/><path d="M-16 -28 Q-20 -6 -28 12" fill="none" stroke="#FFE08A" stroke-width="6" stroke-linecap="round"/>`,
tambor:`<path d="M-44 -8 V36 A44 13 0 0 0 44 36 V-8 Z" fill="#FF5A5A" ${sw()}/>`+
 `<path d="M-38 2 L-26 34 L-12 4 L0 37 L12 4 L26 34 L38 2" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round"/>`+
 `<path d="M-44 30 A44 13 0 0 0 44 30 V38 A44 13 0 0 1 -44 38 Z" fill="#FFC93C" ${sw(4)}/>`+
 `<ellipse cx="0" cy="-8" rx="46" ry="14" fill="#FFC93C" ${sw()}/><ellipse cx="0" cy="-9" rx="38" ry="9" fill="#FFF6E6" ${sw(3)}/>`+
 `<path d="M-46 -56 L14 -18 M46 -56 L-14 -18" stroke="${K}" stroke-width="10" stroke-linecap="round"/><path d="M-46 -56 L14 -18 M46 -56 L-14 -18" stroke="#C98A4B" stroke-width="5" stroke-linecap="round"/>`+
 `<circle cx="14" cy="-18" r="5.5" fill="#FFF6E6" ${sw(3)}/><circle cx="-14" cy="-18" r="5.5" fill="#FFF6E6" ${sw(3)}/>`,
perfume:`<path d="M-18 -26 Q-30 -40 -40 -32" fill="none" stroke="${K}" stroke-width="7" stroke-linecap="round"/><path d="M-18 -26 Q-30 -40 -40 -32" fill="none" stroke="#FFC93C" stroke-width="3" stroke-linecap="round"/><ellipse cx="-46" cy="-24" rx="9" ry="12" fill="#FF8A7A" ${sw(4)}/>`+
 `<rect x="-36" y="-10" width="60" height="62" rx="16" fill="#F58BB4" ${sw()}/><rect x="-14" y="-18" width="16" height="10" fill="#E4ECF4" ${sw(4)}/><rect x="-18" y="-32" width="24" height="16" rx="3" fill="#FFC93C" ${sw(4)}/><rect x="6" y="-28" width="7" height="6" rx="1" fill="#FFC93C" ${sw(2.5)}/>`+
 `<path d="M-24 4 V30" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity=".6"/>${PA_heart(-6,22,11,'#FFFFFF',3)}`+
 [[22,-26,4],[30,-34,5],[32,-20,4.5],[41,-28,6],[44,-40,4],[50,-16,4],[54,-30,4]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#F7C7DA" ${sw(2)}/>`).join(''),
cactus:`<g transform="translate(0 3) scale(.94)"><path d="M-10 2 H-26 Q-34 2 -34 -8 V-24 Q-34 -32 -27 -32 Q-20 -32 -20 -24 V-10 H-10 Z" fill="#7CC86E" ${sw()}/><path d="M10 -10 H26 Q34 -10 34 -20 V-34 Q34 -42 27 -42 Q20 -42 20 -34 V-22 H10 Z" fill="#7CC86E" ${sw()}/>`+
 `<path d="M-13 14 V-34 Q-13 -48 0 -48 Q13 -48 13 -34 V14 Z" fill="#7CC86E" ${sw()}/><path d="M0 -40 V8" stroke="#5FA84E" stroke-width="4" stroke-linecap="round"/>`+
 `<path d="M-13 -24 l-5 -2 M-13 -8 l-5 -2 M13 -2 l5 -2 M-30 -20 l-5 -1 M30 -30 l5 -1 M6 -30 l3 -3 M-6 -14 l-3 -3 M6 0 l3 -3" ${sw(2)}/>`+
 `${[0,72,144,216,288].map(a=>`<circle cx="${(7*Math.sin(a*Math.PI/180)).toFixed(1)}" cy="${(-52-7*Math.cos(a*Math.PI/180)).toFixed(1)}" r="5.5" fill="#F58BB4" ${sw(2.5)}/>`).join('')}<circle cx="0" cy="-52" r="4" fill="#FFD66B" ${sw(2)}/>`+
 `<path d="M-30 18 H30 L24 54 H-24 Z" fill="#E08A4A" ${sw()}/><rect x="-35" y="8" width="70" height="14" rx="4" fill="#C9743A" ${sw()}/></g>`,
casco:`<g transform="translate(-2 -2)"><path d="M-20 16 L2 40 M26 12 L8 40" fill="none" ${sw(5)}/><rect x="-2" y="36" width="14" height="10" rx="2" fill="#FFC93C" ${sw(3)}/>`+
 `<path d="M-52 12 Q-54 -38 0 -42 Q46 -44 54 -2 Q56 8 46 10 Q0 6 -52 12 Z" fill="#5B8DEF" ${sw()}/>`+
 `<path d="M-42 -8 Q-6 -40 44 -18" fill="none" stroke="#FFC93C" stroke-width="7" stroke-linecap="round"/>`+
 `<ellipse cx="-28" cy="-18" rx="9" ry="4" transform="rotate(-38 -28 -18)" fill="${K}"/><ellipse cx="-2" cy="-30" rx="10" ry="4" transform="rotate(-8 -2 -30)" fill="${K}"/><ellipse cx="25" cy="-26" rx="9" ry="4" transform="rotate(22 25 -26)" fill="${K}"/>`+
 `<path d="M-52 10 Q0 4 50 8 L48 16 Q0 13 -48 18 Z" fill="#5B5F6B" ${sw(4)}/><path d="M38 -8 Q54 -14 58 -6 Q56 0 48 2 Z" fill="#FFC93C" ${sw(4)}/></g>`,
maleta:`<path d="M-14 -26 V-50 M14 -26 V-50" stroke="${K}" stroke-width="9" stroke-linecap="round"/><path d="M-14 -26 V-50 M14 -26 V-50" stroke="#B8B0A6" stroke-width="4" stroke-linecap="round"/><rect x="-20" y="-58" width="40" height="11" rx="5" fill="#5B5F6B" ${sw(4)}/>`+
 `<circle cx="-24" cy="50" r="6" fill="#5B5F6B" ${sw(3)}/><circle cx="24" cy="50" r="6" fill="#5B5F6B" ${sw(3)}/>`+
 `<rect x="-38" y="-30" width="76" height="76" rx="12" fill="#3FC1B0" ${sw()}/><path d="M-20 -24 V40 M0 -24 V40 M20 -24 V40" stroke="#2FA796" stroke-width="4" stroke-linecap="round"/>`+
 `<circle cx="-16" cy="-6" r="11" fill="#FFD66B" ${sw(3)}/>${PA_star(-16,-6,7,'#FF6B5E')}<g transform="rotate(-10 14 24)"><rect x="2" y="16" width="26" height="17" rx="3" fill="#FFFFFF" ${sw(3)}/>${PA_heart(15,25,6,'#FF5A5A',2)}</g>`,
ambulancia:`<g transform="translate(0 2)"><path d="M-56 34 Q-58 34 -58 28 V-24 Q-58 -30 -52 -30 H22 V-12 H34 L50 4 Q58 6 58 14 V28 Q58 34 52 34 Z" fill="#FFFFFF" ${sw()}/>`+
 `<rect x="-55" y="14" width="111" height="7" fill="#FF5A5A"/><path d="M22 -12 V32" ${sw(3)}/><path d="M26 -6 H33 L45 6 H26 Z" fill="#BFEAF7" ${sw(3)}/><circle cx="54" cy="10" r="3.5" fill="#FFE08A" ${sw(2)}/>`+
 `<path d="M-25 -22 H-15 V-14 H-7 V-4 H-15 V4 H-25 V-4 H-33 V-14 H-25 Z" fill="#FF5A5A" ${sw(3)}/>`+
 `<path d="M0 -30 V-36 Q0 -42 8 -42 Q16 -42 16 -36 V-30 Z" fill="#5B8DEF" ${sw(3.5)}/><path d="M8 -49 V-55 M-4 -44 l-6 -4 M20 -44 l6 -4" stroke="#5B8DEF" stroke-width="4" stroke-linecap="round"/>`+
 PA_wh(-32,36,13)+PA_wh(34,36,13)+`</g>`,
camionBomberos:`<g transform="translate(0 4)"><rect x="-58" y="-16" width="84" height="46" rx="4" fill="#FF5A5A" ${sw()}/><path d="M24 30 V-30 Q24 -34 28 -34 H42 Q48 -34 52 -26 L58 -6 V30 Z" fill="#FF5A5A" ${sw()}/>`+
 `<path d="M30 -28 H42 L48 -10 H30 Z" fill="#BFEAF7" ${sw(3)}/><rect x="32" y="-41" width="12" height="7" rx="3" fill="#5B8DEF" ${sw(3)}/>`+
 `<rect x="-52" y="-10" width="22" height="18" rx="2" fill="#E04F44" ${sw(3)}/><rect x="-24" y="-10" width="22" height="18" rx="2" fill="#E04F44" ${sw(3)}/><rect x="-56" y="13" width="112" height="5" fill="#FFFFFF"/>`+
 `<rect x="2" y="-24" width="18" height="9" rx="2" fill="#5B5F6B" ${sw(3)}/>`+
 (()=>{const A=[16,-20],B=[13,-29],D=[-60,-24];let r='';for(let t=.12;t<1;t+=.17){r+=`M${(A[0]+D[0]*t).toFixed(1)} ${(A[1]+D[1]*t).toFixed(1)} L${(B[0]+D[0]*t).toFixed(1)} ${(B[1]+D[1]*t).toFixed(1)} `}
  const rails=`M${A[0]} ${A[1]} l${D[0]} ${D[1]} M${B[0]} ${B[1]} l${D[0]} ${D[1]}`;
  return `<path d="${rails} ${r}" fill="none" stroke="${K}" stroke-width="8" stroke-linecap="round"/><path d="${rails} ${r}" fill="none" stroke="#E4ECF4" stroke-width="3.5" stroke-linecap="round"/>`})()+
 PA_wh(-40,32,12)+PA_wh(-14,32,12)+PA_wh(40,32,12)+`</g>`,
patrullero:`<g transform="translate(-1 6)"><path d="M-56 18 V0 Q-54 -10 -36 -12 L-24 -34 H22 L38 -12 Q56 -10 58 4 V18 Z" fill="#FFFFFF" ${sw()}/>`+
 `<path d="M-55 2 H57 V17 H-55 Z" fill="#5B8DEF"/><path d="M-56 18 V0 Q-54 -10 -36 -12 L-24 -34 H22 L38 -12 Q56 -10 58 4 V18 Z" fill="none" ${sw()}/>`+
 `<path d="M-18 -28 H-2 V-12 H-28 Z M6 -28 H18 L28 -12 H6 Z" fill="#BFEAF7" ${sw(3)}/>${PA_star(-2,9,7,'#FFC93C')}<circle cx="54" cy="8" r="3.5" fill="#FFE08A" ${sw(2)}/>`+
 `<rect x="-16" y="-42" width="16" height="8" fill="#FF5A5A"/><rect x="0" y="-42" width="16" height="8" fill="#5B8DEF"/><rect x="-16" y="-42" width="32" height="8" rx="3" fill="none" ${sw(3.5)}/>`+
 `<path d="M-22 -46 l-6 -5 M-8 -48 l-2 -6" stroke="#FF5A5A" stroke-width="4" stroke-linecap="round"/><path d="M22 -46 l6 -5 M8 -48 l2 -6" stroke="#5B8DEF" stroke-width="4" stroke-linecap="round"/>`+
 PA_wh(-30,22,14)+PA_wh(32,22,14)+`</g>`,
submarino:`<g transform="translate(1 13)">`+[[-48,-26,5],[-38,-38,4],[-50,-48,6],[-34,-55,3.5]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#BFEAF7" ${sw(2.5)}/>`).join('')+
 `<path d="M10 -36 V-54 H22" fill="none" stroke="${K}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 -36 V-54 H22" fill="none" stroke="#B8B0A6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><rect x="20" y="-59" width="7" height="10" rx="2" fill="#5B5F6B" ${sw(3)}/>`+
 `<path d="M-40 -2 L-56 -16 V28 L-40 14 Z" fill="#FFA94D" ${sw(4)}/><path d="M-12 -12 V-30 Q-12 -36 -6 -36 H14 Q20 -36 20 -30 V-12 Z" fill="#FFC93C" ${sw()}/>`+
 `<path d="M-46 6 Q-46 -14 -20 -14 H30 Q54 -14 54 8 Q54 30 30 30 H-20 Q-46 30 -46 6 Z" fill="#FFC93C" ${sw()}/>`+
 [-22,2,26].map(x=>`<circle cx="${x}" cy="8" r="8" fill="#7FD3F0" ${sw(3.5)}/><path d="M${x-4} 6 q1 -4 5 -5" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>`).join('')+`</g>`,
globoAire:`<path d="M-12 22 L-10 36 M12 22 L10 36" ${sw(3)}/>`+PA_lens(46,'#FF6B5E')+PA_lens(30,'#FFD66B')+PA_lens(13,'#FF6B5E')+
 `<rect x="-14" y="18" width="28" height="7" rx="3" fill="#FFA94D" ${sw(3)}/>`+
 `<rect x="-15" y="35" width="30" height="20" rx="3" fill="#C98A4B" ${sw(4)}/><path d="M-15 45 H15 M-5 35 V55 M5 35 V55" stroke="#A86B43" stroke-width="2.5"/><rect x="-17" y="32" width="34" height="6" rx="3" fill="#A86B43" ${sw(3)}/>`,
tractor:`<rect x="27" y="-26" width="7" height="24" fill="#5B5F6B" ${sw(3)}/><circle cx="36" cy="-36" r="5" fill="#E4ECF4" ${sw(2.5)}/><circle cx="44" cy="-46" r="6" fill="#E4ECF4" ${sw(2.5)}/>`+
 `<path d="M-6 -6 H44 Q52 -6 52 2 V30 H-6 Z" fill="#7CC86E" ${sw()}/><path d="M46 2 V24" stroke="#5FA84E" stroke-width="4" stroke-linecap="round"/>`+
 `<path d="M-48 -44 H-2 V10 H-48 Z" fill="#7CC86E" ${sw()}/><rect x="-54" y="-54" width="58" height="10" rx="3" fill="#5FA84E" ${sw()}/><rect x="-42" y="-38" width="34" height="30" rx="3" fill="#BFEAF7" ${sw(4)}/>`+
 `<circle cx="-26" cy="26" r="28" fill="#5B5F6B" ${sw()}/><circle cx="-26" cy="26" r="20" fill="none" stroke="${K}" stroke-width="2.5" stroke-dasharray="5 6"/><circle cx="-26" cy="26" r="12" fill="#FFC93C" ${sw(4)}/><circle cx="-26" cy="26" r="4" fill="${K}"/>`+
 `<circle cx="38" cy="40" r="14" fill="#5B5F6B" ${sw()}/><circle cx="38" cy="40" r="6" fill="#FFC93C" ${sw(3)}/>`,
metro:`<path d="M-58 56 V-6 Q-58 -58 0 -58 Q58 -58 58 -6 V56 Z" fill="#E4D3B8" ${sw()}/>`+
 `<path d="M-44 56 V-4 Q-44 -46 0 -46 Q44 -46 44 -4 V56 Z" fill="#5B5F6B" ${sw(4)}/>`+
 `<path d="M-51 -26 l-5 -2 M-36 -46 l-4 -5 M-12 -52 l-1 -5 M12 -52 l1 -5 M36 -46 l4 -5 M51 -26 l5 -2 M-44 18 H-58 M44 18 H58" ${sw(3)}/>`+
 `<path d="M-18 46 L-30 56 M18 46 L30 56" stroke="#B8B0A6" stroke-width="5" stroke-linecap="round"/>`+
 `<rect x="-30" y="-34" width="60" height="80" rx="12" fill="#FF6B5E" ${sw()}/><rect x="-23" y="-26" width="46" height="30" rx="6" fill="#BFEAF7" ${sw(4)}/><path d="M0 -26 V4" ${sw(3)}/><rect x="-10" y="-32" width="20" height="5" rx="2" fill="#FFD66B"/>`+
 `<rect x="-30" y="12" width="60" height="7" fill="#FFFFFF"/><circle cx="-17" cy="28" r="6" fill="#FFE08A" ${sw(3)}/><circle cx="17" cy="28" r="6" fill="#FFE08A" ${sw(3)}/><rect x="-32" y="38" width="64" height="9" rx="3" fill="#5B5F6B" ${sw(3.5)}/>`,
camion:`<g transform="translate(0 0) scale(.97)"><rect x="-58" y="20" width="114" height="10" rx="3" fill="#5B5F6B" ${sw(4)}/>`+
 `<rect x="-58" y="-44" width="72" height="66" rx="4" fill="#FFFFFF" ${sw()}/><rect x="-38" y="-28" width="32" height="30" rx="2" fill="#C98A4B" ${sw(4)}/><path d="M-22 -28 V2" stroke="#FFE08A" stroke-width="6"/><path d="M-38 -28 L-34 -36 H-10 L-6 -28" fill="#E0A86A" ${sw(3)}/>`+
 `<path d="M18 26 V-14 Q18 -18 22 -18 H40 Q46 -18 50 -10 L58 4 V26 Z" fill="#5B8DEF" ${sw()}/><path d="M24 -12 H38 L45 2 H24 Z" fill="#BFEAF7" ${sw(3)}/><path d="M26 10 H32" ${sw(3)}/><circle cx="55" cy="14" r="3.5" fill="#FFE08A" ${sw(2)}/>`+
 PA_wh(-34,32,13)+PA_wh(38,32,13)+`</g>`,
astronauta:`<rect x="-30" y="-2" width="60" height="38" rx="8" fill="#B8B0A6" ${sw()}/>`+
 `<rect x="-20" y="28" width="16" height="20" fill="#FFFFFF" ${sw(4)}/><rect x="4" y="28" width="16" height="20" fill="#FFFFFF" ${sw(4)}/><rect x="-23" y="44" width="21" height="12" rx="4" fill="#B8B0A6" ${sw(4)}/><rect x="2" y="44" width="21" height="12" rx="4" fill="#B8B0A6" ${sw(4)}/>`+
 `<path d="M-18 8 Q-36 4 -42 -14 M18 8 Q36 14 40 32" fill="none" stroke="${K}" stroke-width="18" stroke-linecap="round"/>`+
 `<rect x="-24" y="0" width="48" height="38" rx="12" fill="#FFFFFF" ${sw()}/>`+
 `<path d="M-18 8 Q-36 4 -42 -14 M18 8 Q36 14 40 32" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round"/><circle cx="-43" cy="-18" r="8" fill="#B8B0A6" ${sw(4)}/><circle cx="41" cy="35" r="8" fill="#B8B0A6" ${sw(4)}/>`+
 `<rect x="-12" y="10" width="24" height="15" rx="3" fill="#E4ECF4" ${sw(3)}/><circle cx="-6" cy="17.5" r="3" fill="#FF5A5A"/><circle cx="0" cy="17.5" r="3" fill="#FFC93C"/><circle cx="6" cy="17.5" r="3" fill="#5B8DEF"/>`+
 `<circle cx="-30" cy="-26" r="5" fill="#B8B0A6" ${sw(3)}/><circle cx="30" cy="-26" r="5" fill="#B8B0A6" ${sw(3)}/><circle cx="0" cy="-26" r="30" fill="#FFFFFF" ${sw()}/>`+
 `<rect x="-22" y="-44" width="44" height="34" rx="16" fill="#7FD3F0" ${sw(4)}/><circle cx="0" cy="-25" r="14" fill="#F2C29B" ${sw(3)}/><path d="M-14 -28 Q-14 -40 0 -40 Q14 -40 14 -28 Q6 -34 -2 -32 Q-8 -34 -14 -28 Z" fill="#8A5A3C" ${sw(2.5)}/>`+
 `${eye(-5,-25,2.6)}${eye(5,-25,2.6)}<path d="M-5 -19 q5 4 10 0" fill="none" ${sw(2.5)}/><circle cx="-9" cy="-20" r="2.5" fill="#FF8A7A" opacity=".5"/><circle cx="9" cy="-20" r="2.5" fill="#FF8A7A" opacity=".5"/>`+
 `<path d="M-15 -36 Q-12 -41 -6 -42" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>`,
cinturon:`<path d="M-42 44 V-34 Q-42 -58 -18 -58 H18 Q42 -58 42 -34 V44 Z" fill="#5B8DEF" ${sw()}/><path d="M-30 30 V-30 Q-30 -46 -14 -46 H14 Q30 -46 30 -30 V30 Z" fill="#7FB0FF"/>`+
 `<rect x="-48" y="26" width="96" height="24" rx="10" fill="#5B8DEF" ${sw()}/>`+
 `<path d="M-18 -6 H18 Q24 -4 24 6 V32 H-24 V6 Q-24 -4 -18 -6 Z" fill="#FFC93C" ${sw()}/>`+
 `<rect x="-19" y="28" width="15" height="20" rx="6" fill="#3FC1B0" ${sw(4)}/><rect x="4" y="28" width="15" height="20" rx="6" fill="#3FC1B0" ${sw(4)}/><rect x="-21" y="44" width="17" height="10" rx="5" fill="#FF6B5E" ${sw(3.5)}/><rect x="4" y="44" width="17" height="10" rx="5" fill="#FF6B5E" ${sw(3.5)}/>`+
 `<path d="M-22 0 Q-30 14 -27 26 M22 0 Q30 14 27 26" fill="none" stroke="${K}" stroke-width="15" stroke-linecap="round"/><path d="M-22 0 Q-30 14 -27 26 M22 0 Q30 14 27 26" fill="none" stroke="#FFC93C" stroke-width="10" stroke-linecap="round"/>`+
 `<path d="M24 -10 L-14 28 M-36 29 H36" stroke="${K}" stroke-width="14" stroke-linecap="square"/><path d="M24 -10 L-14 28 M-36 29 H36" stroke="#5B5F6B" stroke-width="9"/><path d="M20 -4 L-10 26" stroke="#B8B0A6" stroke-width="1.5" stroke-dasharray="3 3"/>`+
 `<rect x="-24" y="22" width="20" height="14" rx="3" fill="#B8B0A6" ${sw(3.5)}/><rect x="-18" y="26" width="8" height="6" rx="1" fill="#FF5A5A"/>`+
 `<circle cx="-27" cy="29" r="6" fill="#F2C29B" ${sw(3)}/><circle cx="27" cy="29" r="6" fill="#F2C29B" ${sw(3)}/>`+
 `<circle cx="0" cy="-26" r="19" fill="#F2C29B" ${sw()}/><path d="M-20 -26 Q-21 -48 0 -47 Q21 -48 20 -26 Q12 -38 -4 -36 Q-14 -36 -20 -26 Z" fill="#8A5A3C" ${sw(4)}/>${eye(-7,-24,3)}${eye(7,-24,3)}<path d="M-6 -16 q6 5 12 0" fill="none" ${sw(3)}/><circle cx="-12" cy="-18" r="3.5" fill="#FF8A7A" opacity=".5"/><circle cx="12" cy="-18" r="3.5" fill="#FF8A7A" opacity=".5"/>`,
});
