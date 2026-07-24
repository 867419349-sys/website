const{readFileSync}=require('fs');
const zlib=require('zlib');

function parsePNG(filePath) {
  const b=readFileSync(filePath);
  const w=b.readUInt32BE(16);
  const h=b.readUInt32BE(20);
  const ctype=b[25];
  const channels={'0':1,'2':3,'3':1,'4':2,'6':4};
  const numCh=channels[String(ctype)]||4;
  let off=33;
  while(off<b.length){const len=b.readUInt32BE(off);const name=b.toString('ascii',off+4,off+8);if(name==='IDAT')break;off+=12+len;}
  const chunks=[];
  while(off<b.length){const len=b.readUInt32BE(off);const name=b.toString('ascii',off+4,off+8);if(name!=='IDAT')break;chunks.push(b.slice(off+8,off+8+len));off+=12+len;}
  const raw=zlib.inflateSync(Buffer.concat(chunks));
  const stride=w*numCh+1;
  const pixels=Buffer.alloc(w*h*4);
  for(let y=0;y<h;y++){
    const rowStart=y*stride;
    const filter=raw[rowStart];
    const row=raw.slice(rowStart+1,rowStart+stride);
    for(let x=0;x<row.length;x++){
      let val=row[x];
      if(filter===1&&x>=numCh)val+=row[x-numCh];
      else if(filter===2&&y>0)val+=pixels[(y-1)*w*4+x];
      else if(filter===3&&y>0){const a=Math.floor(x/numCh)*numCh;val+=Math.floor((row[x-numCh]+pixels[(y-1)*w*4+x])/2);}
      else if(filter===4&&y>0){
        const a=Math.floor(x/numCh)*numCh;
        const A=row[x-numCh]||0;const B=pixels[(y-1)*w*4+x]||0;const C=(x>=numCh&&y>0)?pixels[(y-1)*w*4+(x-numCh)]:0;
        const p=A+B-C;const pa=Math.abs(p-A);const pb=Math.abs(p-B);const pc=Math.abs(p-C);
        val+=(pa<=pb&&pa<=pc)?A:(pb<=pc)?B:C;
      }
      row[x]=val&255;
    }
    if(numCh===4)row.copy(pixels,y*w*4);
    else if(numCh===3){for(let x=0;x<w;x++){const i=x*4;const j=x*3;pixels[y*w*4+i]=row[j];pixels[y*w*4+i+1]=row[j+1];pixels[y*w*4+i+2]=row[j+2];pixels[y*w*4+i+3]=255;}}
    else if(numCh===1){for(let x=0;x<w;x++){const i=x*4;const v=row[x];pixels[y*w*4+i]=v;pixels[y*w*4+i+1]=v;pixels[y*w*4+i+2]=v;pixels[y*w*4+i+3]=255;}}
  }
  return {w,h,data:pixels};
}

const base='C:/Users/zhilin/Downloads/Claude code/first CC/yang-zhilin-portfolio-&-ai-sandbox/public/assets/about';

// New DESIGN.png
const design=parsePNG(`${base}/design.png`);
console.log('DESIGN:', design.w, 'x', design.h);

// Reference image
const ref=parsePNG('d:/网站设计/自我介绍/文字分层/参考效果.png');
console.log('Reference:', ref.w, 'x', ref.h);

// Scale factors: ref -> our REF (4418x2066)
const SX = 4418/4401;
const SY = 2066/2143;
console.log('Scale: SX=', SX.toFixed(5), 'SY=', SY.toFixed(5));

// Current Figma position for DESIGN in REF space
const figmaX = 687, figmaY = 183;
// Map Figma position to reference space
const refTargetX = Math.round(figmaX / SX);
const refTargetY = Math.round(figmaY / SY);
console.log('Figma DESIGN pos mapped to ref:', refTargetX, refTargetY);

