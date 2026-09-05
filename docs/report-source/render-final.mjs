import path from 'node:path';
import fs from 'node:fs/promises';
import {PresentationFile,FileBlob} from '@oai/artifact-tool';
const root=path.resolve(import.meta.dirname,'../..');
const p=await PresentationFile.importPptx(await FileBlob.load(root+'/deliverables/CareNow-Exhibition-Presentation-Edition-1.2.1.pptx'));
await fs.mkdir(root+'/artifacts/report-build/final-slides',{recursive:true});
for(let i=0;i<p.slides.items.length;i++){
 const b=await p.export({slide:p.slides.items[i],format:'png',scale:1});
 await fs.writeFile(root+`/artifacts/report-build/final-slides/slide-${String(i+1).padStart(2,'0')}.png`,new Uint8Array(await b.arrayBuffer()));
}
console.log('Rendered final',p.slides.items.length);
