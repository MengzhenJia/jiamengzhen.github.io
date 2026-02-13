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
export NOTION_BLOG_DB_ID=your_database_id
export NOTION_HOME_PAGE_ID=your_home_page_id
export NOTION_RESUME_PAGE_ID=your_resume_page_id
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
