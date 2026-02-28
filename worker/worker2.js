let accessToken = "";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const targetPath = url.pathname;

    // 1. 处理OPTIONS预检请求（新增跨域支持）
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    // 2. 首页返回伪装页面
    if (targetPath === "/") {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>WeChat API Proxy</title></head>
        <body>
          <h1>WeChat API Proxy Service</h1>
          <p>This is a proxy for WeChat Official Account APIs.</p>
        </body>
        </html>
      `, { 
        headers: { 
          'Content-Type': 'text/html',
          "Access-Control-Allow-Origin": "*" 
        } 
      });
    }

    // 3. 调试输出IP
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    console.log(`[Debug] Client IP: ${clientIP}`);

    // 4. 代理微信公众号API
    const wechatApiUrl = `https://api.weixin.qq.com${targetPath}${url.search}`;

    // 5. 处理Access Token
    accessToken = url.searchParams.get('access_token') 
                 || env.WECHAT_ACCESS_TOKEN 
                 || accessToken;

    if (!accessToken && !targetPath.includes('/token')) {
      return new Response('Access Token is required', { 
        status: 401,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    // 6. 构建请求头
    const headers = new Headers(request.headers);
    headers.set('Host', 'api.weixin.qq.com');
    headers.delete('Origin'); // 移除Origin头避免微信API拒绝
    if (accessToken) {
      url.searchParams.set('access_token', accessToken);
    }

    // 7. 转发请求
    try {
      const response = await fetch(wechatApiUrl, {
        method: request.method,
        headers: headers,
        body: request.body,
        cf: { ipFamily: 'v4' }
      });

      // 8. 返回响应（添加跨域头）
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set("Access-Control-Allow-Origin", "*");
      responseHeaders.set("Vary", "Origin");

      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: `Proxy Error: ${error.message}`,
        debugIp: clientIP
      }), { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });
    }
  }
};