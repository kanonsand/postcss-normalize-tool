// PostCSS Normalization Tool - Static Bundle
// This is a bundled version for static deployment

(function(window) {
  'use strict';

  // ============================================
  // PostCSS Value Parser (simplified version)
  // ============================================
  const valueParser = {
    unit: function(str) {
      if (!str) return false;
      const match = str.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
      if (!match) return false;
      return {
        number: match[1],
        unit: match[2]
      };
    }
  };

  // ============================================
  // Explode Plugin
  // ============================================
  function explodePlugin() {
    return {
      name: 'explode',
      process: function(css) {
        const trbl = ['top', 'right', 'bottom', 'left'];

        // Explode margin/padding
        css = css.replace(/(\w+(?:-\w+)*)\s*:\s*([^;]+);/g, function(match, prop, value) {
          const lowerProp = prop.toLowerCase();

          if (lowerProp === 'margin' || lowerProp === 'padding') {
            const values = value.trim().split(/\s+/);
            const prefix = lowerProp;
            const expanded = [];

            if (values.length === 1) {
              expanded.push(`${prefix}-top: ${values[0]};`);
              expanded.push(`${prefix}-right: ${values[0]};`);
              expanded.push(`${prefix}-bottom: ${values[0]};`);
              expanded.push(`${prefix}-left: ${values[0]};`);
            } else if (values.length === 2) {
              expanded.push(`${prefix}-top: ${values[0]};`);
              expanded.push(`${prefix}-right: ${values[1]};`);
              expanded.push(`${prefix}-bottom: ${values[0]};`);
              expanded.push(`${prefix}-left: ${values[1]};`);
            } else if (values.length === 3) {
              expanded.push(`${prefix}-top: ${values[0]};`);
              expanded.push(`${prefix}-right: ${values[1]};`);
              expanded.push(`${prefix}-bottom: ${values[2]};`);
              expanded.push(`${prefix}-left: ${values[1]};`);
            } else if (values.length === 4) {
              expanded.push(`${prefix}-top: ${values[0]};`);
              expanded.push(`${prefix}-right: ${values[1]};`);
              expanded.push(`${prefix}-bottom: ${values[2]};`);
              expanded.push(`${prefix}-left: ${values[3]};`);
            }
            return expanded.join(' ');
          }

          return match;
        });

        return css;
      }
    };
  }

  // ============================================
  // Add Defaults Plugin
  // ============================================
  function addDefaultsPlugin(options) {
    const ignore = new Set((options && options.ignore) || []);

    return {
      name: 'addDefaults',
      process: function(css) {
        return css.replace(/(\w+(?:-\w+)*)\s*:\s*([^;]+);/g, function(match, prop, value) {
          const lowerProp = prop.toLowerCase();
          if (ignore.has(lowerProp)) return match;

          // Animation defaults
          if (lowerProp === 'animation') {
            const parts = value.trim().split(/\s+/);
            let result = value;

            if (!parts.some(p => p.endsWith('s') || p.endsWith('ms'))) {
              result += ' 0s';
            }
            if (!parts.some(p => ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out'].some(t => p.startsWith(t)))) {
              result += ' ease';
            }
            if (parts.filter(p => p.endsWith('s') || p.endsWith('ms')).length < 2) {
              result += ' 0s';
            }
            if (!parts.some(p => ['1', '2', '3', '4', '5', 'infinite'].includes(p))) {
              result += ' 1';
            }
            if (!parts.some(p => ['normal', 'reverse', 'alternate', 'alternate-reverse'].includes(p))) {
              result += ' normal';
            }
            if (!parts.some(p => ['none', 'forwards', 'backwards', 'both'].includes(p))) {
              result += ' none';
            }
            if (!parts.some(p => ['running', 'paused'].includes(p))) {
              result += ' running';
            }

            return `${prop}: ${result};`;
          }

          // Transition defaults
          if (lowerProp === 'transition') {
            const parts = value.trim().split(/\s+/);
            let result = value;

            if (!parts.some(p => p.endsWith('s') || p.endsWith('ms'))) {
              result += ' 0s';
            }
            if (!parts.some(p => ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out'].some(t => p.startsWith(t)))) {
              result += ' ease';
            }
            if (parts.filter(p => p.endsWith('s') || p.endsWith('ms')).length < 2) {
              result += ' 0s';
            }

            return `${prop}: ${result};`;
          }

          // Box shadow defaults
          if (lowerProp === 'box-shadow') {
            const parts = value.trim().split(/\s+/);
            let result = value;

            const numericValues = parts.filter(p => /^-?\d+/.test(p));
            if (numericValues.length === 2) {
              result += ' 0 0';
            } else if (numericValues.length === 3) {
              result += ' 0';
            }

            if (!parts.some(p => ['#', 'rgb', 'hsl', 'rgba', 'hsla', 'color(', 'currentcolor'].some(t => p.toLowerCase().startsWith(t)))) {
              result += ' currentcolor';
            }

            return `${prop}: ${result};`;
          }

          // Flex defaults
          if (lowerProp === 'flex') {
            const parts = value.trim().split(/\s+/);
            let result = value;

            if (parts.length === 1) {
              if (parts[0] === 'none') {
                result = '0 0 auto';
              } else if (/^\d+$/.test(parts[0])) {
                result = `${parts[0]} 1 0%`;
              } else if (parts[0] === 'auto') {
                result = '1 1 auto';
              }
            } else if (parts.length === 2) {
              result += ' 0%';
            }

            return `${prop}: ${result};`;
          }

          return match;
        });
      }
    };
  }

  // ============================================
  // Add Units Plugin
  // ============================================
  function addUnitsPlugin(options) {
    const ignore = new Set((options && options.ignore) || []);

    const propertyUnitMap = {
      'width': 'px', 'height': 'px', 'margin': 'px', 'margin-top': 'px',
      'margin-right': 'px', 'margin-bottom': 'px', 'margin-left': 'px',
      'padding': 'px', 'padding-top': 'px', 'padding-right': 'px',
      'padding-bottom': 'px', 'padding-left': 'px',
      'border-width': 'px', 'border-radius': 'px',
      'top': 'px', 'right': 'px', 'bottom': 'px', 'left': 'px',
      'min-width': 'px', 'max-width': 'px', 'min-height': 'px', 'max-height': 'px',
      'text-indent': 'px', 'letter-spacing': 'px', 'word-spacing': 'px',
      'column-width': 'px', 'gap': 'px', 'flex-basis': 'px',
      'background-size': 'px', 'background-position': 'px',
      'transform-origin': 'px',
      'grid-template-columns': 'px', 'grid-template-rows': 'px',
      'stroke-width': 'px', 'stroke-dasharray': 'px',
      'font-size': 'px',
      'transition': 's', 'transition-duration': 's', 'transition-delay': 's',
      'animation': 's', 'animation-duration': 's', 'animation-delay': 's',
      'transform': 'deg', 'rotate': 'deg', 'skew': 'deg',
    };

    return {
      name: 'addUnits',
      process: function(css) {
        return css.replace(/(\w+(?:-\w+)*)\s*:\s*([^;]+);/g, function(match, prop, value) {
          const lowerProp = prop.toLowerCase();
          if (ignore.has(lowerProp)) return match;

          const defaultUnit = propertyUnitMap[lowerProp];
          if (!defaultUnit) return match;

          const newValue = value.replace(/\b0\b/g, `0${defaultUnit}`);
          return `${prop}: ${newValue};`;
        });
      }
    };
  }

  // ============================================
  // Beautify Plugin
  // ============================================
  function beautifyPlugin() {
    return {
      name: 'beautify',
      process: function(css) {
        const rules = css.split('}').filter(r => r.trim());
        const beautified = rules.map(rule => {
          const trimmed = rule.trim();
          if (!trimmed) return '';

          const braceIndex = trimmed.indexOf('{');
          if (braceIndex === -1) return trimmed;

          const selector = trimmed.substring(0, braceIndex).trim();
          const declarations = trimmed.substring(braceIndex + 1).trim();

          if (!declarations) return `${selector} {}`;

          const decls = declarations.split(';')
            .map(d => d.trim())
            .filter(d => d)
            .map(d => `    ${d};`)
            .join('\n');

          return `${selector} {\n${decls}\n}`;
        }).join('\n\n');

        return beautified;
      }
    };
  }

  // ============================================
  // Main API
  // ============================================
  window.PostCSSNormalizeTool = {
    explode: explodePlugin,
    addDefaults: addDefaultsPlugin,
    addUnits: addUnitsPlugin,
    beautify: beautifyPlugin,

    process: function(css, options) {
      options = options || {};
      const plugins = [];

      if (options.explode !== false) {
        plugins.push(explodePlugin());
      }
      if (options.addDefaults !== false) {
        plugins.push(addDefaultsPlugin(options.addDefaultsOptions));
      }
      if (options.addUnits !== false) {
        plugins.push(addUnitsPlugin(options.addUnitsOptions));
      }
      if (options.beautify) {
        plugins.push(beautifyPlugin());
      }

      let result = css;
      plugins.forEach(plugin => {
        result = plugin.process(result);
      });

      return {
        css: result,
        warnings: []
      };
    }
  };

})(typeof window !== 'undefined' ? window : global);