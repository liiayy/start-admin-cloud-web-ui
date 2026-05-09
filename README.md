<h1 align="center">✨ Start-Admin-Web 前端控制台</h1>

<p align="center">
  <b>基于 Vue 3 + Vite + Element Plus 构建的现代化微服务中后台 UI</b><br/>
  <i>深度适配 Start-Admin-Cloud 后端架构的官方前端解决方案</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-3.x-42b883.svg" alt="Vue 3">
  <img src="https://img.shields.io/badge/Vite-5.x-646cff.svg" alt="Vite">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Pinia-2.x-ffd859.svg" alt="Pinia">
  <img src="https://img.shields.io/badge/Element%20Plus-2.x-409eff.svg" alt="Element Plus">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
</p>

---

> 🌐 **在线演示**：[https://start-admin.p.muziseo.cn/](https://start-admin.p.muziseo.cn/)

## 📖 项目简介

**Start-Admin-Web** 是 [Start-Admin-Cloud](../) 微服务后台管理系统的专属前端工程。项目基于优秀的开源框架 [Fantastic-admin](https://fantastic-admin.hurui.me/) 进行深度定制与拓展。

本项目采用最新的前端技术栈（Vue 3 Setup 语法糖、Vite 构建工具、TypeScript 强类型约束），并针对 `Start-Admin-Cloud` 后端架构进行了全面深度适配，内置了动态路由菜单、精细化按钮权限、全局字典/参数缓存、WebSocket 实时通信等企业级能力，旨在为中后台管理系统提供极致的开发体验与丝滑的用户交互。

## ✨ 核心特性

- 💡 **前沿技术栈**：紧跟前端技术发展，全面拥抱 Vue 3 Composition API、Vite 极速构建与 TypeScript 类型安全。
- 🎨 **卓越的视觉体验**：基于 `Element Plus` 深度定制的精美 UI，支持暗黑模式，内置多种导航交互模式与优雅的主题色系（如高级莫兰迪色调）。
- 🔐 **严密的权限架构**：无缝对接后端的 `Sa-Token` 体系，实现了动态路由动态加载、菜单/按钮级别的细粒度权限控制，以及数据隔离渲染。
- 📦 **开箱即用的业务组件**：内置了包括全局字典翻译（DictTag）、系统参数化配置、FaModal 弹窗容器、FaPageHeader 高级页头等高频业务组件。
- ⚡ **极致的性能与交互**：
  - 精细可控的路由 KeepAlive 保活策略。
  - 基于 WebSocket 的全双工实时消息推送（在线用户、踢下线等）。
  - 支持超大文件与断点续传的 OSS 附件管理模块。
- 🤖 **AI 友好工程底座**：拥有极致规范的目录结构与 ESLint/Stylelint 约束，极大地提高了代码的整洁度与 AI 辅助编程的效率。

## 🛠️ 技术栈清单

| 技术领域 | 核心框架/组件 | 作用说明 |
| --- | --- | --- |
| **前端框架** | Vue 3.x | 渐进式 JavaScript 框架（采用 `<script setup>` 范式） |
| **构建工具** | Vite | 下一代前端极速构建工具 |
| **类型校验** | TypeScript | 强类型的 JavaScript 超集 |
| **UI 组件库** | Element Plus | 经典易用的 Vue 3 桌面端组件库 |
| **状态管理** | Pinia | 新一代轻量级、类型安全的 Vue 状态管理库 |
| **路由管理** | Vue Router 4 | 官方路由管理器 |
| **CSS 引擎** | UnoCSS | 即时按需的原子级 CSS 引擎 |
| **工具箱** | VueUse / Axios / Day.js | Hooks 库、HTTP 请求、日期处理 |

## 🏗️ 目录结构

```text
start-admin-web-ui-new
├── src
│   ├── api            # 统一管理的后端 API 请求接口
│   ├── assets         # 静态资源文件（图片、全局样式表等）
│   ├── components     # 全局复用的基础组件 (FaModal, FaPageHeader 等)
│   ├── hooks          # 组合式自定义 Hooks (如 useDict, useConfig)
│   ├── layouts        # 系统整体框架布局组件
│   ├── router         # 路由配置与全局路由守卫
│   ├── store          # Pinia 全局状态管理 (用户态、权限、应用设置)
│   ├── utils          # 全局工具函数 (请求拦截器、缓存处理等)
│   └── views          # 页面级视图组件 (按业务模块划分，如 system/user)
├── .env.*             # 环境变量配置文件 (开发/测试/生产)
├── vite.config.ts     # Vite 核心配置
└── package.json       # 项目依赖声明
```

## 🚀 快速开始

### 1. 环境准备
- **Node.js**: 建议 `v18.x` 或以上版本。
- **包管理器**: 推荐使用 `pnpm` (`npm install -g pnpm`)。

### 2. 获取代码与安装依赖
```bash
# 进入前端项目目录
cd start-admin-web-ui-new

# 安装所有依赖
pnpm install
```

### 3. 配置开发环境
在运行前，请检查项目根目录下的 `.env.development` 文件，确保后端 API 地址与您的本地微服务网关保持一致（默认网关端口为 `8080`）：
```env
# API 请求的基础路径（指向 Gateway 网关）
VITE_APP_API_BASEURL = 'http://localhost:8080'
```

### 4. 启动与构建
```bash
# 启动本地开发服务器 (极速冷启动)
pnpm run dev

# 生产环境打包构建
pnpm run build

# 执行 TypeScript 类型检查与 ESLint 代码规范检查
pnpm run lint
```

## 📐 开发规范提示

为了保持与 `Start-Admin-Cloud` 后端的高效协同，请遵守以下前端范式：
- **组合式 API**：所有的 Vue 组件务必使用 `<script setup lang="ts">` 语法进行编写。
- **接口封装**：所有的后端请求必须在 `src/api` 下统一定义，并标注好 TypeScript 的请求与响应数据类型。
- **字典与参数同步**：禁止在代码中硬编码状态字典。请使用项目内置的 `useDict('sys_user_sex')` 和 `useConfig('sys.captcha.enabled')` 动态从后端获取。
- **UI 风格统一**：表单与表格请结合 `UnoCSS` 原子类使用，并在涉及颜色交互时优先使用全局 CSS 变量（如 `var(--el-color-primary)`）。

## 鸣谢

本前端脚手架底座主要衍生自优秀的开源项目，感谢原作者的杰出贡献：
- [Fantastic-admin](https://github.com/fantastic-admin/basic)

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议发布。
