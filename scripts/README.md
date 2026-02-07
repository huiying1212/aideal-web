# Google Scholar 爬虫 / Google Scholar Crawler

自动从 Google Scholar 抓取论文数据，更新 publications.json 和 projects.json  
Automated tool to keep your publications and projects data synchronized with Google Scholar.

## 🚀 快速开始 / Quick Start

### 安装依赖 / Installation

```bash
npm install --save-dev puppeteer
```

### 使用方法 / Usage

```bash
# 运行爬虫（会打开浏览器窗口）
# Run the crawler (opens a visible browser window)
npm run crawl

# 预览更改但不修改文件（推荐先运行这个）
# Preview changes without modifying files (recommended first)
npm run crawl:dry

# 无界面模式运行（可能触发验证码）
# Run in headless mode (may trigger CAPTCHA)
npm run crawl:headless
```

## 📋 功能说明 / What It Does

爬虫会自动完成以下任务：

1. **抓取 Google Scholar 数据** - 获取所有论文信息
2. **检测新论文** - 对比现有的 `data/publications.json`，找出新发表的论文
3. **获取论文链接** - 从详情页获取 DOI/arXiv 等链接
4. **更新 publications.json** - 按年份自动添加新论文

## 🛠️ 脚本说明 / Script Details

### `crawl-scholar-puppeteer.js`

使用 Puppeteer 控制真实的 Chrome 浏览器，可以绕过 Google Scholar 的反爬虫检测。

**特性：**
- ✅ 处理 Google Scholar 的反爬虫机制
- ✅ 遇到验证码时会暂停，让你手动解决
- ✅ 提取完整的论文元数据
- ✅ 自动获取论文链接
- ✅ 支持预览模式（dry-run）

**参数选项：**
- `--dry-run` - 预览更改但不写入文件
- `--headless` - 无界面运行（可能触发验证码）

## 🔧 Configuration

Edit the `CONFIG` object in `crawl-scholar-puppeteer.js`:

```javascript
const CONFIG = {
  scholarUserId: "8NN-2uYAAAAJ",  // Google Scholar user ID
  scholarUrl: "https://scholar.google.com",
  pageSize: 100,                   // Publications per page
  waitForCaptcha: true,            // Pause for manual CAPTCHA solving
};
```

## 📊 输出格式 / Output Format

### publications.json

爬虫会按以下格式更新论文数据：

```json
{
  "publications": [
    {
      "year": 2024,
      "items": [
        {
          "authors": "Author1, Author2, Author3",
          "title": "Paper Title",
          "venue": "Conference/Journal Name",
          "link": "https://doi.org/..."
        }
      ]
    }
  ]
}
```

新论文会自动按年份分组添加，已存在的论文不会重复添加。

## 🐛 常见问题 / Troubleshooting

### 遇到验证码 / CAPTCHA Detected

**方法 1：手动解决（默认）**
- 运行 `npm run crawl`（不要用 `--headless`）
- 当验证码出现时，在浏览器窗口中手动解决
- 解决后脚本会自动继续

**方法 2：等待重试**
- 等待 10-15 分钟
- 再次尝试（Google 的限制可能已重置）

**方法 3：使用 VPN**
- 连接到不同的网络或 VPN
- 重新运行脚本

### 提示 "No publications found"

- 检查 Google Scholar 个人主页 URL 是否正确
- 验证配置中的 `scholarUserId`
- 尝试先在浏览器中手动打开该 URL

### 脚本卡住不动

- 增加脚本中的超时时间
- 检查网络连接
- 尝试去掉 `--headless` 参数运行

## 🔐 Privacy & Rate Limiting

- The script uses realistic browser headers and delays
- Respects Google Scholar's rate limits (1-2 second delays)
- Does not store any credentials
- Only accesses public profile information


## 🤝 Contributing

To modify the crawler:

1. Edit `scripts/crawl-scholar-puppeteer.js`
2. Test with `npm run crawl:dry` first
3. Check the output before running without `--dry-run`

## 📚 Dependencies

- **puppeteer** - Headless Chrome automation
- **fs** - File system operations (built-in)
- **path** - Path utilities (built-in)

## 🔗 Related Files

- `data/publications.json` - Publication database
- `data/projects.json` - Featured projects
- `package.json` - npm scripts configuration
