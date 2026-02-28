// 图文样式模板
export const imageContentTemplates = [
  {
    name: `图文-上图下文`,
    content: `<section style="text-align: center; padding: 20px; background: white; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="max-width: 100%; border-radius: 10px; overflow: hidden; margin-bottom: 15px;">
            <img src="./assets/images/example.png"
                style="width: 100%; height: auto; object-fit: cover; border-radius: 10px;"
              />
          </div>
          <h3 style="margin: 0 0 10px;font-size:2.0rem;  color: #2d3436;">美食时光</h3>
          <p>品味生活中的每一个瞬间</p>
          <p>让美食触动味蕾，温暖心灵</p>
          <br>
           <span style="display: inline-block; padding: 5px 12px; background: #ffeaa7; color: #2d3436; border-radius: 15px; font-size: 0.6em;">#美食</span>
           <span style="display: inline-block; padding: 5px 12px; background: #fab1a0; color: #2d3436; border-radius: 15px; font-size: 0.6em; margin-left: 8px;">#生活</span>
</section>
    `,
  },
  {
    name: `图文-直角紧凑九宫格`,
    content: `
<section style="padding: 20px; background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;">
  <h5 style="margin: 0 0 20px; font-size: 18px; color: #2d3436;">旅行相册</h5>
  <table style="width: 100%; border-collapse: collapse; margin: 0 auto;">
    <tr>
      <td style="width: 33.3%; padding: 2px; vertical-align: top;"><img src="./assets/images/example.png" style="width: 100%; height: auto; display: block;" alt="1"/></td>
      <td style="width: 33.3%; padding: 2px; vertical-align: top;"><img src="./assets/images/example.png" style="width: 100%; height: auto; display: block;" alt="2"/></td>
      <td style="width: 33.3%; padding: 2px; vertical-align: top;"><img src="./assets/images/example.png" style="width: 100%; height: auto; display: block;" alt="3"/></td>
    </tr>
    <tr>
      <td style="width: 33.3%; padding: 2px; vertical-align: top;"><img src="./assets/images/example.png" style="width: 100%; height: auto; display: block;" alt="4"/></td>
      <td style="width: 33.3%; padding: 2px; vertical-align: top;"><img src="./assets/images/example.png" style="width: 100%; height: auto; display: block;" alt="5"/></td>
      <td style="width: 33.3%; padding: 2px; vertical-align: top;"><img src="./assets/images/example.png" style="width: 100%; height: auto; display: block;" alt="6"/></td>
    </tr>
    <tr>
      <td style="width: 33.3%; padding: 2px; vertical-align: top;"><img src="./assets/images/example.png" style="width: 100%; height: auto; display: block;" alt="7"/></td>
      <td style="width: 33.3%; padding: 2px; vertical-align: top;"><img src="./assets/images/example.png" style="width: 100%; height: auto; display: block;" alt="8"/></td>
      <td style="width: 33.3%; padding: 2px; vertical-align: top;"><img src="./assets/images/example.png" style="width: 100%; height: auto; display: block;" alt="9"/></td>
    </tr>
  </table>
  <p style="margin-top: 20px; color: #636e72; font-size: 14px; text-align: center;">
    记录旅途中的精彩瞬间，留下最美好的回忆
  </p>
</section>`,
  },
  {
    name: `图文-产品介绍`,
    content: `<section style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <img src="./assets/images/example.png" alt="产品预览" style="width: 100%; max-width: 100%; display: block; border-radius: 8px; margin-bottom: 20px;">
  <section style="margin: 0; padding: 0;">
    <section style="display: flex; align-items: flex-start; gap: 20px; margin-bottom: 20px;">
      <section style="flex: 0 0 auto;">
        <img src="./assets/images/example.png" alt="产品1" style="width: 120px; height: 120px; display: block; border-radius: 8px; object-fit: cover;">
      </section>
      <section style="flex: 1;">
        <section style="font-weight: bold; margin-bottom: 8px;">产品1</section>
        <section style="font-size: 14px; color: #666; line-height: 1.5;">
          产品1介绍
        </section>
      </section>
    </section>
    <section style="display: flex; align-items: flex-start; gap: 20px; margin-bottom: 20px;">
      <section style="flex: 0 0 auto;">
        <img src="./assets/images/example.png" alt="产品2" style="width: 120px; height: 120px; display: block; border-radius: 8px; object-fit: cover;">
      </section>
      <section style="flex: 1;">
        <section style="font-weight: bold; margin-bottom: 8px;">产品2</section>
        <section style="font-size: 14px; color: #666; line-height: 1.5;">
          产品2介绍
        </section>
      </section>
    </section>
    <section style="display: flex; align-items: flex-start; gap: 20px;">
      <section style="flex: 0 0 auto;">
        <img src="./assets/images/example.png" alt="产品3" style="width: 120px; height: 120px; display: block; border-radius: 8px; object-fit: cover;">
      </section>
      <section style="flex: 1;">
        <section style="font-weight: bold; margin-bottom: 8px;">产品3</section>
        <section style="font-size: 14px; color: #666; line-height: 1.5;">
          产品3介绍
        </section>
      </section>
    </section>
  </section>
</section>`,
  },
  {
    name: `图文-三视图`,
    content: `<section style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <section style="text-align: center; margin-bottom: 30px;">
    <img src="./assets/images/example.png" alt="全景图" style="width: 100%; max-width: 300px; display: block; border-radius: 8px; margin: 0 auto;">
    <section style="margin-top: 10px; font-weight: bold; font-size: 18px;">全景图</section>
  </section>
  <section style="display: flex; flex-direction: column; align-items: center;">
    <section style="display: flex; justify-content: center; gap: 20px; width: 100%; flex-wrap: wrap;">
      <section style="flex: 1; text-align: center; max-width: 200px; min-width: 150px;">
        <img src="./assets/images/example.png" alt="正视图" style="width: 100%; max-width: 100%; display: block; border-radius: 8px; margin-bottom: 8px;">
        <section style="font-weight: bold; margin-bottom: 5px;">正视图</section>
        <section style="font-size: 14px; color: #666;">
          正面设计展示
        </section>
      </section>
      <section style="flex: 1; text-align: center; max-width: 200px; min-width: 150px;">
        <img src="./assets/images/example.png" alt="侧视图" style="width: 100%; max-width: 100%; display: block; border-radius: 8px; margin-bottom: 8px;">
        <section style="font-weight: bold; margin-bottom: 5px;">侧视图</section>
        <section style="font-size: 14px; color: #666;">
          侧面轮廓展示
        </section>
      </section>
      <section style="flex: 1; text-align: center; max-width: 200px; min-width: 150px;">
        <img src="./assets/images/example.png" alt="后视图" style="width: 100%; max-width: 100%; display: block; border-radius: 8px; margin-bottom: 8px;">
        <section style="font-weight: bold; margin-bottom: 5px;">后视图</section>
        <section style="font-size: 14px; color: #666;">
          尾部设计展示
        </section>
      </section>
    </section>
  </section>
</section>`,
  },
  {
    name: `图文-五位一体`,
    content: `<section style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center">
  <section style="font-weight: bold; font-size: 24px; color: #2c3e50; margin-bottom: 8px">
    <span>五位一体展示</span>
  </section>
  <section style="font-size: 16px; color: #7f8c8d; margin-bottom: 20px">
    <span>上北下南左西右东</span>
  </section>
  <section style="display: flex; justify-content: center; margin: 0 auto; max-width: 360px">
    <div class="tableWrapper">
      <table style="table-layout: fixed; min-width: 75px; border: none; border-collapse: collapse; border-spacing: 0;">
        <tbody>
          <tr>
            <td style="padding: 0; border: none; text-align: center; vertical-align: middle"></td>
            <td style="padding: 0; border: none; text-align: center; vertical-align: middle">
                 <img src="./assets/images/example.png" style="max-width: 100%; height: auto; display: block; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            </td>
            <td style="padding: 0; border: none; text-align: center; vertical-align: middle"></td>
          </tr>
          <tr>
            <td style="padding: 0; border: none; text-align: center; vertical-align: middle">
              <img src="./assets/images/example.png" style="max-width: 100%; height: auto; display: block; border-top-left-radius: 8px; border-bottom-left-radius: 8px;">
            </td>
            <td style="padding: 0; border: none; text-align: center; vertical-align: middle">
              <img src="./assets/images/example.png" style="max-width: 100%; height: auto; display: block; ">
            </td>
            <td style="padding: 0; border: none; text-align: center; vertical-align: middle">
              <img src="./assets/images/example.png" style="max-width: 100%; height: auto; display: block; border-top-right-radius: 8px; border-bottom-right-radius: 8px;">
            </td>
          </tr>
          <tr>
            <td style="padding: 0; border: none; text-align: center; vertical-align: middle"></td>
            <td style="padding: 0; border: none; text-align: center; vertical-align: middle">
              <img src="./assets/images/example.png" style="max-width: 100%; height: auto; display: block; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            </td>
            <td style="padding: 0; border: none; text-align: center; vertical-align: middle"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</section>`,
  },
  {
    name: `图文-故事书`,
    content: `<section style="padding: 15px; background: white; box-sizing: border-box;">
  <section style="display: flex; flex-direction: row; width: 100%;">
    <section style="flex: 1; min-width: 45%; padding: 30px 15px 15px 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box; border-top-left-radius: 10px; border-bottom-left-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); color:#666;">
      <h2 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">城市漫步</h2>
      <h2 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 400;">URBAN WALKING</h2>
      <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.6;">漫步在城市的街头，</p>
      <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.6;">感受都市的脉动，</p>
      <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.6;">发现生活的美好。</p>
      <div style="margin-top: 10px; display: flex; gap: 8px;">
        <span style="display: inline-block; padding: 6px 12px; background: #dfe6e9; color: #2d3436; border-radius: 15px; font-size: 0.8em;">
          <a class="wx_topic_link" topic-id="mgyg9hmt-zfybi0" style="color: #576B95; text-decoration: none;" data-topic="1">#城市</a>
        </span>
        <span style="display: inline-block; padding: 6px 12px; background: #dfe6e9; color: #2d3436; border-radius: 15px; font-size: 0.8em;">
          <a class="wx_topic_link" topic-id="mgyg9hmt-ckuhjk" style="color: #576B95; text-decoration: none;" data-topic="1">#生活</a>
        </span>
      </div>
    </section>
    <section style="flex: 1; min-width: 55%; display: flex; align-items: stretch; box-sizing: border-box;">
      <img src="./assets/images/example.png"
           alt="城市漫步"
           style="width: 100%; height: 100%; object-fit: cover; display: block; border-top-right-radius: 10px; border-bottom-right-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
    </section>
  </section>
</section>`,
  },
  {
    name: `图文-画廊风`,
    content: `<section style="padding: 20px; background: #fff; border-radius: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-bottom: 20px; overflow: hidden;">
  <section style="display: flex; width: 100%; height: 380px; box-sizing: border-box; margin: 0; padding: 0;">
    <section style="width: 70%; padding-right: 15px; box-sizing: border-box; position: relative; margin: 0; padding: 0; height: 100% !important;">
      <section style="width: 100%; height: 100%; border-top-left-radius: 8px;  border-bottom-left-radius: 8px; overflow: hidden; margin: 0; padding: 0; height: 100% !important;">
        <img src="./assets/images/example.png" 
             alt="主图" 
             style="width: 100%; height: auto; display: block; min-height: 100% !important; margin: 0; padding: 0;">
      </section>
    </section>
    <section style="width: 30%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; margin: 0; padding: 0; height: 100% !important;">
      <section style="width: 100%; height: 120px; margin-bottom: 10px; border-top-right-radius: 8px;  border-bottom-right-radius: 8px; overflow: hidden; margin: 0; padding: 0; height: 120px !important;">
        <img src="./assets/images/example.png" 
             alt="缩略图1" 
             style="width: 100%; height: auto; display: block; min-height: 100% !important; margin: 0; padding: 0;">
      </section>
      <section style="width: 100%; height: 120px; margin-bottom: 10px; border-top-right-radius: 8px;  border-bottom-right-radius: 8px;overflow: hidden; margin: 0; padding: 0; height: 120px !important;">
        <img src="./assets/images/example.png" 
             alt="缩略图2" 
             style="width: 100%; height: auto; display: block; min-height: 100% !important; margin: 0; padding: 0;">
      </section>
      <section style="width: 100%; height: 120px; border-top-right-radius: 8px;  border-bottom-right-radius: 8px;overflow: hidden; margin: 0; padding: 0; height: 120px !important;">
        <img src="./assets/images/example.png" 
             alt="缩略图3" 
             style="width: 100%; height: auto; display: block; min-height: 100% !important; margin: 0; padding: 0;">
      </section>
    </section>
  </section>
  <section style="text-align: center; margin-top: 20px;">
    <h3 style="margin: 0 0 12px; font-size: 1.8em; color: #2d3436; font-weight: bold;">自然画廊</h3>
    <p style="margin: 0; color: #636e72; line-height: 1.6; font-size: 16px;">
      大自然的色彩斑斓，<br>
      尽收眼底。
    </p>
  </section>
</section>`,
  },
  {
    name: `图文-圆角宽松九宫格`,
    content: `<section style="padding: 20px; background: white; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
  <section style="columns: 3; gap: 20px;">
    <section style="margin-bottom: 20px; break-inside: avoid;">
      <img src="./assets/images/example.png" style="width: 100%; border-radius: 10px;" alt="风景图1"/>
    </section>
    <section style="margin-bottom: 20px; break-inside: avoid;">
      <img src="./assets/images/example.png" style="width: 100%; border-radius: 10px;" alt="风景图2"/>
    </section>
    <section style="margin-bottom: 20px; break-inside: avoid;">
      <img src="./assets/images/example.png" style="width: 100%; border-radius: 10px;" alt="风景图3"/>
    </section>
    <section style="margin-bottom: 20px; break-inside: avoid;">
      <img src="./assets/images/example.png" style="width: 100%; border-radius: 10px;" alt="风景图4"/>
    </section>
    <section style="margin-bottom: 20px; break-inside: avoid;">
      <img src="./assets/images/example.png" style="width: 100%; border-radius: 10px;" alt="风景图5"/>
    </section>
     <section style="margin-bottom: 20px; break-inside: avoid;">
      <img src="./assets/images/example.png" style="width: 100%; border-radius: 10px;" alt="风景图6"/>
        </section>
     <section style="margin-bottom: 20px; break-inside: avoid;">
      <img src="./assets/images/example.png" style="width: 100%; border-radius: 10px;" alt="风景图7"/>
        </section>
     <section style="margin-bottom: 20px; break-inside: avoid;">
      <img src="./assets/images/example.png" style="width: 100%; border-radius: 10px;" alt="风景图8"/>
        </section>
     <section style="margin-bottom: 20px; break-inside: avoid;">
      <img src="./assets/images/example.png" style="width: 100%; border-radius: 10px;" alt="风景图9"/>
        </section>    
  </section>
</section>`,
  },
  {
    name: `图片-一主四副`,
    content: `<section style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  <section style="margin: 0;">
    <section style="margin-bottom: 15px;">
      <img src="./assets/images/example.png" style="width: 100%; border-radius: 8px;">
    </section>
    <section style="display: flex; flex-wrap: wrap; gap: 10px;">
      <section style="flex: 1; min-width: 45%;">
        <img src="./assets/images/example.png" style="width: 100%; border-radius: 8px;">
      </section>
      <section style="flex: 1; min-width: 45%;">
        <img src="./assets/images/example.png" style="width: 100%; border-radius: 8px;">
      </section>
      <section style="flex: 1; min-width: 45%;">
        <img src="./assets/images/example.png" style="width: 100%; border-radius: 8px;">
      </section>
      <section style="flex: 1; min-width: 45%;">
        <img src="./assets/images/example.png" style="width: 100%; border-radius: 8px;">
      </section>
    </section>
  </section>
</section>`,
  },
  {
    name: `图片-摄影集`,
    content: `<section style="padding: 30px; background: white; border-radius: 15px; color: #333;">
  <h3 style="margin: 0 0 20px; font-size: 1.8em; text-align: center; color: #222;">摄影作品集</h3>
  <section style="display: flex; flex-wrap: wrap; gap: 20px;">
    <section style="flex: 1; min-width: calc(50% - 10px);">
  <section style="border-radius: 10px; overflow: hidden;">
    <img
      src="./assets/images/example.png"
      style="width: 100%; display: block; vertical-align: top; margin: 0;"
      alt="自然之光"
    />
    <section style="
      margin-top: -50px;
      padding: 4px 20px 16px;
      background: rgba(0,0,0,0.7);
      color: white;
      font-size: 1.2em;
      font-weight: bold;
      border-radius: 0 0 10px 10px;
    ">自然之光</section>
  </section>
</section>
    <section style="flex: 1; min-width: calc(50% - 10px);">
      <section style="border-radius: 10px; overflow: hidden;">
        <img 
          src="./assets/images/example.png" 
          style="width: 100%; display: block; margin: 0;"
          alt="城市剪影"
        />
        <section style="
          margin-top: -50px;
          padding: 4px 20px 16px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          font-size: 1.2em;
          font-weight: bold;
          border-radius: 0 0 10px 10px;
        ">城市剪影</section>
      </section>
    </section>
  </section>
</section>`,
  },
  {
    name: `图片-故事展示`,
    content: `<section style="padding: 20px; background: #f8f9fa; border-radius: 10px">
  <!-- 主图 -->
  <section style="border-radius: 8px; overflow: hidden; margin-bottom: 20px">
    <img src="./assets/images/example.png" 
         style="width: 100%; display: block" 
         alt="旅行主图" />
  </section>
  <!-- 三列小图 -->
  <section style="display: flex; justify-content: space-between; margin-top: 20px">
    <section style="width: 32%">
      <img src="./assets/images/example.png" 
           style="width: 100%; border-radius: 6px" 
           alt="清晨的阳光" />
      <p style="margin: 8px 0 0; color: #666; font-size: 14px; line-height: 1.4">清晨的阳光</p>
    </section>    
    <section style="width: 32%">
      <img src="./assets/images/example.png" 
           style="width: 100%; border-radius: 6px" 
           alt="午后时光" />
      <p style="margin: 8px 0 0; color: #666; font-size: 14px; line-height: 1.4">午后时光</p>
    </section>    
    <section style="width: 32%">
      <img src="./assets/images/example.png" 
           style="width: 100%; border-radius: 6px" 
           alt="日落余晖" />
      <p style="margin: 8px 0 0; color: #666; font-size: 14px; line-height: 1.4">日落余晖</p>
    </section>
  </section>
</section>`,
  },
  {
    name: `图文-左图右文`,
    content: `<section style="margin: 20px 0; padding: 20px; background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
  <section style="display: flex; gap: 20px; align-items: center;">
    <section style="width: 150px; height: 100%; flex-shrink: 0;">
      <img src="./assets/images/example.png" 
           style="width: 100%; height: 100%; border-radius: 10px; display: block;" 
           alt="简约风图片"/>
    </section>  
    <section style="flex: 1;">
      <h3 style="margin: 0 0 10px; color: #2d3436; font-size: 1.3em;">简约生活</h3>
      <p style="margin: 0; color: #636e72; line-height: 1.6;">
        简约是一种生活态度，追求简单而不失品质的生活方式。
      </p>
    </section>
  </section>
</section>`,
  },
  {
    name: `图文-上图下文`,
    content: `<section style="margin: 20px 0; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
  <img 
    src="./assets/images/example.png"
    style="width: 100%; display: block; vertical-align: top;"
    alt="时尚风图片"
  />
  <section style="padding: 20px;">
    <h3 style="margin: 0 0 10px; color: #2d3436; font-size: 1.3em;">时尚潮流</h3>
    <p style="margin: 0; color: #636e72; line-height: 1.6;">
      时尚不仅仅是外表的装饰，更是一种生活态度的体现。
    </p>
  </section>
</section>`,
  },
  {
    name: `图文-网格布局`,
    content: `<section style="margin: 20px 0; padding: 20px; background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
  <h3 style="margin: 0 0 15px; color: #2d3436; font-size: 1.3em;">文艺时光</h3>
  <section style="display: flex; flex-wrap: wrap; gap: 15px;">
    <section style="flex: 1; min-width: calc(33.333% - 10px); border-radius: 10px; overflow: hidden;">
      <img 
        src="./assets/images/example.png"
        style="width: 100%; height: auto; display: block; vertical-align: top;"
        alt="文艺图片1"
      />
    </section>
    <section style="flex: 1; min-width: calc(33.333% - 10px); border-radius: 10px; overflow: hidden;">
      <img 
        src="./assets/images/example.png"
        style="width: 100%; height: auto; display: block; vertical-align: top;"
        alt="文艺图片2"
      />
    </section>
    <section style="flex: 1; min-width: calc(33.333% - 10px); border-radius: 10px; overflow: hidden;">
      <img 
        src="./assets/images/example.png"
        style="width: 100%; height: auto; display: block; vertical-align: top;"
        alt="文艺图片3"
      />
    </section>
  </section>
  <p style="margin: 15px 0 0; color: #636e72; line-height: 1.6;">
    文艺是一种生活态度，记录生活中的美好瞬间。
  </p>
</section>`,
  },
  {
    name: `图文-卡片画廊`,
    content: `<section style="display: flex; flex-wrap: nowrap; width: 100%;">
  <section style="flex: 1; background: white; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <img src="./assets/images/example.png" style="width:100%; height:200px; display:block; border-radius:8px;" alt="城市图片1"/>
    <h4 style="margin:10px 0; color:#333;">城市之光</h4>
    <p style="margin:0; color:#666; font-size:0.9em;">城市的繁华与美丽</p>
  </section>
  <section style="flex: 1; background: white; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <img src="./assets/images/example.png" style="width:100%; height:200px; display:block; border-radius:8px;" alt="城市图片2"/>
    <h4 style="margin:10px 0; color:#333;">建筑之美</h4>
    <p style="margin:0; color:#666; font-size:0.9em;">现代建筑的魅力</p>
  </section>
  <section style="flex: 1; background: white; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <img src="./assets/images/example.png" style="width:100%; height:200px; display:block; border-radius:8px;" alt="城市图片3"/>
    <h4 style="margin:10px 0; color:#333;">城市夜景</h4>
    <p style="margin:0; color:#666; font-size:0.9em;">璀璨的夜晚</p>
  </section>
</section>`,
  },
  {
    name: `图文-创意拼贴`,
    content: `<section style="padding: 20px; background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
  <section style="display: flex; gap: 15px;">
    <section style="flex: 2; border-radius: 15px; overflow: hidden;">
      <img 
        src="./assets/images/example.png"
        style="width: 100%; display: block; vertical-align: top; border-radius: 15px;"
        alt="主图"
      />
    </section>
    <section style="flex: 1; display: flex; flex-direction: column; gap: 15px;">
      <section style="border-radius: 15px; overflow: hidden;">
        <img 
          src="./assets/images/example.png"
          style="width: 100%; display: block; vertical-align: top; border-radius: 15px;"
          alt="配图1"
        />
      </section>
      <section style="border-radius: 15px; overflow: hidden;">
        <img 
          src="./assets/images/example.png"
          style="width: 100%; display: block; vertical-align: top; border-radius: 15px;"
          alt="配图2"
        />
      </section>
    </section>
  </section>
  <section style="margin-top: 10px; text-align: center;">
    <h3 style="margin: 0 0 8px; color: #2d3436; font-size: 1.5em;">记录生活的美好瞬间</h3>
    <p style="margin: 0; color: #636e72; line-height: 1.6;">
      每一个画面都是独特的故事，每一帧都值得被珍藏。
    </p>
  </section>
</section>`,
  },
  {
    name: `图文-圆形切割`,
    content: `<section style="padding: 20px; background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
  <section style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">
    <section style="width: 150px; height: 150px; border-radius: 50%; overflow: hidden;">
      <img src="./assets/images/example.png" 
           style="width: 100%; height: auto; display: block; min-height: 150px; object-fit: cover; 
           alt="圆形图1"/>
    </section>
    <section style="width: 150px; height: 150px; border-radius: 50%; overflow: hidden;">
      <img src="./assets/images/example.png" 
           style="width: 100%; height: auto; display: block; min-height: 150px; object-fit: cover;"
           alt="圆形图2"/>
    </section>
    <section style="width: 150px; height: 150px; border-radius: 50%; overflow: hidden;">
      <img src="./assets/images/example.png" 
           style="width: 100%; height: auto; display: block; min-height: 150px; object-fit: cover;"
           alt="圆形图3"/>
    </section>
  </section>
  <section style="text-align: center;">
    <h3 style="margin: 0 0 10px; color: #2d3436; font-size: 1.5em;">圆满人生</h3>
    <p style="margin: 0; color: #636e72; line-height: 1.6;">
      生活中的每个圆满时刻，都值得被铭记。
    </p>
  </section>
</section>`,
  },
  {
    name: `图文-六边形蜂窝`,
    content: `<section style="padding: 20px; background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; font-size: 0;">
  <section style="
      display: inline-block;
      width: 30%;
      margin-right: 3.333%;
      -webkit-clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      overflow: hidden;
      vertical-align: top;
      background: #dcdcdc;
  ">
    <img src="./assets/images/example.png" 
         style="width: 100%; height: auto; display: block;" 
         alt="六边形图1"/>
  </section>
  <section style="
      display: inline-block;
      width: 30%;
      margin-right: 3.333%;
      -webkit-clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      overflow: hidden;
      vertical-align: top;
      background: #dcdcdc;
  ">
    <img src="./assets/images/example.png" 
         style="width: 100%; height: auto; display: block;" 
         alt="六边形图2"/>
  </section>
  <section style="
      display: inline-block;
      width: 30%;
      -webkit-clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      overflow: hidden;
      vertical-align: top;
      background: #dcdcdc;
  ">
    <img src="./assets/images/example.png" 
         style="width: 100%; height: auto; display: block;" 
         alt="六边形图3"/>
  </section>
  <section style="text-align: center; margin-top: 20px; font-size: 16px;">
    <h3 style="margin: 0 0 10px; color: #2d3436;">蜂巢式回忆</h3>
    <p style="margin: 0; color: #636e72;">每一个六边形都是一段独特的故事</p>
  </section>
</section>`,
  },
  {
    name: `图文-倾斜卡片墙`,
    content: `<section style="padding: 20px; background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
  <section style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
    <section style="transform: rotate(-3deg); background: #e0e0e0; border-radius: 10px;">
      <img src="./assets/images/example.png" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" alt="卡片1"/>
    </section>
    <section style="transform: rotate(3deg); background: #e0e0e0; border-radius: 10px;">
      <img src="./assets/images/example.png" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" alt="卡片2"/>
    </section>
    <section style="transform: rotate(3deg); background: #e0e0e0; border-radius: 10px;">
      <img src="./assets/images/example.png" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" alt="卡片3"/>
    </section>
    <section style="transform: rotate(-3deg); background: #e0e0e0; border-radius: 10px;">
      <img src="./assets/images/example.png" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" alt="卡片4"/>
    </section>
  </section>
</section>`,
  },
]
