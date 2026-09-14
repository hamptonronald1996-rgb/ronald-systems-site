// Exercise the actual filter against the current service titles and request links.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'assets/service-guide.js'), 'utf8');
function element() {
  return {
    attributes: {}, handlers: {}, children: [], hidden: false,
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, handler) { this.handlers[name] = handler; },
    append(...children) { this.children.push(...children); }
  };
}
const cards = [...html.matchAll(/<article class="service glass">([\s\S]*?)<\/article>/g)].map(([, body]) => {
  const title = body.match(/<h3>(.*?)<\/h3>/)[1];
  return Object.assign(element(), {
    title, request: body.match(/data-service="([^"]+)"/)[1],
    querySelector: selector => selector === 'h3' ? { textContent: title } : null
  });
});
assert.equal(cards.length, 7, 'The current seven services must be available without JavaScript');
let guide;
const grid = { id: '', querySelectorAll: () => cards, before(value) { guide = value; } };
const document = {
  querySelector: () => grid,
  getElementById: () => guide,
  createElement: () => element()
};
const window = {};
vm.runInNewContext(script, { document, window });
const [title, controls, intro, status] = guide.children;
assert.equal(title.textContent, 'Find your starting point');
assert.equal(controls.attributes.role, 'group');
assert.equal(status.attributes['aria-live'], 'polite');
assert.equal(status.textContent, '7 services · All services');
assert(cards.every(card => !card.hidden));
const expectations = [
  ['All services', cards.map(card => card.title)],
  ['Device repair', ['Computer & laptop repair', 'Phone & tablet repair']],
  ['Business IT', ['Small-business IT', 'Networking & Wi-Fi']],
  ['Websites & software', ['Websites & online systems', 'Custom software & AI']],
  ['Servers & security', ['Servers & security technology']]
];
expectations.forEach(([label, expected], index) => {
  const button = controls.children[index];
  assert.equal(button.type, 'button');
  assert.equal(button.textContent, label);
  assert.equal(button.attributes['aria-controls'], grid.id);
  button.handlers.click();
  assert.deepEqual(cards.filter(card => !card.hidden).map(card => card.title), expected);
  assert.equal(controls.children.filter(item => item.attributes['aria-pressed'] === 'true').length, 1);
  assert.equal(button.attributes['aria-pressed'], 'true');
  assert(status.textContent.startsWith(`${expected.length} service`));
  assert(intro.textContent.length > 40);
});
controls.children[0].handlers.click();
assert(cards.every(card => !card.hidden), 'All services must restore every card');
assert(cards.every(card => card.request === card.title), 'Request links retain the exact service values');
for (const [id, index] of [['business', 2], ['repair', 1], ['systems', 4]]) {
  window.workshopServices.select(id);
  assert.deepEqual(cards.filter(card => !card.hidden).map(card => card.title), expectations[index][1]);
  assert.equal(controls.children[index].attributes['aria-pressed'], 'true');
}
const previousStatus = status.textContent;
window.workshopServices.select('unknown');
assert.equal(status.textContent, previousStatus, 'Unknown external categories must preserve the current selection');
assert.deepEqual(cards.filter(card => !card.hidden).map(card => card.title), expectations[4][1]);
const originalGuide = guide;
vm.runInNewContext(script, { document, window });
assert.equal(guide, originalGuide, 'Do not insert duplicate controls');
vm.runInNewContext(script, { document: { querySelector: () => null } });
console.log('PASS: seven-service fallback, all four filters, accessible state/count, request values, reset, external selection, unknown category preservation, duplicate guard, and missing-section fallback');
