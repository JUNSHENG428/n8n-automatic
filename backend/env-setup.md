# 配置便携AI聚合API

## 步骤1：创建 .env 文件

在 `backend` 目录下创建 `.env` 文件，添加以下内容：

```bash
# 便携AI聚合API配置
OPENAI_API_KEY=您的API密钥（以sk-开头的密钥）
OPENAI_BASE_URL=https://api.bianxie.ai/v1

# 服务器端口配置（可选）
PORT=3001
```

## 步骤2：获取API密钥

1. 登录便携AI聚合API平台：https://api.bianxie.ai
2. 进入"令牌"页面
3. 创建新的API密钥（确保账户有足够余额）
4. 复制密钥并替换上面的 `您的API密钥`

## 步骤3：选择合适的BASE_URL

便携AI提供了三个接入地址，根据您的网络情况选择：

- **推荐** `https://api.bianxie.ai/v1` - 香港服务器，直连线路
- **备选1** `https://api.bianxieai.com/v1` - 国内上海服务器
- **备选2** `https://api.a8.hk/v1` - 国外服务器

## 步骤4：验证配置

运行后端服务时，如果配置成功，您会在控制台看到：
```
使用 OpenAI 代理地址: https://api.bianxie.ai/v1
```

## 支持的模型

便携AI支持所有主流模型，包括：
- GPT-3.5: `gpt-3.5-turbo`
- GPT-4: `gpt-4`, `gpt-4-turbo`, `gpt-4o`
- GPT-4o mini: `gpt-4o-mini`
- Claude: `claude-3-5-sonnet-20241022`
- Gemini: `gemini-1.5-pro-latest`

## 注意事项

1. 确保账户余额充足（钱包余额）
2. API密钥要保密，不要提交到代码仓库
3. 如遇到403错误，通常是余额不足
4. 如遇到401错误，检查API密钥是否正确

## 费用说明

- 便携AI按token计费，与官方价格一致
- 充值优惠：6RMB = 1美元（相当于官网8.2折）
- 最低充值1美元起 