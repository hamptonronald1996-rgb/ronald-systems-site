// Exercise the actual progressive controller using the four current project IDs.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'assets/project-guide.js'), 'utf8');
function element() {
  return {
    attributes: {}, handlers: {}, children: [], hidden: false,
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, handler) { this.handlers[name] = handler; },
    append(...children) { this.children.push(...children); },
    scrollIntoView(options) { this.scrolled = options; }
  };
}
const cards = [...html.matchAll(/<article class="project[^"]*" id="([^"]+)">([\s\S]*?)<\/article>/g)].map(([, id, body]) => Object.assign(element(), { id, body }));
assert.deepEqual(cards.map(card => card.id), ['project-fur-love', 'project-fur-love-operations', 'project-secure-watch', 'project-codecredit']);
assert(cards.every(card => !card.hidden), 'All four cards exist before enhancement');
const originalBodies = cards.map(card => card.body);
let guide;
const grid = Object.assign(element(), { id: '', querySelectorAll: () => cards, before(value) { guide = value; } });
const document = {
  querySelector: () => grid,
  getElementById: () => guide,
  createElement: () => element()
};
const window = {
  location: { hash: '' },
  handlers: {},
  addEventListener(name, handler) { this.handlers[name] = handler; }
};
vm.runInNewContext(script, { document, window });
const [title, controls, intro, status, relationship] = guide.children;
assert.equal(title.textContent, 'Choose a build to explore');
assert.equal(controls.attributes.role, 'group');
assert.equal(controls.attributes['aria-label'], 'Filter selected projects');
assert.equal(status.attributes['aria-live'], 'polite');
assert.equal(status.attributes['aria-atomic'], 'true');
assert.equal(status.textContent, '4 of 4 builds · All four');
assert(relationship.hidden);
const expectations = [
  ['All four', cards.map(card => card.id)],
  ['Fur the Love', ['project-fur-love', 'project-fur-love-operations']],
  ['Secure Watch', ['project-secure-watch']],
  ['CodeCredit', ['project-codecredit']]
];
expectations.forEach(([label, ids], index) => {
  const button = controls.children[index];
  assert.equal(button.type, 'button');
  assert.equal(button.textContent, label);
  assert.equal(button.attributes['aria-controls'], grid.id);
  button.handlers.click();
  assert.deepEqual(cards.filter(card => !card.hidden).map(card => card.id), ids);
  assert.equal(button.attributes['aria-pressed'], 'true');
  assert.equal(controls.children.filter(item => item.attributes['aria-pressed'] === 'true').length, 1);
  assert.equal(status.textContent, `${ids.length} of 4 builds · ${label}`);
  assert(intro.textContent.length > 40);
  assert.equal(relationship.hidden, index !== 1);
});
assert.equal(relationship.children[0].textContent, 'Website ↔ Operations');
assert(relationship.children[1].textContent.includes('private operations workspace'));
for (const [id, index] of [['project-fur-love', 1], ['project-fur-love-operations', 1], ['project-secure-watch', 2], ['project-codecredit', 3], ['all', 0]]) {
  assert.equal(window.workshopProjects.show(id), true);
  assert.deepEqual(cards.filter(card => !card.hidden).map(card => card.id), expectations[index][1]);
  assert.equal(controls.children[index].attributes['aria-pressed'], 'true');
}
window.workshopProjects.show('project-fur-love-operations');
const previousState = [status.textContent, grid.attributes['data-project-view'], relationship.hidden];
assert.equal(window.workshopProjects.show('unknown'), false);
assert.deepEqual([status.textContent, grid.attributes['data-project-view'], relationship.hidden], previousState);
assert.deepEqual(cards.filter(card => !card.hidden).map(card => card.id), expectations[1][1]);
window.location.hash = '#project-codecredit';
window.handlers.hashchange();
assert.deepEqual(cards.filter(card => !card.hidden).map(card => card.id), expectations[3][1], 'A fragment reveals its hidden project');
assert.equal(cards[3].scrolled.block, 'start', 'Reveal the fragment destination before scrolling to it');
for (const hash of ['#work', '#contact', '#unknown-project', '#%E0%A4%A']) {
  window.location.hash = hash;
  window.handlers.hashchange();
  assert.deepEqual(cards.filter(card => !card.hidden).map(card => card.id), expectations[3][1], 'Unrelated or malformed hashes preserve the chosen group');
}
window.location.hash = '#project-fur-love-operations';
window.handlers.hashchange();
assert.deepEqual(cards.filter(card => !card.hidden).map(card => card.id), expectations[1][1], 'Operations fragments keep the related website visible');
controls.children[0].handlers.click();
assert(cards.every(card => !card.hidden), 'All four restores every card without changing the current URL');
assert.equal(window.location.hash, '#project-fur-love-operations');
window.location.hash = '#project%2Dsecure%2Dwatch';
window.handlers.hashchange();
assert.deepEqual(cards.filter(card => !card.hidden).map(card => card.id), expectations[2][1], 'Encoded fragment IDs are decoded safely');
assert.deepEqual(cards.map(card => card.body), originalBodies, 'Existing links, details, artwork and project text stay intact');
const originalGuide = guide;
vm.runInNewContext(script, { document, window });
assert.equal(guide, originalGuide, 'A repeated script must not insert duplicate controls');
guide = undefined;
window.location.hash = '#project-codecredit';
vm.runInNewContext(script, { document, window });
assert.deepEqual(cards.filter(card => !card.hidden).map(card => card.id), expectations[3][1], 'A direct project URL selects its group at startup');
vm.runInNewContext(script, { document: { querySelector: () => null } });
console.log('PASS: four-project fallback, each filter, paired Fur the Love builds, public selection/reset, direct URLs, hidden fragment navigation, unrelated/malformed hash preservation, accessible state/count, original card content, duplicate guard and missing-section fallback');
