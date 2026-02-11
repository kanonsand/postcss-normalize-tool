'use strict';
const { list } = require('postcss');
const stylehacks = require('stylehacks');
const parseTrbl = require('./lib/parseTrbl.js');
const parseWsc = require('./lib/parseWsc.js');
const insertCloned = require('./lib/insertCloned.js');
const isCustomProp = require('./lib/isCustomProp.js');
const { isValidWsc } = require('./lib/validateWsc.js');

const trbl = ['top', 'right', 'bottom', 'left'];
const wsc = ['width', 'style', 'color'];
const defaults = ['medium', 'none', 'currentcolor'];

/**
 * Check if a declaration can be exploded
 * @param {import('postcss').Declaration} decl
 * @return {boolean}
 */
function canExplode(decl) {
  const globalKeywords = new Set(['inherit', 'initial', 'unset', 'revert']);
  if (!decl.value || isCustomProp(decl) || globalKeywords.has(decl.value.toLowerCase())) {
    return false;
  }
  return true;
}

/**
 * Explode margin/padding properties
 * @param {import('postcss').Rule} rule
 * @param {string} prop - 'margin' or 'padding'
 */
function explodeBoxBase(rule, prop) {
  const properties = trbl.map((direction) => `${prop}-${direction}`);

  rule.walkDecls(new RegExp('^' + prop + '$', 'i'), (decl) => {
    if (!canExplode(decl)) {
      return;
    }

    if (stylehacks.detect(decl)) {
      return;
    }

    const values = parseTrbl(decl.value);

    trbl.forEach((direction, index) => {
      insertCloned(
        /** @type {import('postcss').Rule} */ (decl.parent),
        decl,
        {
          prop: properties[index],
          value: values[index],
        }
      );
    });

    decl.remove();
  });
}

/**
 * Explode columns property
 * @param {import('postcss').Rule} rule
 */
function explodeColumns(rule) {
  const properties = ['column-width', 'column-count'];
  const auto = 'auto';

  rule.walkDecls(/^columns$/i, (decl) => {
    if (!canExplode(decl)) {
      return;
    }

    if (stylehacks.detect(decl)) {
      return;
    }

    let values = list.space(decl.value);

    if (values.length === 1) {
      values.push(auto);
    }

    values.forEach((value, i) => {
      let prop = properties[1];
      const dimension = value.match(/^[\d.]+[a-z%]*$/i);

      if (value.toLowerCase() === auto) {
        prop = properties[i];
      } else if (dimension) {
        prop = properties[0];
      }

      insertCloned(/** @type {import('postcss').Rule} */ (decl.parent), decl, {
        prop,
        value,
      });
    });

    decl.remove();
  });
}

/**
 * Helper to create border property name
 * @param {...string} parts
 * @return {string}
 */
function borderProperty(...parts) {
  return `border-${parts.join('-')}`;
}

/**
 * Explode border properties
 * @param {import('postcss').Rule} rule
 */
function explodeBorders(rule) {
  const directions = trbl.map((d) => borderProperty(d));
  const properties = wsc.map((w) => borderProperty(w));

  rule.walkDecls(/^border/i, (decl) => {
    if (!canExplode(decl)) {
      return;
    }

    if (stylehacks.detect(decl)) {
      return;
    }

    const prop = decl.prop.toLowerCase();

    // border -> border-top/bottom/left/right
    if (prop === 'border') {
      if (isValidWsc(parseWsc(decl.value))) {
        directions.forEach((direction) => {
          insertCloned(
            /** @type {import('postcss').Rule} */ (decl.parent),
            decl,
            { prop: direction }
          );
        });
        decl.remove();
      }
    }

    // border-top/bottom/left/right -> border-top-width/style/color
    if (directions.some((direction) => prop === direction)) {
      let values = parseWsc(decl.value);

      if (isValidWsc(values)) {
        wsc.forEach((d, i) => {
          insertCloned(
            /** @type {import('postcss').Rule} */ (decl.parent),
            decl,
            {
              prop: `${prop}-${d}`,
              value: values[i] || defaults[i],
            }
          );
        });
        decl.remove();
      }
    }

    // border-width/style/color -> border-top/bottom/left/right-width/style/color
    wsc.some((style) => {
      if (prop !== borderProperty(style)) {
        return false;
      }

      if (isCustomProp(decl)) {
        decl.prop = decl.prop.toLowerCase();
        return false;
      }

      parseTrbl(decl.value).forEach((value, i) => {
        insertCloned(
          /** @type {import('postcss').Rule} */ (decl.parent),
          decl,
          {
            prop: borderProperty(trbl[i], style),
            value,
          }
        );
      });

      return decl.remove();
    });
  });
}

/**
 * PostCSS plugin creator for explode-only normalization
 * @type {import('postcss').PluginCreator<void>}
 * @return {import('postcss').Plugin}
 */
function pluginCreator() {
  return {
    postcssPlugin: 'postcss-explode-longhand',

    OnceExit(css) {
      css.walkRules((rule) => {
        explodeBoxBase(rule, 'margin');
        explodeBoxBase(rule, 'padding');
        explodeColumns(rule);
        explodeBorders(rule);
      });
    },
  };
}

pluginCreator.postcss = true;
module.exports = pluginCreator;