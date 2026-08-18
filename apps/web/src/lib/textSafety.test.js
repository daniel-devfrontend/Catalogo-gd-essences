import test from 'node:test';
import assert from 'node:assert/strict';

import { preserveExactText } from './textSafety.js';

test('preserveExactText keeps time-like names as literal strings', () => {
  assert.equal(preserveExactText('9 PM'), '9 PM');
  assert.equal(preserveExactText('9pm'), '9pm');
  assert.equal(preserveExactText('9 PM Rebel'), '9 PM Rebel');
});

test('preserveExactText strips only control characters and never coerces values', () => {
  assert.equal(preserveExactText(9), '9');
  assert.equal(preserveExactText('Afnan\u0000'), 'Afnan');
  assert.equal(preserveExactText('  Café  '), '  Café  ');
});