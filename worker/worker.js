/**
 * 中龙燃控 - 钉钉留言代理 Worker
 *
 * 部署：
 *   1. npx wrangler deploy
 *   2. npx wrangler secret put DING_ACCESS_TOKEN
 *   3. npx wrangler secret put DING_SECRET
 *
 * 建议绑定到主域名路由（Cloudflare Dashboard → Workers Routes）：
 *   www.pyzlrk.cn/api/contact → zhonglong-contact-proxy
 */

// ===== 配置 =====
const ALLOWED_ORIGINS = [
  'https://www.pyzlrk.cn',
  'https://pyzlrk.cn',
];

// 频率限制：同 IP 每分钟最多 3 次（防脚本批量提交）
const RATE_LIMIT_WINDOW = 60_000;   // 1 分钟
const RATE_LIMIT_MAX = 3;

// 简易内存限流（生产建议换 Durable Object 或 Redis）
// Cloudflare Workers 单个 isolate 内存跨请求共享，但不同 colo 独立
const rateMap = new Map();

// 定期清理过期记录，避免内存泄漏
function cleanRateMap() {
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    if (now - entry.resetAt > RATE_LIMIT_WINDOW * 2) {
      rateMap.delete(key);
    }
  }
}

function checkRateLimit(clientIP) {
  const now = Date.now();
  let entry = rateMap.get(clientIP);
  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + RATE_LIMIT_WINDOW };
    rateMap.set(clientIP, entry);
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count++;
  return true;
}

// ===== 辅助函数 =====
function json(data, status, extraHeaders) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    ...extraHeaders,
  };
  return new Response(JSON.stringify(data), { status, headers });
}

function isOriginAllowed(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(function(o) { return origin === o; });
}

// ===== Worker 入口 =====
export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin');

    // CORS 预检
    if (request.method === 'OPTIONS') {
      const corsOrigin = isOriginAllowed(origin) ? origin : '';
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // 只接受 POST
    if (request.method !== 'POST') {
      return json({ errcode: -1, errmsg: 'Method not allowed' }, 405);
    }

    // CORS 来源校验
    if (!isOriginAllowed(origin)) {
      return json({ errcode: -1, errmsg: 'Forbidden' }, 403);
    }

    // 频率限制
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return json({ errcode: -1, errmsg: '提交过于频繁，请稍后再试' }, 429);
    }

    // 定期清理（利用 ctx.waitUntil 避免阻塞响应）
    ctx.waitUntil((async () => { cleanRateMap(); })());

    // 解析请求体
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ errcode: -1, errmsg: '无效的 JSON 请求体' }, 400);
    }

    // 蜜罐检测（隐藏字段 website 被填充 = 机器人）
    if (body.website) {
      // 返回成功以迷惑机器人
      return json({ errcode: 0, errmsg: 'ok' }, 200);
    }

    // 验证必填字段
    if (!body.text || !body.text.trim()) {
      return json({ errcode: -1, errmsg: '缺少留言内容' }, 400);
    }

    // 内容长度限制（防止异常大 payload）
    if (body.text.length > 10000) {
      return json({ errcode: -1, errmsg: '留言内容过长，请控制在 10000 字以内' }, 400);
    }

    const accessToken = env.DING_ACCESS_TOKEN;
    const secret = env.DING_SECRET;

    if (!accessToken || !secret) {
      return json({ errcode: -1, errmsg: '服务端未配置钉钉凭证' }, 500);
    }

    // ===== HMAC-SHA256 签名 =====
    const timestamp = Date.now();
    const stringToSign = timestamp + '\n' + secret;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(stringToSign));
    const signBytes = new Uint8Array(signature);

    // 安全的 Base64 编码（避免 String.fromCharCode 栈溢出）
    let signBase64 = '';
    for (let i = 0; i < signBytes.length; i++) {
      signBase64 += String.fromCharCode(signBytes[i]);
    }
    signBase64 = btoa(signBase64);
    const signEncoded = encodeURIComponent(signBase64);

    const webhookUrl =
      'https://oapi.dingtalk.com/robot/send?access_token=' + accessToken +
      '&timestamp=' + timestamp + '&sign=' + signEncoded;

    // ===== 转发到钉钉 =====
    try {
      const dingResp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msgtype: 'markdown',
          markdown: { title: body.title || '网站留言', text: body.text },
        }),
      });
      const result = await dingResp.json();

      const corsHeaders = { 'Access-Control-Allow-Origin': origin };
      return json(result, 200, corsHeaders);
    } catch (err) {
      return json({ errcode: -1, errmsg: '钉钉请求失败: ' + err.message }, 502);
    }
  },
};
