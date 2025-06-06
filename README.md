# 📚 GAI in Social Science: A Comprehensive Trend-Based Review on Applications and Risks

> 以数据驱动的视角，系统梳理人工智能（特别是生成式AI）在社会科学中的演化路径、实际应用及潜在风险  
> 本项目收录两篇高质量综述：  
> 1.《社会科学中的人工智能研究：趋势分析视角下的综述》  
> 2.《生成式人工智能赋能社会学：应用探索与风险治理综述》

---

## 📌 项目简介 | Project Overview

本仓库旨在提供一份**基于趋势可视化与语义分析的AI与社会科学交叉研究综述**。其中：

- **趋势篇**基于 Web of Science 核心库（1970–2024）的7011条文献，使用 LDA 主题建模、DataMapPlot、Voronoi Treemap、Parallel Tag Clouds 等多种可视化技术，识别出7大核心研究主题，重构 AI 与社会科学的融合图谱。
- **生成式AI篇**聚焦于生成式AI技术对社会科学不同子领域的影响，以“工具-助手-自主体”三种身份划分方式，系统审视其在传播学、社会学、心理学等领域的应用与风险。

---

## 📁 项目组成 | Repository Structure

- `papers/`：论文 PDF 与补充材料  
  - `AI in the social sciences, a review based on trend analysis-CN.pdf`：中文版可视化趋势分析（已完成）  
  - `AI in the social sciences, a review based on trend analysis-EN.pdf`：英文版可视化趋势分析（已完成）  
  - `gpapers/Generative artificial intelligence in social science.pdf`：生成式人工智能赋能社会学：应用探索与风险治理综述（中文）（已完成）  
  - `gpapers/Generative artificial intelligence in social science.pdf`：生成式人工智能赋能社会学：应用探索与风险治理综述（英文）（编写中）  

- `code/`：可复现代码  
  - `LDAsklearn/`：数据清洗、LDA主题建模与JSON结构输出  
  - `Parallel Tag Clouds/`：并行标签云可视化分析  
  - `DataMapPlot/`：高维主题密度投影图  
  - `Voronoi_treemap/`：领域权重分析的图形展示  

- `LICENSE`：开源协议  
- `README.md`：项目说明文档（你现在看到的）
）



## 🧪 方法论亮点 | Method Highlights

- 🛍️ LDA Topic Modeling：从文献中提取7个主要研究主题

- 🗺️ DataMapPlot：展示主题聚类密度与影响力分布

- 🌲 Voronoi Treemap：识别交叉学科的研究密集度和分布权重

- ☁️ Parallel Tag Clouds：观察主题随时间的演化路径与爆发节点

在第二篇综述中，进一步引入以下核心方法：

- 👫 身份划分视角：将GAI划分为工具型、交互型、自主型三类社会“角色”

- 📚 语义映射与案例归类：结合真实研究文献，将不同风险与应用映射至相应角色、相应学科下

- ⚠️ 风险类型化分析：将GAI风险归为模型问题和治理问题两大类，并在每一类中展开更细致的讨论
---

## 🔍 研究核心主题 | Key Topics Identified
1.《社会科学中的人工智能研究：趋势分析视角下的综述》  
- **Science Technology**：AI基础研究、技术伦理  
- **Agents’ Cognitive**：智能体行为决策与认知交互  
- **Network Information**：算法预测与神经网络应用  
- **Media and Driving**：媒介影响与信息治理  
- **Mental Health**：AI在心理健康与抑郁症干预中的应用  
- **Information Recognition (Detection)**：虚假信息识别与行为分析  
- **Development and Environment**：社会影响评估与可持续发展
---
2.《生成式人工智能赋能社会学：应用探索与风险治理综述》
- **新闻传播学（Communication Studies）**
- **社会学（Sociology）**
- **心理学（Psychology）**
- **经济学（Economics）**
- **政治学（Political Science）**
- **管理学（Management Studies）**
---

## 🔮 未来发展方向 | Roadmap

- [x] 中文综述版本发布 ✅  
- [x] 英文初稿整理 ✅  
- [ ] 虚假信息相关专题趋势分析研究   
- [ ] 发表预印本

---

## 📖 引用方式 | Citation

如果该研究对你有所帮助，请考虑如下引用方式：

```bibtex
@misc{xu2025gai_social_science,
  author       = {Xu, Jia},
  title        = {GAI in Social Science: A Comprehensive Trend-Based Review on Applications and Risks},
  year         = {2025},
  howpublished = {\url{https://github.com/1EchA/GAI-in-social-science-A-comprehensive-review-on-applications-and-risk}},
  note         = {Version 1.0}
}

