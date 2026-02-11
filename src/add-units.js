'use strict';
const valueParser = require('postcss-value-parser');

/**
 * CSS 属性到默认单位的映射
 * 基于 postcss-convert-values 的 LENGTH_UNITS 集合和 CSS 规范
 */
const PROPERTY_UNIT_MAP = {
  // 长度属性 - 默认 px
  'width': 'px',
  'height': 'px',
  'margin': 'px',
  'margin-top': 'px',
  'margin-right': 'px',
  'margin-bottom': 'px',
  'margin-left': 'px',
  'padding': 'px',
  'padding-top': 'px',
  'padding-right': 'px',
  'padding-bottom': 'px',
  'padding-left': 'px',
  'border-width': 'px',
  'border-top-width': 'px',
  'border-right-width': 'px',
  'border-bottom-width': 'px',
  'border-left-width': 'px',
  'border-radius': 'px',
  'border-top-left-radius': 'px',
  'border-top-right-radius': 'px',
  'border-bottom-left-radius': 'px',
  'border-bottom-right-radius': 'px',
  'border-spacing': 'px',
  'outline-width': 'px',
  'outline-offset': 'px',
  'top': 'px',
  'right': 'px',
  'bottom': 'px',
  'left': 'px',
  'min-width': 'px',
  'max-width': 'px',
  'min-height': 'px',
  'max-height': 'px',
  'text-indent': 'px',
  'text-shadow': 'px',
  'letter-spacing': 'px',
  'word-spacing': 'px',
  'column-width': 'px',
  'column-gap': 'px',
  'row-gap': 'px',
  'gap': 'px',
  'flex-basis': 'px',
  'background-size': 'px',
  'background-position': 'px',
  'background-position-x': 'px',
  'background-position-y': 'px',
  'object-position': 'px',
  'offset-distance': 'px',
  'offset-path': 'px',
  'offset-rotate': 'px',
  'transform-origin': 'px',
  'perspective-origin': 'px',
  'grid-template-columns': 'px',
  'grid-template-rows': 'px',
  'grid-auto-columns': 'px',
  'grid-auto-rows': 'px',
  'grid-column-gap': 'px',
  'grid-row-gap': 'px',
  'stroke-width': 'px',
  'stroke-dasharray': 'px',
  'stroke-dashoffset': 'px',
  'mask-position': 'px',
  'mask-size': 'px',
  'mask-origin': 'px',
  'mask-border-width': 'px',
  'clip-path': 'px',
  'font-size': 'px',
  'line-height': '',  // line-height 的 0 不需要单位
  'font-size-adjust': '',
  'vertical-align': '',

  // 时间属性 - 默认 s
  'transition': 's',
  'transition-duration': 's',
  'transition-delay': 's',
  'animation': 's',
  'animation-duration': 's',
  'animation-delay': 's',

  // 角度属性 - 默认 deg
  'transform': 'deg',
  'rotate': 'deg',
  'rotate-x': 'deg',
  'rotate-y': 'deg',
  'rotate-z': 'deg',
  'rotate3d': 'deg',
  'skew': 'deg',
  'skew-x': 'deg',
  'skew-y': 'deg',
  'perspective': 'px',
  'hue-rotate': 'deg',
  'azimuth': 'deg',
  'elevation': 'deg',

  // 频率属性 - 默认 Hz
  'audio-pitch': 'Hz',

  // 分辨率属性 - 默认 dppx
  'resolution': 'dppx',
};

/**
 * 时间单位集合
 */
const TIME_UNITS = new Set(['ms', 's']);

/**
 * 角度单位集合
 */
const ANGLE_UNITS = new Set(['deg', 'grad', 'rad', 'turn']);

/**
 * 长度单位集合（来自 postcss-convert-values）
 */
const LENGTH_UNITS = new Set([
  'em', 'ex', 'ch', 'rem', 'vw', 'vh', 'vmin', 'vmax',
  'cm', 'mm', 'q', 'in', 'pt', 'pc', 'px',
]);

/**
 * 不应添加单位的属性（数字值本身就是有效的）
 */
const NO_UNIT_PROPERTIES = new Set([
  'line-height',
  'font-weight',
  'opacity',
  'z-index',
  'order',
  'flex-grow',
  'flex-shrink',
  'counter-increment',
  'counter-reset',
  'orphans',
  'widows',
  'fill-opacity',
  'flood-opacity',
  'stop-opacity',
  'stroke-opacity',
  'shape-image-threshold',
  'column-count',
  'animation-iteration-count',
]);

/**
 * 检查属性是否需要添加单位
 */
function shouldAddUnit(decl) {
  const prop = decl.prop.toLowerCase();
  return (
    !NO_UNIT_PROPERTIES.has(prop) &&
    !prop.startsWith('--') &&
    PROPERTY_UNIT_MAP[prop] !== undefined
  );
}

/**
 * 获取属性的默认单位
 */
function getDefaultUnit(prop) {
  return PROPERTY_UNIT_MAP[prop.toLowerCase()] || '';
}

/**
 * 从单位推断单位类型
 */
function getUnitType(unit) {
  const u = unit.toLowerCase();
  if (LENGTH_UNITS.has(u)) return 'length';
  if (TIME_UNITS.has(u)) return 'time';
  if (ANGLE_UNITS.has(u)) return 'angle';
  return 'unknown';
}

/**
 * 判断是否应该保留这个单位（用于多值属性中已有单位的情况）
 */
function shouldKeepUnit(unit, defaultUnit) {
  if (!unit) return false;
  if (!defaultUnit) return false;

  const unitType = getUnitType(unit);
  const defaultType = getUnitType(defaultUnit);

  return unitType === defaultType;
}

/**
 * 处理节点值
 */
function processNode(node, defaultUnit, inFunction) {
  if (node.type === 'word') {
    const pair = valueParser.unit(node.value);
    if (pair) {
      const num = Number(pair.number);
      const unit = pair.unit;

      // 如果值为 0 且没有单位，添加默认单位
      if (num === 0 && !unit && defaultUnit) {
        node.value = '0' + defaultUnit;
      }
    }
  } else if (node.type === 'function') {
    const funcName = node.value.toLowerCase();

    // 某些函数内的值不应该添加单位
    if (['calc', 'min', 'max', 'clamp', 'var'].includes(funcName)) {
      return;
    }

    // 递归处理函数内部的节点
    node.nodes.forEach((n) => processNode(n, defaultUnit, true));
  }
}

/**
 * 处理声明值
 */
function transform(decl) {
  if (!shouldAddUnit(decl)) {
    return;
  }

  const defaultUnit = getDefaultUnit(decl.prop);
  if (!defaultUnit) {
    return;
  }

  const parsed = valueParser(decl.value);
  let changed = false;

  parsed.walk((node) => {
    const originalValue = node.value;
    processNode(node, defaultUnit, false);
    if (originalValue !== node.value) {
      changed = true;
    }
  });

  if (changed) {
    decl.value = parsed.toString();
  }
}

/**
 * PostCSS 插件创建器
 */
function pluginCreator(options = {}) {
  const ignoreProps = new Set((options.ignore || []).map((p) => p.toLowerCase()));

  return {
    postcssPlugin: 'postcss-add-units',

    OnceExit(css) {
      css.walkDecls((decl) => {
        if (ignoreProps.has(decl.prop.toLowerCase())) {
          return;
        }
        transform(decl);
      });
    },
  };
}

pluginCreator.postcss = true;
module.exports = pluginCreator;