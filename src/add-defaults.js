'use strict';
const { list } = require('postcss');
const isCustomProp = require('./lib/isCustomProp.js');

/**
 * Default values for properties with optional parameters
 * @type {Record<string, {params: string[], defaults: string[], parser: (value: string) => string[]}>}
 */
const propertyDefaults = {
  // Animation properties
  'animation': {
    params: ['name', 'duration', 'timing-function', 'delay', 'iteration-count', 'direction', 'fill-mode', 'play-state'],
    defaults: ['none', '0s', 'ease', '0s', '1', 'normal', 'none', 'running'],
    parser: parseAnimation,
  },
  'animation-name': {
    params: ['name'],
    defaults: ['none'],
    parser: (v) => [v],
  },
  'animation-duration': {
    params: ['duration'],
    defaults: ['0s'],
    parser: (v) => list.comma(v),
  },
  'animation-timing-function': {
    params: ['timing-function'],
    defaults: ['ease'],
    parser: (v) => list.comma(v),
  },
  'animation-delay': {
    params: ['delay'],
    defaults: ['0s'],
    parser: (v) => list.comma(v),
  },
  'animation-iteration-count': {
    params: ['iteration-count'],
    defaults: ['1'],
    parser: (v) => list.comma(v),
  },
  'animation-direction': {
    params: ['direction'],
    defaults: ['normal'],
    parser: (v) => list.comma(v),
  },
  'animation-fill-mode': {
    params: ['fill-mode'],
    defaults: ['none'],
    parser: (v) => list.comma(v),
  },
  'animation-play-state': {
    params: ['play-state'],
    defaults: ['running'],
    parser: (v) => list.comma(v),
  },

  // Transition properties
  'transition': {
    params: ['property', 'duration', 'timing-function', 'delay'],
    defaults: ['all', '0s', 'ease', '0s'],
    parser: parseTransition,
  },
  'transition-property': {
    params: ['property'],
    defaults: ['all'],
    parser: (v) => list.comma(v),
  },
  'transition-duration': {
    params: ['duration'],
    defaults: ['0s'],
    parser: (v) => list.comma(v),
  },
  'transition-timing-function': {
    params: ['timing-function'],
    defaults: ['ease'],
    parser: (v) => list.comma(v),
  },
  'transition-delay': {
    params: ['delay'],
    defaults: ['0s'],
    parser: (v) => list.comma(v),
  },

  // Box shadow
  'box-shadow': {
    params: ['offset-x', 'offset-y', 'blur-radius', 'spread-radius', 'color', 'inset'],
    defaults: ['0', '0', '0', '0', 'currentcolor', ''],
    parser: parseBoxShadow,
  },

  // Outline
  'outline': {
    params: ['width', 'style', 'color'],
    defaults: ['medium', 'none', 'currentcolor'],
    parser: (v) => {
      const values = list.space(v);
      // Parse outline: width style color
      const result = [null, null, null];
      for (const val of values) {
        if (val === 'inherit' || val === 'initial' || val === 'unset') {
          return [val, val, val];
        }
        if (val.includes('px') || val.includes('em') || val.includes('rem') || val.includes('vw') || val.includes('vh')) {
          result[0] = val;
        } else if (['none', 'solid', 'dotted', 'dashed', 'double', 'groove', 'ridge', 'inset', 'outset'].includes(val)) {
          result[1] = val;
        } else {
          result[2] = val;
        }
      }
      return result;
    },
  },

  // Flex properties
  'flex': {
    params: ['grow', 'shrink', 'basis'],
    defaults: ['0', '1', '0%'],
    parser: parseFlex,
  },
  'flex-grow': {
    params: ['grow'],
    defaults: ['0'],
    parser: (v) => [v],
  },
  'flex-shrink': {
    params: ['shrink'],
    defaults: ['1'],
    parser: (v) => [v],
  },
  'flex-basis': {
    params: ['basis'],
    defaults: ['0%'],
    parser: (v) => [v],
  },

  // Grid gap
  'gap': {
    params: ['row-gap', 'column-gap'],
    defaults: ['normal', 'normal'],
    parser: (v) => {
      const values = list.space(v);
      return [values[0], values[1] || values[0]];
    },
  },
  'row-gap': {
    params: ['row-gap'],
    defaults: ['normal'],
    parser: (v) => [v],
  },
  'column-gap': {
    params: ['column-gap'],
    defaults: ['normal'],
    parser: (v) => [v],
  },

  // List style
  'list-style': {
    params: ['type', 'position', 'image'],
    defaults: ['disc', 'outside', 'none'],
    parser: parseListStyle,
  },
  'list-style-type': {
    params: ['type'],
    defaults: ['disc'],
    parser: (v) => [v],
  },
  'list-style-position': {
    params: ['position'],
    defaults: ['outside'],
    parser: (v) => [v],
  },
  'list-style-image': {
    params: ['image'],
    defaults: ['none'],
    parser: (v) => [v],
  },

  // Font
  'font': {
    params: ['style', 'variant', 'weight', 'stretch', 'size', 'line-height', 'family'],
    defaults: ['normal', 'normal', 'normal', 'normal', 'medium', 'normal', 'sans-serif'],
    parser: parseFont,
  },
};