// Template match DESIGN in reference image
// Use stride=5 for efficiency
const stride=5;
const dw=design.w, dh=design.h;
const rw=ref.w, rh=ref.h;

// For DESIGN, search in a wide zone around the expected position
// The Figma pos maps to (~684, ~190) in reference space
const searchX0=Math.max(0,refTargetX-200);
const searchY0=Math.max(0,refTargetY-200);
const searchX1=Math.min(rw-dw,refTargetX+200);
const searchY1=Math.min(rh-dh,refTargetY+200);

let bestScore=Infinity,bestX=0,bestY=0;
for(let sy=searchY0;sy<=searchY1;sy+=6){
  for(let sx=searchX0;sx<=searchX1;sx+=6){
    let score=0,count=0;
    for(let dy=0;dy<dh;dy+=stride){
      for(let dx=0;dx<dw;dx+=stride){
        const ti=((dy)*dw+dx)*4;
        const ta=design.data[ti+3]; if(ta<30) continue;
        const ri=((sy+dy)*rw+(sx+dx))*4;
        // RGB diff
        const dr=design.data[ti]-ref.data[ri];
        const dg=design.data[ti+1]-ref.data[ri+1];
        const db=design.data[ti+2]-ref.data[ri+2];
        score+=dr*dr+dg*dg+db*db;
        count++;
      }
    }
    if(count>100){
      const avgScore=score/count;
      if(avgScore<bestScore){bestScore=avgScore;bestX=sx;bestY=sy;}
    }
  }
}
console.log('DESIGN template match in ref:', bestX, bestY, 'score=', bestScore.toFixed(1));
console.log('Ref->REF: X=', Math.round(bestX*SX), 'Y=', Math.round(bestY*SY));
console.log('vs Figma: X=', figmaX, 'Y=', figmaY);
console.log('Diff from Figma: dx=', Math.round(bestX*SX-figmaX), 'dy=', Math.round(bestY*SY-figmaY));

// Now match each icon in reference
const icons=['icon-edu','icon-work','icon-skills','icon-tools'];
const figmaPos={
  'icon-edu':[2820,392],
  'icon-work':[2820,810],
  'icon-skills':[2781,1345],
  'icon-tools':[3299,1345],
};

for(const name of icons){
  const icon=parsePNG(`${base}/${name}.png`);
  const [fx,fy]=figmaPos[name];
  const rtx=Math.round(fx/SX);
  const rty=Math.round(fy/SY);
  
  let bestScore=Infinity,bestX=0,bestY=0;
  const ix0=Math.max(0,rtx-60),iy0=Math.max(0,rty-60);
  const ix1=Math.min(rw-icon.w,rtx+60),iy1=Math.min(rh-icon.h,rty+60);
  
  for(let sy=iy0;sy<=iy1;sy+=3){
    for(let sx=ix0;sx<=ix1;sx+=3){
      let score=0,count=0;
      for(let dy=0;dy<icon.h;dy+=2){
        for(let dx=0;dx<icon.w;dx+=2){
          const ti=(dy*icon.w+dx)*4;
          if(icon.data[ti+3]<50) continue;
          const ri=((sy+dy)*rw+(sx+dx))*4;
          const dr=icon.data[ti]-ref.data[ri];
          const dg=icon.data[ti+1]-ref.data[ri+1];
          const db=icon.data[ti+2]-ref.data[ri+2];
          score+=dr*dr+dg*dg+db*db;
          count++;
        }
      }
      if(count>20){
        const avgScore=score/count;
        if(avgScore<bestScore){bestScore=avgScore;bestX=sx;bestY=sy;}
      }
    }
  }
  const newX=Math.round(bestX*SX);
  const newY=Math.round(bestY*SY);
  console.log(`${name}: ref(${bestX},${bestY}) -> REF(${newX},${newY}) | Figma(${fx},${fy}) | diff(${newX-fx},${newY-fy}) | score=${bestScore.toFixed(1)}`);
}

