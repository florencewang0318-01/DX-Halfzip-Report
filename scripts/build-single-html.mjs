import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const srcDir = path.join(rootDir, "src");
const distDir = path.join(rootDir, "dist");
const distFile = path.join(distDir, "edited.single.html");

const templatePath = path.join(srcDir, "template.html");
const stylesPath = path.join(srcDir, "styles.css");
const modulePaths = [
  path.join(srcDir, "data", "ls-hz-inner-data.js"),
  path.join(srcDir, "content-data.js"),
  path.join(srcDir, "content-render.js"),
  path.join(srcDir, "chart-app.js"),
  path.join(srcDir, "inline-editor.js"),
  path.join(srcDir, "content-bootstrap.js")
];

function stripModuleSyntax(code) {
  return code
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*["'][^"']+["'];?\s*/g, "")
    .replace(/^export\s+/gm, "");
}

function wrapModule(filename, code) {
  return `\n// ${filename}\n${stripModuleSyntax(code).trim()}\n`;
}

async function build() {
  const [template, styles, ...modules] = await Promise.all([
    readFile(templatePath, "utf8"),
    readFile(stylesPath, "utf8"),
    ...modulePaths.map((filePath) => readFile(filePath, "utf8"))
  ]);

  const bundledJs = modules
    .map((code, index) => wrapModule(path.relative(rootDir, modulePaths[index]), code))
    .join("\n");

  const withInlineStyles = template.replace(
    '<link rel="stylesheet" href="./styles.css">',
    `<style>\n${styles}\n</style>`
  );

  const finalHtml = withInlineStyles.replace(
    '<script type="module" src="./content-bootstrap.js"></script>',
    `<script type="module">\n${bundledJs}\n</script>`
  );

  await mkdir(distDir, { recursive: true });
  await writeFile(distFile, finalHtml, "utf8");

  console.log(`Built ${path.relative(rootDir, distFile)}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
