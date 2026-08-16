/* v0.4.1: prefer same-origin cached Champions sprites and expose useful scan errors. */
(()=>{
  const remoteResolver=cbcResolveSpriteUrls;

  cbcResolveSpriteUrls=async function(entries){
    try{
      cbcProg('ローカル参照画像を確認中…');
      const r=await fetch('./sprites/index.json?v=041',{cache:'no-cache'});
      if(r.ok){
        const j=await r.json(),available=new Set(j.files||[]),out=[];
        for(const e of entries){
          for(const f of cbcSpriteFiles(e)){
            if(available.has(f))out.push({entry:e,file:f,url:'./sprites/'+encodeURIComponent(f)});
          }
        }
        if(out.length>=30){
          cbcProg(`ローカル参照画像 ${out.length}枚を使用します`);
          return out;
        }
      }
    }catch(e){console.warn('local sprite index unavailable',e)}
    cbcProg('ローカル画像が未準備のため外部参照を試します…');
    return remoteResolver(entries);
  };

  cbcRecognizeSelectionScreen=async function(){
    const input=document.querySelector('#shotInput');
    if(!input?.files?.[0]){alert('先に選出画面のスクショを選んでください');return}
    const btn=document.querySelector('#ocrBtn');if(btn)btn.disabled=true;
    try{
      cbcProg('① スクショを読み込み中…');
      const img=await cbcBlobToImage(input.files[0]);
      const screen=cbcCanvasFromImage(img,1400);
      cbcProg('② 相手側の赤い6枠を検出中…');
      const rects=cbcDetectOpponentCards(screen);
      if(rects.length!==6)throw new Error(`相手枠の検出数が ${rects.length}/6 です`);

      const crops=rects.map(r=>cbcCropCanvas(screen,r));
      const descs=crops.map(c=>cbcDescriptor(c,true));
      if(descs.some(x=>!x))throw new Error('ポケモン画像の切り抜きに失敗しました');

      cbcProg('③ 参照ポケモン画像を準備中…');
      const templates=await cbcBuildTemplateDescriptors();
      if(!templates?.length)throw new Error('参照画像を読み込めませんでした');

      cbcProg(`④ ${templates.length}枚と6体を照合中…`);
      const ranked=descs.map(d=>cbcRankCrop(d,templates));
      const chosen=cbcChooseUnique(ranked);
      if(chosen.length<6)throw new Error(`候補を ${chosen.length}/6 体しか作れませんでした`);

      const jpNames=[];
      for(const c of chosen){const name=await cbcDisplayName(c.entry);cbcEnsureMon(name,c.entry);jpNames.push(name)}
      selectedOpp=jpNames.slice(0,6);
      renderOpp(document.querySelector('#oppSearch').value.trim());

      const det=document.querySelector('#detected');
      if(det)det.innerHTML=chosen.map((c,i)=>{
        const alts=(ranked[i]||[]).slice(0,3).map(x=>x.entry.name).join(' / '),thumb=cbcCropDataUrl(crops[i]);
        return `<div style="display:flex;gap:9px;align-items:center;margin:7px 0;padding:7px;border:1px solid rgba(255,255,255,.12);border-radius:10px">${thumb?`<img src="${thumb}" style="width:54px;height:54px;object-fit:cover;border-radius:8px">`:''}<div style="min-width:0"><b>${i+1}. ${jpNames[i]}</b><div class="meta" style="font-size:11px;overflow:hidden;text-overflow:ellipsis">候補: ${alts}</div></div></div>`
      }).join('');
      cbcProg('✅ 6体を画像認識しました。選出計算へ進みます。');
      if(selectedOpp.length>=3)setTimeout(analyzeSelection,120);
    }catch(e){
      console.error('Champions scan error',e);
      const msg=e?.message||String(e);
      cbcProg('❌ 画像認識エラー：'+msg);
      const det=document.querySelector('#detected');
      if(det)det.innerHTML=`<div class="note" style="margin-bottom:8px">エラー詳細：${String(msg).replace(/[<>&]/g,s=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[s]))}</div><button class="btn ghost small" id="legacyOcrFallback">文字OCRを試す</button>`;
      const b=document.querySelector('#legacyOcrFallback');if(b&&typeof cbcLegacyOcr==='function')b.onclick=cbcLegacyOcr;
    }finally{if(btn)btn.disabled=false}
  };

  window.ocrScreenshot=cbcRecognizeSelectionScreen;
})();
