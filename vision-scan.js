/*
 * Screenshot recognition for Pokemon Champions selection screens.
 * Detects the six red opponent cards, crops the menu sprites,
 * and compares them against Champions menu-sprite references.
 */
const CBC_CHAMP_ROSTER_URL='https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/main/pokemon/roster.json';
const CBC_ARCHIVE_API='https://archives.bulbagarden.net/w/api.php';
const CBC_POKEAPI='https://pokeapi.co/api/v2/pokemon-species/';
const CBC_SCAN_SIZE=40;
let cbcChampRoster=null;
let cbcTemplateDescriptors=null;
let cbcJpNameCache=JSON.parse(STORE.getItem('cbc_jp_name_cache_v04')||'{}');
const cbcLegacyOcr=window.ocrScreenshot;
function cbcProg(msg){const p=document.querySelector('#ocrProgress');if(p)p.textContent=msg}
async function cbcGetChampRoster(){if(cbcChampRoster)return cbcChampRoster;const r=await fetch(CBC_CHAMP_ROSTER_URL,{cache:'force-cache'});if(!r.ok)throw new Error('Champions roster fetch failed: '+r.status);cbcChampRoster=await r.json();return cbcChampRoster}
function cbcSpriteFiles(entry){
 const d=String(entry.dexNumber).padStart(4,'0'),n=entry.name||'';
 if(/^Mega /.test(n)){if(/ X$/.test(n))return [`Menu CP ${d}-Mega X.png`];if(/ Y$/.test(n))return [`Menu CP ${d}-Mega Y.png`];return [`Menu CP ${d}-Mega.png`]}
 if(/^Alolan /.test(n))return [`Menu CP ${d}-Alola.png`];if(/^Hisuian /.test(n))return [`Menu CP ${d}-Hisui.png`];if(/^Galarian /.test(n))return [`Menu CP ${d}-Galar.png`];
 const rotom=n.match(/^(Heat|Wash|Frost|Fan|Mow) Rotom$/);if(rotom)return [`Menu CP ${d}-${rotom[1]}.png`];
 if(n==='Paldean Tauros')return [`Menu CP ${d}-Paldea Combat.png`,`Menu CP ${d}-Paldea Blaze.png`,`Menu CP ${d}-Paldea Aqua.png`];
 if(/Rainy Castform/i.test(n))return [`Menu CP ${d}-Rainy.png`];if(/Snowy Castform/i.test(n))return [`Menu CP ${d}-Snowy.png`];if(/Sunny Castform/i.test(n))return [`Menu CP ${d}-Sunny.png`];
 if(/Rapid Strike/i.test(n))return [`Menu CP ${d}-Rapid Strike.png`,`Menu CP ${d}.png`];if(/Single Strike/i.test(n))return [`Menu CP ${d}-Single Strike.png`,`Menu CP ${d}.png`];
 if(/Dusk Lycanroc/i.test(n))return [`Menu CP ${d}-Dusk.png`];if(/Midnight Lycanroc/i.test(n))return [`Menu CP ${d}-Midnight.png`];return [`Menu CP ${d}.png`]
}
async function cbcResolveSpriteUrls(entries){
 const fileToEntries=new Map();for(const e of entries)for(const f of cbcSpriteFiles(e)){if(!fileToEntries.has(f))fileToEntries.set(f,[]);fileToEntries.get(f).push(e)}
 const files=[...fileToEntries.keys()],resolved=[];
 for(let i=0;i<files.length;i+=25){const chunk=files.slice(i,i+25),qs=new URLSearchParams({action:'query',format:'json',origin:'*',prop:'imageinfo',iiprop:'url',iiurlwidth:'128',titles:chunk.map(f=>'File:'+f).join('|')});
  const r=await fetch(CBC_ARCHIVE_API+'?'+qs.toString(),{cache:'force-cache'});if(!r.ok)continue;const j=await r.json();
  for(const p of Object.values(j.query?.pages||{})){const ii=p.imageinfo?.[0];if(!ii)continue;const file=(p.title||'').replace(/^File:/,''),url=ii.thumburl||ii.url;for(const e of fileToEntries.get(file)||[])resolved.push({entry:e,file,url})}
  cbcProg(`参照画像を準備中… ${Math.min(i+25,files.length)}/${files.length}`)
 }return resolved
}
async function cbcBlobToImage(blob){if('createImageBitmap'in window){try{return await createImageBitmap(blob)}catch(e){}}return await new Promise((ok,ng)=>{const u=URL.createObjectURL(blob),img=new Image();img.onload=()=>{URL.revokeObjectURL(u);ok(img)};img.onerror=()=>{URL.revokeObjectURL(u);ng(new Error('image decode failed'))};img.src=u})}
async function cbcImageFromUrl(url){const r=await fetch(url,{mode:'cors',cache:'force-cache'});if(!r.ok)throw new Error('sprite fetch '+r.status);return cbcBlobToImage(await r.blob())}
function cbcCanvasFromImage(img,maxW=1400){const s=Math.min(1,maxW/img.width),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*s));c.height=Math.max(1,Math.round(img.height*s));c.getContext('2d',{willReadFrequently:true}).drawImage(img,0,0,c.width,c.height);return c}
function cbcIsOpponentRed(r,g,b){return r>95&&r>g*1.7&&b>g*1.15&&r>b*1.08&&(r-g)>45}
function cbcDetectOpponentCards(canvas){
 const ctx=canvas.getContext('2d',{willReadFrequently:true}),w=canvas.width,h=canvas.height,im=ctx.getImageData(0,0,w,h).data,x0=Math.floor(w*.68),rw=w-x0,counts=new Uint32Array(h);
 for(let y=0;y<h;y++){let c=0;for(let x=x0;x<w;x+=2){const i=(y*w+x)*4;if(cbcIsOpponentRed(im[i],im[i+1],im[i+2]))c++}counts[y]=c}
 const threshold=Math.max(12,Math.floor((rw/2)*.07)),bands=[];let start=-1;
 for(let y=0;y<h;y++){const on=counts[y]>=threshold;if(on&&start<0)start=y;if((!on||y===h-1)&&start>=0){const end=on&&y===h-1?y:y-1;if(end-start>=12)bands.push([start,end]);start=-1}}
 const merged=[];for(const b of bands){const p=merged[merged.length-1];if(p&&b[0]-p[1]<=3)p[1]=b[1];else merged.push(b.slice())}
 let good=merged.filter(([a,b])=>b-a>=20&&b-a<=Math.max(120,h*.2)&&a<h*.88);if(good.length>6)good=good.sort((a,b)=>(b[1]-b[0])-(a[1]-a[0])).slice(0,6).sort((a,b)=>a[0]-b[0]);
 if(good.length!==6){const top=Math.round(h*.12),bottom=Math.round(h*.81),slot=(bottom-top)/6;good=Array.from({length:6},(_,i)=>[Math.round(top+i*slot),Math.round(top+(i+1)*slot-4)])}
 const rects=[];for(const [ya,yb] of good){let minx=w,maxx=0,seen=0;for(let y=Math.max(0,ya);y<=Math.min(h-1,yb);y++)for(let x=x0;x<w;x++){const i=(y*w+x)*4;if(cbcIsOpponentRed(im[i],im[i+1],im[i+2])){minx=Math.min(minx,x);maxx=Math.max(maxx,x);seen++}}
  if(!seen){minx=Math.round(w*.755);maxx=Math.round(w*.885)}const cardH=Math.max(24,yb-ya+1),cardW=Math.round(cardH*2.70),left=Math.max(0,Math.round(minx+cardW*.15)),top=Math.max(0,ya-2);
  rects.push({x:left,y:top,w:Math.min(w-left,Math.round(cardW*.52)),h:Math.min(h-top,yb-ya+5)})
 }return rects
}
function cbcCropCanvas(src,r){const c=document.createElement('canvas');c.width=Math.max(1,r.w);c.height=Math.max(1,r.h);c.getContext('2d',{willReadFrequently:true}).drawImage(src,r.x,r.y,r.w,r.h,0,0,r.w,r.h);return c}
function cbcMedianBg(data,w,h){const pts=[],take=(x,y)=>{const i=(y*w+x)*4;pts.push([data[i],data[i+1],data[i+2]])},xs=[1,Math.max(1,w-2),Math.floor(w*.2),Math.floor(w*.8)],ys=[1,Math.max(1,h-2),Math.floor(h*.15),Math.floor(h*.85)];for(const x of xs)for(const y of ys)if(x<w&&y<h)take(x,y);pts.sort((a,b)=>(a[0]+a[1]+a[2])-(b[0]+b[1]+b[2]));return pts[Math.floor(pts.length/2)]||[180,20,70]}
function cbcDescriptor(canvas,screen=false){
 const ctx=canvas.getContext('2d',{willReadFrequently:true}),w=canvas.width,h=canvas.height,im=ctx.getImageData(0,0,w,h),d=im.data,bg=screen?cbcMedianBg(d,w,h):null;let minx=w,miny=h,maxx=-1,maxy=-1;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let a=d[i+3];if(screen){const dr=d[i]-bg[0],dg=d[i+1]-bg[1],db=d[i+2]-bg[2],dist=dr*dr+dg*dg+db*db;a=dist<1650?0:255;d[i+3]=a}if(a>35){minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y)}}
 if(maxx<minx||maxy<miny)return null;if(screen)ctx.putImageData(im,0,0);const bw=maxx-minx+1,bh=maxy-miny+1,t=document.createElement('canvas');t.width=CBC_SCAN_SIZE;t.height=CBC_SCAN_SIZE;const tc=t.getContext('2d',{willReadFrequently:true});tc.clearRect(0,0,t.width,t.height);const scale=Math.min((CBC_SCAN_SIZE-4)/bw,(CBC_SCAN_SIZE-4)/bh),dw=bw*scale,dh=bh*scale,dx=(CBC_SCAN_SIZE-dw)/2,dy=(CBC_SCAN_SIZE-dh)/2;tc.imageSmoothingEnabled=true;tc.drawImage(canvas,minx,miny,bw,bh,dx,dy,dw,dh);const p=tc.getImageData(0,0,CBC_SCAN_SIZE,CBC_SCAN_SIZE).data,out=new Float32Array(CBC_SCAN_SIZE*CBC_SCAN_SIZE*4);for(let i=0,j=0;i<p.length;i+=4,j+=4){const a=p[i+3]/255;out[j]=p[i]/255*a;out[j+1]=p[i+1]/255*a;out[j+2]=p[i+2]/255*a;out[j+3]=a}return out
}
function cbcDescriptorDistance(a,b){let color=0,mask=0,inter=0,union=0,n=a.length/4;for(let i=0;i<a.length;i+=4){const aa=a[i+3],ba=b[i+3],u=Math.max(aa,ba),inn=Math.min(aa,ba);union+=u;inter+=inn;mask+=Math.abs(aa-ba);if(u>.08)color+=(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]))/3}const maskLoss=mask/n,colorLoss=color/Math.max(1,union),iouLoss=1-(inter/Math.max(.001,union));return colorLoss*.42+maskLoss*.28+iouLoss*.30}
async function cbcBuildTemplateDescriptors(){
 if(cbcTemplateDescriptors)return cbcTemplateDescriptors;const roster=await cbcGetChampRoster();cbcProg('Championsの参照スプライト一覧を取得中…');const refs=await cbcResolveSpriteUrls(roster),out=[],queue=refs.slice();let done=0;
 const workers=Array.from({length:Math.min(12,refs.length)},async()=>{while(queue.length){const ref=queue.shift();try{const img=await cbcImageFromUrl(ref.url),c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d',{willReadFrequently:true}).drawImage(img,0,0);const desc=cbcDescriptor(c,false);if(desc)out.push({...ref,desc})}catch(e){}done++;if(done%8===0||done===refs.length)cbcProg(`ポケモン画像を準備中… ${done}/${refs.length}`)}});await Promise.all(workers);if(out.length<30)throw new Error('参照スプライトを十分に読み込めませんでした');cbcTemplateDescriptors=out;return out
}
function cbcRankCrop(desc,templates){const best=[];for(const t of templates){const score=cbcDescriptorDistance(desc,t.desc);if(best.length<7||score<best[best.length-1].score){best.push({entry:t.entry,file:t.file,score});best.sort((a,b)=>a.score-b.score);if(best.length>7)best.pop()}}const uniq=[];for(const x of best){if(!uniq.some(y=>y.entry.dexNumber===x.entry.dexNumber)){uniq.push(x);if(uniq.length===4)break}}return uniq}
function cbcChooseUnique(rankedRows){const chosen=[],used=new Set();for(const row of rankedRows){const pick=row.find(x=>!used.has(x.entry.dexNumber))||row[0];if(pick){chosen.push(pick);used.add(pick.entry.dexNumber)}}return chosen}
async function cbcJapaneseSpeciesName(dex){const k=String(dex);if(cbcJpNameCache[k])return cbcJpNameCache[k];try{const r=await fetch(CBC_POKEAPI+dex,{cache:'force-cache'});if(!r.ok)throw 0;const j=await r.json(),n=j.names?.find(x=>x.language?.name==='ja-Hrkt')?.name||j.names?.find(x=>x.language?.name==='ja')?.name;if(n){cbcJpNameCache[k]=n;STORE.setItem('cbc_jp_name_cache_v04',JSON.stringify(cbcJpNameCache));return n}}catch(e){}return null}
async function cbcDisplayName(entry){let jp=await cbcJapaneseSpeciesName(entry.dexNumber);if(!jp)return entry.name;const n=entry.name||'';if(/^Mega /.test(n))return jp;if(/^Alolan /.test(n))return 'アローラ'+jp;if(/^Hisuian /.test(n))return 'ヒスイ'+jp;if(/^Galarian /.test(n))return 'ガラル'+jp;if(n==='Paldean Tauros')return 'パルデア'+jp;const rotom=n.match(/^(Heat|Wash|Frost|Fan|Mow) Rotom$/);if(rotom){const p={Heat:'ヒート',Wash:'ウォッシュ',Frost:'フロスト',Fan:'スピン',Mow:'カット'}[rotom[1]];return p+'ロトム'}return jp}
function cbcEnsureMon(name,entry){let m=ROSTER.find(x=>x.name===name);if(m)return m;const types=(entry.types||['Normal']).slice(0,2),moves=types.map(t=>MV(`${t}タイプ技`,t,90));while(moves.length<2)moves.push(MV('汎用技','Normal',80));m=M(name,types[0],types[1]||null,'mixed',70,70,'画像認識',moves,'',Object.values(entry.abilities||{})[0]||'');ROSTER.push(m);return m}
function cbcCropDataUrl(c){try{return c.toDataURL('image/jpeg',.72)}catch(e){return ''}}
async function cbcRecognizeSelectionScreen(){
 const input=document.querySelector('#shotInput');if(!input?.files?.[0]){alert('先に選出画面のスクショを選んでください');return}const btn=document.querySelector('#ocrBtn');if(btn)btn.disabled=true;
 try{cbcProg('選出画面を解析中…');const img=await cbcBlobToImage(input.files[0]),screen=cbcCanvasFromImage(img,1400),rects=cbcDetectOpponentCards(screen);if(rects.length!==6)throw new Error('相手6枠を検出できませんでした');const crops=rects.map(r=>cbcCropCanvas(screen,r)),descs=crops.map(c=>cbcDescriptor(c,true));if(descs.some(x=>!x))throw new Error('ポケモン画像の切り抜きに失敗しました');const templates=await cbcBuildTemplateDescriptors();cbcProg('6体を照合中…');const ranked=descs.map(d=>cbcRankCrop(d,templates)),chosen=cbcChooseUnique(ranked);if(chosen.length<6)throw new Error('6体の候補を作れませんでした');const jpNames=[];for(const c of chosen){const name=await cbcDisplayName(c.entry);cbcEnsureMon(name,c.entry);jpNames.push(name)}selectedOpp=jpNames.slice(0,6);renderOpp(document.querySelector('#oppSearch').value.trim());const det=document.querySelector('#detected');if(det)det.innerHTML=chosen.map((c,i)=>{const alts=(ranked[i]||[]).slice(0,3).map(x=>x.entry.name).join(' / '),thumb=cbcCropDataUrl(crops[i]);return `<div style="display:flex;gap:9px;align-items:center;margin:7px 0;padding:7px;border:1px solid rgba(255,255,255,.12);border-radius:10px">${thumb?`<img src="${thumb}" style="width:54px;height:54px;object-fit:cover;border-radius:8px">`:''}<div style="min-width:0"><b>${i+1}. ${jpNames[i]}</b><div class="meta" style="font-size:11px;overflow:hidden;text-overflow:ellipsis">候補: ${alts}</div></div></div>`}).join('');cbcProg('6体を画像認識しました。選出計算まで進めます…');if(selectedOpp.length>=3)setTimeout(analyzeSelection,120)
 }catch(e){console.error(e);cbcProg('画像認識に失敗しました。スクショ全体が入っているか確認してください。名前が表示される画面ならOCRも利用できます。');if(typeof cbcLegacyOcr==='function'){const det=document.querySelector('#detected');if(det)det.innerHTML='<button class="btn ghost small" id="legacyOcrFallback">文字OCRを試す</button>';const b=document.querySelector('#legacyOcrFallback');if(b)b.onclick=cbcLegacyOcr}}
 finally{if(btn)btn.disabled=false}
}
window.ocrScreenshot=cbcRecognizeSelectionScreen;
