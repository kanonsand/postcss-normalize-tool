#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const explodePlugin = require('../src/explode-only.js');

/**
 * Parse command line arguments
 * @param {string[]} args
 * @return {{input: string, output: string}}
 */
function parseArgs(args) {
  const inputIndex = args.indexOf('-i') !== -1 ? args.indexOf('-i') + 1 : args.indexOf('--input') !== -1 ? args.indexOf('--input') + 1 : -1;
  const outputIndex = args.indexOf('-o') !== -1 ? args.indexOf('-o') + 1 : args.indexOf('--output') !== -1 ? args.indexOf('--output') + 1 : -1;

  if (inputIndex === -1 || outputIndex === -1 || !args[inputIndex] || !args[outputIndex]) {
    console.error('Usage: explode-cli -i <input-file> -o <output-file>');
    console.error('   or: explode-cli --input <input-file> --output <output-file>');
    process.exit(1);
  }

  return {
    input: args[inputIndex],
    output: args[outputIndex],
  };
}

/**
 * Normalize CSS file
 * @param {string} inputPath
 * @param {string} outputPath
 */
async function normalizeCss(inputPath, outputPath) {
  try {
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error(`Error: Input file not found: ${inputPath}`);
      process.exit(1);
    }

    // Read input file
    const css = fs.readFileSync(inputPath, 'utf8');

    // Process CSS
    const result = await postcss([explodePlugin]).process(css, {
      from: inputPath,
      to: outputPath,
    });

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write output file
    fs.writeFileSync(outputPath, result.css, 'utf8');

    console.log(`Successfully normalized CSS: ${inputPath} -> ${outputPath}`);

    if (result.warnings().length > 0) {
      console.warn('\nWarnings:');
      result.warnings().forEach(warning => {
        console.warn(`  ${warning.toString()}`);
      });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Main entry point
const args = process.argv.slice(2);
const { input, output } = parseArgs(args);
normalizeCss(input, output);