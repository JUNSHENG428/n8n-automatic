# n8n工作流生成器 - 部署快速开始指南

## 🚀 5分钟快速部署

### 1. 准备工作

```bash
# 克隆项目
git clone https://github.com/yourusername/n8n-workflow-generator.git
cd n8n-workflow-generator

# 给部署脚本添加执行权限
chmod +x deploy.sh

# 复制环境变量模板
cp env.production.example .env.production
```

### 2. 配置环境变量

编辑 `.env.production` 文件，填入您的实际配置：

```bash
# 必须修改的配置
OPENAI_API_KEY=sk-xxx  # 您的OpenAI API密钥
DB_PASSWORD=your-secure-password  # 数据库密码
JWT_SECRET=your-32-chars-secret  # JWT密钥（32字符以上）
REDIS_PASSWORD=your-redis-password  # Redis密码

# 域名配置（部署前修改）
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### 3. 一键部署

```bash
# 执行自动部署
./deploy.sh production deploy
```

### 4. 配置域名和SSL

#### 方式一：使用Cloudflare（推荐）
1. 将域名添加到Cloudflare
2. 开启代理和SSL/TLS
3. 设置A记录指向服务器IP

#### 方式二：使用Let's Encrypt
```bash
# 自动获取SSL证书
./deploy.sh production ssl yourdomain.com
```

## 📊 常用运维命令

```bash
# 查看服务状态
./deploy.sh production health

# 查看日志
./deploy.sh production logs          # 所有服务
./deploy.sh production logs backend   # 仅后端
./deploy.sh production logs frontend  # 仅前端

# 重启服务
./deploy.sh production restart

# 备份数据库
./deploy.sh production backup

# 停止服务
./deploy.sh production stop
```

## 🔧 手动部署（不使用脚本）

### 1. 使用Docker Compose

```bash
# 构建并启动所有服务
docker-compose -f docker-compose.production.yml up -d --build

# 查看服务状态
docker-compose -f docker-compose.production.yml ps

# 查看日志
docker-compose -f docker-compose.production.yml logs -f
```

### 2. 传统方式部署

#### 后端部署
```bash
cd backend
npm install
npm run build
pm2 start dist/index.js --name n8n-generator-backend
```

#### 前端部署
```bash
cd frontend
npm install
npm run build
# 将build目录内容上传到Web服务器
```

## 🌐 云服务商快速部署

### 阿里云ECS

```bash
# 1. 创建ECS实例（推荐配置：4核8G）
# 2. 安装Docker和Docker Compose
curl -fsSL https://get.docker.com | bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. 克隆项目并部署
git clone https://github.com/yourusername/n8n-workflow-generator.git
cd n8n-workflow-generator
./deploy.sh production deploy
```

### 腾讯云

```bash
# 使用腾讯云容器服务
# 1. 创建TKE集群
# 2. 部署应用
kubectl apply -f k8s/deployment.yaml
```

### AWS

```bash
# 使用AWS ECS
# 1. 创建ECS集群
# 2. 创建任务定义
# 3. 创建服务
aws ecs create-service --cluster n8n-generator --service-name n8n-generator-service --task-definition n8n-generator:1
```

## 🔍 故障排查

### 1. 服务无法启动

```bash
# 检查Docker服务
systemctl status docker

# 检查端口占用
netstat -tulpn | grep -E '3000|3001|5432|6379'

# 查看详细错误日志
docker-compose -f docker-compose.production.yml logs --tail=100
```

### 2. 数据库连接失败

```bash
# 检查数据库服务
docker-compose -f docker-compose.production.yml exec postgres pg_isready

# 测试连接
docker-compose -f docker-compose.production.yml exec postgres psql -U admin -d n8n_generator -c "SELECT 1"
```

### 3. OpenAI API错误

- 检查API密钥是否正确
- 确认API额度是否充足
- 如使用代理，检查代理服务是否正常

## 📈 性能优化建议

1. **使用CDN加速**
   - 推荐使用Cloudflare CDN
   - 配置静态资源缓存规则

2. **数据库优化**
   ```sql
   -- 创建索引
   CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
   CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);
   ```

3. **启用Redis缓存**
   - 缓存生成的工作流
   - 缓存API响应

4. **负载均衡**（高流量场景）
   ```nginx
   upstream backend {
       server backend1:3001;
       server backend2:3001;
       server backend3:3001;
   }
   ```

## 💰 成本控制

### 月度成本估算（中等流量）
- 服务器：¥200-500（4核8G）
- 域名：¥50/年
- SSL证书：免费（Let's Encrypt）
- CDN：¥50-200
- OpenAI API：¥300-1000
- **总计**：¥550-1700/月

### 成本优化建议
1. 使用按量付费的云服务器
2. 配置自动扩缩容
3. 使用更便宜的AI模型（如gpt-3.5-turbo）
4. 实施请求缓存策略

## 🆘 需要帮助？

1. 查看详细部署文档：`deployment-guide.md`
2. 查看常见问题：`FAQ.md`
3. 提交Issue：https://github.com/yourusername/n8n-workflow-generator/issues
4. 加入社区讨论：Discord/Telegram

---

祝您部署顺利！🎉 