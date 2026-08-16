const STORE=(()=>{try{const s=window.localStorage;s.setItem('__cbc_test','1');s.removeItem('__cbc_test');return s}catch(e){const mem={};return {getItem:k=>Object.prototype.hasOwnProperty.call(mem,k)?mem[k]:null,setItem:(k,v)=>{mem[k]=String(v)},removeItem:k=>{delete mem[k]}}}})();
const TYPES=["Normal","Fire","Water","Electric","Grass","Ice","Fighting","Poison","Ground","Flying","Psychic","Bug","Rock","Ghost","Dragon","Dark","Steel","Fairy"];
const typeChart={Normal:{Rock:.5,Ghost:0,Steel:.5},Fire:{Fire:.5,Water:.5,Grass:2,Ice:2,Bug:2,Rock:.5,Dragon:.5,Steel:2},Water:{Fire:2,Water:.5,Grass:.5,Ground:2,Rock:2,Dragon:.5},Electric:{Water:2,Electric:.5,Grass:.5,Ground:0,Flying:2,Dragon:.5},Grass:{Fire:.5,Water:2,Grass:.5,Poison:.5,Ground:2,Flying:.5,Bug:.5,Rock:2,Dragon:.5,Steel:.5},Ice:{Fire:.5,Water:.5,Grass:2,Ground:2,Flying:2,Dragon:2,Steel:.5,Ice:.5},Fighting:{Normal:2,Ice:2,Poison:.5,Flying:.5,Psychic:.5,Bug:.5,Rock:2,Ghost:0,Dark:2,Steel:2,Fairy:.5},Poison:{Grass:2,Poison:.5,Ground:.5,Rock:.5,Ghost:.5,Steel:0,Fairy:2},Ground:{Fire:2,Electric:2,Grass:.5,Poison:2,Flying:0,Bug:.5,Rock:2,Steel:2},Flying:{Electric:.5,Grass:2,Fighting:2,Bug:2,Rock:.5,Steel:.5},Psychic:{Fighting:2,Poison:2,Psychic:.5,Dark:0,Steel:.5},Bug:{Fire:.5,Grass:2,Fighting:.5,Poison:.5,Flying:.5,Psychic:2,Ghost:.5,Dark:2,Steel:.5,Fairy:.5},Rock:{Fire:2,Ice:2,Fighting:.5,Ground:.5,Flying:2,Bug:2,Steel:.5},Ghost:{Normal:0,Psychic:2,Ghost:2,Dark:.5},Dragon:{Dragon:2,Steel:.5,Fairy:0},Dark:{Fighting:.5,Psychic:2,Ghost:2,Dark:.5,Fairy:.5},Steel:{Fire:.5,Water:.5,Electric:.5,Ice:2,Rock:2,Steel:.5,Fairy:2},Fairy:{Fire:.5,Fighting:2,Poison:.5,Dragon:2,Dark:2,Steel:.5}};
const eff=(mt,ts)=>ts.reduce((m,t)=>m*((typeChart[mt]&&typeChart[mt][t])||1),1);
const resistScore=(defTypes,atkTypes)=>Math.max(...atkTypes.map(t=>eff(t,defTypes)));
const M=(name,type1,type2,style,speed,bulk,role,moves,item="",ability="")=>({name,types:[type1,type2].filter(Boolean),style,speed,bulk,role,moves,item,ability});
const MV=(name,type,power,kind="attack",extra={})=>({name,type,power,kind,...extra});

