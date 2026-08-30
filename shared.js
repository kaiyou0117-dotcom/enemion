// ===== エネミオン 共通モジュール（対戦・デッキセット・ひとりで で共用） =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getDatabase, ref, set, update, push, onValue,
  onDisconnect, remove, serverTimestamp, get
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6Y2XG4sWKHin4ZQjstzF0o9yUTVAQrFk",
  authDomain: "enemion.firebaseapp.com",
  databaseURL: "https://enemion-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "enemion",
  storageBucket: "enemion.firebasestorage.app",
  messagingSenderId: "1024531797284",
  appId: "1:1024531797284:web:b5be7ef927434ec46b8fb1",
  measurementId: "G-XC45Q1N2QP"
};

export function showFatalError(label, err){
  const banner = document.getElementById('fatal-error-banner');
  if(!banner) { console.error(label, err); return; }
  banner.classList.remove('hidden');
  banner.textContent = `[${label}] ${err && err.message ? err.message : err}`;
  console.error(label, err);
}
window.addEventListener('error', (e) => showFatalError('script error', e.error || e.message));
window.addEventListener('unhandledrejection', (e) => showFatalError('unhandled promise', e.reason));

export let app, db;
try{
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch(err){
  showFatalError('Firebase初期化失敗', err);
}
export { ref, set, update, push, onValue, onDisconnect, remove, serverTimestamp, get };

export const TYPE_LABEL = { atk:'攻撃🔴', spd:'速度🔵', def:'防御🟢', uni:'万能🟡', spc:'特化🟣' };
export const SPECIES_LIST = ['エネミー','異能者','無能力者'];

// エネミオン効果カタログ（atwiki 496番ページの情報を要約・再構成。演出テキストは省き数値・条件中心）
export const EFFECTS_CATALOG = [{"name":"激務、あるいは急用","pt":-2,"ex":false,"text":"試合1ターン目に出すと、それだけでこのバトルに敗北する。"},{"name":"虚弱体質","pt":-2,"ex":false,"text":"自分が何らかの状態異常を負っている間、バトルに敗北する。"},{"name":"適応不可","pt":-2,"ex":false,"text":"試合の場が変化している状態だと、バトルに敗北する。"},{"name":"危機的な不利","pt":-2,"ex":false,"text":"相手に対して不利な状況だと、バトルに敗北する（万能タイプにも不利になる）。"},{"name":"限られた手段","pt":-2,"ex":false,"text":"試合中、デメリット以外の数字変更効果を使えなくなる。効果面では勝てない（＋値効果や状態異常付与は使用可）。"},{"name":"勝利への慢心","pt":-2,"ex":false,"text":"自分の勝ち点が相手を上回っている間、デメリット以外の効果を使えない。"},{"name":"バッドコンディション","pt":-2,"ex":false,"text":"自分のデメリット以外の効果を1つ選び、そのターンだけ使用不可にする。"},{"name":"記憶喪失","pt":-2,"ex":false,"text":"1d4を振り、1が出たらそのターンはデメリット以外の効果を使えない。"},{"name":"短期決戦","pt":-2,"ex":false,"text":"4ターン目以降、デメリット以外の効果を1つ選んで使用不可にする。次のターンにさらに1つ追加で使用不可にする。"},{"name":"後先知らず","pt":-2,"ex":false,"text":"次に出たとき1回、デメリット以外の効果を使えない。"},{"name":"禁断","pt":-2,"ex":false,"text":"3ターン目が始まるまで、デメリット以外の効果を使えない。"},{"name":"麻痺状態","pt":-2,"ex":false,"text":"自分の数字を-1し、相性は常に不利扱いになる（元の有利不利は無視）。次に出たとき1回デメリット以外の効果を使えない。重複可で加算される。"},{"name":"睡眠状態","pt":-2,"ex":false,"text":"自分の数字が1になる。次に出たときは0になり他の効果を使えない。さらに次に出たとき起きて解除される。"},{"name":"封印状態","pt":-2,"ex":false,"text":"デメリット以外の効果を使用できない。次に出たとき解除される。"},{"name":"不安定な状態","pt":-1,"ex":false,"text":"1d3を振り、出目の数だけ自分の数字を-1する。次に出たときは治る。"},{"name":"体力難","pt":-1,"ex":false,"text":"出るたびに永続で-2されていく。"},{"name":"古傷","pt":-1,"ex":false,"text":"3ターン目以降、自分の数字を-2する。"},{"name":"戦闘下手","pt":-1,"ex":false,"text":"相性が有利でも+を受けられず、不利だとさらに-1される。万能は万能相手に不利になる。"},{"name":"対エネミー","pt":-1,"ex":false,"text":"エネミーと対戦する際、相性が不利になる。"},{"name":"傲慢","pt":-1,"ex":false,"text":"相手の元の数字が自分と同じ場合、自分の数字を-1する。"},{"name":"調子乗り","pt":-1,"ex":false,"text":"自分の勝ち点が優勢のとき、自分の数字を-3する。"},{"name":"メンタルブレイク","pt":-1,"ex":false,"text":"自分の勝ち点が劣勢のとき、自分の数字が0になる。"},{"name":"臆病","pt":-1,"ex":false,"text":"相手より元の数字が低いか不利な状況のとき、自分の数字を-3する。"},{"name":"トラブルメーカー","pt":-1,"ex":false,"text":"次に出る自分のカードの数字を-1する。"},{"name":"スロースターター","pt":-1,"ex":false,"text":"自分の数字を-3する。経過ターン数が進むほどこの-値は1ずつ軽減される。"},{"name":"絶不調","pt":-1,"ex":false,"text":"試合中はじめて出たカードなら、数字が0になる。"},{"name":"カナヅチ","pt":-1,"ex":false,"text":"場が【水浸し】のとき、自分の数字が0になる。"},{"name":"不運","pt":-1,"ex":false,"text":"1d8を振り、1が出たらデメリット以外の効果を使えない。"},{"name":"タイムリミット","pt":-1,"ex":false,"text":"自分の数字を経過ターン数と同じだけ-1する。"},{"name":"火傷状態","pt":-1,"ex":false,"text":"自分の数字を-1する。重複可能で、4つ重なるごとにデメリット以外の効果を1つ消す。"},{"name":"凍結状態","pt":-1,"ex":false,"text":"次に出たとき以降、自分の数字が永続で0になる（意識はあり効果は使用可）。【火傷状態】になると解除される。"},{"name":"出血状態","pt":-1,"ex":false,"text":"自分の数字を-3する。次に出たとき、手当てして数字を0にし解除するか選べる。"},{"name":"毒状態","pt":-1,"ex":false,"text":"1ターン経過するごとに、永続で自分の数字が-1されていく（初期値0）。重複可能。"},{"name":"感染状態","pt":-1,"ex":false,"text":"【感染状態】のカード1枚につき自分の数字を-1する。次に出す自分のカードにも感染する。"},{"name":"身体強化","pt":1,"ex":false,"text":"自分の数字を永続で+1する。"},{"name":"弱体化攻撃","pt":1,"ex":false,"text":"相手の数字を-2する。"},{"name":"牽制","pt":1,"ex":false,"text":"任意で自分の数字を-1してよい。使った場合、次に出たときは代わりに+4してよい。"},{"name":"先手必勝","pt":1,"ex":false,"text":"自分が先手で出したカードなら、数字を+4する。"},{"name":"下剋上","pt":1,"ex":false,"text":"相手の元の数字が自分より大きい場合、自分の数字を+3する。"},{"name":"勇気","pt":1,"ex":false,"text":"自分の勝ち点が劣勢のとき、数字を+3する。"},{"name":"根性","pt":1,"ex":false,"text":"自分が状態異常のとき、数字を+3する。"},{"name":"居合","pt":1,"ex":false,"text":"自分の数字を+3する。次に出たとき1回、この効果は使えない。"},{"name":"技巧派","pt":1,"ex":false,"text":"相手の元の数字と同じになるよう自分の数字を+1し、相性を無視して有利になる（麻痺は受けるが不利にはならない）。"},{"name":"取り込む","pt":1,"ex":false,"text":"バトルに勝ったとき、相手が使った効果か、相手の＋値と同じ分の永続＋を得る。"},{"name":"仲間に託す","pt":1,"ex":false,"text":"自分のデッキの異能者か無能力者を1枚選び、その数字を永続で+3する。"},{"name":"大技解放","pt":1,"ex":false,"text":"自分の数字が（相性・状態異常以外で）+されるとき、その値を2倍にしてよい。ただし反動で次に出たとき効果を使えない。"},{"name":"治癒","pt":1,"ex":false,"text":"自分か味方全員のうちどちらかを選び、試合中に新しくついたデメリットを全て治す。"},{"name":"不屈","pt":1,"ex":false,"text":"効果によって負けない。勝ちの効果を使った相手の元の数字が自分より高い場合、その数字に合わせる。"},{"name":"見切り","pt":1,"ex":false,"text":"お互いのデメリットと【見切り】以外の効果から1つずつ選び打ち消す（選べない場合は不発）。"},{"name":"貫通","pt":1,"ex":false,"text":"自分は数字変更を受けず、相手にかかる数字変更も無視して元の数字でバトルする（状態異常・相性・-値は自分に適用される）。"},{"name":"重打撃","pt":1,"ex":false,"text":"相手の数字を自分の元の数字と同じになるよう-1する。相手は次に出たとき1回デメリット以外の効果を使えない。"},{"name":"狙撃","pt":1,"ex":false,"text":"相手のデッキのカードを1枚選び、次に出たとき1回このカードの数字と同じになるよう-1し、デメリット以外の効果を使えなくする。"},{"name":"制圧","pt":1,"ex":false,"text":"相手の数字を自分の元の数字と同じになるよう-1する。勝利した場合、次に出る相手カードはデメリット以外の効果を使えない。"},{"name":"バリア","pt":1,"ex":false,"text":"自分と次の自分のカードは、相手の元の数字と同じになるよう+1し、状態異常にならない。"},{"name":"視界の妨害","pt":1,"ex":false,"text":"1d2を振り、1なら相手の数字を0にする。"},{"name":"回避","pt":1,"ex":false,"text":"1d2を振り、1なら相手の効果を1つ選び打ち消す。"},{"name":"後の先","pt":1,"ex":false,"text":"相手の元の数字と同じになるよう自分の数字を+1し、相手の＋以外の効果から1つ選び打ち消す（次に出たとき1回この打ち消しは使えない）。"},{"name":"感覚共有","pt":1,"ex":false,"text":"相手から受けた状態異常を相手にも与える。出るたびに発動する。"},{"name":"簡易な結界","pt":1,"ex":true,"text":"EX効果。そのターン中に相手から受ける効果を無視する。相手の元の数字が自分より高ければもう1ターン継続する。"},{"name":"火炎","pt":1,"ex":false,"text":"相手を【火傷状態】にし、自分の【凍結状態】を解く。相手がすでに【火傷状態】なら、相手のデッキから1枚選び追加で【火傷状態】にする。"},{"name":"電光石火","pt":1,"ex":false,"text":"任意で相手を【麻痺状態】にできる（発動すると自分は反動で【火傷状態】になる）。相手がすでに【火傷】か【麻痺】なら、代わりに自分の数字を+3し反動を受けない。"},{"name":"冷たい風","pt":1,"ex":false,"text":"相手の【凍結状態】カードを1枚選び、次のターン出せなくする（出す場合は数字を繰り下げて出す。1は繰り上げ）。"},{"name":"毒の攻撃","pt":1,"ex":false,"text":"相手と、相手のデッキのカードを1枚選び【毒状態】にする。"},{"name":"悪虐","pt":1,"ex":false,"text":"相手が【毒状態】か【感染状態】なら、デメリット以外の効果を1つ選び打ち消す。"},{"name":"血の代償","pt":1,"ex":false,"text":"自分を【出血状態】にしてよい。数字を永続で+4する（すでに【出血状態】なら使用不可）。"},{"name":"欠伸","pt":1,"ex":false,"text":"お互いを【睡眠状態】にする。"},{"name":"幻惑","pt":1,"ex":false,"text":"相手を【不安定な状態】にする。"},{"name":"水浸し","pt":1,"ex":false,"text":"試合の場を【水浸し】にする。これによりお互いは【火傷状態】にならず、数字が0になっても溺れて1以上増えなくなる。"},{"name":"水切り","pt":1,"ex":false,"text":"自分の数字を+1する。場が【水浸し】なら、さらに自分+1・相手-3する。"},{"name":"業運","pt":1,"ex":false,"text":"試合中、効果で振るダイスは自分が望む出目にできる。"},{"name":"音波","pt":1,"ex":false,"text":"相手の数字を-1する。自分と相手のデッキから1枚ずつ選び、自分は【音波】を持ち、相手は数字を永続で-2される（重複可）。"},{"name":"霊魂","pt":1,"ex":false,"text":"出た時、相手に【霊魂】を与える（重複可）。"},{"name":"エネミー化","pt":1,"ex":false,"text":"相手が異能者ならエネミーにする。相手がすでにエネミーなら自分が有利になる。"},{"name":"エネミー使役","pt":1,"ex":false,"text":"試合中、自分の他のエネミーが出るたびに+1される（重複可）。"},{"name":"召喚","pt":1,"ex":false,"text":"「数字5・種族自由・タイプ自由・効果なし」のトークンを召喚しデッキに加える（以降1d5、召喚するたび数字とダイスの目が1ずつ増える）。"},{"name":"従者への指令","pt":1,"ex":false,"text":"デッキ内のトークンカードそれぞれに、この効果とEX・デメリットを除く効果を合計4ptになるよう自由に付与できる。"},{"name":"引力","pt":1,"ex":false,"text":"このターン、お互いの効果テキスト中の数字を1減らして扱う（※内テキスト・漢数字・状態異常を除く）。その後、相手の数字4以上のカードを選び、次のターンそれを出させる。"},{"name":"ゼログラビティ","pt":1,"ex":false,"text":"お互いの数字を0にし、【重力】を消す。"},{"name":"戦場","pt":1,"ex":false,"text":"試合の場を【戦場】にする。以後お互いは＋を受けるとさらに同じ分+1され、効果では勝てず逆に負ける（重複不可）。"},{"name":"流星","pt":1,"ex":false,"text":"場が【夜空】の下でこの効果が試合中3回発動すると勝利する（デッキに3枚まで）。"},{"name":"予言","pt":1,"ex":false,"text":"自分の数字をこっそり宣言する。次に出る相手カードの数字が的中していればそのバトルに勝ち勝ち点を2獲得。外れて負けた場合は相手が2獲得する。"},{"name":"終焉の時","pt":1,"ex":false,"text":"出てから7ターンで試合に勝利するカウントダウンを開始。出るたびに1ターン早める。"},{"name":"コピー習得","pt":1,"ex":true,"text":"EX効果。自分のデッキのカード効果を1つ選ぶ。次に出たとき、その効果と同じになる。"},{"name":"イカサマ","pt":1,"ex":true,"text":"EX効果。次のバトルでは1d3を振った目以下しか出せなくなる。次に出たとき1回この効果は使えない。"},{"name":"逆転の一手","pt":1,"ex":true,"text":"EX効果。このカードが数字か効果で負け試合に敗北する場面のとき、逆転して勝ち点に関わらず試合に勝利する。"},{"name":"時飛ばし","pt":1,"ex":false,"text":"1ターン経過させる。"},{"name":"そよ風","pt":1,"ex":false,"text":"この効果は【風】として扱う。自分のデッキのカード1枚を選び【風】を与える。"},{"name":"コンビネーションアタック","pt":1,"ex":false,"text":"自分の全カードにある同名効果の個数だけ、自分の数字を+1する。"},{"name":"変身","pt":2,"ex":false,"text":"自分の数字が4になる。"},{"name":"ローダウン","pt":2,"ex":false,"text":"バトル相手と次に出る相手の数字を-2する。"},{"name":"連続攻撃","pt":2,"ex":false,"text":"自分の数字を+1する動作を3回行う（出るたび回数が1回増える）。"},{"name":"突撃！！","pt":2,"ex":false,"text":"自分の数字を+4する。次に出たとき1回、代わりに+1になる。"},{"name":"エネルギーチャージ","pt":2,"ex":false,"text":"永続で自分の数字を+1する。以後出るたびに+値が+1ずつ増えていく（次は+2、その次は+3……）。"},{"name":"エネミー狩り","pt":2,"ex":false,"text":"自分の数字を+2する。相手がエネミーならさらに+3し有利になる。"},{"name":"敵霊加護","pt":2,"ex":false,"text":"お互いのデッキにいるエネミーの数だけ、自分の数字を+1する。"},{"name":"一か八か","pt":2,"ex":false,"text":"1d8を振り、出目がそのまま自分の数字になる。次に出たとき1回この効果は使えない。"},{"name":"戦闘の達人","pt":2,"ex":false,"text":"お互いの元の数字と同じになるよう自分は+1、相手は-1する。相性を無視して有利になる（麻痺は受けるが不利にならない）。同じ相手との2度目以降の対戦では確定で勝つ。"},{"name":"オーバーヒート","pt":2,"ex":false,"text":"自分を【火傷状態】にし、その後相手を3回【火傷状態】にする。"},{"name":"雷撃","pt":2,"ex":false,"text":"相手を【麻痺状態】にする。"},{"name":"氷","pt":2,"ex":false,"text":"相手を【凍結状態】にする。"},{"name":"催眠術","pt":2,"ex":false,"text":"相手を【睡眠状態】にする。"},{"name":"病原","pt":2,"ex":false,"text":"相手を【感染状態】にする。"},{"name":"斬撃","pt":2,"ex":false,"text":"相手か相手のデッキのカードを1枚選び【出血状態】にする。"},{"name":"封印","pt":2,"ex":false,"text":"相手を【封印状態】にする。次に出たとき1回この効果は使えない。"},{"name":"風","pt":2,"ex":false,"text":"この試合中、【風】が使われるたびに【風】を持つカードは+1されていく（最大+4）。"},{"name":"疾風迅雷","pt":2,"ex":false,"text":"このカードは【風】として扱う。自分に【風】を与え、お互いを【麻痺状態】にする。"},{"name":"潜水","pt":2,"ex":false,"text":"相手の数字を-3、自分の数字を+1する。場が【水浸し】か【毒の沼】なら、そのターン相手から受ける状態異常以外の効果を無視する。"},{"name":"毒の沼","pt":2,"ex":false,"text":"試合の場を【毒の沼】にする。以後お互いは出る時【毒状態】になる（自分も対象）。"},{"name":"重力","pt":2,"ex":false,"text":"試合の場を【重力】にする。お互いの効果テキスト中の数字を1減らして扱う（※内テキスト・漢数字・状態異常を除く）。その後相手の数字を-1する（重複可）。"},{"name":"地形操作","pt":2,"ex":false,"text":"試合の場を元の状態に戻す。場が変化していなければ代わりに自分の数字を+2する。"},{"name":"儀式の書","pt":2,"ex":false,"text":"【召喚】を行う。自分のデッキ内のトークンの数だけ数字を+1する。"},{"name":"巨大樹","pt":2,"ex":false,"text":"試合中、お互いはデメリット以外の効果発動を任意選択制にする。発動するたびそのカードは永続で-2、相手は永続で+2される。"},{"name":"ハイパーヒーリング","pt":2,"ex":false,"text":"自分の他のカードからデメリットを好きなだけ選び治す。治した数の半分だけ自分の数字を+1する（端数切り捨て）。"},{"name":"仕組まれた策略","pt":2,"ex":false,"text":"自分の元の数字と同じになるよう相手の数字を-1する。相手のデッキのカードに『次出たとき1回デメリット以外の効果を使えない』と『数字-3』を自由に配分して与える。"},{"name":"拘束","pt":2,"ex":false,"text":"相手と次に出る相手が使う効果を1つ選び打ち消す（打ち消す対象は相手が選ぶ。デメリット効果は対象外）。"},{"name":"武器の選択","pt":2,"ex":false,"text":"出た時、剣・槍・斧・盾・弓のいずれかを選び、以後試合外も含め恒久的にそれになる（対応する効果ペアを使用可能になる。次に出たとき1回は使用不可）。"},{"name":"諸刃の剣","pt":2,"ex":false,"text":"バトルに勝った場合、勝ち点を2獲得する。負けた場合は相手が2獲得する。"},{"name":"バトンタッチ","pt":2,"ex":true,"text":"EX効果。自分の効果1つと自分のデッキのカード1枚を選ぶ。そのカードは次に出たとき1回、選んだ効果を使い、数字も+1される。"},{"name":"2回行動","pt":2,"ex":true,"text":"EX効果。1回出た後、続けてもう一度出直せる（デメリット効果も発動する。元の数字は重複加算されない）。"},{"name":"仲間を呼ぶ","pt":2,"ex":true,"text":"EX効果。自分のデッキから元数字2以下または5以上のトークンを1体選び呼び出す（すでに出ている場合は不可。次に出たとき1回使用不可）。"},{"name":"無効化","pt":2,"ex":true,"text":"EX効果。相手の効果を1つ選び打ち消す。"},{"name":"不死身","pt":2,"ex":true,"text":"EX効果。試合中1度だけ発動可能。負けても相手に勝ち点を渡さず、自分についたデメリットを全て消し、その分だけ永続で数字を+1する。"},{"name":"致命の爪","pt":2,"ex":false,"text":"自分の数字を+2する。相手が状態異常などで数字を-されている場合、さらに+3する。"},{"name":"破壊の光線","pt":3,"ex":false,"text":"自分の数字を+4する。"},{"name":"成長","pt":3,"ex":false,"text":"自分の数字を経過ターン数と同じだけ+1する。"},{"name":"硬い防御","pt":3,"ex":false,"text":"自分と次の自分のカードは、そのターン中相手の+値と同じだけ数字を+1する（相性有利の+は含まない。重複不可）。"},{"name":"連戦連勝","pt":3,"ex":false,"text":"自分がバトルに勝った時、数字を永続で+1し、次のバトルも確定で出せる。"},{"name":"激化する戦闘","pt":3,"ex":false,"text":"この試合中、自分のカードの効果テキスト中の数字を1増やして扱う（重複可、※内テキスト・漢数字・状態異常を除く）。"},{"name":"爆発","pt":3,"ex":false,"text":"バトル相手を2回【火傷状態】にし、次に出る相手も2回【火傷状態】にする。自分の【凍結状態】を解く。"},{"name":"避雷針","pt":3,"ex":false,"text":"お互いの全カードの【麻痺状態】を治す。治した数と同じだけ自分のカードを選び永続で+2し、その後バトル相手を【麻痺状態】にする。"},{"name":"ブリザード","pt":3,"ex":false,"text":"バトル中の相手と、相手のデッキ2枚を【凍結状態】にする。"},{"name":"吸血","pt":3,"ex":false,"text":"お互いの全カードから【出血状態】を選び治してよい。治した分だけ自分の数字を永続で+1する。"},{"name":"毒の王","pt":3,"ex":false,"text":"相手を【毒状態】にする。自分は全カードの【毒状態】合計ターン数と同じ数字になる。"},{"name":"混沌","pt":3,"ex":false,"text":"相手と次に出る相手カードを、任意の-1pt状態異常にする（種類は自分が選ぶ）。"},{"name":"突然変異","pt":3,"ex":false,"text":"自分の無能力者・異能者カードの数字を全て永続で4にする（エネミー扱いになる）。"},{"name":"超音波","pt":3,"ex":false,"text":"相手の数字を-3する。自分の全カードに【音波】を与える（重複可）。"},{"name":"根を張る","pt":3,"ex":false,"text":"相手と次に出る相手が使う効果を好きなだけ選び打ち消す（対象は相手が選ぶ。デメリット効果は対象外）。打ち消さなかった数だけ相手を永続で-1、このカードを永続で+1する。"},{"name":"霊の統率","pt":3,"ex":false,"text":"相手に【霊魂】を与える。以後、自分につく【霊魂】は数字+1、相手につく【霊魂】は数字-1の効果を持つ。"},{"name":"ポルターガイスト","pt":3,"ex":false,"text":"お互いの【霊魂】の数と同じ種類だけ、相手を-1ptの状態異常にする。"},{"name":"夜空","pt":3,"ex":false,"text":"試合の場を【夜空】にする。以後相手は出るたび【睡眠状態】になる（すでに【夜空】ならデッキから【ナイトメア】を呼び出す）。"},{"name":"歪曲","pt":3,"ex":false,"text":"試合の場を【歪曲】にする。以後お互いの+効果は-に、-効果は+に反転する（状態異常は対象外）。"},{"name":"反転","pt":3,"ex":false,"text":"試合の場を【反転】にする。以後数字が低い方が勝つ（もう一度使うと元に戻る）。"},{"name":"回復加護","pt":3,"ex":false,"text":"自分のデッキのデメリット効果を全て治し、治した分だけ自分の数字を+1する。その後デッキから1枚選び同じ効果を与える。"},{"name":"エネミー特攻","pt":3,"ex":false,"text":"相手がエネミーなら、このバトルに勝つ。"},{"name":"全反射","pt":3,"ex":false,"text":"相手から受ける効果・数字の減少・数字指定を跳ね返し、相手が受ける。"},{"name":"暗殺","pt":3,"ex":true,"text":"EX効果。相手のカードを1枚選ぶ。それは次に出たとき1回、バトルに敗北する。"},{"name":"託宣","pt":3,"ex":true,"text":"EX効果。次に自分が出すカードの数字を指定できる（【託宣】を持つカードは対象外）。"},{"name":"完全模倣","pt":3,"ex":true,"text":"EX効果。バトル中に相手が使った効果を1つ選び、永続的にそれになり即座に発動する。"},{"name":"アシッドポイズン","pt":3,"ex":false,"text":"相手を2回【毒状態】にする。既存の全ての【毒状態】を1ターン分経過させる。"},{"name":"一刀両断","pt":3,"ex":false,"text":"自分の数字を+3する。相手を【出血状態】にする。"},{"name":"ラッシュ","pt":3,"ex":false,"text":"自分の数字を+1する動作を4回行う。次に出たとき、もう1つ【ラッシュ】を追加で持つ。"},{"name":"心臓穿ち","pt":3,"ex":false,"text":"相手の数字を永続で1にする（1より大きくならない）。すでに相手が1以下なら、次に出たとき1回効果を使えなくする。"},{"name":"悪魔の契約","pt":3,"ex":false,"text":"バトル相手のデメリット以外の効果は、この試合中『発動すると同じものを自分も発動する』を持つ。"},{"name":"逆境無頼","pt":3,"ex":false,"text":"自分が劣勢のとき、バトルに勝つ。"},{"name":"闇","pt":3,"ex":true,"text":"EX効果。相手の効果を全て【闇】に変える（すでにお互い【闇】なら、【闇】の数が少ない方が勝つ）。"},{"name":"大変身","pt":4,"ex":false,"text":"自分の数字が8になる。"},{"name":"無限の強化","pt":4,"ex":false,"text":"この試合中お互いが発動した＋値効果と同じ分だけ、自分の数字を+1する（重複可）。"},{"name":"無双","pt":4,"ex":false,"text":"お互いのデッキの異能者の数だけ数字を+1、エネミーの数だけ相手の数字を-1する。自分のデッキの無能力者の数字を全て永続で+1する。"},{"name":"ブラックホール","pt":4,"ex":false,"text":"バトル相手と相手の数字4以上のカードを好きなだけ選び永続で-3する。2ターン後、このカードは永続で無限大の+を得て、相手は試合中あと1回しか効果を使えなくなる。"},{"name":"煙炎漲天","pt":4,"ex":false,"text":"バトル相手を【火傷状態】にし、その後相手の全カードも【火傷状態】にする（場が【水浸し】の場合は代わりに水を乾かし元に戻し、【凍結状態】を全て解除する）。"},{"name":"水天一碧","pt":4,"ex":false,"text":"試合の場を【水浸し】にし、相手の数字を0にする（すでに【水浸し】なら、自分と次に出る自分のカードはそのターン相手からの状態異常以外の効果を無視する）。"},{"name":"雷霆万鈞","pt":4,"ex":false,"text":"バトル相手と次に出る相手を【麻痺状態】にする（すでに【麻痺状態】ならこのバトルに勝つ）。"},{"name":"大地震撼","pt":4,"ex":false,"text":"試合の場をリセットして元に戻す（場が何も変化していなければ、代わりにこのバトルに勝つ）。"},{"name":"疾風怒濤","pt":4,"ex":false,"text":"この効果は【風】として扱う。自分のデッキの全カードに【風】を付与する（重複可）。"},{"name":"絶対零度","pt":4,"ex":false,"text":"相手のカードを1枚選び、次のターン出せなくする。その後相手全体を【凍結状態】にする。"},{"name":"鮮血淋漓","pt":4,"ex":false,"text":"これ以外のお互いのカードを全て【出血状態】にする。自分のカードのみ全て永続で+2する。"},{"name":"大召喚の号令","pt":4,"ex":false,"text":"自分のデッキのトークンを全て呼び出し、共にバトルする（元数字は合算）。"},{"name":"パンデミック","pt":4,"ex":false,"text":"相手を【毒状態】と【感染状態】にする。相手の【毒状態】と【感染状態】の合計数をXとして、6-Xターン後に試合に勝利する。"},{"name":"ナイトメア","pt":4,"ex":false,"text":"相手を【睡眠状態】にする（相手が【催眠】由来で眠っているならこの試合に勝利する）。"},{"name":"デッドエンド","pt":4,"ex":false,"text":"相手に【霊魂】を与える。お互いの【霊魂】が5つ以上なら試合中1回、負けても相手に勝ち点を渡さない。13個以上ならこの試合に勝利する。"},{"name":"愛","pt":4,"ex":false,"text":"相手に【愛】を与える。【愛】を持つカード同士は優勢でも勝ち点を得られない。全カードが【愛】を持った時、最初に出た【愛】のカードが永続で無限大の+を得て全ての【愛】が失われる。"},{"name":"テレポート","pt":4,"ex":true,"text":"EX効果。自分のデッキの【テレポート】を持たないカードと入れ替わってバトルさせる（発動時に効果も発動。次に出たとき1回使用不可）。"},{"name":"消滅","pt":4,"ex":true,"text":"EX効果。相手の効果を全て打ち消し、次のターン出せなくする。"},{"name":"マインドジャッジメント","pt":4,"ex":true,"text":"EX効果。バトル中でない相手カードを1枚選び呼び出す。そのカードは次に出たとき効果を使えない（すでに出ている場合不可。次に出たとき1回使用不可）。"},{"name":"ギアドライブ","pt":4,"ex":true,"text":"EX効果。自分のデッキの効果名に「火」「水」「雷」「風」「地」のいずれかを含み、同属性で揃っている数だけコストを差し引いて扱う（最大0ptまで）。自分の数字を+3する。"},{"name":"大衝撃","pt":4,"ex":false,"text":"自分の数字を+8する。お互いは次に出たとき1回、デメリット以外の効果を使えない。"},{"name":"死者蘇生","pt":4,"ex":true,"text":"EX効果。試合中1度だけ、負けたカードから1枚選びコピーを出して数字を合算する（コピーは永続）。"},{"name":"一撃必殺","pt":6,"ex":false,"text":"このバトルに勝つ。"},{"name":"超次元","pt":6,"ex":false,"text":"自分の数字を無限大にする。"},{"name":"滅亡","pt":6,"ex":false,"text":"3ターン後、試合に勝利する。"},{"name":"無敵","pt":6,"ex":false,"text":"このカードは負けない。"}];

export function sanitizeKey(str){ return str.trim().replace(/[.#$/\[\]]/g, '_'); }
export function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  }

export function emptyCards(){
    return [0,1,2,3].map((_, idx) => ({ name:'', number: idx+1, species:'異能者', type:'atk', effectNames:[], flavor:'', used:false }));
  }
export function emptyDeck(){
    return { ready:false, cards: emptyCards() };
  }
export function effectByName(name){ return EFFECTS_CATALOG.find(e => e.name === name); }

export function ptGroupLabel(pt){
    if(pt < 0) return `${pt}pt（デメリット）`;
    return `${pt}pt`;
  }
export function buildEffectSelectOptions(){
    const groups = {};
    EFFECTS_CATALOG.forEach(e => {
      groups[e.pt] = groups[e.pt] || [];
      groups[e.pt].push(e);
    });
    const ptOrder = Object.keys(groups).map(Number).sort((a,b) => a-b);
    return ptOrder.map(pt => {
      const opts = groups[pt].map(e => `<option value="${escapeHtml(e.name)}">${escapeHtml(e.name)}${e.ex ? '（EX）' : ''}</option>`).join('');
      return `<optgroup label="${ptGroupLabel(pt)}">${opts}</optgroup>`;
    }).join('');
  }
export function cardFormHtml(idx, card, effectsArr, isReadOnly){
    const used = effectsArr.reduce((sum, n) => { const e = effectByName(n); return sum + (e ? e.pt : 0); }, 0);
    const cardNumber = card.number;
    const overBudget = used > cardNumber;

    const chipsHtml = effectsArr.map(n => {
      const e = effectByName(n);
      if(!e) return '';
      return `
        <div class="effect-chip">
          <div class="ec-head">
            <span class="ec-name">${escapeHtml(e.name)}${e.ex ? '（EX）' : ''}</span>
            <span class="ec-pt">${e.pt}pt</span>
            ${isReadOnly ? '' : `<button type="button" class="ec-remove" data-remove-effect data-i="${idx}" data-name="${escapeHtml(e.name)}">✕ 外す</button>`}
          </div>
          <div class="ec-text">${escapeHtml(e.text)}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="slot-label">数字 ${cardNumber}</div>
      <label>カード名</label>
      <input type="text" data-f="name" data-i="${idx}" value="${escapeHtml(card.name)}" ${isReadOnly?'disabled':''}>
      <label>種族</label>
      <select data-f="species" data-i="${idx}" ${isReadOnly?'disabled':''}>
        ${SPECIES_LIST.map(s => `<option value="${s}" ${card.species===s?'selected':''}>${s}</option>`).join('')}
      </select>
      <label>タイプ</label>
      <select data-f="type" data-i="${idx}" ${isReadOnly?'disabled':''}>
        ${Object.entries(TYPE_LABEL).map(([k,v]) => `<option value="${k}" ${card.type===k?'selected':''}>${v}</option>`).join('')}
      </select>

      <label>効果</label>
      <div class="pt-budget ${overBudget?'over':''}">使用pt: ${used} ／ 数字上限: ${cardNumber}${overBudget ? '（超過しています）' : ''}</div>
      ${chipsHtml}
      ${isReadOnly ? '' : `
        <div class="effect-add-row">
          <select data-effect-select data-i="${idx}">
            <option value="">効果を選んで追加…</option>
            ${buildEffectSelectOptions()}
          </select>
          <button type="button" class="ghost-btn" data-add-effect data-i="${idx}">追加</button>
        </div>
      `}

      <label>説明（フレーバー）</label>
      <input type="text" data-f="flavor" data-i="${idx}" value="${escapeHtml(card.flavor)}" ${isReadOnly?'disabled':''}>
    `;
  }
export function renderCardGrid(gridEl, cards, effectsState, isReadOnly, callbacks){
    gridEl.innerHTML = '';
    cards.forEach((card, idx) => {
      const div = document.createElement('div');
      div.className = 'card-form';
      div.innerHTML = cardFormHtml(idx, card, effectsState[idx] || [], isReadOnly);
      gridEl.appendChild(div);
    });
    gridEl.querySelectorAll('[data-add-effect]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.i, 10);
        const select = gridEl.querySelector(`[data-effect-select][data-i="${idx}"]`);
        callbacks.onAddEffect(idx, select.value);
      });
    });
    gridEl.querySelectorAll('[data-remove-effect]').forEach(btn => {
      btn.addEventListener('click', () => {
        callbacks.onRemoveEffect(parseInt(btn.dataset.i, 10), btn.dataset.name);
      });
    });
  }
export function addEffectGeneric(effectsState, idx, name, cardNumber, errEl){
    errEl.textContent = '';
    if(!name) return false;
    const effects = effectsState[idx];
    const eff = effectByName(name);
    if(!eff) return false;
    if(effects.includes(name)){ errEl.textContent = '同じ効果は同じカードに重複してつけられません。'; return false; }
    if(effects.length >= 5){ errEl.textContent = '1枚のカードにつけられる効果は5個までです。'; return false; }
    const currentUsed = effects.reduce((sum, n) => { const e = effectByName(n); return sum + (e ? e.pt : 0); }, 0);
    if((currentUsed + eff.pt) > cardNumber){
      errEl.textContent = `pt上限を超えています（このカードの上限: ${cardNumber}pt）。`;
      return false;
    }
    if(eff.pt === -2 && effectsState.some((arr,i) => i!==idx && arr.some(n => { const e=effectByName(n); return e && e.pt===-2; }))){
      errEl.textContent = '-2ptの効果を持つカードはデッキに1枚までしか入れられません（他のカードに既についています）。';
      return false;
    }
    if(eff.pt === 6 && effectsState.some((arr,i) => i!==idx && arr.some(n => { const e=effectByName(n); return e && e.pt===6; }))){
      errEl.textContent = '6ptの効果を持つカードはデッキに1枚までしか入れられません（他のカードに既についています）。';
      return false;
    }
    const exCount = effectsState.reduce((sum,arr) => sum + arr.filter(n => { const e=effectByName(n); return e && e.ex; }).length, 0);
    if(eff.ex && exCount >= 2){ errEl.textContent = 'EX効果はデッキ全体で2枚までしか入れられません。'; return false; }
    if(eff.ex && effectsState.some(arr => arr.includes(name))){ errEl.textContent = '同じEX効果をデッキに複数入れることはできません。'; return false; }
    const totalEffects = effectsState.reduce((sum,arr) => sum + arr.length, 0);
    if(totalEffects >= 10){ errEl.textContent = 'デッキ全体の効果数は10個までです。'; return false; }
    effects.push(name);
    return true;
  }
export function validateDeckWide(cards){
    for(const c of cards){
      const used = (c.effectNames||[]).reduce((sum,n) => { const e = effectByName(n); return sum + (e?e.pt:0); }, 0);
      if(used > c.number){
        return `「${c.name || '無題のカード'}」の効果ptが数字の上限を超えています。`;
      }
      if((c.effectNames||[]).length > 5){
        return `「${c.name || '無題のカード'}」につけられる効果は5個までです。`;
      }
    }
    const totalEffects = cards.reduce((sum,c) => sum + (c.effectNames||[]).length, 0);
    if(totalEffects > 10){
      return `デッキ全体の効果数が10個を超えています（現在${totalEffects}個）。`;
    }
    const exNames = [];
    cards.forEach(c => (c.effectNames||[]).forEach(n => { const e = effectByName(n); if(e && e.ex) exNames.push(n); }));
    if(exNames.length > 2){
      return 'EX効果はデッキ全体で2枚までしか入れられません。';
    }
    if(new Set(exNames).size !== exNames.length){
      return '同じEX効果をデッキに複数入れることはできません。';
    }
    const cardsWithNeg2 = cards.filter(c => (c.effectNames||[]).some(n => { const e = effectByName(n); return e && e.pt === -2; }));
    if(cardsWithNeg2.length > 1){
      return '-2ptの効果を持つカードはデッキに1枚までしか入れられません。';
    }
    const cardsWith6 = cards.filter(c => (c.effectNames||[]).some(n => { const e = effectByName(n); return e && e.pt === 6; }));
    if(cardsWith6.length > 1){
      return '6ptの効果を持つカードはデッキに1枚までしか入れられません。';
    }
    return null;
  }

export function typeAdvantage(typeA, typeB){
    // 戻り値: 'A' | 'B' | null（有利側、なければnull）
    const cycle = { atk:'spd', spd:'def', def:'atk' };
    if(typeA==='spc' && typeB==='uni') return 'A';
    if(typeB==='spc' && typeA==='uni') return 'B';
    if(typeA==='spc' && ['atk','spd','def'].includes(typeB)) return 'B';
    if(typeB==='spc' && ['atk','spd','def'].includes(typeA)) return 'A';
    if(cycle[typeA] === typeB) return 'A';
    if(cycle[typeB] === typeA) return 'B';
    return null;
  }