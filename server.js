const express = require("express");
require("dotenv").config();
const { translate } = require("bing-translate-api");

const app = express();
const port = process.env.PORT || 3000;
const apiToken = process.env.API_TOKEN;

// 解析 JSON 请求体
app.use(express.json());

// Token 认证中间件
app.use((req, res, next) => {
  const token = req.headers.authorization;
  if (!token || token !== `Bearer ${apiToken}`) {
    // console.log(`toke: ${token}, apiToken: ${apiToken}`);
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// 定义翻译接口
app.post("/translate", async (req, res) => {
  const { text, target_language } = req.body;

  try {
    const result = await translate(text, null, target_language);
    res.json({ translation: result.translation });
  } catch (error) {
    console.error("Bing Translate API error:", error);
    res.status(500).json({ error: "Translation failed" });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
