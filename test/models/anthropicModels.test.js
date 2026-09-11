const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");

const registry = require(path.join(__dirname, "../../src/models/modelRegistryData.json"));
const en = require(path.join(__dirname, "../../src/locales/en/translation.json"));

const anthropic = registry.cloudProviders.find((p) => p.id === "anthropic");
const byId = Object.fromEntries(anthropic.models.map((m) => [m.id, m]));

// Sending `temperature` to these returns a 400; sending `output_config.effort`
// to Sonnet 4.5 / Haiku 4.5 does the same.
const NO_TEMPERATURE = [
  "claude-fable-5-1",
  "claude-fable-5",
  "claude-sonnet-5",
  "claude-opus-5",
  "claude-opus-4-8",
  "claude-opus-4-7",
];
const NO_EFFORT = ["claude-sonnet-4-5", "claude-haiku-4-5"];

test("every Anthropic model declares both request-shape flags", () => {
  for (const model of anthropic.models) {
    assert.equal(typeof model.supportsTemperature, "boolean", `${model.id} supportsTemperature`);
    assert.equal(typeof model.supportsEffort, "boolean", `${model.id} supportsEffort`);
  }
});

test("models that reject temperature are flagged false", () => {
  for (const id of NO_TEMPERATURE) {
    assert.ok(byId[id], `${id} missing from registry`);
    assert.equal(byId[id].supportsTemperature, false, id);
  }
});

test("only Sonnet 4.5 and Haiku 4.5 reject effort", () => {
  const flaggedNoEffort = anthropic.models.filter((m) => !m.supportsEffort).map((m) => m.id);
  assert.deepEqual(flaggedNoEffort.sort(), [...NO_EFFORT].sort());
});

test("every Anthropic model has a translated description", () => {
  const descriptions = en.models.descriptions.cloud;
  for (const model of anthropic.models) {
    const key = model.descriptionKey.split(".").pop();
    assert.ok(descriptions[key], `missing en translation for ${model.descriptionKey}`);
  }
});
