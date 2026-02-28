// 布局模板
export const layoutTemplates = [
  {
    name: `两栏布局`,
    content: `<section style="display: flex; gap: 20px;">
<section style="flex: 1;">

### 左栏内容
这里是左栏的内容...

</section>
<section style="flex: 1;">

### 右栏内容
这里是右栏的内容...

</section>
</section>`,
  },
  {
    name: `三栏布局`,
    content: `<section style="display: flex; gap: 20px;">
<section style="flex: 1;">

### 左栏内容
这里是左栏的内容...

</section>
<section style="flex: 2;">

### 中栏内容
这里是中栏的内容...

</section>
<section style="flex: 1;">

### 右栏内容
这里是右栏的内容...

</section>
</section>`,
  },
  {
    name: `卡片布局`,
    content: `<section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
<section style="border: 1px solid #ddd; border-radius: 8px; padding: 15px;">

### 卡片1
这里是卡片1的内容...

</section>
<section style="border: 1px solid #ddd; border-radius: 8px; padding: 15px;">

### 卡片2
这里是卡片2的内容...

</section>
<section style="border: 1px solid #ddd; border-radius: 8px; padding: 15px;">

### 卡片3
这里是卡片3的内容...

</section>
</section>`,
  },
  {
    name: `标签页布局`,
    content: `<section class="tabs">
<section class="tab-buttons">
  
- [标签1](#tab1)
- [标签2](#tab2)
- [标签3](#tab3)
  
</section>

<section id="tab1">

### 标签1内容

这里是标签1的内容...

</section>

<section id="tab2">

### 标签2内容

这里是标签2的内容...

</section>

<section id="tab3">

### 标签3内容

这里是标签3的内容...

</section>
</section>`,
  },
  {
    name: `响应式布局`,
    content: `<section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
<section>

### 第一部分
在小屏幕上会自动堆叠...

</section>
<section>

### 第二部分
在大屏幕上会并排显示...

</section>
<section>

### 第三部分
布局会根据屏幕宽度自动调整...

</section>
</section>`,
  },
  {
    name: `文章布局`,
    content: `<article style="max-width: 800px; margin: 0 auto; padding: 20px;">
<header style="text-align: center; margin-bottom: 40px;">
  <h1>文章标题</h1>
  <section style="color: #666;">
    作者：作者名称 | 发布时间：2024-01-01
  </section>
</header>

<section style="line-height: 1.8;">

## 第一部分
这里是文章内容...

## 第二部分
这里是更多内容...

</section>

<footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
  <section style="color: #666;">
    标签：标签1, 标签2, 标签3
  </section>
</footer>
</article>`,
  },
  {
    name: `图文混排`,
    content: `### 并排图文（使用 HTML 实现更精确的布局控制）
<section style="display: flex; gap: 20px; align-items: center; margin: 20px 0;">
<section style="flex: 1;">
  
![城市风景](./assets/images/example.png)
  
</section>
  <section style="flex: 1;">

  #### 城市风景

  这是一张展示现代城市风景的图片。通过 HTML 的弹性布局，我们可以实现图片和文字并排显示的效果。

  - 专业的布局控制
  - 响应式设计
  - 完美的排版效果

  </section>
</section>

### 图文卡片
<section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0;">
<section style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">

![风景图片1](./assets/images/example.png)

#### 风景图片1
这里是第一张风景图片的详细描述...

</section>
<section style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">

![风景图片2](./assets/images/example.png)

#### 风景图片2
这里是第二张风景图片的详细描述...

</section>
</section>

### 图片瀑布流
<section style="
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
  gap: 20px;
  margin: 20px 0;
">
  
![瀑布流1](./assets/images/example.png)
  
![瀑布流2](./assets/images/example.png)
  
![瀑布流3](./assets/images/example.png)
  
![瀑布流4](./assets/images/example.png)
  
![瀑布流5](./assets/images/example.png)
  
![瀑布流6](./assets/images/example.png)

</section>`,
  },
  {
    name: `特色盒子`,
    content: `<section style="margin: 20px 0;">
<!-- 信息盒子 -->
<section style="background: #e8f4f8; border-left: 4px solid #2196f3; padding: 15px; margin: 10px 0;">
  <strong>📌 提示：</strong>这是一个信息提示框
</section>

<!-- 警告盒子 -->
<section style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 10px 0;">
  <strong>⚠️ 警告：</strong>这是一个警告提示框
</section>

<!-- 成功盒子 -->
<section style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 10px 0;">
  <strong>✅ 成功：</strong>这是一个成功提示框
</section>

<!-- 错误盒子 -->
<section style="background: #fdecea; border-left: 4px solid #f44336; padding: 15px; margin: 10px 0;">
  <strong>❌ 错误：</strong>这是一个错误提示框
</section>
</section>`,
  },
  {
    name: `时间轴布局`,
    content: `<section style="max-width: 800px; margin: 0 auto; padding: 20px;">
  <!-- 时间轴标题 -->
  <section style="text-align: center; margin-bottom: 40px;">
    <h2 style="font-size: 24px; color: #333; margin: 0;">项目里程碑</h2>
  </section>
  <!-- 时间轴容器 -->
  <section style="position: relative;">   
    <!-- 时间轴线 -->
    <section style="position: absolute; left: 100px; top: 0; bottom: 0; width: 2px; background: #4A90E2;"></section> 
    <!-- 第一个时间节点 -->
    <section style="position: relative; margin-bottom: 40px; padding-left: 140px;">
      <!-- 时间点标记 -->
      <section style="position: absolute; left: 93px; top: 5px; width: 16px; height: 16px; background: white; border: 3px solid #4A90E2; border-radius: 50%;"></section>
      <!-- 时间标签 -->
      <section style="position: absolute; left: 0; top: 0; width: 80px; text-align: right; padding-right: 15px;">
        <time style="font-size: 14px; color: #4A90E2; font-weight: bold;">2023-11-01</time>
      </section>
      <!-- 内容区域 -->
      <section style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #4A90E2;">
        <h3 style="font-size: 18px; color: #333; margin: 0 0 10px 0;">阶段一完成</h3>
        <p style="color: #666; line-height: 1.6; margin: 0;">描述信息，包含关键要点与成果。这里是第一个事件的详细描述内容...</p>
      </section>
    </section>
    <!-- 第二个时间节点 -->
    <section style="position: relative; margin-bottom: 40px; padding-left: 140px;">
      <section style="position: absolute; left: 93px; top: 5px; width: 16px; height: 16px; background: white; border: 3px solid #4A90E2; border-radius: 50%;"></section>
      <section style="position: absolute; left: 0; top: 0; width: 80px; text-align: right; padding-right: 15px;">
        <time style="font-size: 14px; color: #4A90E2; font-weight: bold;">2024-03-15</time>
      </section>
      <section style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #4A90E2;">
        <h3 style="font-size: 18px; color: #333; margin: 0 0 10px 0;">阶段二完成</h3>
        <p style="color: #666; line-height: 1.6; margin: 0;">描述信息，展示进度与后续计划。这里是第二个事件的详细描述内容...</p>
      </section>
    </section>
    <!-- 第三个时间节点 -->
    <section style="position: relative; padding-left: 140px;">
      <section style="position: absolute; left: 93px; top: 5px; width: 16px; height: 16px; background: white; border: 3px solid #4A90E2; border-radius: 50%;"></section>     
      <section style="position: absolute; left: 0; top: 0; width: 80px; text-align: right; padding-right: 15px;">
        <time style="font-size: 14px; color: #4A90E2; font-weight: bold;">2024-07-20</time>
      </section>     
      <section style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #4A90E2;">
        <h3 style="font-size: 18px; color: #333; margin: 0 0 10px 0;">阶段三完成</h3>
        <p style="color: #666; line-height: 1.6; margin: 0;">项目最终阶段完成，达成所有目标。这里是第三个事件的详细描述内容...</p>
      </section>
    </section>
  </section>
</section>`,
  },
  {
    name: `特色列表`,
    content: `<section style="margin: 0 auto;">
<section style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px;">
  
  <section style="flex: 1; min-width: 200px; background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
    <section style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
      <section style="width: 40px; height: 40px; background: #e3f2fd; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        ✨
      </section>
      <strong style="font-size: 16px;">特色功能1</strong>
    </section>
    <section style="color: #666; line-height: 1.6; padding-left: 55px;">
      这里是功能描述，详细说明这个特色功能的具体内容和优势...
    </section>
  </section>
  
  <section style="flex: 1; min-width: 200px; background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50;">
    <section style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
      <section style="width: 40px; height: 40px; background: #e8f5e9; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        🎯
      </section>
      <strong style="font-size: 16px;">特色功能2</strong>
    </section>
    <section style="color: #666; line-height: 1.6; padding-left: 55px;">
      这里是功能描述，详细说明这个特色功能的具体内容和优势...
    </section>
  </section>
  
  <section style="flex: 1; min-width: 200px; background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800;">
    <section style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
      <section style="width: 40px; height: 40px; background: #fff3e0; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        💡
      </section>
      <strong style="font-size: 16px;">特色功能3</strong>
    </section>
    <section style="color: #666; line-height: 1.6; padding-left: 55px;">
      这里是功能描述，详细说明这个特色功能的具体内容和优势...
    </section>
  </section>
  
</section>
</section>`,
  },
  {
    name: `价格表`,
    content: `<section style="display: flex; gap: 20px; justify-content: center; padding: 20px;">
<!-- 基础版 -->
<section style="flex: 1; max-width: 300px; border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-align: center;">
  <h3>基础版</h3>
  <section style="font-size: 2em; margin: 20px 0;">
    ¥99<span style="font-size: 0.5em;">/月</span>
  </section>
  <ul style="list-style: none; padding: 0; text-align: left;">
    <li style="margin: 10px 0;">✓ 功能1</li>
    <li style="margin: 10px 0;">✓ 功能2</li>
    <li style="margin: 10px 0;">✓ 功能3</li>
    <li style="margin: 10px 0;">✓ 功能4</li>
  </ul>
  <button style="background: #2196f3; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
    立即购买
  </button>
</section>

<!-- 专业版 -->
<section style="flex: 1; max-width: 300px; border: 1px solid #2196f3; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  <h3>专业版</h3>
  <section style="font-size: 2em; margin: 20px 0;">
    ¥199<span style="font-size: 0.5em;">/月</span>
  </section>
  <ul style="list-style: none; padding: 0; text-align: left;">
    <li style="margin: 10px 0;">✓ 所有基础版功能</li>
    <li style="margin: 10px 0;">✓ 高级功能1</li>
    <li style="margin: 10px 0;">✓ 高级功能2</li>
    <li style="margin: 10px 0;">✓ 高级功能3</li>
  </ul>
  <button style="background: #2196f3; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
    立即购买
  </button>
</section>

<!-- 企业版 -->
<section style="flex: 1; max-width: 300px; border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-align: center;">
  <h3>企业版</h3>
  <section style="font-size: 2em; margin: 20px 0;">
    ¥499<span style="font-size: 0.5em;">/月</span>
  </section>
  <ul style="list-style: none; padding: 0; text-align: left;">
    <li style="margin: 10px 0;">✓ 所有专业版功能</li>
    <li style="margin: 10px 0;">✓ 企业功能1</li>
    <li style="margin: 10px 0;">✓ 企业功能2</li>
    <li style="margin: 10px 0;">✓ 企业功能3</li>
  </ul>
  <button style="background: #2196f3; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
    联系我们
  </button>
</section>
</section>`,
  },
  {
    name: `现代博客布局`,
    content: `# 文章标题

> 📅 发布时间：2024-01-01 | 👤 作者：作者名称 | 🏷️ 分类：技术博客

## 引言

这里是文章的开篇引言，简要介绍文章的主要内容...

## 第一部分

这里是第一部分的正文内容...

> **💡 重要提示**  
> 这是一个重要的引用或要点总结...

## 第二部分

继续展开内容...

### 小节一

- 要点1
- 要点2
- 要点3

### 小节二

1. 第一步
2. 第二步
3. 第三步

---

**相关链接：**
- [了解更多](#)
- [相关文章](#)
- [参考资源](#)

*文章标签：* \`标签1\` \`标签2\` \`标签3\`

---

*© 2024 版权所有 | 保留所有权利*`,
  },
  {
    name: `产品展示卡片`,
    content: `<section style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); transition: transform 0.3s;">
  <section style="position: relative; padding-top: 75%;">
    <img src="./assets/images/example.png" alt="产品图片" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
    <section style="position: absolute; top: 20px; right: 20px; background: #5352ed; color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.9em;">
      热销
    </section>
  </section>
  <section style="padding: 24px;">
    <h3 style="margin: 0 0 10px; font-size: 1.5em; color: #2d3436;">产品名称</h3>
    <p style="margin: 0 0 20px; color: #636e72; line-height: 1.6;">产品描述内容...</p>
    <section style="display: flex; justify-content: space-between; align-items: center;">
      <section style="font-size: 1.2em; font-weight: bold; color: #2d3436;">¥ 399</section>
      <button style="background: #0984e3; color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; transition: background 0.3s;">
        立即购买
      </button>
    </section>
  </section>
</section>
</section>`,
  },
  {
    name: `团队介绍`,
    content: `<section style="max-width: 1200px; margin: 0 auto; padding: 40px 20px;">
<header style="text-align: center; margin-bottom: 60px;">
  <h2 style="font-size: 2.5em; color: #2d3436; margin-bottom: 20px;">我们的团队</h2>
  <p style="color: #636e72; max-width: 600px; margin: 0 auto;">一支充满激情和创造力的团队，致力于为客户提供最优质的服务...</p>
</header>
<section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px;">
  <section style="text-align: center;">
    <section style="width: 150px; height: 150px; margin: 0 auto 20px; position: relative;">
      <img src="./assets/images/example.png" alt="团队成员" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
      <section style="position: absolute; bottom: 0; right: 0; background: #0984e3; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        CEO
      </section>
    </section>
    <h3 style="margin: 0 0 10px; color: #2d3436;">张三</h3>
    <p style="margin: 0 0 15px; color: #636e72;">首席执行官</p>
    <section style="display: flex; gap: 15px; justify-content: center;">
      <a href="#" style="color: #0984e3; text-decoration: none;">LinkedIn</a>
      <a href="#" style="color: #0984e3; text-decoration: none;">Twitter</a>
    </section>
  </section>
  <section style="text-align: center;">
    <section style="width: 150px; height: 150px; margin: 0 auto 20px; position: relative;">
      <img src="./assets/images/example.png" alt="团队成员" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
      <section style="position: absolute; bottom: 0; right: 0; background: #00b894; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        CTO
      </section>
    </section>
    <h3 style="margin: 0 0 10px; color: #2d3436;">李四</h3>
    <p style="margin: 0 0 15px; color: #636e72;">技术总监</p>
    <section style="display: flex; gap: 15px; justify-content: center;">
      <a href="#" style="color: #0984e3; text-decoration: none;">LinkedIn</a>
      <a href="#" style="color: #0984e3; text-decoration: none;">GitHub</a>
    </section>
  </section>
  <section style="text-align: center;">
    <section style="width: 150px; height: 150px; margin: 0 auto 20px; position: relative;">
      <img src="./assets/images/example.png" alt="团队成员" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
      <section style="position: absolute; bottom: 0; right: 0; background: #e17055; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        PM
      </section>
    </section>
    <h3 style="margin: 0 0 10px; color: #2d3436;">王五</h3>
    <p style="margin: 0 0 15px; color: #636e72;">产品经理</p>
    <section style="display: flex; gap: 15px; justify-content: center;">
      <a href="#" style="color: #0984e3; text-decoration: none;">LinkedIn</a>
      <a href="#" style="color: #0984e3; text-decoration: none;">Dribbble</a>
    </section>
  </section>
</section>
</section>`,
  },
  {
    name: `数据统计展示`,
    content: `<section style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 20px;">
<section style="max-width: 1200px; margin: 0 auto;">
  <header style="text-align: center; margin-bottom: 50px;">
    <h2 style="color: white; font-size: 2.5em; margin-bottom: 20px;">核心数据</h2>
    <p style="color: rgba(255,255,255,0.8);">见证我们的成长与成就</p>
  </header>
  <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px;">
    <section style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 16px; padding: 30px; text-align: center;">
      <section style="font-size: 3em; font-weight: bold; color: white; margin-bottom: 10px;">100+</section>
      <section style="color: rgba(255,255,255,0.8);">企业客户</section>
    </section>
    <section style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 16px; padding: 30px; text-align: center;">
      <section style="font-size: 3em; font-weight: bold; color: white; margin-bottom: 10px;">50M+</section>
      <section style="color: rgba(255,255,255,0.8);">用户数量</section>
    </section>
    <section style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 16px; padding: 30px; text-align: center;">
      <section style="font-size: 3em; font-weight: bold; color: white; margin-bottom: 10px;">99%</section>
      <section style="color: rgba(255,255,255,0.8);">客户满意度</section>
    </section>
    <section style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 16px; padding: 30px; text-align: center;">
      <section style="font-size: 3em; font-weight: bold; color: white; margin-bottom: 10px;">24/7</section>
      <section style="color: rgba(255,255,255,0.8);">全天候支持</section>
    </section>
  </section>
</section>
</section>`,
  },
  {
    name: `英雄区布局`,
    content: `## 🚀 欢迎来到我们的世界

> 探索无限可能，创造非凡价值

### 我们的优势

- 🎯 专业技术支持
- 💡 创新解决方案
- 🌟 优质服务体验

[立即开始](#) | [了解更多](#)

---

## 核心特性

1. **高效性能**
   - 快速响应
   - 稳定可靠
   - 持续优化

2. **安全保障**
   - 数据加密
   - 隐私保护
   - 安全监控

3. **便捷体验**
   - 简单易用
   - 智能推荐
   - 个性定制`,
  },
  {
    name: `功能展示布局`,
    content: `## ✨ 产品功能

### 🎯 核心功能一
> 简单易用的操作界面，让您快速上手

- 直观的操作方式
- 智能的辅助功能
- 完整的使用教程

### 💡 核心功能二
> 强大的数据分析能力，助您决策精准

1. 实时数据监控
2. 智能分析报告
3. 可视化图表展示

### 🌟 核心功能三
> 全方位的服务支持，确保您使用无忧

\`\`\`
24/7 在线支持
专业技术团队
完善售后保障
\`\`\`

---

## 🎁 特色服务

| 服务项目 | 基础版 | 专业版 | 企业版 |
|---------|--------|--------|--------|
| 功能模块 | ✓ | ✓ | ✓ |
| 技术支持 | ✓ | ✓ | ✓ |
| 定制开发 | × | ✓ | ✓ |
| 专属顾问 | × | × | ✓ |`,
  },
  {
    name: `联系我们布局`,
    content: `## 📞 联系我们

### 🏢 公司信息
> 为您提供专业的服务与支持

**公司地址**
- 总部：城市中心商务区
- 分部：创新科技园区

**联系方式**
- 📧 Email：contact@example.com
- 📱 电话：400-123-4567
- 💬 微信：company_wechat

### 🌏 全球布局

| 区域 | 办公地点 | 联系电话 |
|------|---------|---------|
| 亚太 | 北京 | +86-10-xxxx |
| 欧洲 | 伦敦 | +44-20-xxxx |
| 美洲 | 纽约 | +1-212-xxxx |

### 📬 留言咨询

> 如有任何问题，欢迎随时联系我们

**工作时间**
- 周一至周五：9:00-18:00
- 周末及节假日：在线值班

*我们将在24小时内回复您的咨询*`,
  },
  {
    name: `用户评价布局`,
    content: `## 👥 用户评价

### ⭐️⭐️⭐️⭐️⭐️
> "使用体验非常好，团队响应迅速，解决问题专业。"
*—— 张经理，科技公司*

### ⭐️⭐️⭐️⭐️⭐️
> "产品功能强大，界面简洁，完全满足我们的需求。"
*—— 李总监，互联网企业*

### ⭐️⭐️⭐️⭐️⭐️
> "服务态度很好，技术支持及时，值得推荐。"
*—— 王工程师，制造企业*

---

## 📊 满意度统计

| 评价维度 | 满意度 | 评价数量 |
|---------|--------|---------|
| 产品功能 | 98% | 2000+ |
| 使用体验 | 95% | 1800+ |
| 服务支持 | 97% | 1500+ |
| 性价比 | 96% | 1600+ |

*数据更新时间：2024年1月*`,
  },
  {
    name: `响应式网格布局`,
    content: `<section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; padding: 20px;">
<!-- 网格项目1 -->
<section style="background: #fff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
  <img src="./assets/images/example.png" alt="图片描述" style="width: 100%; height: 200px; object-fit: cover;">
  <section style="padding: 20px;">
    <h3 style="margin: 0 0 10px; font-size: 1.5em;">标题一</h3>
    <p style="margin: 0; color: #666;">这里是内容描述...</p>
  </section>
</section>

<!-- 网格项目2 -->
<section style="background: #fff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
  <img src="./assets/images/example.png" alt="图片描述" style="width: 100%; height: 200px; object-fit: cover;">
  <section style="padding: 20px;">
    <h3 style="margin: 0 0 10px; font-size: 1.5em;">标题二</h3>
    <p style="margin: 0; color: #666;">这里是内容描述...</p>
  </section>
</section>

<!-- 网格项目3 -->
<section style="background: #fff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
  <img src="./assets/images/example.png" alt="图片描述" style="width: 100%; height: 200px; object-fit: cover;">
  <section style="padding: 20px;">
    <h3 style="margin: 0 0 10px; font-size: 1.5em;">标题三</h3>
    <p style="margin: 0; color: #666;">这里是内容描述...</p>
  </section>
</section>
</section>`,
  },
  {
    name: `特色内容布局`,
    content: `<section style="max-width: 1200px; margin: 0 auto; padding: 40px 20px;">
<!-- 头部区域 -->
<header style="text-align: center; margin-bottom: 60px;">
  <h1 style="font-size: 2.5em; color: #2d3436; margin-bottom: 20px;">特色内容标题</h1>
  <p style="color: #636e72; max-width: 600px; margin: 0 auto;">这里是内容的简要描述，可以添加一些吸引人的文字...</p>
</header>

<!-- 特色内容区 -->
<section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
  <!-- 特色项目1 -->
  <section style="background: linear-gradient(135deg, #6c5ce7, #a363d5); padding: 30px; border-radius: 16px; color: white;">
    <h3 style="margin: 0 0 15px; font-size: 1.8em;">🌟 特色一</h3>
    <p style="margin: 0; opacity: 0.9;">特色内容描述，突出重点和优势...</p>
  </section>

  <!-- 特色项目2 -->
  <section style="background: linear-gradient(135deg, #00b894, #00cec9); padding: 30px; border-radius: 16px; color: white;">
    <h3 style="margin: 0 0 15px; font-size: 1.8em;">💡 特色二</h3>
    <p style="margin: 0; opacity: 0.9;">特色内容描述，突出重点和优势...</p>
  </section>

  <!-- 特色项目3 -->
  <section style="background: linear-gradient(135deg, #fdcb6e, #e17055); padding: 30px; border-radius: 16px; color: white;">
    <h3 style="margin: 0 0 15px; font-size: 1.8em;">🎯 特色三</h3>
    <p style="margin: 0; opacity: 0.9;">特色内容描述，突出重点和优势...</p>
  </section>
</section>
</section>`,
  },
  {
    name: `现代卡片布局`,
    content: `<section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; padding: 20px;">
<!-- 卡片1：玻璃态设计 -->
<section style="background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); border-radius: 16px; padding: 30px; box-shadow: 0 8px 32px rgba(31,38,135,0.15);">
  <section style="font-size: 2em; margin-bottom: 20px;">🎨</section>
  <h3 style="margin: 0 0 15px; color: #2d3436;">创意设计</h3>
  <p style="margin: 0; color: #636e72;">现代简约的设计风格，突出内容重点...</p>
</section>

<!-- 卡片2：渐变背景 -->
<section style="background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%); border-radius: 16px; padding: 30px; box-shadow: 0 8px 32px rgba(31,38,135,0.15);">
  <section style="font-size: 2em; margin-bottom: 20px;">💡</section>
  <h3 style="margin: 0 0 15px; color: #2d3436;">创新理念</h3>
  <p style="margin: 0; color: #2d3436;">独特的创新思维，引领行业发展...</p>
</section>

<!-- 卡片3：深色主题 -->
<section style="background: #2d3436; border-radius: 16px; padding: 30px; box-shadow: 0 8px 32px rgba(31,38,135,0.15);">
  <section style="font-size: 2em; margin-bottom: 20px;">✨</section>
  <h3 style="margin: 0 0 15px; color: #fff;">卓越品质</h3>
  <p style="margin: 0; color: rgba(255,255,255,0.8);">追求极致的品质体验...</p>
</section>
</section>`,
  },
  {
    name: `分屏展示布局`,
    content: `<section style="min-height: 100vh; display: flex; flex-direction: column;">
<section style="flex: 1; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 20px; display: flex; align-items: center; justify-content: center;">
  <section style="max-width: 800px; text-align: center;">
    <h1 style="font-size: 3em; margin-bottom: 20px;">引人注目的标题</h1>
    <p style="font-size: 1.2em; opacity: 0.9;">这里是一段简短的描述文字，用来补充说明主标题的内容...</p>
    <button style="background: white; color: #764ba2; border: none; padding: 15px 30px; border-radius: 30px; font-size: 1.1em; margin-top: 30px; cursor: pointer;">
      了解更多
    </button>
  </section>
</section>
<section style="flex: 1; padding: 60px 20px; background: #f8f9fa;">
  <section style="max-width: 1200px; margin: 0 auto;">
    <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px;">
      <section style="text-align: center;">
        <section style="font-size: 2.5em; color: #764ba2; margin-bottom: 20px;">🎯</section>
        <h3 style="margin: 0 0 15px; color: #2d3436;">目标</h3>
        <p style="margin: 0; color: #636e72;">明确的目标定位...</p>
      </section>
      <section style="text-align: center;">
        <section style="font-size: 2.5em; color: #764ba2; margin-bottom: 20px;">💡</section>
        <h3 style="margin: 0 0 15px; color: #2d3436;">创意</h3>
        <p style="margin: 0; color: #636e72;">独特的创意理念...</p>
      </section>
      <section style="text-align: center;">
        <section style="font-size: 2.5em; color: #764ba2; margin-bottom: 20px;">✨</section>
        <h3 style="margin: 0 0 15px; color: #2d3436;">成果</h3>
        <p style="margin: 0; color: #636e72;">显著的成果展示...</p>
      </section>
    </section>
  </section>
</section>`,
  },
  {
    name: `瀑布流画廊`,
    content: `<section style="columns: 3; gap: 20px; padding: 20px;">
<!-- 画廊项目1 -->
<section style="break-inside: avoid; margin-bottom: 20px;">
  <section style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <img src="./assets/images/example.png" alt="画廊图片" style="width: 100%; display: block;">
    <section style="padding: 15px;">
      <h4 style="margin: 0 0 8px; color: #2d3436;">创意摄影</h4>
      <p style="margin: 0; color: #636e72; font-size: 0.9em;">独特视角下的艺术表现...</p>
    </section>
  </section>
</section>

<!-- 画廊项目2 -->
<section style="break-inside: avoid; margin-bottom: 20px;">
  <section style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <img src="./assets/images/example.png" alt="画廊图片" style="width: 100%; display: block;">
    <section style="padding: 15px;">
      <h4 style="margin: 0 0 8px; color: #2d3436;">自然风光</h4>
      <p style="margin: 0; color: #636e72; font-size: 0.9em;">大自然的鬼斧神工...</p>
    </section>
  </section>
</section>

<!-- 画廊项目3 -->
<section style="break-inside: avoid; margin-bottom: 20px;">
  <section style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <img src="./assets/images/example.png" alt="画廊图片" style="width: 100%; display: block;">
    <section style="padding: 15px;">
      <h4 style="margin: 0 0 8px; color: #2d3436;">城市掠影</h4>
      <p style="margin: 0; color: #636e72; font-size: 0.9em;">现代都市的律动...</p>
    </section>
  </section>
</section>

<!-- 画廊项目4 -->
<section style="break-inside: avoid; margin-bottom: 20px;">
  <section style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <img src="./assets/images/example.png" alt="画廊图片" style="width: 100%; display: block;">
    <section style="padding: 15px;">
      <h4 style="margin: 0 0 8px; color: #2d3436;">人文纪实</h4>
      <p style="margin: 0; color: #636e72; font-size: 0.9em;">记录生活的点滴...</p>
    </section>
  </section>
</section>
</section>`,
  },
  {
    name: `特色服务展示`,
    content: `  <section style="background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); padding: 60px 20px;">
<section style="max-width: 1200px; margin: 0 auto;">
  <header style="text-align: center; margin-bottom: 50px;">
    <h2 style="color: white; font-size: 2.5em; margin-bottom: 20px;">我们的服务</h2>
    <p style="color: rgba(255,255,255,0.9); max-width: 600px; margin: 0 auto;">为您提供全方位的专业服务支持，助力您的业务腾飞...</p>
  </header>

  <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">
    <section style="background: rgba(255,255,255,0.9); border-radius: 16px; padding: 30px; transform: translateY(0); transition: transform 0.3s; cursor: pointer;">
      <section style="width: 60px; height: 60px; background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
        <span style="font-size: 2em;">🎯</span>
      </section>
      <h3 style="margin: 0 0 15px; color: #2d3436;">战略咨询</h3>
      <p style="margin: 0; color: #636e72; line-height: 1.6;">提供专业的战略规划和业务咨询服务，助力企业实现可持续发展...</p>
      <section style="margin-top: 20px;">
        <a href="#" style="color: #fd79a8; text-decoration: none; font-weight: bold;">了解更多 →</a>
      </section>
    </section>
    <section style="background: rgba(255,255,255,0.9); border-radius: 16px; padding: 30px; transform: translateY(0); transition: transform 0.3s; cursor: pointer;">
      <section style="width: 60px; height: 60px; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
        <span style="font-size: 2em;">💡</span>
      </section>
      <h3 style="margin: 0 0 15px; color: #2d3436;">创新研发</h3>
      <p style="margin: 0; color: #636e72; line-height: 1.6;">持续创新和技术研发，为客户提供领先的解决方案...</p>
      <section style="margin-top: 20px;">
        <a href="#" style="color: #fd79a8; text-decoration: none; font-weight: bold;">了解更多 →</a>
      </section>
    </section>
    <section style="background: rgba(255,255,255,0.9); border-radius: 16px; padding: 30px; transform: translateY(0); transition: transform 0.3s; cursor: pointer;">
      <section style="width: 60px; height: 60px; background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
        <span style="font-size: 2em;">✨</span>
      </section>
      <h3 style="margin: 0 0 15px; color: #2d3436;">品质保障</h3>
      <p style="margin: 0; color: #636e72; line-height: 1.6;">严格的质量管理体系，确保每个项目的完美交付...</p>
      <section style="margin-top: 20px;">
        <a href="#" style="color: #fd79a8; text-decoration: none; font-weight: bold;">了解更多 →</a>
      </section>
    </section>
  </section>
</section>
</section>`,
  },
  {
    name: `新闻资讯布局`,
    content: `<section style="max-width: 100%; margin: 0 auto; padding: 20px;">
  <header style="text-align: center; margin-bottom: 30px;">
    <h2 style="font-size: 1.8em; color: #2d3436; margin-bottom: 12px;">最新动态</h2>
    <p style="color: #636e72; font-size: 0.95em;">及时了解我们的最新消息和行业资讯</p>
  </header>
  <section style="display: flex; flex-direction: column; gap: 25px;">   
    <!-- 卡片 1 -->
    <section style="background: white; border-radius: 14px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.08);">
      <img src="./assets/images/example.png" alt="新闻图片" style="width: 100%; height: 180px; object-fit: cover;">
      <section style="padding: 20px;">
        <section style="display: flex; align-items: center; margin-bottom: 12px;">
          <span style="background: #e17055; color: white; padding: 3px 10px; border-radius: 16px; font-size: 0.8em;">最新</span>
          <span style="margin-left: 8px; color: #636e72; font-size: 0.85em;">2024-01-15</span>
        </section>
        <h3 style="margin: 0 0 12px; color: #2d3436; font-size: 1.2em; line-height: 1.4;">行业重大突破：新技术引领未来</h3>
        <p style="margin: 0 0 16px; color: #636e72; line-height: 1.6; font-size: 0.95em;">最新技术突破为行业带来革命性变革，引领行业发展新方向...</p>
        <a href="#" style="color: #0984e3; text-decoration: none; font-weight: bold; font-size: 0.95em;">阅读全文 →</a>
      </section>
    </section>
    <!-- 卡片 2 -->
    <section style="background: white; border-radius: 14px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.08);">
      <img src="./assets/images/example.png" alt="新闻图片" style="width: 100%; height: 180px; object-fit: cover;">
      <section style="padding: 20px;">
        <section style="display: flex; align-items: center; margin-bottom: 12px;">
          <span style="background: #00b894; color: white; padding: 3px 10px; border-radius: 16px; font-size: 0.8em;">活动</span>
          <span style="margin-left: 8px; color: #636e72; font-size: 0.85em;">2024-01-10</span>
        </section>
        <h3 style="margin: 0 0 12px; color: #2d3436; font-size: 1.2em; line-height: 1.4;">2024年度技术峰会圆满结束</h3>
        <p style="margin: 0 0 16px; color: #636e72; line-height: 1.6; font-size: 0.95em;">年度技术峰会汇聚行业精英，共同探讨技术发展趋势...</p>
        <a href="#" style="color: #0984e3; text-decoration: none; font-weight: bold; font-size: 0.95em;">阅读全文 →</a>
      </section>
    </section>
    <!-- 卡片 3 -->
    <section style="background: white; border-radius: 14px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.08);">
      <img src="./assets/images/example.png" alt="新闻图片" style="width: 100%; height: 180px; object-fit: cover;">
      <section style="padding: 20px;">
        <section style="display: flex; align-items: center; margin-bottom: 12px;">
          <span style="background: #6c5ce7; color: white; padding: 3px 10px; border-radius: 16px; font-size: 0.8em;">公告</span>
          <span style="margin-left: 8px; color: #636e72; font-size: 0.85em;">2024-01-05</span>
        </section>
        <h3 style="margin: 0 0 12px; color: #2d3436; font-size: 1.2em; line-height: 1.4;">战略合作伙伴关系达成</h3>
        <p style="margin: 0 0 16px; color: #636e72; line-height: 1.6; font-size: 0.95em;">与行业领军企业达成战略合作，共同推动产业升级...</p>
        <a href="#" style="color: #0984e3; text-decoration: none; font-weight: bold; font-size: 0.95em;">阅读全文 →</a>
      </section>
    </section>
  </section>
</section>`,
  },
  {
    name: `活动日历布局`,
    content: `<section style="max-width: 1200px; margin: 0 auto; padding: 40px 20px;">
<header style="text-align: center; margin-bottom: 50px;">
  <h2 style="font-size: 2.5em; color: #2d3436; margin-bottom: 20px;">近期活动</h2>
  <p style="color: #636e72;">不要错过这些精彩的活动和机会</p>
</header>

<section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
  <!-- 活动卡片1 -->
  <section style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <section style="background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%); padding: 20px; text-align: center;">
      <section style="font-size: 2.5em; font-weight: bold; color: #2d3436;">25</section>
      <section style="color: #2d3436;">一月 2024</section>
    </section>
    <section style="padding: 24px;">
      <h3 style="margin: 0 0 15px; color: #2d3436;">技术创新研讨会</h3>
      <section style="margin-bottom: 15px;">
        <section style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="margin-right: 10px;">🕒</span>
          <span style="color: #636e72;">14:00 - 17:00</span>
        </section>
        <section style="display: flex; align-items: center;">
          <span style="margin-right: 10px;">📍</span>
          <span style="color: #636e72;">科技园区会议中心</span>
        </section>
      </section>
      <p style="margin: 0 0 20px; color: #636e72; line-height: 1.6;">探讨最新技术趋势，分享创新实践经验...</p>
      <button style="background: #2d3436; color: white; border: none; padding: 10px 20px; border-radius: 25px; width: 100%; cursor: pointer;">
        立即报名
      </button>
    </section>
  </section>

  <!-- 活动卡片2 -->
  <section style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <section style="background: linear-gradient(135deg, #ffd3b6 0%, #ffaaa5 100%); padding: 20px; text-align: center;">
      <section style="font-size: 2.5em; font-weight: bold; color: #2d3436;">28</section>
      <section style="color: #2d3436;">一月 2024</section>
    </section>
    <section style="padding: 24px;">
      <h3 style="margin: 0 0 15px; color: #2d3436;">产品发布会</h3>
      <section style="margin-bottom: 15px;">
        <section style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="margin-right: 10px;">🕒</span>
          <span style="color: #636e72;">10:00 - 12:00</span>
        </section>
        <section style="display: flex; align-items: center;">
          <span style="margin-right: 10px;">📍</span>
          <span style="color: #636e72;">国际会展中心</span>
        </section>
      </section>
      <p style="margin: 0 0 20px; color: #636e72; line-height: 1.6;">重磅新品发布，带来全新用户体验...</p>
      <button style="background: #2d3436; color: white; border: none; padding: 10px 20px; border-radius: 25px; width: 100%; cursor: pointer;">
        预约参加
      </button>
    </section>
  </section>

  <!-- 活动卡片3 -->
  <section style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <section style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 20px; text-align: center;">
      <section style="font-size: 2.5em; font-weight: bold; color: #2d3436;">30</section>
      <section style="color: #2d3436;">一月 2024</section>
    </section>
    <section style="padding: 24px;">
      <h3 style="margin: 0 0 15px; color: #2d3436;">用户体验工作坊</h3>
      <section style="margin-bottom: 15px;">
        <section style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="margin-right: 10px;">🕒</span>
          <span style="color: #636e72;">13:30 - 16:30</span>
        </section>
        <section style="display: flex; align-items: center;">
          <span style="margin-right: 10px;">📍</span>
          <span style="color: #636e72;">创意设计中心</span>
        </section>
      </section>
      <p style="margin: 0 0 20px; color: #636e72; line-height: 1.6;">深入探讨用户体验设计的最佳实践...</p>
      <button style="background: #2d3436; color: white; border: none; padding: 10px 20px; border-radius: 25px; width: 100%; cursor: pointer;">
        我要参加
      </button>
    </section>
  </section>
</section>
</section>`,
  },
]
