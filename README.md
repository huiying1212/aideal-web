# ai{DEAL} Studio Website

极简风格的学术实验室网站，基于 Next.js 构建。

## 特性

- 📝 **数据驱动**: 团队成员、论文、项目信息存储在 JSON 文件中，便于维护
- 🎨 **极简设计**: 现代、清爽的视觉风格
- 📱 **响应式**: 完美支持移动端和桌面端
- ⚡ **静态导出**: 支持部署到 GitHub Pages

## 项目结构

```
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页
│   ├── team/              # 团队页面
│   ├── projects/          # 项目页面
│   ├── publications/      # 论文页面
│   └── opportunities/     # 加入我们页面
├── components/            # React 组件
│   ├── Navigation.tsx     # 导航栏
│   └── Footer.tsx         # 页脚
├── data/                  # 📌 数据文件 (更新这里的内容)
│   ├── team.json          # 团队成员信息
│   ├── publications.json  # 论文列表
│   ├── projects.json      # 研究项目
│   └── site.json          # 网站配置 (导航、联系方式等)
└── public/               
    └── images/            # 图片资源
        ├── team/          # 团队成员照片
        └── projects/      # 项目图片
```

## 如何更新内容

### 更新团队成员

编辑 `data/team.json`:

```json
{
  "members": [
    {
      "name": { "zh": "张三", "en": "San ZHANG" },
      "role": { "zh": "博士生", "en": "Doctoral Student" },
      "image": "/images/team/san-zhang.jpg",
      "bio": { "zh": "个人简介...", "en": "Bio..." }
    }
  ]
}
```

### 更新论文

编辑 `data/publications.json`:

```json
{
  "publications": [
    {
      "year": 2024,
      "items": [
        {
          "authors": "Author1, Author2, ...",
          "title": "Paper Title",
          "venue": "Conference/Journal Name",
          "link": "https://doi.org/..."
        }
      ]
    }
  ]
}
```

### 更新项目

编辑 `data/projects.json`:

```json
{
  "projects": [
    {
      "id": "project-id",
      "title": "Project Title",
      "date": "2024-01-01",
      "categories": ["education", "hci"],
      "authors": "Author1, Author2",
      "description": {
        "short": "简短描述",
        "full": "完整描述"
      }
    }
  ]
}
```

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建静态网站
npm run build
```

## 部署到 GitHub Pages

1. 运行 `npm run build`
2. `out/` 目录包含静态文件
3. 推送到 GitHub 仓库的 `gh-pages` 分支

## 技术栈

- [Next.js 14](https://nextjs.org/) - React 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Tailwind CSS](https://tailwindcss.com/) - 样式
- [Noto Sans SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC) - 中文字体

## License

© Pengcheng An. All rights reserved.

