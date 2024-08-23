#!/bin/bash

API_URL="http://localhost:6600/translate-subtitle"
SUBTITLE_FILE="/Volumes/single_data/tank/bt/qbt/nsfs/NSFS-007/hhd800.com@NSFS-007.srt"
TARGET_LANGUAGE="zh-Hans"

source .env

# 读取字幕文件内容
SUBTITLE_CONTENT=$(cat "$SUBTITLE_FILE")

# 使用 curl 发送请求
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d "{
    \"subtitle\": $(echo "$SUBTITLE_CONTENT" | jq -R -s .),
    \"target_language\": \"$TARGET_LANGUAGE\"
  }" \
  | jq .
