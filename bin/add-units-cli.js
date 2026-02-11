#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const addUnitsPlugin = require('../src/add-units.js');

/**
 * 解析命令行参数
 */
function parseArgs(args) {
  const result = {
    input: null,
    output: null,
    ignore: [],
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-i' || arg === '--input') {
      result.input = args[++i];
    } else if (arg === '-o' || arg === '--output') {
      result.output = args[++i];
    } else if (arg === '--ignore') {
      result.ignore = args[++i].split(',').map((p) => p.trim());
    } else if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    }
  }

  return result;
}

/**
 * 打印帮助信息
 */
function printHelp() {
  console.log(`
Usage: node bin/add-units-cli.js [options]

Options:
  -i, --input <file>     Input CSS file path
  -o, --output <file>    Output CSS file path
  --ignore <props>       Comma-separated list of properties to ignore
  -h, --help             Show this help message

Example:
  node bin/add-units-cli.js -i input.css -o output.css
  node bin/add-units-cli.js -i input.css -o output.css --ignore line-height,opacity
`);
}

/**
 * 主函数
 */
async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.input || !args.output) {
    console.error('Error: Both --input and --output are required');
    printHelp();
    process.exit(1);
  }

  // 读取输入文件
  const inputPath = path.resolve(args.input);
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const css = fs.readFileSync(inputPath, 'utf8');
  const outputPath = path.resolve(args.output);

  // 确保输出目录存在
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // 处理 CSS
    const result = await postcss([addUnitsPlugin({ ignore: args.ignore })]).process(css, {
      from: inputPath,
      to: outputPath,
    });

    // 写入输出文件
    fs.writeFileSync(outputPath, result.css);
    console.log(`✓ Successfully processed ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error('Error processing CSS:', error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});