/**
 * Parse animation value
 * @param {string} value
 * @return {string[]}
 */
function parseAnimation(value) {
  const animations = list.comma(value);
  const result = [];

  for (const anim of animations) {
    const parts = list.space(anim);
    const parsed = {
      name: 'none',
      duration: '0s',
      'timing-function': 'ease',
      delay: '0s',
      'iteration-count': '1',
      direction: 'normal',
      'fill-mode': 'none',
      'play-state': 'running',
    };

    for (const part of parts) {
      if (part === 'none') {
        parsed.name = part;
      } else if (part.endsWith('s') || part.endsWith('ms')) {
        if (parsed.duration === '0s') {
          parsed.duration = part;
        } else {
          parsed.delay = part;
        }
      } else if (['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier(', 'step-start', 'step-end', 'steps('].some(t => part.startsWith(t))) {
        parsed['timing-function'] = part;
      } else if (['infinite', '0', ...Array.from({length: 10}, (_, i) => String(i))].includes(part) || part.includes('.')) {
        if (parsed['iteration-count'] === '1') {
          parsed['iteration-count'] = part;
        }
      } else if (['normal', 'reverse', 'alternate', 'alternate-reverse'].includes(part)) {
        parsed.direction = part;
      } else if (['none', 'forwards', 'backwards', 'both'].includes(part)) {
        parsed['fill-mode'] = part;
      } else if (['running', 'paused'].includes(part)) {
        parsed['play-state'] = part;
      } else {
        parsed.name = part;
      }
    }

    result.push(
      parsed.name,
      parsed.duration,
      parsed['timing-function'],
      parsed.delay,
      parsed['iteration-count'],
      parsed.direction,
      parsed['fill-mode'],
      parsed['play-state']
    );
  }

  return result;
}

/**
 * Parse transition value
 * @param {string} value
 * @return {string[]}
 */
function parseTransition(value) {
  const transitions = list.comma(value);
  const result = [];

  for (const trans of transitions) {
    const parts = list.space(trans);
    const parsed = {
      property: 'all',
      duration: '0s',
      'timing-function': 'ease',
      delay: '0s',
    };

    for (const part of parts) {
      if (part === 'all') {
        parsed.property = part;
      } else if (part === 'none') {
        parsed.property = part;
      } else if (part.endsWith('s') || part.endsWith('ms')) {
        if (parsed.duration === '0s') {
          parsed.duration = part;
        } else {
          parsed.delay = part;
        }
      } else if (['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier(', 'step-start', 'step-end', 'steps('].some(t => part.startsWith(t))) {
        parsed['timing-function'] = part;
      } else {
        parsed.property = part;
      }
    }

    result.push(parsed.property, parsed.duration, parsed['timing-function'], parsed.delay);
  }

  return result;
}

/**
 * Parse box-shadow value
 * @param {string} value
 * @return {string[]}
 */
function parseBoxShadow(value) {
  const shadows = list.comma(value);
  const result = [];

  for (const shadow of shadows) {
    const parts = list.space(shadow);
    const parsed = {
      'offset-x': '0',
      'offset-y': '0',
      'blur-radius': '0',
      'spread-radius': '0',
      color: 'currentcolor',
      inset: '',
    };

    let index = 0;
    for (const part of parts) {
      if (part === 'inset') {
        parsed.inset = 'inset';
      } else if (index < 4 && (part.includes('px') || part.includes('em') || part.includes('rem') || part.includes('vw') || part.includes('vh') || part.includes('%'))) {
        if (index === 0) parsed['offset-x'] = part;
        else if (index === 1) parsed['offset-y'] = part;
        else if (index === 2) parsed['blur-radius'] = part;
        else parsed['spread-radius'] = part;
        index++;
      } else {
        parsed.color = part;
      }
    }

    result.push(parsed['offset-x'], parsed['offset-y'], parsed['blur-radius'], parsed['spread-radius'], parsed.color, parsed.inset);
  }

  return result;
}

/**
 * Parse flex value
 * @param {string} value
 * @return {string[]}
 */
