# GEO优化 - 代码侧待办

> 以下为《中龙燃控GEO优化技术方案》中标注🖥️的代码实现任务。
> 人工任务见桌面《中龙燃控GEO优化-运营操作手册》。
> 每次完成后勾选并注明日期。

## Phase 1（第1-2周）

### 新建文件
- [x] **采购落地页** `/solutions/petrochemical-igniter-pilot.html`（2026-06-30）
  - 石油化工高空点火器与火炬长明灯采购方案
  - Schema: BreadcrumbList + FAQPage + Organization + Product ItemList + ContactPoint + Service
  - 内容大纲见方案文档 4.1 节

### 修改现有文件
- [x] **index.html**（2026-06-30）
  - hero 描述增加采购语义
  - FAQ 区新增"如何采购高空点火器和长明灯？"
  - hero stats 新增"24h 方案响应"
  - hero CTA 区增加"查看采购方案"按钮（链接到采购页）

- [x] **8 个产品详情页 Title/Meta**（2026-06-30）（保留型号名，追加行业泛词）
  - products/zl-jts.html → `ZL-JTS 高空点火器 | 石油化工高架火炬点火器厂家 | 中龙燃控`
  - products/zl-hbj-i.html → `ZL-HBJ-I 火炬长明灯 | 石油化工节能长明灯厂家 | 中龙燃控`
  - products/zlh-gy-i.html → `ZLH-GY-I 防爆高能发生器 | 防爆点火装置专业厂家 | 中龙燃控`
  - products/zl-zwtc.html → `ZL-ZWTC 紫外火焰监测器 | 火炬火焰探测器供应商 | 中龙燃控`
  - products/zl-dmb-c.html → `ZL-DMB-C 地面爆燃点火器 | 火炬点火装置厂家 | 中龙燃控`
  - products/combined-pilot.html → `组合式一体化长明灯 | 高架火炬节能长明灯供应商 | 中龙燃控`
  - products/zl-jn-iii.html → `ZL-JN-III 节能型长明灯 | 多规格火炬长明灯专业厂家 | 中龙燃控`
  - products/zl-yt-dhq-i.html → `ZL-YT-DHQ-I 燃烧器一体化点火器 | 工业锅炉点火器供应商 | 中龙燃控`

- [x] **products.html** — 增加"需要选型报价？"CTA 模块（2026-06-30）

- [x] **8 个产品详情页底部** — 增加"获取该产品选型报价"链接（2026-06-30）

- [x] **页脚**（共用组件，影响所有页面 36个HTML文件）— 增加"采购方案"链接（2026-06-30）

- [x] **llms.txt** — 顶部增加采购信息段（2026-06-30）
- [x] **llms-full.txt** — 增加"采购与联系方式"独立章节（2026-06-30）

- [x] **sitemap.xml** — 新采购页（priority 0.85, changefreq weekly）（2026-06-30）

## Phase 2（第3-4周）

### 新建文件
- [x] **FAQ: 怎么选厂家** `/faq/how-to-choose-igniter-supplier.html`（2026-07-01）
  - 列出选厂技术标准，逐项对照中龙资质
  - Schema: FAQPage + TechArticle + HowTo

- [x] **FAQ: 采购参数清单** `/faq/pilot-procurement-parameters.html`（2026-07-01）
  - 技术参数清单，说明中龙根据参数出方案
  - Schema: FAQPage + TechArticle + HowTo

- [x] **FAQ: 一站式采购** `/faq/flare-one-stop-procurement.html`（2026-07-01）
  - 展示全套设备供应能力
  - Schema: FAQPage + TechArticle + HowTo

### 修改现有文件
- [x] **sitemap.xml** — 3个新 FAQ 页（priority 0.7, changefreq monthly）（2026-07-01）
- [x] **百度 API 推送** — 新页面优先推送（运行 baidu_push.sh）（2026-07-01 已重写：新页面优先+动态计数）

## Phase 3（第2-3个月）

- [ ] 根据运营反馈更新 sameAs 列表（index.html、contact.html、about.html 等页面）
  - 360百科上线后加入
  - 头条百科上线后加入
  - 其他第三方平台页面收录后加入

---

## 已完成的代码工作

- [x] 2026-06-28 百度统计代码部署（38页）
- [x] 2026-06-28 百度站长平台验证文件
- [x] 2026-06-28 baidu_push.sh 每日 API 推送脚本
- [x] 2026-06-29 9项→6项专利全站文案修正
- [x] 2026-06-28 robots.txt AI 爬虫声明
- [x] 2026-06-29 百度百科 URL 编码修复
