// @ts-nocheck
// Tama the cat's drawings: a semi-realistic ginger tabby, posed frame by frame like an old desktop pet.
  var OL='var(--catline)';
  function SH(cx,rx){return '<ellipse cx="'+cx+'" cy="72.6" rx="'+rx+'" ry="2.4" fill="#000" opacity=".16"/>'}
  function LEG(d,far,px,py,rot){return '<path d="'+d+'" fill="none" stroke="'+OL+'" stroke-width="7.4" stroke-linecap="round" stroke-linejoin="round"/><path d="'+d+'" fill="none" stroke="var(--'+(far?'cat2':'cat')+')" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'+
    '<g transform="translate('+px+' '+py+') rotate('+(rot||0)+')"><ellipse cx="0" cy="0" rx="3.9" ry="2.3" fill="var(--'+(far?'cream2':'cream')+')" stroke="'+OL+'" stroke-width="1"/><path d="M-1.2 -.6v2 M1.2 -.6v2" stroke="'+OL+'" stroke-width=".55" opacity=".55"/></g>'}
  // back leg: hip, knee (forward), hock (back), paw. front leg: shoulder, elbow, paw.
  function BL(hx,hy,o,l,far){var px=hx+1+o,py=67.6-l;return LEG('M'+hx+' '+hy+'L'+(hx+4+o*.4)+' '+(hy+8)+'L'+(hx-1.5+o*.8)+' '+(61-l*.7)+'L'+px+' '+py,far,px+1.6,py+1.3)}
  function FG(sx,sy,o,l,far){var px=sx+o,py=67.6-l;return LEG('M'+sx+' '+sy+'L'+(sx-.5+o*.45)+' '+(sy+10)+'L'+px+' '+py,far,px+1.6,py+1.3)}
  function T(d,cls){return '<g class="'+(cls||'')+'"><path d="'+d+'" fill="none" stroke="'+OL+'" stroke-width="7" stroke-linecap="round"/><path d="'+d+'" fill="none" stroke="var(--cat)" stroke-width="4.8" stroke-linecap="round"/></g>'}
  function H(x,y,r,s,eyes){var t='translate('+x+' '+y+') rotate('+(r||0)+') scale('+(s||1)+')';
    return eyes==='shut'?'<use href="#tHs" transform="'+t+'"/>':'<use class="ho" href="#tHo" transform="'+t+'"/><use class="hc" href="#tHs" transform="'+t+'"/>'}
  var STR='fill="none" stroke="var(--cat3)" stroke-width="2" stroke-linecap="round" opacity=".85"';
  function walk(k){var A=[5,0,-5,0][k],B=[-5,0,5,0][k],lA=k===3?4:0,lB=k===1?4:0,bob=(k%2)?-.8:0;
    return '<g class="p walk'+k+'">'+SH(48,28)+BL(37,46,B,lB,1)+FG(65,46,A,lA,1)+'<g transform="translate(0 '+bob+')">'+T('M23 42 C14 40 9 31 11 19','tailsway')+
      '<path d="M22 44 C22 36 30 33 40 33 C52 33 60 31 68 33 C75 35 75 44 71 50 C67 54 60 54 52 53 C44 54 34 55 28 53 C23 51 22 48 22 44Z" fill="url(#tgB)" stroke="'+OL+'" stroke-width="1.2"/>'+
      '<path d="M50 53 C56 54 64 54 69 50 C66 52 58 52 50 51Z" fill="var(--cream)" opacity=".8"/>'+
      '<path d="M36 33.6 q2.2 4.6 0 9 M44 33.2 q2.2 4.6 0 9 M52 32.8 q2.2 4.2 0 8 M60 32.2 q2 3.6 0 7" '+STR+'/>'+
      '<path d="M22 44 C22 37 30 35 36 38 C40 42 39 50 35 54 C29 55 23 51 22 44Z" fill="url(#tgB)" stroke="'+OL+'" stroke-width="1"/><path d="M26 41 q3 1 6 0 M25 46 q3 1 6 0" '+STR+'/></g>'+
      BL(31,49,A,lA)+FG(62,47,B,lB)+'<g transform="translate(0 '+bob+')">'+H(74,27,0,.8)+'</g></g>'}
  // Sitting, seen from the side: upright chest, straight front legs, folded back leg with the foot resting forward, tail wrapped around the front.
  var SITB=SH(50,26)+T('M34 69 C27 74.5 50 75.5 75 72.6')+LEG('M61 46 L61 57 L61.6 67.8',1,63.2,69.2)+
    '<path d="M58 22 C47 26 39 36 34 46 C29 56 27 65 31 71 L63 71 C63.5 61 66 52 68 45 C70 38 69 31 65 26 Z" fill="url(#tgB)" stroke="'+OL+'" stroke-width="1.2"/>'+
    '<path d="M66 28 C69.5 35 68.5 42 64.5 50 C61.5 44 61.5 36 63.5 29Z" fill="var(--cream)" opacity=".9"/>'+
    '<path d="M47 28 q4 3 3 8 M42 35 q5 3 3 8 M38 43 q5 3 3 8" '+STR+'/>'+
    '<path d="M30 61 C31 49 49 45 54 57 C56 64 54 69 50 71 L33 71 C30.5 68 29.5 64.5 30 61Z" fill="url(#tgB)" stroke="'+OL+'" stroke-width="1.1"/>'+
    '<path d="M34 54 q4 1 7 -1 M33 59 q5 1.5 8 -1 M34 64.5 q4 1 6 -.5" '+STR+'/>'+
    '<ellipse cx="50" cy="70.3" rx="7.8" ry="2.5" fill="var(--cream2)" stroke="'+OL+'" stroke-width="1"/>';
  var NEARFRONT=LEG('M64.5 45 L65 57 L65.6 67.8',0,67.3,69.2);
  function groom(cls,py,tongue){var px=68.6;
    return '<g class="p '+cls+'">'+SITB+H(64,22,-12,.82,'shut')+
      (tongue?'<ellipse cx="65.2" cy="29.1" rx="1.3" ry="1.8" fill="#e8768a" stroke="'+OL+'" stroke-width=".6"/>':'')+
      LEG('M64.5 46 C71 44 72 '+(py+7)+' '+px+' '+(py+2.4),0,px-.4,py,-60)+'</g>'}
  var POSES=[0,1,2,3].map(walk).join('')+
    '<g class="p sit">'+SITB+NEARFRONT+H(64,21.5,0,.82)+'</g>'+
    '<g class="p happy">'+SITB+NEARFRONT+H(64,22,8,.82,'shut')+'</g>'+
    groom('groom0',31.1,false)+groom('groom1',29.9,true)+
    '<g class="p sleep">'+SH(50,32)+T('M25 61 C12 73 54 78.5 82 70.5')+'<g class="breathe"><path d="M20 62 C20 50 34 45 50 45 C66 45 78 51 78 62 C78 69 70 71.5 50 71.5 C30 71.5 20 69 20 62Z" fill="url(#tgB)" stroke="'+OL+'" stroke-width="1.2"/>'+
      '<path d="M36 46.4 q2.4 4.6 0 9 M45 45.4 q2.4 4.6 0 9 M54 45.6 q2.4 4.4 0 8.4 M63 47 q2 3.8 0 7.4" '+STR+'/>'+
      '<path d="M21 61 C21 52 30 49 37 52 C43 56 42 66 37 70 C29 71 21 67 21 61Z" fill="url(#tgB)" stroke="'+OL+'" stroke-width="1"/></g>'+
      '<ellipse cx="79" cy="70" rx="6.6" ry="2.6" fill="var(--cream)" stroke="'+OL+'" stroke-width="1"/>'+H(71,58,18,.72,'shut')+'</g>'+
    '<g class="p held">'+T('M50 62 C51 72 63 76 70 70.5')+LEG('M45 58 L44 63 L44.5 68',0,45.5,69.5)+LEG('M55 58 L56 63 L55.5 68',0,56.8,69.5)+
      '<path d="M50 24 C59 24 63 33 63 44 C63 56 58 64 50 64 C42 64 37 56 37 44 C37 33 41 24 50 24Z" fill="url(#tgB)" stroke="'+OL+'" stroke-width="1.2"/><path d="M50 30 C55 34 56 48 50 60 C44 48 45 34 50 30Z" fill="var(--cream)" opacity=".85"/>'+
      LEG('M42 34 L40 44 L39 52',0,39.5,53.5,80)+LEG('M58 34 L60 44 L61 52',0,60.5,53.5,-80)+H(50,19,0,.86)+'</g>';
  function EYE(s){return '<g transform="scale('+s+' 1)"><path d="M-10.2 -3 C-8.6 -6.4 -4.4 -6.8 -2.4 -3.6 C-4.4 -1 -8.6 -.6 -10.2 -3Z" fill="url(#tgE)"/><ellipse cx="-6.2" cy="-3.4" rx="1.05" ry="2.5" fill="#140c06"/><circle cx="-5.1" cy="-4.6" r=".75" fill="#fff"/>'+
    '<path d="M-10.2 -3 C-8.6 -6.4 -4.4 -6.8 -2.4 -3.6 C-4.4 -1 -8.6 -.6 -10.2 -3Z" fill="none" stroke="'+OL+'" stroke-width=".9"/><path d="M-10.6 -3.1 C-8.8 -6.9 -4.3 -7.3 -2.2 -3.7" fill="none" stroke="'+OL+'" stroke-width="1.4" stroke-linecap="round"/></g>'}
  function SHUT(s){return '<g transform="scale('+s+' 1)"><path d="M-10.4 -3.2 C-8.4 -1.2 -4.6 -1.1 -2.3 -3.5" fill="none" stroke="'+OL+'" stroke-width="1.4" stroke-linecap="round"/></g>'}
  var DEFS=('<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>'+
    '<radialGradient id="tgB" cx=".4" cy=".25" r=".85"><stop offset="0" stop-color="#ffcf94"/><stop offset=".55" stop-color="#ee9038"/><stop offset="1" stop-color="#c96a20"/></radialGradient>'+
    '<radialGradient id="tgH" cx=".45" cy=".3" r=".8"><stop offset="0" stop-color="#ffd6a2"/><stop offset=".6" stop-color="#ef933c"/><stop offset="1" stop-color="#cf7024"/></radialGradient>'+
    '<radialGradient id="tgE" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#efe68a"/><stop offset=".6" stop-color="#a9bd3e"/><stop offset="1" stop-color="#6b8420"/></radialGradient>'+
    '<g id="tHb"><path d="M-13.5 -6 C-14.5 -14 -13.5 -20 -11.5 -24.5 C-7.5 -21 -4.5 -17 -2.5 -13.5 Z M13.5 -6 C14.5 -14 13.5 -20 11.5 -24.5 C7.5 -21 4.5 -17 2.5 -13.5 Z" fill="url(#tgH)" stroke="'+OL+'" stroke-width="1.1" stroke-linejoin="round"/>'+
      '<path d="M-11.6 -10 C-12 -15 -11.6 -19 -10.8 -21 C-8 -18.5 -6 -16 -4.8 -13.6Z M11.6 -10 C12 -15 11.6 -19 10.8 -21 C8 -18.5 6 -16 4.8 -13.6Z" fill="var(--catpink)" opacity=".8"/>'+
      '<path d="M-10.5 -12 l2.2 2.4 M-9.6 -15 l2 2 M10.5 -12 l-2.2 2.4 M9.6 -15 l-2 2" stroke="var(--cream)" stroke-width=".8" stroke-linecap="round"/>'+
      '<path d="M-15 -2 C-15 -11 -8 -15 0 -15 C8 -15 15 -11 15 -2 C15 3 17.5 6 14 8.5 C10 12 5 13 0 13 C-5 13 -10 12 -14 8.5 C-17.5 6 -15 3 -15 -2Z" fill="url(#tgH)" stroke="'+OL+'" stroke-width="1.1"/>'+
      '<path d="M-6 -12.6 L-4.4 -8.6 L-2 -11.2 L0 -8 L2 -11.2 L4.4 -8.6 L6 -12.6 M-2 -14.6 v2.6 M2 -14.6 v2.6" fill="none" stroke="var(--cat3)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>'+
      '<path d="M-15 0 q3 .6 5.4 -.6 M-14.6 3.2 q3 .3 4.8 -.9 M15 0 q-3 .6 -5.4 -.6 M14.6 3.2 q-3 .3 -4.8 -.9" fill="none" stroke="var(--cat3)" stroke-width="1.3" stroke-linecap="round"/>'+
      '<ellipse cx="0" cy="6" rx="8.4" ry="5.6" fill="var(--cream)" opacity=".5"/><ellipse cx="-2.9" cy="5.7" rx="3.4" ry="2.6" fill="var(--cream)"/><ellipse cx="2.9" cy="5.7" rx="3.4" ry="2.6" fill="var(--cream)"/><ellipse cx="0" cy="9.4" rx="2.6" ry="1.7" fill="var(--cream)"/>'+
      '<path d="M0 -2 V2.6" stroke="#ffd9ad" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>'+
      '<path d="M-1.7 2.6 h3.4 l-1.7 2.1z" fill="#e98a8f" stroke="'+OL+'" stroke-width=".7" stroke-linejoin="round"/><path d="M0 4.7 v1.4 M0 6.1 q-1.4 1.6 -3 .6 M0 6.1 q1.4 1.6 3 .6" fill="none" stroke="'+OL+'" stroke-width=".85" stroke-linecap="round"/>'+
      '<g fill="'+OL+'" opacity=".45"><circle cx="-3.6" cy="5.2" r=".35"/><circle cx="-4.8" cy="6.3" r=".35"/><circle cx="3.6" cy="5.2" r=".35"/><circle cx="4.8" cy="6.3" r=".35"/></g>'+
      '<path d="M-6 5.6 l-12 -2 M-6 6.8 l-12 1.2 M6 5.6 l12 -2 M6 6.8 l12 1.2" stroke="'+OL+'" stroke-width=".5" opacity=".35"/></g>'+
    '<g id="tHo"><use href="#tHb"/>'+EYE(1)+EYE(-1)+'</g>'+
    '<g id="tHs"><use href="#tHb"/>'+SHUT(1)+SHUT(-1)+'</g>'+
    '</defs></svg>');
export const TAMA_SVG='<svg viewBox="0 0 100 76" aria-hidden="true">'+POSES+'</svg>';
let added=false;
/** The shared gradients and head drawings, added to the page once. */
export function ensureTamaDefs(){if(added)return;added=true;document.body.insertAdjacentHTML('beforeend',DEFS);}
