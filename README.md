# AI 智能考试助手

基于 AI 的纯前端考试复习助手，上传 PDF 题库即可智能提炼考点、生成练习题、管理错题，实现精准复习。

## 功能特性

### AI 智能总结
上传 PDF 后，AI 从 6 个维度提炼知识：
- 高频考点
- 必背知识
- 核心概念
- 易错点
- 思维导图（支持交互式展开/折叠，可导出为高清 PNG 图片）
- 章节总结

### AI 智能出题
- 支持 5 种题型：单选题、多选题、判断题、填空题、简答题
- 可自定义生成数量（3/5/10/15/20 道）
- 题目支持 LaTeX 数学公式渲染

### 多模式刷题
- 顺序练习、随机练习、章节练习、错题练习、收藏练习
- 答题反馈：正确/错误标识、AI 解析、AI 重新讲解
- 收藏功能，方便复习重点题目

### 错题管理
- 答错自动归入错题本
- 支持错题重练和 AI 重新讲解
- 错题本可导出为 TXT 文件

### 学习数据可视化
- 今日学习时间、答题量、正确率、连续学习天数
- 近 7 天答题量柱状图
- 近 7 天正确率折线图
- 正确/错误占比饼图

### AI 问答
- 基于 PDF 内容的智能对话
- 支持 Markdown 渲染和上下文记忆

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/kaninmeow/exam-traecn.git
cd exam-trae

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 构建单个 HTML 文件（可直接用浏览器打开）
npm run build
```

### 配置 API

首次使用需在「设置」页面配置：
- **API Key**：你的 OpenAI 兼容接口密钥
- **API Base URL**：接口地址（默认 `https://api.openai.com/v1`）
- **模型名称**：使用的模型（如 `gpt-4o-mini`）

## 使用方式

### 方式一：本地开发
```bash
npm run dev
```
访问 `http://localhost:5173` 即可使用。

### 方式二：单文件 HTML
构建后的 `dist/index.html` 是一个独立的 HTML 文件（约 3.7MB），直接用浏览器打开即可使用，无需服务器。

> PDF 解析功能需联网（PDF.js Worker 从 CDN 加载），AI 功能需要配置有效的 API Key。

## 技术栈

| 技术 | 用途 |
|------|------|
| React 18 + TypeScript | 前端框架 |
| Vite 6 | 构建工具 |
| Tailwind CSS 3 | 样式方案 |
| Zustand 5 | 状态管理 |
| React Router v7 | 路由管理 |
| pdfjs-dist | PDF 文本提取 |
| markmap-lib / markmap-view | 思维导图渲染 |
| KaTeX + remark-math | LaTeX 公式渲染 |
| ECharts 5 | 数据可视化图表 |
| react-markdown + remark-gfm | Markdown 渲染 |
| axios | HTTP 请求 |

## 项目结构

```
src/
├── api/                    # API 调用和 Prompt 模板
│   ├── ai.ts              # AI 接口调用
│   └── prompts.ts         # Prompt 模板
├── components/
│   ├── layout/            # 布局组件（Header、Sidebar、BottomNav）
│   ├── shared/            # 业务组件（PDF上传、题目卡片、思维导图等）
│   └── ui/                # 基础UI组件（Button、Card、Modal等）
├── constants/              # 常量定义
├── hooks/                  # 自定义 Hooks
│   ├── useAi.ts           # AI 调用封装
│   ├── usePdfParser.ts    # PDF 解析
│   ├── usePractice.ts     # 刷题逻辑
│   └── useStudyStats.ts   # 学习统计
├── pages/                  # 页面组件（11个页面）
├── stores/                 # Zustand 状态管理
├── types/                  # TypeScript 类型定义
└── utils/                  # 工具函数
```

## 数据存储

所有数据存储在浏览器 LocalStorage 中，无需后端服务：

| Key | 数据 |
|-----|------|
| `exam_pdf_files` | PDF 文件元数据 |
| `exam_pdf_text_{id}` | PDF 解析文本 |
| `exam_ai_summary_{pdfId}` | AI 总结内容 |
| `exam_questions_{pdfId}` | 生成的题目 |
| `exam_answer_records` | 答题记录 |
| `exam_wrong_questions` | 错题列表 |
| `exam_favorites` | 收藏题目 |
| `exam_chat_history_{pdfId}` | AI 对话历史 |
| `exam_study_stats` | 学习统计 |
| `exam_settings` | 应用设置 |

## 功能展示

### 首页概览
学习数据统计和快速入口。

### PDF 管理
拖拽上传 PDF，支持预览和 AI 分析。

### AI 总结
6 维度知识提炼，思维导图可交互和导出。

### 刷题练习
多种练习模式，答题反馈和 AI 解析。

### 学习统计
图表展示学习趋势，数据驱动复习。

## 开发说明

```bash
# 类型检查
npm run check

# 代码检查
npm run lint

# 预览构建结果
npm run preview
```

## 许可证

MIT License
