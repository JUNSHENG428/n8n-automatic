# OpenAI API 代理配置指南

由于某些地区的网络限制，直接访问 OpenAI API 可能会遇到 "403 Country, region, or territory not supported" 错误。本指南将帮助您配置代理来解决这个问题。

## 方法一：使用环境变量配置代理

### 1. 创建 .env 文件

在后端目录 (`backend/`) 中创建 `.env` 文件：

```bash
# OpenAI API 密钥
OPENAI_API_KEY=your-api-key-here

# OpenAI API 代理地址
OPENAI_API_BASE_URL=https://api.openai-proxy.com/v1

# 可选：自定义请求头（某些代理服务可能需要）
# OPENAI_PROXY_HEADERS={"Authorization": "Bearer proxy-token"}
```

### 2. 常用的代理服务

以下是一些可用的 OpenAI API 代理服务：

- **Cloudflare Workers 代理**
  - 自己部署：https://github.com/noobnooc/noobnooc/discussions/9
  - 示例地址：`https://openai-proxy.example.workers.dev/v1`

- **OpenAI-SB**
  - 地址：`https://api.openai-sb.com/v1`
  - 需要注册获取 API Key

- **自建代理**
  - 使用 Nginx 反向代理
  - 使用 Cloudflare Workers
  - 使用 Vercel Edge Functions

## 方法二：使用 Cloudflare Workers 搭建自己的代理

### 1. 创建 Worker

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    url.host = 'api.openai.com';
    
    const modifiedRequest = new Request(url, {
      headers: request.headers,
      method: request.method,
      body: request.body,
      redirect: 'follow'
    });
    
    const response = await fetch(modifiedRequest);
    const modifiedResponse = new Response(response.body, response);
    
    // 添加 CORS 头
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    
    return modifiedResponse;
  },
};
```

### 2. 部署到 Cloudflare

1. 登录 Cloudflare Dashboard
2. 创建新的 Worker
3. 粘贴上述代码
4. 部署并获取 Worker URL
5. 在 `.env` 中配置：`OPENAI_API_BASE_URL=https://your-worker.workers.dev/v1`

## 方法三：使用 Azure OpenAI

Azure OpenAI 在更多地区可用，可以作为 OpenAI 的替代方案。

### 1. 申请 Azure OpenAI 访问权限

访问 [Azure OpenAI Service](https://azure.microsoft.com/en-us/products/ai-services/openai-service/) 申请访问权限。

### 2. 配置 Azure OpenAI

```bash
# 使用 Azure OpenAI
AZURE_OPENAI_API_KEY=your-azure-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

### 3. 修改代码支持 Azure OpenAI

需要修改 `backend/src/config/openai.ts` 来支持 Azure OpenAI API。

## 方法四：使用第三方 API 服务

一些第三方服务提供了 OpenAI API 的镜像：

1. **API2D**
   - 网址：https://api2d.com/
   - 支持多种 AI 模型

2. **CloseAI**
   - 提供 OpenAI API 兼容接口

## 故障排除

### 1. 仍然收到 403 错误

- 检查代理地址是否正确
- 确认代理服务是否正常运行
- 尝试使用 curl 测试代理：

```bash
curl https://your-proxy-url/v1/models \
  -H "Authorization: Bearer your-api-key"
```

### 2. 连接超时

- 增加超时时间
- 检查网络连接
- 尝试不同的代理服务

### 3. 认证失败

- 确认 API Key 正确
- 某些代理服务需要额外的认证头

## 安全提示

1. **不要使用不可信的代理服务**：代理服务可能会记录您的 API Key 和请求内容
2. **定期更换 API Key**：如果使用第三方代理，建议定期更换 API Key
3. **使用 HTTPS**：确保代理服务使用 HTTPS 加密传输
4. **自建代理最安全**：如果条件允许，建议自己搭建代理服务

## 总结

通过配置代理，您可以在任何地区使用 OpenAI API。建议优先考虑自建代理或使用可信的代理服务。如果您在配置过程中遇到问题，可以查看系统日志或联系技术支持。 