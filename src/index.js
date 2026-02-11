'use strict';

/**
 * Main entry point for postcss-normalize-tool
 * Exports all three normalization plugins
 */

const explodePlugin = require('./explode-only.js');
const addDefaultsPlugin = require('./add-defaults.js');
const addUnitsPlugin = require('./add-units.js');

module.exports = {
  explode: explodePlugin,
  addDefaults: addDefaultsPlugin,
  addUnits: addUnitsPlugin,
};