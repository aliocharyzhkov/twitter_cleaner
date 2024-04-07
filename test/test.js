import assert from 'assert';
import { isPornSpam } from '../src/scripts/utils.js';

describe('test isPornSpam on different inputs', function () {
  it('should return false when text arg is undefined', function () {
    assert.equal(isPornSpam(), false);
  });
  it('should return false when text arg is null', function () {
    assert.equal(isPornSpam(null), false);
  });
  let true_positives = [
    '【P】【U】【S】【S】【Y】 【I】【N】 【B】【I】【O】',
    // Source https://twitter.com/SusanRober66548/status/1775881942124335151
    // This Post is from a suspended account. Learn more
    'Susan Roberts\n@SusanRober66548\n·\n26m\n🅻🅺 🆁🅵🅸🅻🅴\n11',
  ];
  for (const input of true_positives) {
    it(`should return true on input ${JSON.stringify(input)}`, function () {
      assert.ok(isPornSpam(input));
    });
  }
  let true_negatives = [
    `There's enough DNA in the body of a human to stretch from the Sun to Pluto and back 17 times.`,
    '🚀✨ Launching new profile banner 👀',
    'เซฟตารางกิจกรรมแล้วเตรียมไป',
  ];
  for (const input of true_negatives) {
    it(`should return false on input ${JSON.stringify(input)}`, function () {
      assert.equal(isPornSpam(input), false);
    });
  }
});
