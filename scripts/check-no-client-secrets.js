const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const allowedExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.json']);
const ignoredDirs = new Set(['.git', '.expo', '.vscode', 'node_modules']);
const ignoredFiles = new Set(['package-lock.json']);

const secretPatterns = [
  {
    label: 'OpenAI secret key',
    regex: /\bsk-[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    label: 'Spoonacular key assignment',
    regex: /SPOONACULAR_API_KEY\s*=\s*[A-Za-z0-9]{20,}/g,
  },
  {
    label: 'DeepAI key assignment',
    regex: /DEEPAI_API_KEY\s*=\s*[A-Za-z0-9_-]{20,}/g,
  },
];

const findings = [];

const walk = (dirPath) => {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (ignoredFiles.has(entry.name) || !allowedExtensions.has(path.extname(entry.name))) {
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    for (const pattern of secretPatterns) {
      const match = content.match(pattern.regex);
      if (match) {
        findings.push({
          file: path.relative(rootDir, fullPath),
          label: pattern.label,
          sample: match[0],
        });
      }
    }
  }
};

walk(rootDir);

if (findings.length > 0) {
  console.error('Client secret scan failed:');
  for (const finding of findings) {
    console.error(`- ${finding.file}: ${finding.label} (${finding.sample.slice(0, 18)}...)`);
  }
  process.exit(1);
}

console.log('Client secret scan passed.');
