# n8n 工作流生成器

一个基于 AI 的 n8n 工作流自动生成工具，可以根据自然语言描述快速创建复杂的自动化工作流。

## ✨ 特性

- 🤖 **AI 驱动**：使用 OpenAI GPT-4 理解需求并生成工作流
- 🎯 **智能优化**：自动分析需求并提供准备指南
- 📚 **丰富模板**：内置 20+ 节点类型支持
- 🎨 **现代 UI**：支持深色模式的美观界面
- 🔍 **实时预览**：生成后立即查看工作流结构
- 📝 **历史记录**：保存所有生成的工作流

## 🚀 快速开始

### 前置要求

- Node.js 18+
- Docker & Docker Compose
- OpenAI API Key 或兼容的 API 服务

### 本地开发

1. 克隆项目
```bash
git clone https://github.com/yourusername/n8n-workflow-generator.git
cd n8n-workflow-generator
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp backend/.env.example backend/.env
# 编辑 backend/.env 文件，填入您的 API 密钥
```

4. 启动开发服务器
```bash
npm run dev
```

### 生产部署

详细部署指南请查看：
- [快速部署指南](DEPLOYMENT_QUICKSTART.md)
- [详细部署文档](deployment-guide.md)

```bash
# 快速部署
./deploy.sh production deploy
```

## 📖 使用指南

1. **输入需求**：在文本框中描述您想要实现的自动化流程
2. **选择模板**：可以从预设模板开始，或完全自定义
3. **生成工作流**：AI 会自动生成符合 n8n 格式的工作流
4. **查看指南**：系统会提供详细的准备步骤和配置说明
5. **导出使用**：下载 JSON 文件并导入到 n8n 中

## 🛠️ 技术栈

- **前端**：React + TypeScript + Vite + Tailwind CSS
- **后端**：Node.js + Express + TypeScript
- **AI**：OpenAI GPT-4 API
- **部署**：Docker + Docker Compose + Nginx

## 📁 项目结构

```
n8n-workflow-generator/
├── frontend/          # React 前端应用
├── backend/           # Express 后端服务
├── nginx/             # Nginx 配置
├── scripts/           # 部署和维护脚本
├── docs/              # 文档
└── docker-compose.yml # Docker 编排文件
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [n8n 官网](https://n8n.io)
- [OpenAI API](https://platform.openai.com)
- [项目文档](./docs)

---

Made with ❤️ by [Your Name] 