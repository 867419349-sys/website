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

const cards=['education','work','skills','tools'];
console.log('=== Detailed Card Text Analysis ===');

for(const name of cards){
  const img=parsePNG(`${base}/${name}.png`);
  const w=img.w, h=img.h;
  
  // For each row, compute opacity sum in the left region (where icon would be)
  // Icon is positioned about 48px right of card left edge
  const iconZoneX0=0, iconZoneX1=Math.floor(w*0.25); // Left quarter
  
  // Find rows with significant content
  const rowDensity=[];
  for(let y=0;y<h;y++){
    let sum=0, count=0;
    for(let x=iconZoneX0;x<iconZoneX1;x++){
      const i=(y*w+x)*4;
      if(img.data[i+3]>20){sum+=img.data[i+3];count++;}
    }
    rowDensity.push({y,sum,count});
  }
  
  // Find the first row with >10 non-transparent pixels
  let textStart=-1;
  for(let i=0;i<rowDensity.length;i++){
    if(rowDensity[i].count>10){textStart=i;break;}
  }
  
  // Find the contiguous block of content rows (title text area)
  let textEnd=textStart;
  if(textStart>=0){
    for(let i=textStart;i<rowDensity.length;i++){
      if(rowDensity[i].count<5) break;
      textEnd=i;
    }
  }
  
  console.log(`\n${name}.png (${w}x${h}):`);
  console.log(`  First content row: y=${textStart}`);
  console.log(`  Title text block: y=[${textStart}, ${textEnd}], height=${textEnd-textStart+1}`);
  console.log(`  Text center y=${(textStart+textEnd)/2}`);
  
  // Icon current position relative to card top
  const cardTops={education:350.74, work:760.74, skills:1309.74, tools:1309.74};
  const iconTops={education:392, work:810, skills:1345, tools:1345};
  const cardTop=cardTops[name];
  const iconTop=iconTops[name];
  const iconCenter=iconTop+51.5;
  const cardTextCenter=cardTop+(textStart+textEnd)/2;
  
  console.log(`  Icon center (REF): ${iconCenter.toFixed(2)}`);
  console.log(`  Card text center (REF): ${cardTextCenter.toFixed(2)}`);
  console.log(`  Icon should be at REF Y=${(cardTextCenter-51.5).toFixed(2)} for center alignment`);
  console.log(`  Current offset from card top: ${(iconTop-cardTop).toFixed(2)}`);
  console.log(`  Suggested offset from card top: ${(cardTextCenter-cardTop-51.5).toFixed(2)}`);
  console.log(`  Adjust Y by: ${(cardTextCenter-cardTop-51.5-(iconTop-cardTop)).toFixed(2)}`);
}

// Also analyze DESIGN vs background circle
console.log('\n=== DESIGN and Background Analysis ===');
const bg=parsePNG(`${base}/bg.png`);
const design=parsePNG(`${base}/design.png`);

// Find DESIGN content center
let sumX=0,sumY=0,count=0;
for(let y=0;y<design.h;y+=3){
  for(let x=0;x<design.w;x+=3){
    const i=(y*design.w+x)*4;
    if(design.data[i+3]>30){
      sumX+=x;sumY+=y;count++;
    }
  }
}
const dcx=sumX/count, dcy=sumY/count;
console.log('DESIGN content centroid:', dcx.toFixed(0), dcy.toFixed(0));
console.log('When placed at REF(687,183), centroid is at REF(', (687+dcx).toFixed(0), ',', (183+dcy).toFixed(0), ')');

// Try to find circle in background by looking for high-contrast circular patterns
// Sample horizontal scanlines at various heights to find symmetric features
console.log('\nBG circular features search:');
for(let y=200;y<600;y+=50){
  // Look for horizontal brightness pattern
  let row=[];
  for(let x=600;x<1400;x+=10){
    const i=(y*bg.w+x)*4;
    const bright=(bg.data[i]+bg.data[i+1]+bg.data[i+2])/3;
    row.push({x,bright});
  }
  // Find peaks and valleys
  let changes=[];
  for(let i=1;i<row.length;i++){
    if(Math.abs(row[i].bright-row[i-1].bright)>30){
      changes.push(row[i].x);
    }
  }
  if(changes.length>=2) console.log(`  y=${y}: ${changes.length} brightness changes, edges at x=${changes[0]}-${changes[changes.length-1]}`);
}

