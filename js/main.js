// Navigation scroll effect
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile nav toggle
document.getElementById('navToggle').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

// Dropdown menus — click toggle for mobile, hover for desktop
document.querySelectorAll('.nav-dropdown > a').forEach(function(toggle) {
  toggle.addEventListener('click', function(e) {
    // On mobile (≤900px), toggle dropdown instead of navigating
    if (window.innerWidth <= 900) {
      e.preventDefault();
      var parent = this.parentElement;
      // Close other open dropdowns
      document.querySelectorAll('.nav-dropdown.open').forEach(function(d) {
        if (d !== parent) d.classList.remove('open');
      });
      parent.classList.toggle('open');
    }
    // On desktop, let the click navigate normally (hover handles the dropdown)
  });
});

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.nav-dropdown')) {
    document.querySelectorAll('.nav-dropdown.open').forEach(function(d) {
      d.classList.remove('open');
    });
  }
});

// FAQ accordion
document.querySelectorAll('.faq-item h3').forEach(h3 => {
  h3.addEventListener('click', () => {
    h3.parentElement.classList.toggle('open');
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('navLinks').classList.remove('open');
    }
  });
});

// Contact form handler — 通过 Cloudflare Worker 代理发送到钉钉机器人
//
// 架构：浏览器 → Worker（服务端 HMAC 签名 + 转发）→ 钉钉 webhook
// 前端不再持有任何钉钉凭证，token/secret 仅存在于 Worker 环境变量中。
// Worker 代码及部署说明见 ./worker/
//
// Worker 部署方式（二选一）：
//   方案A（推荐）：绑定到主域名路径，PROXY_URL = 'https://www.pyzlrk.cn/api/contact'
//                 在 Cloudflare Dashboard → Workers Routes → 添加路由：
//                 www.pyzlrk.cn/api/contact → zhonglong-contact-proxy
//   方案B：使用 workers.dev 子域，PROXY_URL = 'https://zhonglong-contact-proxy.xxx.workers.dev'
(function(){
  var form = document.getElementById('contactForm');
  if (!form) return;

  // ★ 部署 Worker 后改为真实地址
  var PROXY_URL = 'https://www.pyzlrk.cn/api/contact';

  // 蜜罐字段名（对用户隐藏，机器人会自动填充）
  var HONEYPOT_NAME = 'website';

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // 蜜罐检测：如果隐藏字段被填写，静默忽略（是机器人）
    var honeypot = form.querySelector('[name="' + HONEYPOT_NAME + '"]');
    if (honeypot && honeypot.value) {
      form.reset();
      return;
    }

    // Build message text（排除蜜罐和按钮）
    var fields = form.querySelectorAll('input:not([type="hidden"]), select, textarea');
    var lines = ['## 网站留言通知'];
    fields.forEach(function(f) {
      if (f.name && f.value && f.name !== HONEYPOT_NAME) {
        lines.push('- **' + f.name + '**：' + f.value);
      }
    });
    lines.push('- **提交时间**：' + new Date().toLocaleString('zh-CN'));
    var content = lines.join('  \n');

    // Show sending state
    var btn = form.querySelector('button[type="submit"]');
    var originalText = btn.textContent;
    btn.textContent = '提交中...';
    btn.disabled = true;

    try {
      var resp = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '网站留言', text: content })
      });
      var result = await resp.json();
      if (result.errcode === 0) {
        btn.textContent = '留言已发送！';
        btn.style.background = '#16a34a';
        form.reset();
        setTimeout(function(){ btn.textContent = originalText; btn.disabled = false; btn.style.background = ''; }, 3000);
      } else {
        // 优先显示钉钉返回的中文错误信息
        var msg = result.errmsg || ('钉钉返回错误: ' + JSON.stringify(result));
        throw new Error(msg);
      }
    } catch (err) {
      var isCorsError = err instanceof TypeError && (
        err.message === 'Failed to fetch' || /NetworkError/i.test(err.message)
      );
      btn.textContent = isCorsError ? '网络限制，请致电或发邮件' : '发送失败，请致电 0393-5389080';
      btn.style.background = '#dc2626';
      setTimeout(function(){ btn.textContent = originalText; btn.disabled = false; btn.style.background = ''; }, 5000);
    }
  });
})();
