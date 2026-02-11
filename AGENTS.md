# postcss-normalize-tool 项目上下文

## 项目概述

`postcss-normalize-tool` 是一个 CSS 标准化工具，提供在线界面将 CSS 简写属性展开为长格式，并添加默认值和单位。

**主要功能：**
- 展开简写属性（margin、padding、border 等）
- 为动画、过渡等属性添加默认值
- 为无单位的零值添加默认单位
- 美化 CSS 输出格式

**核心技术栈：**
- 纯前端实现（无服务器依赖）
- 原生 JavaScript（ES6+）
- 响应式设计（CSS Grid/Flexbox）
- 可部署为静态页面（GitHub Pages、nginx 等）

**项目结构：**
```
postcss-normalize-tool/
├── demo-static.html    # 主应用页面
├── dist.js             # 核心逻辑实现
├── package.json        # 包配置
├── README.md           # 项目文档
├── AGENTS.md           # AI 代理上下文（本文件）
├── .github/workflows/  # GitHub Actions 工作流
│   └── deploy-gh-pages.yml
└── GITHUB_PAGES_DEPLOYMENT.md
```

## 核心功能

### 1. Explode Shorthands（展开简写属性）

展开 CSS 简写属性为完整的长格式属性：

**支持的属性：**
- `margin` → `margin-top/right/bottom/left`
- `padding` → `padding-top/right/bottom/left`
- `columns` → `column-count`, `column-width`
- `border` → `border-top/right/bottom/left`
- `border-*` → `border-*-width/style/color`

**示例：**
```css
/* 输入 */
.box { margin: 10px 20px; }

/* 输出 */
.box { margin-top: 10px; margin-right: 20px; margin-bottom: 10px; margin-left: 20px; }
```

### 2. Add Defaults（添加默认值）

为 CSS 属性添加缺失的可选参数：

**支持的属性：**
- `animation`: 添加 timing-function、delay、iteration-count 等
- `transition`: 添加 property、timing-function、delay
- `box-shadow`: 添加 blur-radius、spread-radius、color
- `flex`: 添加 grow、shrink、basis
- `gap`: 添加 row-gap、column-gap
- `outline`: 添加 width、style、color
- `list-style`: 添加 type、position、image
- `font`: 添加 style、variant、weight 等

**示例：**
```css
/* 输入 */
.box { animation: fade 2s; box-shadow: 5px 5px; flex: 1; }

/* 输出 */
.box { animation: fade 2s ease 0s 1 normal none running; box-shadow: 5px 5px 0 0 currentcolor; flex: 1 1 0%; }
```

### 3. Add Units（添加单位）

为无单位的零值添加默认单位：

**支持的单位类型：**
- 长度单位：px
- 时间单位：s
- 角度单位：deg

**示例：**
```css
/* 输入 */
.box { margin: 0; padding: 0 10px 0; transition: opacity 0; transform: rotate(0); }

/* 输出 */
.box { margin: 0px; padding: 0px 10px 0px; transition: opacity 0s; transform: rotate(0deg); }
```

### 4. Beautify Output（美化输出）

格式化 CSS 代码以提高可读性：
- 规则之间添加空行
- 声明缩进 2 个空格
- 规范化选择器和花括号格式

## 使用方式

### 在线使用

1. 打开 `demo-static.html`
2. 在输入框中粘贴 CSS 代码
3. 选择需要的选项：
   - Explode Shorthands（默认开启）
   - Add Defaults（默认开启）
   - Add Units（默认开启）
   - Beautify Output（默认开启）
4. 结果自动实时显示在输出框
5. 点击 "Copy" 按钮复制结果

### 命令行使用（未来）

```bash
# 展开简写属性
explode-cli -i input.css -o output.css

# 添加默认值
add-defaults-cli -i input.css -o output.css

# 添加单位
add-units-cli -i input.css -o output.css
```

## 部署方式

### GitHub Pages 部署（推荐）

1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 "GitHub Actions" 作为源
4. 自动部署到 `https://<username>.github.io/<repo>/`

详细步骤见 `GITHUB_PAGES_DEPLOYMENT.md`

### 静态服务器部署

```bash
# 使用 Python 简单服务器
python3 -m http.server 8000

# 访问 http://localhost:8000/demo-static.html
```

### Nginx 部署

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/postcss-normalize-tool;
    
    location / {
        try_files $uri $uri/ /demo-static.html;
    }
}
```

## 技术实现

### 核心文件

1. **`dist.js`** - 包含所有 CSS 处理逻辑
   - `PostCSSNormalizeTool` - 主处理对象
   - `explodeShorthands()` - 简写属性展开
   - `addDefaults()` - 默认值添加
   - `addUnits()` - 单位添加
   - `beautifyCSS()` - 代码美化

2. **`demo-static.html`** - 用户界面
   - 双栏编辑器（输入/输出）
   - 选项控制面板
   - 统计信息显示
   - 自动转换触发

### 关键算法

#### 简写属性展开
- TRBL 解析（Top-Right-Bottom-Left）
- WSC 解析（Width-Style-Color）
- 支持复合属性的多层展开

#### 默认值添加
- 参数模式匹配
- 缺失参数检测
- 默认值补全

#### 单位推断
- 属性类型识别
- 默认单位映射
- 零值单位添加

#### 代码美化
- 规则边界检测
- 缩进规范化
- 空格优化

## 特性

✅ **纯前端实现** - 无需服务器端处理
✅ **实时转换** - 输入自动触发转换
✅ **批量处理** - 支持多规则同时处理
✅ **选项灵活** - 可独立开关各个功能
✅ **格式美观** - 现代化深色主题界面
✅ **统计显示** - 显示行数变化统计
✅ **易于部署** - 纯静态文件，支持多种部署方式
✅ **开源免费** - MIT 许可证

## 限制与注意事项

1. **处理范围** - 目前专注于常见 CSS 属性，不支持所有 CSS 属性
2. **兼容性** - 输出 CSS 兼容现代浏览器
3. **性能** - 大型 CSS 文件可能需要较长时间处理
4. **错误处理** - 部分复杂的 CSS 可能无法正确处理

## 未来计划

- [ ] 支持更多 CSS 属性
- [ ] 添加预设配置
- [ ] 支持自定义规则
- [ ] 批量文件处理
- [ ] CLI 工具完善

## 相关链接

- **在线演示**: https://kanonsand.github.io/css2kobweb/
- **项目仓库**: GitHub（待创建）
- **CSS 规范**: https://www.w3.org/Style/CSS/

## 开发约定

### 代码风格
- 使用严格模式（`'use strict'`）
- 遵循 ES6+ 语法规范
- 使用 JSDoc 注释

### 提交规范
- 使用语义化提交信息
- 参考 Conventional Commits 格式

### 文档维护
- 更新 AGENTS.md 记录项目变更
- 更新 README.md 记录使用说明
- 保持文档与代码同步