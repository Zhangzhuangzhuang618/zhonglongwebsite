#!/bin/bash
# 百度站长 API 批量推送 — 每次 10 条，每天跑一次，新页面优先
DIR="$(cd "$(dirname "$0")" && pwd)"
TOKEN="ALCbiwVDqzRHZoqG"
SITE="https://www.pyzlrk.cn"
SENT_FILE="$DIR/.baidu_sent_urls.txt"

# 提取 sitemap 中所有 URL
grep '<loc>' "$DIR/sitemap.xml" | sed 's/.*<loc>\(.*\)<\/loc>.*/\1/' > /tmp/baidu_all.txt

touch "$SENT_FILE"

# 从未提交过的 URL
comm -23 <(sort /tmp/baidu_all.txt) <(sort "$SENT_FILE") > /tmp/baidu_new.txt
NEW_COUNT=$(wc -l < /tmp/baidu_new.txt | tr -d ' ')

# Phase 2 新页面白名单（优先推送）
PHASE2_WHITELIST=(
  "https://www.pyzlrk.cn/faq/how-to-choose-igniter-supplier.html"
  "https://www.pyzlrk.cn/faq/pilot-procurement-parameters.html"
  "https://www.pyzlrk.cn/faq/flare-one-stop-procurement.html"
)

# 从新页面中优先取白名单内的 URL，再补其他新页面，只推未提交过的
> /tmp/baidu_todo.txt
for url in "${PHASE2_WHITELIST[@]}"; do
  if grep -qFx "$url" /tmp/baidu_new.txt; then
    echo "$url" >> /tmp/baidu_todo.txt
  fi
done
# 补其他未提交 URL 到 10 条
grep -vFx -f /tmp/baidu_todo.txt /tmp/baidu_new.txt | head -$((10 - $(wc -l < /tmp/baidu_todo.txt | tr -d ' '))) >> /tmp/baidu_todo.txt

TODO_COUNT=$(wc -l < /tmp/baidu_todo.txt | tr -d ' ')
if [ "$TODO_COUNT" -eq 0 ]; then
  echo "所有 URL 已提交完毕"
  exit 0
fi

echo "本次提交 $TODO_COUNT 条（其中新页面 $TODO_COUNT 条）..."

RESULT=$(curl -s -X POST \
  "http://data.zz.baidu.com/urls?site=$SITE&token=$TOKEN" \
  -H "Content-Type: text/plain" \
  --data-binary @/tmp/baidu_todo.txt)
echo "$RESULT"

SUCCESS=$(echo "$RESULT" | grep -o '"success":[0-9]*' | grep -o '[0-9]*')
if [ -n "$SUCCESS" ] && [ "$SUCCESS" -gt 0 ]; then
  # 只记录本次实际推送的 URL，不重复记录已推送过的
  cat /tmp/baidu_todo.txt >> "$SENT_FILE"
  TOTAL_URLS=$(wc -l < /tmp/baidu_all.txt | tr -d ' ')
  SENT_TOTAL=$(wc -l < "$SENT_FILE" | tr -d ' ')
  REMAINING=$((TOTAL_URLS - SENT_TOTAL))
  echo "已记录 $SUCCESS 条，剩余约 $REMAINING 条（全站共 $TOTAL_URLS 条）"
fi
