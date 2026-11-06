/** Transparent, approximate feedback for finger-tracing.
 * No image classifier, no claim to recognize or grade handwriting.
 * Drawn sample points can be compared to a font glyph guide, but letter
 * shaping, stroke order and language-specific handwriting are not verified.
 */
export function traceMetrics(lines,width=500,height=300){
 const strokes=(lines||[]).filter(s=>Array.isArray(s)&&s.length);
 const pts=strokes.flat();
 if(!pts.length)return {strokes:0,points:0,path:0,extentX:0,extentY:0,centerOffset:0};
 let distance=0;
 for(const s of strokes)for(let i=1;i<s.length;i++)distance+=Math.hypot(s[i].x-s[i-1].x,s[i].y-s[i-1].y);
 const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 return {strokes:strokes.length,points:pts.length,path:Math.round(distance),extentX:Math.round(maxX-minX),extentY:Math.round(maxY-minY),centerOffset:Math.round(Math.hypot((minX+maxX)/2-width/2,(minY+maxY)/2-height/2))};
}
export function assessTrace(lines,{width=500,height=300,guideHits=null,guidePoints=null}={}){
 const m=traceMetrics(lines,width,height);
 if(!m.points)return {level:'start',title:'Ready to try? ✏️',tips:['Use a finger or mouse to follow the faint letter guide.','When you finish, tap Check my drawing to get helpful tips.'],metrics:m};
 const tips=[];
 if(m.path<55||m.points<4)tips.push('Make a longer line. Try tracing the whole letter, not just tapping once.');
 if(m.extentX<35&&m.extentY<35)tips.push('Your lines cover only a small area. Follow more of the letter from start to finish.');
 if(m.centerOffset>115)tips.push('Move your drawing closer to the middle of the practice space.');
 if(m.strokes>12&&m.path<420)tips.push('Try fewer short dashes and connect the letter strokes where the guide connects.');
 const aligned=guideHits!==null&&guidePoints>0?Math.round(guideHits/guidePoints*100):null;
 if(aligned!==null&&aligned<45)tips.push('Many sampled points are away from the faint guide. Try tracing more closely over its shape.');
 if(aligned!==null&&aligned>=70)tips.push('Many sampled points are close to the guide. Now try making the strokes smoother.');
 if(!tips.length)tips.push('Nice coverage! Try a second attempt with steady, controlled movements.');
 const level=m.path<55||m.points<4?'starting':aligned!==null&&aligned>=70&&m.centerOffset<=115?'progress':'practising';
 const title=level==='starting'?'A good start — keep going 🌱':level==='progress'?'Good guide-following effort! 🌟':'Good practice — try one more ✨';
 return {level,title,tips,metrics:m,approximateGuideProximity:aligned};
}
export function approximateGuideHits(lines,pixels,width,height,tolerance=14){
 if(!pixels||!lines?.length)return {hits:0,total:0};
 const points=lines.flat().filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));
 let hits=0,total=0;
 for(let i=0;i<points.length;i+=Math.max(1,Math.floor(points.length/550))){
  const p=points[i];const x=Math.round(p.x),y=Math.round(p.y);
  if(x<0||x>=width||y<0||y>=height)continue;
  total++;
  let near=false;
  for(let dy=-tolerance;dy<=tolerance&&!near;dy+=3)for(let dx=-tolerance;dx<=tolerance;dx+=3){
   if(dx*dx+dy*dy>tolerance*tolerance)continue;
   const px=x+dx,py=y+dy;
   if(px>=0&&py>=0&&px<width&&py<height&&pixels[(py*width+px)*4+3]>35){near=true;break}
  }
  if(near)hits++;
 }
 return {hits,total};
}
