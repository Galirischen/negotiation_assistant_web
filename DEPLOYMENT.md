# GitHub部署指南

## 快速部署到GitHub

### 步骤1: 初始化Git仓库

```bash
cd /Users/chenyujie/negotiation_assistant_web
git init
git add .
git commit -m "Initial commit: 资金商务谈判助手 v0.2.0"
```

### 步骤2: 创建GitHub仓库

1. 访问 https://github.com/new
2. 仓库名称: `negotiation_assistant_web` (或其他名称)
3. 描述: `基于MCP的AI谈判支持系统 - 让每一次外勤都成为数字资产`
4. 选择 **Private** (内部项目) 或 **Public** (公开展示)
5. **不要**勾选 "Initialize this repository with a README"
6. 点击 "Create repository"

### 步骤3: 推送代码到GitHub

```bash
# 添加远程仓库(替换YOUR_USERNAME为你的GitHub用户名)
git remote add origin https://github.com/YOUR_USERNAME/negotiation_assistant_web.git

# 推送代码
git branch -M main
git push -u origin main
```

### 步骤4: 更新README中的链接

在README.md顶部,将以下内容:
```markdown
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/YOUR_USERNAME/negotiation_assistant_web)
```

替换为你的实际仓库地址。

### 步骤5: 分享项目文档

部署完成后,你可以通过以下链接分享README文档:

**方式1: GitHub仓库页面**
```
https://github.com/YOUR_USERNAME/negotiation_assistant_web
```
- GitHub会自动渲染README.md
- 支持所有Markdown语法
- 精美的样式,自带目录导航

**方式2: 原始Markdown查看**
```
https://github.com/YOUR_USERNAME/negotiation_assistant_web/blob/main/README.md
```

**方式3: 网页版渲染(GitHub Pages)**
如果想要更独立的展示页面:
```bash
# 创建gh-pages分支
git checkout --orphan gh-pages
git rm -rf .
echo "# Coming Soon" > index.html
git add index.html
git commit -m "Initial GitHub Pages"
git push origin gh-pages

# 访问地址
https://YOUR_USERNAME.github.io/negotiation_assistant_web/
```

---

## 内网部署(如果需要)

如果公司不允许使用GitHub,可以部署到内网GitLab:

### 内网GitLab部署

```bash
# 添加内网GitLab地址
git remote add origin http://your-gitlab-server/your-group/negotiation_assistant_web.git
git push -u origin main
```

访问地址: `http://your-gitlab-server/your-group/negotiation_assistant_web`

---

## 权限设置

### Private仓库(推荐)
- 仅授权团队成员可访问
- Settings → Manage access → Invite collaborators
- 添加团队成员的GitHub账号

### Public仓库
- 任何人都可以查看README
- 注意不要包含敏感信息(密码、内网地址等)
- 适合对外展示技术能力

---

## 后续维护

### 更新文档
```bash
# 修改README.md后
git add README.md
git commit -m "更新文档: 添加XXX内容"
git push
```

### 版本发布
```bash
# 打标签
git tag -a v0.3.0 -m "发布v0.3.0: 新增XXX功能"
git push origin v0.3.0

# 在GitHub上创建Release
# 访问: https://github.com/YOUR_USERNAME/negotiation_assistant_web/releases/new
```

---

## 常见问题

### Q1: 如何让README更美观?
A: GitHub自动支持:
- Emoji表情 ✅
- 表格渲染 📊
- 代码高亮 💻
- 目录导航 📚
- Badge徽章 🏷️

### Q2: 如何分享给没有GitHub账号的人?
A:
- Private仓库: 需要先邀请对方注册GitHub账号
- Public仓库: 直接发送链接即可查看

### Q3: 如何嵌入图片/视频?
A:
```markdown
# 图片
![效果图](./docs/images/screenshot.png)

# 视频(需要先上传到GitHub)
https://user-images.githubusercontent.com/xxx/demo.mp4
```

---

**部署完成后,记得更新README中的YOUR_USERNAME为实际用户名!**