const ROSTER=[
M("アローラキュウコン","Ice","Fairy","special",82,64,"壁展開",[MV("オーロラベール","Ice",0,"veil"),MV("フリーズドライ","Ice",70,"attack",{freezeDry:true}),MV("ムーンフォース","Fairy",95),MV("アンコール","Normal",0,"encore")],"ひかりのねんど","ゆきふらし"),
M("カイリュー","Dragon","Flying","mixed",78,90,"エース",[MV("りゅうせいぐん","Dragon",130),MV("かえんほうしゃ","Fire",90),MV("エアスラッシュ","Flying",75),MV("はねやすめ","Flying",0,"heal")],"カイリュナイト","マルチスケイル"),
M("ドドゲザン","Dark","Steel","physical",45,88,"終盤掃除",[MV("ドゲザン","Dark",85),MV("ふいうち","Dark",70,"attack",{priority:true}),MV("アイアンヘッド","Steel",80),MV("つるぎのまい","Normal",0,"boost")],"くろいメガネ","そうだいしょう"),
M("ガブリアス","Dragon","Ground","physical",92,80,"先発・崩し",[MV("じしん","Ground",100),MV("スケイルショット","Dragon",75),MV("ステルスロック","Rock",0,"rocks"),MV("つるぎのまい","Normal",0,"boost")],"きあいのタスキ","さめはだ"),
M("マスカーニャ","Grass","Dark","physical",97,52,"高速対面操作",[MV("トリックフラワー","Grass",70),MV("トリプルアクセル","Ice",120),MV("はたきおとす","Dark",65),MV("とんぼがえり","Bug",70,"pivot")],"こだわりスカーフ","へんげんじざい"),
M("ラウドボーン","Fire","Ghost","special",42,94,"物理受け・積み対策",[MV("フレアソング","Fire",80,"attack",{selfBoost:true}),MV("なまける","Normal",0,"heal"),MV("おにび","Fire",0,"burn"),MV("たたりめ","Ghost",65,"attack",{hex:true})],"たべのこし","てんねん"),
M("ドラパルト","Dragon","Ghost","mixed",100,57,"高速アタッカー",[MV("ドラゴンアロー","Dragon",100),MV("シャドーボール","Ghost",80),MV("とんぼがえり","Bug",70,"pivot"),MV("おにび","Fire",0,"burn")]),
M("ゲンガー","Ghost","Poison","special",96,48,"高速特殊",[MV("シャドーボール","Ghost",80),MV("ヘドロばくだん","Poison",90),MV("きあいだま","Fighting",120),MV("みちづれ","Ghost",0,"utility")]),
M("リザードン","Fire","Flying","special",84,61,"特殊アタッカー",[MV("だいもんじ","Fire",110),MV("エアスラッシュ","Flying",75),MV("りゅうのはどう","Dragon",85),MV("はねやすめ","Flying",0,"heal")]),
M("ルカリオ","Fighting","Steel","mixed",82,58,"崩し",[MV("インファイト","Fighting",120),MV("しんそく","Normal",80,"attack",{priority:true}),MV("ラスターカノン","Steel",80),MV("つるぎのまい","Normal",0,"boost")]),
M("エルフーン","Grass","Fairy","special",93,56,"サポート",[MV("ムーンフォース","Fairy",95),MV("アンコール","Normal",0,"encore"),MV("おいかぜ","Flying",0,"utility"),MV("とんぼがえり","Bug",70,"pivot")]),
M("イルカマン","Water",null,"physical",86,76,"水エース",[MV("ウェーブタックル","Water",120),MV("ジェットパンチ","Water",60,"attack",{priority:true}),MV("れいとうパンチ","Ice",75),MV("クイックターン","Water",60,"pivot")]),
M("アーマーガア","Flying","Steel","physical",52,94,"受け・対面操作",[MV("ブレイブバード","Flying",120),MV("ボディプレス","Fighting",80),MV("はねやすめ","Flying",0,"heal"),MV("とんぼがえり","Bug",70,"pivot")]),
M("サーナイト","Psychic","Fairy","special",70,58,"特殊崩し",[MV("ムーンフォース","Fairy",95),MV("サイコキネシス","Psychic",90),MV("マジカルフレイム","Fire",75),MV("ちょうはつ","Dark",0,"utility")]),
M("バンギラス","Rock","Dark","physical",50,94,"鈍足高火力",[MV("ストーンエッジ","Rock",100),MV("かみくだく","Dark",80),MV("じしん","Ground",100),MV("りゅうのまい","Dragon",0,"boost")]),
M("ミミッキュ","Ghost","Fairy","physical",86,65,"ストッパー",[MV("じゃれつく","Fairy",90),MV("かげうち","Ghost",40,"attack",{priority:true}),MV("シャドークロー","Ghost",70),MV("つるぎのまい","Normal",0,"boost")]),
M("ドリュウズ","Ground","Steel","physical",88,65,"地面エース",[MV("じしん","Ground",100),MV("アイアンヘッド","Steel",80),MV("いわなだれ","Rock",75),MV("つるぎのまい","Normal",0,"boost")]),
M("ウインディ","Fire",null,"physical",82,74,"物理クッション",[MV("フレアドライブ","Fire",120),MV("しんそく","Normal",80,"attack",{priority:true}),MV("ワイルドボルト","Electric",90),MV("おにび","Fire",0,"burn")]),
M("ボーマンダ","Dragon","Flying","mixed",88,72,"積みエース",[MV("りゅうせいぐん","Dragon",130),MV("ぼうふう","Flying",110),MV("だいもんじ","Fire",110),MV("りゅうのまい","Dragon",0,"boost")]),
M("ギャラドス","Water","Flying","physical",73,77,"積みエース",[MV("たきのぼり","Water",80),MV("じしん","Ground",100),MV("こおりのキバ","Ice",65),MV("りゅうのまい","Dragon",0,"boost")]),
M("ニンフィア","Fairy",null,"special",44,78,"特殊受け・崩し",[MV("ハイパーボイス","Fairy",90),MV("シャドーボール","Ghost",80),MV("でんこうせっか","Normal",40,"attack",{priority:true}),MV("あくび","Normal",0,"utility")]),
M("カバルドン","Ground",null,"physical",32,96,"物理受け",[MV("じしん","Ground",100),MV("ステルスロック","Rock",0,"rocks"),MV("あくび","Normal",0,"utility"),MV("なまける","Normal",0,"heal")]),
M("ウォッシュロトム","Electric","Water","special",76,76,"クッション",[MV("10まんボルト","Electric",90),MV("ハイドロポンプ","Water",110),MV("ボルトチェンジ","Electric",70,"pivot"),MV("おにび","Fire",0,"burn")]),
M("ハッサム","Bug","Steel","physical",55,82,"先制技エース",[MV("バレットパンチ","Steel",40,"attack",{priority:true}),MV("とんぼがえり","Bug",70,"pivot"),MV("インファイト","Fighting",120),MV("つるぎのまい","Normal",0,"boost")]),
M("ナットレイ","Grass","Steel","physical",22,98,"受け・削り",[MV("パワーウィップ","Grass",120),MV("ジャイロボール","Steel",100),MV("ステルスロック","Rock",0,"rocks"),MV("やどりぎのタネ","Grass",0,"utility")]),
M("サザンドラ","Dark","Dragon","special",85,70,"特殊崩し",[MV("あくのはどう","Dark",80),MV("りゅうせいぐん","Dragon",130),MV("だいもんじ","Fire",110),MV("とんぼがえり","Bug",70,"pivot")]),
M("キノガッサ","Grass","Fighting","physical",62,45,"催眠・対面",[MV("タネマシンガン","Grass",75),MV("マッハパンチ","Fighting",40,"attack",{priority:true}),MV("がんせきふうじ","Rock",60),MV("キノコのほうし","Grass",0,"utility")]),
M("アシレーヌ","Water","Fairy","special",50,82,"特殊崩し",[MV("ムーンフォース","Fairy",95),MV("ハイドロポンプ","Water",110),MV("アクアジェット","Water",40,"attack",{priority:true}),MV("アンコール","Normal",0,"encore")]),
M("メタグロス","Steel","Psychic","physical",65,88,"高耐久アタッカー",[MV("コメットパンチ","Steel",90),MV("しねんのずつき","Psychic",80),MV("じしん","Ground",100),MV("バレットパンチ","Steel",40,"attack",{priority:true})]),
M("ローブシン","Fighting",null,"physical",35,88,"鈍足物理",[MV("ドレインパンチ","Fighting",75),MV("マッハパンチ","Fighting",40,"attack",{priority:true}),MV("はたきおとす","Dark",65),MV("れいとうパンチ","Ice",75)]),
M("サーフゴー","Steel","Ghost","special",78,78,"特殊崩し・受け崩し",[MV("ゴールドラッシュ","Steel",120),MV("シャドーボール","Ghost",80),MV("10まんボルト","Electric",90),MV("わるだくみ","Dark",0,"boost")]),
M("ヘイラッシャ","Water",null,"physical",30,100,"物理受け",[MV("ウェーブタックル","Water",120),MV("ボディプレス","Fighting",80),MV("あくび","Normal",0,"utility"),MV("ねむる","Psychic",0,"heal")]),
M("テツノツツミ","Ice","Water","special",100,54,"超高速特殊",[MV("フリーズドライ","Ice",70,"attack",{freezeDry:true}),MV("ハイドロポンプ","Water",110),MV("れいとうビーム","Ice",90),MV("アンコール","Normal",0,"encore")]),
M("ハバタクカミ","Ghost","Fairy","special",99,56,"高速特殊",[MV("ムーンフォース","Fairy",95),MV("シャドーボール","Ghost",80),MV("パワージェム","Rock",80),MV("めいそう","Psychic",0,"boost")]),
M("ウーラオス","Fighting","Water","physical",84,77,"物理崩し",[MV("すいりゅうれんだ","Water",75),MV("インファイト","Fighting",120),MV("アクアジェット","Water",40,"attack",{priority:true}),MV("とんぼがえり","Bug",70,"pivot")]),
M("ブリジュラス","Steel","Dragon","special",70,89,"高耐久特殊",[MV("ラスターカノン","Steel",80),MV("りゅうせいぐん","Dragon",130),MV("10まんボルト","Electric",90),MV("ボディプレス","Fighting",80)]),
M("パオジアン","Dark","Ice","physical",100,59,"高速物理",[MV("つららおとし","Ice",85),MV("かみくだく","Dark",80),MV("ふいうち","Dark",70,"attack",{priority:true}),MV("せいなるつるぎ","Fighting",90)]),
M("イーユイ","Dark","Fire","special",93,55,"高火力特殊",[MV("オーバーヒート","Fire",130),MV("あくのはどう","Dark",80),MV("サイコキネシス","Psychic",90),MV("ニトロチャージ","Fire",50)]),
M("ディンルー","Dark","Ground","physical",35,100,"特殊受け・起点",[MV("じしん","Ground",100),MV("カタストロフィ","Dark",0,"utility"),MV("ステルスロック","Rock",0,"rocks"),MV("ふきとばし","Normal",0,"utility")]),
M("テツノカイナ","Fighting","Electric","physical",28,96,"重戦車",[MV("ドレインパンチ","Fighting",75),MV("かみなりパンチ","Electric",75),MV("れいとうパンチ","Ice",75),MV("つるぎのまい","Normal",0,"boost")]),
M("セグレイブ","Dragon","Ice","physical",73,82,"積みエース",[MV("つららばり","Ice",75),MV("きょけんとつげき","Dragon",120),MV("じしん","Ground",100),MV("りゅうのまい","Dragon",0,"boost")]),
M("キョジオーン","Rock",null,"physical",30,98,"受け・定数ダメ",[MV("しおづけ","Rock",40),MV("ボディプレス","Fighting",80),MV("じこさいせい","Normal",0,"heal"),MV("ステルスロック","Rock",0,"rocks")]),
M("ドオー","Poison","Ground","special",20,95,"特殊受け",[MV("じしん","Ground",100),MV("どくどく","Poison",0,"utility"),MV("じこさいせい","Normal",0,"heal"),MV("ステルスロック","Rock",0,"rocks")]),
M("コノヨザル","Fighting","Ghost","physical",78,84,"粘り強い崩し",[MV("ふんどのこぶし","Ghost",100),MV("ドレインパンチ","Fighting",75),MV("ちょうはつ","Dark",0,"utility"),MV("ビルドアップ","Fighting",0,"boost")]),
M("イダイナキバ","Ground","Fighting","physical",89,82,"高速物理",[MV("ぶちかまし","Ground",120),MV("インファイト","Fighting",120),MV("アイススピナー","Ice",80),MV("こうそくスピン","Normal",50)]),
M("テツノドクガ","Fire","Poison","special",92,58,"高速特殊",[MV("ほのおのまい","Fire",80),MV("ヘドロウェーブ","Poison",95),MV("エナジーボール","Grass",90),MV("サイコキネシス","Psychic",90)]),
M("カイナ系対策候補・クレセリア","Psychic",null,"special",55,100,"高耐久サポート",[MV("サイコキネシス","Psychic",90),MV("れいとうビーム","Ice",90),MV("つきのひかり","Fairy",0,"heal"),MV("でんじは","Electric",0,"utility")])
];

const DEFAULT_TEAM=["アローラキュウコン","カイリュー","ドドゲザン","ガブリアス","マスカーニャ","ラウドボーン"];
let teamNames=JSON.parse(STORE.getItem('cbc_team_v02')||'null')||DEFAULT_TEAM.slice();
let selectedOpp=[]; let currentPlan=teamNames.slice(0,3); let ocrImageData=null;
const history=()=>JSON.parse(STORE.getItem('cbc_history_v02')||'[]');
const saveHistory=h=>STORE.setItem('cbc_history_v02',JSON.stringify(h.slice(0,100)));
const mon=n=>ROSTER.find(x=>x.name===n); const typeLabel=t=>t.join(' / ');
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;

function card(m,selected=false,num=null){return `<div class="card click ${selected?'selected':''}" data-name="${m.name}">${num?`<span class="num">${num}</span>`:''}<div class="name">${m.name}</div><div class="types">${typeLabel(m.types)}</div><div class="role">${m.role}</div><div class="meta">速 ${m.speed} · 耐久 ${m.bulk}</div></div>`}
