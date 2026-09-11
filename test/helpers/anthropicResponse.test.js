const test = require("node:test");
const assert = require("node:assert/strict");
const {
  extractAnthropicText,
  describeMissingAnthropicText,
} = require("../../src/helpers/anthropicResponse");

test("reads the text block when it is first", () => {
  assert.equal(extractAnthropicText({ content: [{ type: "text", text: "  hi  " }] }), "hi");
});

test("skips a leading thinking block (Opus 5 / Fable default)", () => {
  const data = {
    content: [
      { type: "thinking", thinking: "" },
      { type: "text", text: "cleaned up" },
    ],
  };
  assert.equal(extractAnthropicText(data), "cleaned up");
});

test("joins multiple text blocks", () => {
  const data = {
    content: [
      { type: "text", text: "a" },
      { type: "text", text: "b" },
    ],
  };
  assert.equal(extractAnthropicText(data), "ab");
});

test("returns null when no text block exists", () => {
  assert.equal(extractAnthropicText({ content: [{ type: "thinking", thinking: "" }] }), null);
  assert.equal(extractAnthropicText({ content: [] }), null);
  assert.equal(extractAnthropicText({}), null);
  assert.equal(extractAnthropicText(null), null);
});

test("describes a max_tokens cut-off distinctly", () => {
  assert.match(describeMissingAnthropicText({ stop_reason: "max_tokens" }), /max_tokens/);
  assert.match(describeMissingAnthropicText({ stop_reason: "refusal" }), /refusal/);
  assert.match(describeMissingAnthropicText({}), /no text content/);
});
