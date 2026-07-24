const{readFileSync}=require('fs');
const zlib=require('zlib');
const path=require('path');

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

// Analyze each card to find first text row (non-bg pixel row)
const cards=['education','work','skills','tools'];
console.log('=== Card Analysis: First non-bg text rows ===');
for(const name of cards){
  try {
    const img=parsePNG(`${base}/${name}.png`);
    let firstRow=-1;
    for(let y=0;y<img.h;y++){
      let hasContent=false;
      for(let x=0;x<img.w;x++){
        const i=(y*img.w+x)*4;
        if(img.data[i+3]>20){hasContent=true;break;}
      }
      if(hasContent){firstRow=y;break;}
    }
    console.log(`${name}.png (${img.w}x${img.h}): first content row at y=${firstRow}`);
  } catch(e) { console.log(`${name}.png: ERROR - ${e.message}`); }
}

// Analyze each icon
const icons=['icon-edu','icon-work','icon-skills','icon-tools'];
console.log('\n=== Icon Analysis ===');
for(const name of icons){
  try {
    const img=parsePNG(`${base}/${name}.png`);
    // Find bounding box of content
    let minY=img.h,maxY=0,minX=img.w,maxX=0;
    for(let y=0;y<img.h;y++){
      for(let x=0;x<img.w;x++){
        const i=(y*img.w+x)*4;
        if(img.data[i+3]>20){
          if(y<minY)minY=y;
          if(y>maxY)maxY=y;
          if(x<minX)minX=x;
          if(x>maxX)maxX=x;
        }
      }
    }
    console.log(`${name}.png (${img.w}x${img.h}): content bounds x:[${minX},${maxX}] y:[${minY},${maxY}], center y=${((minY+maxY)/2).toFixed(1)}`);
  } catch(e) { console.log(`${name}.png: ERROR - ${e.message}`); }
}

// Analyze DESIGN.png to find its content center
console.log('\n=== DESIGN Analysis ===');
try {
  const design=parsePNG(`${base}/design.png`);
  let sumX=0,sumY=0,count=0;
  for(let y=0;y<design.h;y+=5){
    for(let x=0;x<design.w;x+=5){
      const i=(y*design.w+x)*4;
      if(design.data[i+3]>20){
        sumX+=x;sumY+=y;count++;
      }
    }
  }
  console.log(`DESIGN.png: content center of mass at (${(sumX/count).toFixed(0)}, ${(sumY/count).toFixed(0)})`);
  console.log(`DESIGN.png dimensions: ${design.w}x${design.h}`);
} catch(e) { console.log(`DESIGN.png: ERROR - ${e.message}`); }

