import test from "node:test";
import assert from "node:assert/strict";
import { cleanLine, thoughts, worries, companions } from "../src/game/content.ts";
test("removes trailing punctuation from each Chinese or English line", () => {
  assert.equal(cleanLine("今天，也辛苦了。\nYou did enough today!\n正在装好这份松软…\nWelcome。 …  "), "今天，也辛苦了\nYou did enough today\n正在装好这份松软\nWelcome");
  assert.equal(cleanLine("松软度 94% · 费用：一个深呼吸"), "松软度 94% · 费用：一个深呼吸");
});
test("all four worries have twelve distinct bilingual thoughts and responses", () => {
  assert.equal(thoughts.length, worries.length);
  for (const group of thoughts) {
    assert.equal(group.length, 12);
    for (let lang = 0; lang < 2; lang++) {
      assert.equal(new Set(group.map(t => t.word[lang])).size, 12);
      assert.equal(new Set(group.map(t => t.reply[lang])).size, 12);
      for (const t of group) for (const value of [t.word[lang], t.reply[lang]]) {
        assert.ok(value.trim().length > 0);
        assert.equal(value, cleanLine(value));
        if (lang === 1) assert.equal(/\p{Script=Han}/u.test(value), false);
      }
    }
  }
  assert.equal(new Set(thoughts.flat().map(t => t.word[0])).size, 48);
});
test("companion and worry labels stay bilingual without terminal punctuation", () => {
  for (const item of [...worries, ...Object.values(companions)]) {
    for (const pair of Object.values(item).filter(Array.isArray)) for (const value of pair) {
      assert.equal(value, cleanLine(value));
    }
  }
});