function parseFlex(value) {
  const parts = list.space(value);
  const parsed = {
    grow: '0',
    shrink: '1',
    basis: '0%',
  };

  for (const part of parts) {
    if (part === 'none') {
      parsed.grow = '0';
      parsed.shrink = '0';
      parsed.basis = 'auto';
    } else if (part === 'auto') {
      parsed.basis = 'auto';
    } else if (part.includes('px') || part.includes('em') || part.includes('rem') || part.includes('%') || part === 'auto' || part === 'content') {
      parsed.basis = part;
    } else if (parsed.grow === '0') {
      parsed.grow = part;
    } else {
      parsed.shrink = part;
    }
  }

  return [parsed.grow, parsed.shrink, parsed.basis];
}

/**
 * Parse list-style value
 * @param {string} value
 * @return {string[]}
 */
function parseListStyle(value) {
  const parts = list.space(value);
  const parsed = {
    type: 'disc',
    position: 'outside',
    image: 'none',
  };

  for (const part of parts) {
    if (['none', 'disc', 'circle', 'square', 'decimal', 'decimal-leading-zero', 'lower-roman', 'upper-roman', 'lower-greek', 'lower-latin', 'upper-latin', 'armenian', 'georgian'].includes(part)) {
      parsed.type = part;
    } else if (['inside', 'outside'].includes(part)) {
      parsed.position = part;
    } else if (part.startsWith('url(') || part === 'none') {
      parsed.image = part;
    }
  }

  return [parsed.type, parsed.position, parsed.image];
}

/**
 * Parse font value
 * @param {string} value
 * @return {string[]}
 */
function parseFont(value) {
  const parts = list.space(value);
  const parsed = {
    style: 'normal',
    variant: 'normal',
    weight: 'normal',
    stretch: 'normal',
    size: 'medium',
    'line-height': 'normal',
    family: 'sans-serif',
  };

  let familyIndex = parts.length;
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (['normal', 'italic', 'oblique'].includes(part)) {
      parsed.style = part;
    } else if (['normal', 'small-caps'].includes(part)) {
      parsed.variant = part;
    } else if (['normal', 'bold', 'bolder', 'lighter', ...Array.from({length: 9}, (_, i) => String(100 + i * 100))].includes(part)) {
      parsed.weight = part;
    } else if (part.includes('/')) {
      const [size, lineHeight] = part.split('/');
      parsed.size = size;
      parsed['line-height'] = lineHeight;
    } else if (part.includes('px') || part.includes('em') || part.includes('rem') || part.includes('%') || part === 'medium' || part === 'xx-small' || part === 'x-small' || part === 'small' || part === 'large' || part === 'x-large' || part === 'xx-large' || part === 'smaller' || part === 'larger') {
      parsed.size = part;
      familyIndex = i + 1;
    }
  }

  if (familyIndex < parts.length) {
    parsed.family = parts.slice(familyIndex).join(' ');
  }

  return [parsed.style, parsed.variant, parsed.weight, parsed.stretch, parsed.size, parsed['line-height'], parsed.family];
}

/**
 * Check if a declaration can be processed
 * @param {import('postcss').Declaration} decl
 * @return {boolean}
 */
function canProcess(decl) {
  const globalKeywords = new Set(['inherit', 'initial', 'unset', 'revert']);
  if (!decl.value || isCustomProp(decl) || globalKeywords.has(decl.value.toLowerCase())) {
    return false;
  }
  return true;
}

/**
 * PostCSS plugin creator for adding default values to properties
 * @type {import('postcss').PluginCreator<{ignore?: string[]}>}
 * @return {import('postcss').Plugin}
 */
function pluginCreator(options = {}) {
  const ignoreProps = new Set(options.ignore || []);

  return {
    postcssPlugin: 'postcss-add-defaults',

    OnceExit(css) {
      css.walkDecls((decl) => {
        const prop = decl.prop.toLowerCase();

        if (ignoreProps.has(prop)) {
          return;
        }

        if (!canProcess(decl)) {
          return;
        }

        const config = propertyDefaults[prop];
        if (!config) {
          return;
        }

        const parsed = config.parser(decl.value);
        const result = [];

        // For multi-value properties like animation, transition, box-shadow
        if (['animation', 'transition', 'box-shadow'].includes(prop)) {
          // These are already parsed with defaults filled in
          result.push(...parsed);
        } else {
          // For single-value properties
          for (let i = 0; i < config.params.length; i++) {
            result.push(parsed[i] !== null && parsed[i] !== undefined ? parsed[i] : config.defaults[i]);
          }
        }

        decl.value = result.join(' ');
      });
    },
  };
}

pluginCreator.postcss = true;
module.exports = pluginCreator;