# postcss-normalize-tool

一个纯前端的 CSS 标准化工具，可以在线将 CSS 简写属性展开为长格式，并添加默认值和单位。

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Static](https://img.shields.io/badge/type-static-brightgreen.svg)

## 功能特性

### ✨ 核心功能

- **展开简写属性** - 将 `margin: 10px 20px` 展开为 `margin-top: 10px; margin-right: 20px; margin-bottom: 10px; margin-left: 20px;`
- **添加默认值** - 为 `animation: fade 2s` 自动补全为 `animation: fade 2s ease 0s 1 normal none running;`
- **添加单位** - 为 `margin: 0` 添加单位 `margin: 0px`
- **美化输出** - 格式化 CSS 代码，提高可读性

### 🎯 支持的属性

**简写属性展开：**
- `margin`, `padding` → 四个方向属性
- `border` → 四个方向边框
- `border-*` → width/style/color
- `columns` → column-count/column-width

**默认值添加：**
- `animation` 系列
- `transition` 系列
- `box-shadow`
- `flex`
- `gap`
- `outline`
- `list-style`
- `font`

**单位添加：**
- 长度属性 → `px`
- 时间属性 → `s`
- 角度属性 → `deg`

## 快速开始

### 在线使用

最简单的方式是直接打开 `demo-static.html` 文件：

```bash
# 克隆仓库
git clone https://github.com/your-username/postcss-normalize-tool.git
cd postcss-normalize-tool

# 用浏览器打开 demo-static.html
open demo-static.html
```

### 本地服务器

```bash
# 使用 Python
python3 -m http.server 8000

# 使用 Node.js (需要安装 http-server)
npx http-server -p 8000

# 访问 http://localhost:8000/demo-static.html
```

## 使用说明

### 基本用法

1. 在左侧输入框粘贴 CSS 代码
2. 选择需要的选项：
   - **Explode Shorthands** - 展开简写属性（默认开启）
   - **Add Defaults** - 添加默认值（默认开启）
   - **Add Units** - 添加单位（默认开启）
   - **Beautify Output** - 美化输出（默认开启）
3. 结果自动显示在右侧
4. 点击 "Copy" 按钮复制结果

### 示例

**输入：**
```css
.box {
  margin: 10px 20px;
  padding: 5px;
  border: 1px solid red;
  animation: fade 2s;
  transition: opacity 0.3s;
  box-shadow: 5px 5px;
  flex: 1;
  gap: 10px;
}
```

**输出：**
```css
.box {
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  margin-left: 20px;
  padding-top: 5px;
  padding-right: 5px;
  padding-bottom: 5px;
  padding-left: 5px;
  border-top: 1px solid red;
  border-right: 1px solid red;
  border-bottom: 1px solid red;
  border-left: 1px solid red;
  animation: fade 2s ease 0s 1 normal none running;
  transition: opacity 0.3s ease 0s;
  box-shadow: 5px 5px 0px 0px currentcolor;
  flex: 1 1 0%;
  gap: 10px 10px;
}
```

## 部署

### GitHub Pages 部署（推荐）

详细步骤请查看 [GITHUB_PAGES_DEPLOYMENT.md](GITHUB_PAGES_DEPLOYMENT.md)

简述：
1. 推送代码到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 "GitHub Actions" 作为源
4. 自动部署完成

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

### Vercel / Netlify 部署

直接将 `demo-static.html` 和 `dist.js` 上传即可，无需额外配置。

## 项目结构

```
postcss-normalize-tool/
├── demo-static.html                    # 主应用页面
├── dist.js                             # 核心逻辑实现
├── package.json                        # 包配置
├── README.md                           # 项目文档
├── AGENTS.md                           # AI 代理上下文
├── .github/workflows/                  # GitHub Actions
│   └── deploy-gh-pages.yml
├── GITHUB_PAGES_DEPLOYMENT.md          # GitHub Pages 部署指南
└── bin/                                # CLI 工具（开发中）
    ├── explode-cli.js
    ├── add-defaults-cli.js
    └── add-units-cli.js
```

## 技术栈

- **前端**：原生 JavaScript (ES6+)
- **样式**：原生 CSS (CSS Grid, Flexbox, Custom Properties)
- **部署**：静态文件，支持多种托管平台

## 特色

✅ **纯前端实现** - 无需服务器，零依赖  
✅ **实时转换** - 输入自动触发，无需点击按钮  
✅ **现代化 UI** - 深色主题，响应式设计  
✅ **统计信息** - 显示行数变化  
✅ **易于部署** - 纯静态文件，一分钟即可上线  
✅ **开源免费** - MIT 许可证  

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 许可证

[MIT](LICENSE-MIT) © 2025

## 相关链接

- [推荐工具: CSS to Kobweb](https://kanonsand.github.io/css2kobweb/)
- [在线演示](https://your-username.github.io/postcss-normalize-tool/)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0 (2025-02-11)
- 初始版本发布
- 支持简写属性展开
- 支持默认值添加
- 支持单位添加
- 支持代码美化
- 添加 GitHub Pages 自动部署