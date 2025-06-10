import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { generateWorkflowRoute } from './routes/workflow';
import * as net from 'net';

// 加载环境变量
dotenv.config();

const app = express();

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 路由
app.use('/api/workflow', generateWorkflowRoute);

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message
  });
});

// 检查端口是否可用
function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.close();
        resolve(true);
      })
      .listen(port);
  });
}

// 启动服务器
async function startServer() {
  let port = parseInt(process.env.PORT || '3001');
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      app.listen(port, () => {
        console.log(`🚀 服务器运行在 http://localhost:${port}`);
        console.log(`📋 健康检查: http://localhost:${port}/health`);
        if (port !== 3001) {
          console.log(`⚠️  注意：端口 3001 被占用，已切换到端口 ${port}`);
        }
      });
      break;
    } else {
      console.log(`❌ 端口 ${port} 被占用，尝试下一个端口...`);
      port++;
      attempts++;
    }
  }

  if (attempts === maxAttempts) {
    console.error('❌ 无法找到可用端口，请检查系统端口占用情况');
    process.exit(1);
  }
}

startServer(); 