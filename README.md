# Notion → GitHub Pages 个人网站

## 功能
- 主页、简历、博客列表与详情
- 分类筛选与站内搜索
- Notion 作为 CMS，GitHub Actions 定时同步

## 本地运行
1. 安装依赖
```bash
npm install
```

2. 设置环境变量
```bash
export NOTION_TOKEN=your_token
export NOTION_BLOG_DB_ID=0f241680336142f28f627d3fd0e64d5b
export NOTION_HOME_PAGE_ID=31aeaf4d357d46588aa16815b8822a8f
export NOTION_RESUME_PAGE_ID=f4f1ed43520f4048998881b1fe54e2a8
```

3. 启动开发服务器
```bash
npm run dev
```

## 构建与部署
```bash
npm run build
```
构建时会生成 `public/search.json`，并导出静态站点到 `out/`。

## Notion 数据库字段
- `name` (标题)
- `Status` (状态，需包含 `Published`)
- `created` (日期)
- `tags` (标签)
- `reference` (分类)
- `Slug` (URL slug)
- `Summary` (摘要)
- `Cover` (封面，可选)
- `Featured` (置顶，可选)
