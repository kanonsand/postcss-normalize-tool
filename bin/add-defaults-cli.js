#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const addDefaultsPlugin = require('../src/add-defaults.js');

/**
 * Parse command line arguments
 * @param {string[]} args
 * @return {{input: string, output: string, ignore: string[]}}
 */
function parseArgs(args) {
  const inputIndex = args.indexOf('-i') !== -1 ? args.indexOf('-i') + 1 : args.indexOf('--input') !== -1 ? args.indexOf('--input') + 1 : -1;
  const outputIndex = args.indexOf('-o') !== -1 ? args.indexOf('-o') + 1 : args.indexOf('--output') !== -1 ? args.indexOf('--output') + 1 : -1;
  const ignoreIndex = args.indexOf('--ignore') !== -1 ? args.indexOf('--ignore') + 1 : -1;

  if (inputIndex === -1 || outputIndex === -1 || !args[inputIndex] || !args[outputIndex]) {
    console.error('Usage: add-defaults-cli -i <input-file> -o <output-file> [--ignore prop1,prop2,...]');
    console.error('   or: add-defaults-cli --input <input-file> --output <output-file> [--ignore prop1,prop2,...]');
    process.exit(1);
  }

  const ignore = ignoreIndex !== -1 && args[ignoreIndex] ? args[ignoreIndex].split(',').map(p => p.trim()) : [];

  return {
    input: args[inputIndex],
    output: args[outputIndex],
    ignore,
  };
}

/**
 * Add default values to CSS properties
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {string[]} ignoreProps
 */
async function addDefaultsToCss(inputPath, outputPath, ignoreProps) {
  try {
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error(`Error: Input file not found: ${inputPath}`);
      process.exit(1);
    }

    // Read input file
    const css = fs.readFileSync(inputPath, 'utf8');

    // Process CSS
    const result = await postcss([addDefaultsPlugin({ ignore: ignoreProps })]).process(css, {
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

    console.log(`Successfully added default values: ${inputPath} -> ${outputPath}`);

    if (ignoreProps.length > 0) {
      console.log(`Ignored properties: ${ignoreProps.join(', ')}`);
    }

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
const { input, output, ignore } = parseArgs(args);
addDefaultsToCss(input, output, ignore);
