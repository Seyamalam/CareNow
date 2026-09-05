import {writeFileSync} from 'node:fs';
const fixed=k=>({a:0,k});
const anim=(from,to,end=36)=>({a:1,k:[{t:0,s:from,e:to,o:{x:.23,y:1},i:{x:.32,y:1}},{t:end,s:to}]});
const green=[.098,.306,.243,1],mint=[.78,.89,.83,1];
const transform={o:fixed(100),r:fixed(0),p:fixed([100,100,0]),a:fixed([0,0,0]),s:fixed([100,100,100])};
const fill=color=>({ty:'fl',c:fixed(color),o:fixed(100),r:1});
const stroke={ty:'st',c:fixed(green),o:fixed(100),w:fixed(8),lc:2,lj:2};
const layer=(name,shapes,ks={})=>({ddd:0,ind:1,ty:4,nm:name,sr:1,ks:{...transform,...ks},ao:0,shapes,ip:0,op:90,st:0,bm:0});
const base=layers=>({v:'5.9.0',fr:60,ip:0,op:90,w:200,h:200,nm:'CareNow original motion',ddd:0,assets:[],layers});
const petal=(rotation,color)=>({ty:'gr',it:[{ty:'rc',p:fixed([0,-38]),s:fixed([34,62]),r:fixed(17)},fill(color),{ty:'tr',p:fixed([0,0]),a:fixed([0,0]),s:fixed([100,100]),r:fixed(rotation),o:fixed(100)}]});
const logo=base([layer('CareNow mark',[petal(0,green),petal(90,mint),petal(180,green),petal(270,mint)],{r:anim(-45,0),s:anim([88,88,100],[100,100,100]),o:anim(0,100,18)})]);
const check={ty:'sh',ks:fixed({i:[[0,0],[0,0],[0,0]],o:[[0,0],[0,0],[0,0]],v:[[-28,0],[-7,21],[33,-23]],c:false})};
const success=base([layer('Check',[check,stroke,{ty:'tm',s:fixed(0),e:anim(0,100,40),o:fixed(0),m:1}]),{...layer('Disc',[{ty:'el',p:fixed([0,0]),s:fixed([134,134])},fill(mint)],{s:anim([90,90,100],[100,100,100]),o:anim(0,100,16)}),ind:2}]);
const empty=base([
  {...layer('Calendar date left',[{ty:'el',p:fixed([-20,20]),s:fixed([10,10])},fill(green)],{o:anim(0,100,32)}),ind:1},
  {...layer('Calendar date right',[{ty:'el',p:fixed([20,20]),s:fixed([10,10])},fill(green)],{o:anim(0,100,38)}),ind:2},
  {...layer('Calendar rule',[{ty:'sh',ks:fixed({i:[[0,0],[0,0]],o:[[0,0],[0,0]],v:[[-33,-12],[33,-12]],c:false})},stroke],{o:anim(0,100,25)}),ind:3},
  {...layer('Calendar paper',[{ty:'rc',p:fixed([0,3]),s:fixed([110,100]),r:fixed(18)},fill(mint)],{s:anim([90,90,100],[100,100,100]),o:anim(0,100,20)}),ind:4}
]);
for(const [name,data]of Object.entries({logo,success,empty}))writeFileSync(`assets/motion/${name}.json`,JSON.stringify(data));
