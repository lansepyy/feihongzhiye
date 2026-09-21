// 绯夜 · CRIMSON NIGHT —— 修复路径拦截版本

const UPSTREAM = {
  // 注意：这里把路径后面的斜杠也写进去，强制匹配
  '/api/': 'https://apiyutu.com/api.php/provide/vod/',
  '/api2/': 'https://lbapi9.com/api.php/provide/vod/',
  '/api3/': 'https://slapibf.com/api.php/provide/vod/',
};

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Cache-Control': 'public, max-age=60',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // 不再替换掉末尾斜杠，直接原样匹配
    const path = url.pathname;
    const base = UPSTREAM[path];

    // 不是接口请求 -> 交给静态资源（html/css/js/图片）
    if (!base) return env.ASSETS.fetch(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: JSON_HEADERS });
    }

    const init = {
      method: request.method === 'POST' ? 'POST' : 'GET',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'User-Agent': UA,
      },
    };
    if (init.method === 'POST') {
      init.headers['Content-Type'] =
        request.headers.get('content-type') || 'application/x-www-form-urlencoded';
      init.body = await request.arrayBuffer();
    }

    let resp;
    try {
      resp = await fetch(base + url.search, init);
    } catch (e) {
      return new Response(
        JSON.stringify({ code: 0, msg: 'upstream unreachable', list: [], class: [] }),
        { status: 502, headers: JSON_HEADERS }
      );
    }

    const body = await resp.arrayBuffer();
    return new Response(body, {
      status: resp.status,
      headers: {
        ...JSON_HEADERS,
        'Content-Type': resp.headers.get('content-type') || JSON_HEADERS['Content-Type'],
      },
    });
  },
};
