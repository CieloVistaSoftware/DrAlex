// Custom Playwright Markdown Report Generator

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const resultsPath = path.join(__dirname, 'reports', 'playwright-results.json');

function getReportPath(testFile) {
  const base = path.basename(testFile, path.extname(testFile));
  return path.join(__dirname, 'reports', `${base}-report.md`);
}


async function generateMarkdownReport(testFile) {
  const reportPath = getReportPath(testFile);
  try {
    await fs.access(resultsPath);
  } catch {
    await fs.writeFile(reportPath, `# Test Summary Report for ${testFile}\n\nNo test results found. Run Playwright tests first.`);
    return;
  }
  const data = JSON.parse(await fs.readFile(resultsPath, 'utf8'));
  let md = `# Test Summary Report for ${testFile}\n\n| File | Status | Description | Coverage |\n|------|--------|-------------|----------|\n`;
  for (const suite of data.suites || []) {
    if (suite.file === testFile) {
      for (const subsuite of suite.suites || []) {
        for (const test of subsuite.specs || []) {
          const file = subsuite.file || suite.file || 'unknown';
          const status = test.ok ? 'passed' : 'failed';
          const title = test.title || '';
          md += `| ${file} | ${status} | ${title} | N/A |\n`;
        }
      }
    }
  }
  await fs.writeFile(reportPath, md);
}

// If called directly, generate reports for all test files found in the Playwright JSON
if (process.argv[2]) {
  generateMarkdownReport(process.argv[2]);
} else {
  (async () => {
    try {
      await fs.access(resultsPath);
    } catch {
      await fs.writeFile(path.join(__dirname, 'reports', 'test-summary-report.md'), '# Test Summary Report\n\nNo test results found. Run Playwright tests first.');
      return;
    }
    const data = JSON.parse(await fs.readFile(resultsPath, 'utf8'));
    for (const suite of data.suites || []) {
      await generateMarkdownReport(suite.file);
    }
  })();
}
