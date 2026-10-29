'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { isIphone } = require('./not-an-iphone.js');

const IPHONE_SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const MAC_SAFARI = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';

// A desktop browser on a laptop, unless a case overrides a field.
const env = (overrides) => ({
  userAgent: MAC_SAFARI,
  platform: 'MacIntel',
  maxTouchPoints: 0,
  screenWidth: 1440,
  screenHeight: 900,
  ...overrides,
});

const cases = [
  ['אייפון עם Safari לפי User-Agent', env({ userAgent: IPHONE_SAFARI, platform: 'iPhone' }), true],
  ['אייפון עם Chrome לפי User-Agent', env({ userAgent: IPHONE_SAFARI.replace('Version/17.5', 'CriOS/126.0.6478.54'), platform: 'iPhone' }), true],
  ['אייפון לפי platform בלבד', env({ userAgent: '', platform: 'iPhone' }), true],
  ['אייפון במצב אתר לדסקטופ (Mac UA, מסך טלפון, מגע)', env({ maxTouchPoints: 5, screenWidth: 393, screenHeight: 852 }), true],
  ['אנדרואיד', env({ userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36', platform: 'Linux armv81' }), false],
  ['אייפד', env({ userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1', platform: 'iPad' }), false],
  ['אייפד במצב אתר לדסקטופ (מסך גדול)', env({ maxTouchPoints: 5, screenWidth: 820, screenHeight: 1180 }), false],
  ['מק לפטופ בלי מגע', env({}), false],
  ['ווינדוס Chrome', env({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36', platform: 'Win32' }), false],
  ['בלי נתונים', {}, false],
];

for (const [name, input, expected] of cases) {
  test(`זיהוי אייפון: ${name}`, () => {
    assert.equal(isIphone(input), expected);
  });
}
