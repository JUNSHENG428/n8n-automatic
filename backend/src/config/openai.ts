import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

export interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
}

export function getOpenAIConfig(apiKey?: string): OpenAIConfig {
  const config: OpenAIConfig = {
    apiKey: apiKey || process.env.OPENAI_API_KEY || '',
    timeout: 60000, // 60秒超时
  };

  // 支持代理地址配置
  const baseURL = process.env.OPENAI_API_BASE_URL || process.env.OPENAI_BASE_URL;
  if (baseURL) {
    config.baseURL = baseURL;
    console.log(`使用 OpenAI 代理地址: ${baseURL}`);
  }

  // 支持自定义请求头（某些代理服务可能需要）
  if (process.env.OPENAI_PROXY_HEADERS) {
    try {
      config.defaultHeaders = JSON.parse(process.env.OPENAI_PROXY_HEADERS);
    } catch (e) {
      console.warn('解析 OPENAI_PROXY_HEADERS 失败:', e);
    }
  }

  return config;
}

export function createOpenAIClient(apiKey?: string): OpenAI {
  const config = getOpenAIConfig(apiKey);
  
  if (!config.apiKey) {
    throw new Error('未提供 OpenAI API 密钥');
  }

  const clientConfig: any = {
    apiKey: config.apiKey,
    timeout: config.timeout,
  };

  if (config.baseURL) {
    clientConfig.baseURL = config.baseURL;
  }

  if (config.defaultHeaders) {
    clientConfig.defaultHeaders = config.defaultHeaders;
  }

  return new OpenAI(clientConfig);
} 