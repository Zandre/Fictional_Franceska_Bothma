// Minimal SCSS compiler for this project's dialect (variables, maps, the four
// map functions, no-arg mixins and @include below()). Run with the project's
// script runner; the real toolchain is `sass scss/main.scss css/main.css`.
export async function compile({ readFile, saveFile, log }) {
  const order = ['_tokens', '_mixins', '_base', '_layout', '_components', '_animations'];
  let src = '';
  for (const f of order) src += '\n/* ===== ' + f.slice(1) + ' ===== */\n' + await readFile('site/scss/' + f + '.scss');

  src = src.replace(/^\s*@use\s+[^\n]*\n/gm, '');
  src = src.split('\n').map(l => l.trim().startsWith('//') ? '' : l.replace(/\s{2,}\/\/.*$/, '').replace(/\s\/\/\s.*$/, '')).join('\n');

  const maps = {};
  src = src.replace(/\$(green|honey|neutral|space)\s*:\s*\(([\s\S]*?)\)\s*;/g, (m, name, body) => {
    const o = {};
    body.split(',').forEach(p => { const q = p.split(':'); if (q.length === 2) o[q[0].trim()] = q[1].trim(); });
    maps[name] = o; return '';
  });

  const vars = {};
  src = src.replace(/^[ \t]*\$([\w-]+)\s*:\s*([^;\n]+);[ \t]*$/gm, (m, k, v) => { vars[k] = v.trim(); return ''; });
  src = src.replace(/^[ \t]*@function[^\n]*$/gm, '');

  const mixins = {};
  let out = '', i = 0;
  while (i < src.length) {
    const idx = src.indexOf('@mixin', i);
    if (idx < 0) { out += src.slice(i); break; }
    out += src.slice(i, idx);
    const open = src.indexOf('{', idx);
    const name = src.slice(idx + 6, open).trim().split('(')[0].trim();
    let depth = 1, j = open + 1;
    while (j < src.length && depth > 0) {
      const c = src[j];
      if (c === '#' && src[j + 1] === '{') {      // skip the whole #{…} token
        j = src.indexOf('}', j + 2);
        if (j < 0) throw new Error('unterminated interpolation in @mixin ' + name);
        j++;
        continue;
      }
      if (c === '{') depth++;
      else if (c === '}') depth--;
      j++;
    }
    mixins[name] = src.slice(open + 1, j - 1).trim();
    i = j;
  }
  src = out;

  for (let p = 0; p < 3; p++) src = src.replace(/@include\s+([\w-]+)\s*;/g, (m, n) => mixins[n] !== undefined ? mixins[n] : m);
  src = src.replace(/@include\s+below\(([^)]+)\)\s*\{/g, (m, arg) => {
    const a = arg.trim();
    return '@media (max-width: ' + (a.startsWith('$') ? vars[a.slice(1)] : a) + ') {';
  });

  const fn = (n, s) => {
    const v = maps[n === 'sp' ? 'space' : n]?.[s.trim()];
    if (!v) throw new Error('unresolved ' + n + '(' + s + ')');
    return v;
  };
  const resolve = s => s
    .replace(/\b(sp|green|honey|neutral)\(\s*([\w-]+)\s*\)/g, (m, n, a) => fn(n, a))
    .replace(/\$([\w-]+)/g, (m, k) => { if (vars[k] === undefined) throw new Error('unresolved $' + k); return vars[k]; })
    .replace(/#\{([^}]+)\}/g, (m, e) => e.trim());
  for (let n = 0; n < 4; n++) src = resolve(src);

  src = src.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
  const left = src.match(/\$[\w-]+|@include|@mixin\b|#\{|@function/g) || [];
  if (left.length) throw new Error('unresolved SCSS: ' + left.join(', '));

  // Sanity checks — the mixin extractor used to swallow the rule following the
  // last @mixin, silently dropping it from the output.
  for (const must of ['box-sizing: border-box', '.plate__slot', '.bee__wing', '.tree__trunk']) {
    if (!src.includes(must)) throw new Error('compiled CSS is missing: ' + must);
  }
  const braces = (src.match(/\{/g) || []).length - (src.match(/\}/g) || []).length;
  if (braces !== 0) throw new Error('unbalanced braces in compiled CSS: ' + braces);

  await saveFile('site/css/main.css',
    '/* Franceska Bothma — online profile\n   Compiled from scss/main.scss  (sass scss/main.scss css/main.css --style=expanded)\n   Edit the SCSS, not this file. */\n\n' + src + '\n');
  log && log('compiled', src.length, 'bytes');
}
