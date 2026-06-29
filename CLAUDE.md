# CLAUDE.md

## 项目概述
濮阳中龙燃控设备有限公司官方网站 — 火炬点火系统行业，GEO（生成式引擎优化）静态网站。

- **公司**：濮阳中龙燃控设备有限公司（2010年成立，河南濮阳）
- **行业**：石油化工火炬燃烧与自动点火系统
- **GitHub**：https://github.com/Zhangzhuangzhuang618/zhonglongwebsite
- **公网**：https://zhangzhuangzhuang618.github.io/zhonglongwebsite/
- **生产域名**：https://www.pyzlrk.cn（Cloudflare CDN）

## 技术栈
- 纯静态 HTML5 + CSS3 + Vanilla JS，无框架
- 响应式设计（移动端断点 900px / 480px）
- Schema.org JSON-LD 结构化数据（Organization、Product、FAQPage、TechArticle、HowTo、BreadcrumbList 等）
- SEO 优化：canonical URL、Open Graph、hreflang、结构化摘要

## 目录结构
```
├── index.html              # 首页
├── products.html           # 产品中心（含产品对比速查表 + 火炬系统定制）
├── cases.html              # 工程案例 + 全部客户清单
├── about.html              # 关于我们
├── strength.html           # 技术实力（人员 + 设备）
├── service.html            # 服务承诺
├── contact.html            # 联系我们（含表单 → Cloudflare Worker → 钉钉）
├── credentials.html        # 资质认证详情
├── glossary.html           # 术语表（30个火炬行业术语，DefinedTermSet Schema）
├── llms.txt / llms-full.txt # AI爬虫发现文件
├── products/               # 14个产品详情页
├── cases/                  # 4个案例详情页
├── faq/                    # 6篇技术FAQ + 知识库首页
├── css/style.css           # 全局样式（CSS变量体系）
├── js/main.js              # 导航、FAQ手风琴、表单提交、下拉菜单
├── images/                 # 产品图、案例图、证书、火炬系统图
└── worker/                 # Cloudflare Worker（表单→钉钉代理）
```

## 导航下拉菜单
产品中心和工程案例导航项有 hover 下拉子菜单：
- **产品中心**：高空点火器 | 节能长明灯 | 防爆高压发生器 | 火焰探测器 | 绝缘子与配件 | 火炬系统定制
- **工程案例**：石油化工 | 煤化工 | 电力/冶金 | LNG/化工
- 桌面端 hover 展开，移动端点击 toggle
- 子菜单链接使用页面内锚点（如 `products.html#igniter`）

## Schema.org 结构化数据
每个页面根据类型使用不同的 Schema：
- 首页：Organization + WebSite + FAQPage（15个FAQ）
- 产品页：CollectionPage + ItemList（14个Product条目）
- 产品详情：Product + BreadcrumbList
- FAQ文章：FAQPage + TechArticle + HowTo + BreadcrumbList
- 术语表：DefinedTermSet
- 技术实力：Person × 2

## SEO / GEO 关键配置
- `robots.txt`：允许所有AI爬虫（GPTBot、Claude-Web、Google-Extended等）
- `sitemap.xml`：包含所有页面URL
- `image-sitemap.xml`：15+图片元数据
- `llms.txt`：结构化站点地图给LLM crawler
- `llms-full.txt`：完整技术文档
- hreflang="zh-CN" 在所有页面

## 颜色与品牌
CSS 变量定义在 `:root`：
- `--primary: #1a3a5c`（深蓝）
- `--accent: #e85d24`（橙色）
- `--dark: #0d1b2a`
- 卡片`--shadow`：轻微阴影，hover 上移4px

## 部署
- 推送到 `main` 分支后 GitHub Pages 自动构建
- 表单通过 Cloudflare Worker 代理到钉钉机器人（HMAC签名，无前端凭证泄露）
- Worker 部署路径：`/api/contact`
