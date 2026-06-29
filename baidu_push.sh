#!/bin/bash
# 百度站长 API 批量推送 — 每次 10 条，每天跑一次
DIR="$(cd "$(dirname "$0")" && pwd)"
TOKEN="ALCbiwVDqzRHZoqG"
SITE="https://www.pyzlrk.cn"
SENT_FILE="$DIR/.baidu_sent_urls.txt"

grep '<loc>' "$DIR/sitemap.xml" | sed 's/.*<loc>\(.*\)<\/loc>.*/\1/' > /tmp/baidu_all.txt

touch "$SENT_FILE"
comm -23 <(sort /tmp/baidu_all.txt) <(sort "$SENT_FILE") | head -10 > /tmp/baidu_todo.txt

TODO_COUNT=$(wc -l < /tmp/baidu_todo.txt | tr -d ' ')
if [ "$TODO_COUNT" -eq 0 ]; then
  echo "所有 URL 已提交完毕 ✓"
  exit 0
fi

echo "本次提交 $TODO_COUNT 条..."
RESULT=$(curl -s -X POST \
  "http://data.zz.baidu.com/urls?site=$SITE&token=$TOKEN" \
  -H "Content-Type: text/plain" \
  --data-binary @/tmp/baidu_todo.txt)
echo "$RESULT"

SUCCESS=$(echo "$RESULT" | grep -o '"success":[0-9]*' | grep -o '[0-9]*')
if [ -n "$SUCCESS" ] && [ "$SUCCESS" -gt 0 ]; then
  cat /tmp/baidu_todo.txt >> "$SENT_FILE"
  echo "已记录 $SUCCESS 条，剩余约 $((40 - $(wc -l < "$SENT_FILE" | tr -d ' '))) 条"
fi
