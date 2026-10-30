import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { onboardingMessages } from '../../../src/i18n/onboarding.messages';

type Tree = { [k: string]: string | Tree };
const flatten = (o: Tree, prefix = ''): Record<string, string> =>
  Object.entries(o).reduce<Record<string, string>>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return typeof v === 'string'
      ? { ...acc, [key]: v }
      : { ...acc, ...flatten(v, key) };
  }, {});
const en = flatten(onboardingMessages.en as Tree);
const sw = flatten(onboardingMessages.sw as Tree);
const params = (s: string) =>
  [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

// jsdom's URL implementation mishandles relative file: URLs on Windows, so
// resolve the source tree from this file's real path instead.
const SRC_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../src',
);

const FILES = [
  'layouts/CitizenOnboardLayout.vue',
  'views/citizen/onboarding/LanguageView.vue',
  'views/citizen/onboarding/AuthChoiceView.vue',
  'views/citizen/onboarding/RegisterView.vue',
  'views/citizen/onboarding/EmailOtpLogin.vue',
  'views/citizen/onboarding/OtpView.vue',
  'views/citizen/onboarding/PermissionsView.vue',
  'views/citizen/onboarding/AllSetView.vue',
  'views/citizen/HomeView.vue',
];

describe('citizen onboarding translations (en / sw)', () => {
  it('English and Kiswahili define exactly the same keys', () => {
    expect(Object.keys(sw).sort()).toEqual(Object.keys(en).sort());
  });
  it('every translation keeps the same {placeholders}', () => {
    for (const key of Object.keys(en))
      expect(params(sw[key])).toEqual(params(en[key]));
  });
  it('every t("…") key used by the onboarding screens exists', () => {
    const missing: string[] = [];
    for (const f of FILES) {
      const src = readFileSync(resolve(SRC_DIR, f), 'utf8');
      for (const m of src.matchAll(/\bt\('([\w.]+)'/g))
        if (!(m[1] in en)) missing.push(`${f}: ${m[1]}`);
    }
    expect(missing).toEqual([]);
  });
  it('HomeView status labels exist, so a chip never shows a raw code', () => {
    for (const k of ['home.inProgress', 'home.resolved', 'home.noReports'])
      expect(k in en).toBe(true);
  });
  it('the flow keeps its stages: landing → email → OTP → permissions → all-set → home', () => {
    for (const prefix of ['lang', 'email', 'otp', 'perm', 'done', 'home']) {
      expect(Object.keys(en).some((k) => k.startsWith(`${prefix}.`))).toBe(
        true,
      );
    }
  });
});
