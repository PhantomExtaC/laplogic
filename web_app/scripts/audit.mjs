import ts from 'typescript';
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { resolve, relative, dirname, extname } from 'node:path';
import { gzipSync } from 'node:zlib';

const walk = folder => readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(resolve(folder, entry.name)) : [resolve(folder, entry.name)]);
const sourceRoot = resolve('src');
const files = walk(sourceRoot).filter(file => /\.tsx?$/.test(file));
const production = files.filter(file => !/\.test\./.test(file));
const name = file => relative(sourceRoot, file).replaceAll('\\', '/');
const graph = new Map(), violations = [];
for (const file of files) {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const dependencies = [];
  const isProduction = production.includes(file);
  function visit(node) {
    let specifier;
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) specifier = node.moduleSpecifier.text;
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) specifier = node.arguments[0].text;
    if (specifier?.startsWith('.')) {
      const base = resolve(dirname(file), specifier);
      const dependency = [base, `${base}.ts`, `${base}.tsx`, resolve(base, 'index.ts'), resolve(base, 'index.tsx')].find(candidate => existsSync(candidate) && statSync(candidate).isFile());
      if (!dependency) violations.push(`${name(file)}: unresolved ${specifier}`);
      else dependencies.push(dependency);
    }
    if (isProduction && specifier && name(file).startsWith('domain/') && (!specifier.startsWith('.') || !resolve(dirname(file), specifier).startsWith(resolve('src/domain')))) violations.push(`${name(file)}: domain imports ${specifier}`);
    if (isProduction && specifier && /^(ui|charts)\//.test(name(file)) && /(^|\/)data\//.test(specifier)) violations.push(`${name(file)}: presentational layer imports data`);
    if (node.kind === ts.SyntaxKind.AnyKeyword) violations.push(`${name(file)}: explicit any`);
    if (isProduction && ts.isCallExpression(node) && node.expression.getText(source) === 'fetch' && name(file) !== 'data/client/fetchJson.ts') violations.push(`${name(file)}: fetch outside client`);
    if (ts.isCallExpression(node) && node.expression.getText(source) === 'console.log') violations.push(`${name(file)}: debug logging`);
    ts.forEachChild(node, visit);
  }
  visit(source); graph.set(file, dependencies);
}
function reachable(roots) {
  const seen = new Set();
  function visit(file) { if (seen.has(file)) return; seen.add(file); for (const next of graph.get(file) ?? []) visit(next); }
  roots.forEach(visit); return seen;
}
const live = reachable([resolve('src/main.tsx')]);
const tested = reachable(files.filter(file => /\.test\./.test(file)));
const unusedFiles = production.filter(file => !live.has(file) && !tested.has(file)).map(name);
const testOnlyModules = production.filter(file => !live.has(file) && tested.has(file)).map(name);

const publicRoot = resolve('public'), publicFiles = walk(publicRoot);
const exact = new Set(publicFiles.map(file => relative(publicRoot, file).replaceAll('\\', '/')));
const folded = new Map([...exact].map(path => [path.toLowerCase(), path]));
const missing = [], caseMismatches = [];
for (const file of publicFiles.filter(file => file.endsWith('.json'))) {
  const document = JSON.parse(readFileSync(file, 'utf8'));
  function inspect(value, trail) {
    if (typeof value === 'string' && value.startsWith('/images/')) {
      const path = value.slice(1);
      if (!exact.has(path)) {
        const record = { file: relative(resolve('public/data'), file).replaceAll('\\', '/'), field: trail, path: value };
        if (folded.has(path.toLowerCase())) caseMismatches.push({ ...record, actual: folded.get(path.toLowerCase()) });
        else missing.push(record);
      }
    } else if (Array.isArray(value)) value.forEach((item, index) => inspect(item, `${trail}[${index}]`));
    else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => inspect(item, `${trail}.${key}`));
  }
  inspect(document, '$');
}
const chunks = existsSync('dist/assets') ? walk(resolve('dist/assets')).filter(file => extname(file) === '.js').map(file => ({ file: relative(resolve('dist'), file).replaceAll('\\', '/'), bytes: statSync(file).size, gzipBytes: gzipSync(readFileSync(file)).length })).sort((a, b) => b.bytes - a.bytes) : [];
const report = { unusedFiles, testOnlyModules, violations, sourceFileCount: production.length, reachableFromApp: production.filter(file => live.has(file)).length, missingAssetReferences: missing.length, caseMismatches, chunks };
writeFileSync('../docs/frontend_audit.json', JSON.stringify(report, null, 2) + '\n');
writeFileSync('../docs/asset_audit.json', JSON.stringify({ caseMismatches, missing }, null, 2) + '\n');
console.info(JSON.stringify({ ...report, chunks: chunks.slice(0, 5), caseMismatches: caseMismatches.length }, null, 2));
if (unusedFiles.length || violations.length || caseMismatches.length) process.exitCode = 1;
