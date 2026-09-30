// ============================================================
// action-engine.js
// 「効果を自動処理する」実験のための、完全に独立したモジュールです。
//
// 【重要】このファイルは auto-battle-test.html だけから読み込まれます。
// shared.js・index.html（対戦）・solo.html（ひとりで）・deckset.html（デッキセット）
// のいずれからも参照されておらず、この中身をどう変更・削除しても、
// それらのページの動作には一切影響しません。
//
// 対応するFirebaseの保存場所も autoTestRooms（対戦本番の rooms とは別）に
// 限定されているため、このテスト中に本番の対戦が行われていても影響しません。
// ============================================================

// テスト用に「actionsデータ」を付けた効果の一覧。
// 実在のカタログ（shared.js側）とは完全に別物として、ここだけで管理する。
// 「破壊の光線」のみ、実際のWiki記載（相手の数字-6する。3pt）に基づく実例。
// 他はエンジンの動作確認のために用意した、明示的なテスト用効果。
export const TEST_ACTION_EFFECTS = {
  '破壊の光線': {
    actions: [
      { target: 'opponent', action: 'numberDelta', value: -6 }
    ]
  },
  'テスト：相手の数字-3': {
    actions: [
      { target: 'opponent', action: 'numberDelta', value: -3 }
    ]
  },
  'テスト：自分の数字+2': {
    actions: [
      { target: 'self', action: 'numberDelta', value: 2 }
    ]
  },
  'テスト：自分の次EE+1': {
    actions: [
      { target: 'self', action: 'eeDelta', value: 1 }
    ]
  },
  'テスト：相手の次EE-1': {
    actions: [
      { target: 'opponent', action: 'eeDelta', value: -1 }
    ]
  },
  'テスト：自分のwin+1': {
    actions: [
      { target: 'self', action: 'pointDelta', value: 1 }
    ]
  }
};

// 指定した効果名に、テスト用のactionsが定義されていれば返す。無ければnull。
export function getTestActionsFor(effectName){
  const entry = TEST_ACTION_EFFECTS[effectName];
  return entry ? entry.actions : null;
}

// actionsを実際に処理する。
// context: { selfSlot, oppSlot, addAdjustment(targetSlot, field, delta) }
//   addAdjustment は、呼び出し側（auto-battle-test.html）が用意する関数で、
//   Firebase上の battle/actionAdjustments に加算分を書き込む役割を持つ。
// 戻り値: 処理対象のactionsが見つかって処理を行った場合はtrue、対象外だった場合はfalse。
export function applyEffectActions(effectName, context){
  const actions = getTestActionsFor(effectName);
  if(!actions) return false;

  actions.forEach(a => {
    const targetSlot = a.target === 'self' ? context.selfSlot : context.oppSlot;
    if(a.action === 'numberDelta'){
      context.addAdjustment(targetSlot, 'numberDelta', a.value);
    } else if(a.action === 'eeDelta'){
      context.addAdjustment(targetSlot, 'eeDelta', a.value);
    } else if(a.action === 'pointDelta'){
      context.addAdjustment(targetSlot, 'pointDelta', a.value);
    }
    // 未対応のaction種別は、意図的に何もしない（フェーズ1の対象外のため無視する）
  });
  return true;
}
