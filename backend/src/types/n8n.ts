// n8n 工作流类型定义

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, any>;
  disabled?: boolean;
  notes?: string;
  notesInFlow?: boolean;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
  continueOnFail?: boolean;
  executeOnce?: boolean;
}

export interface N8nConnection {
  node: string;
  type: string;
  index: number;
}

export interface N8nConnections {
  [nodeName: string]: {
    main?: N8nConnection[][];
    [key: string]: N8nConnection[][] | undefined;
  };
}

export interface N8nWorkflowSettings {
  executionOrder?: string;
  saveDataSuccessExecution?: string;
  saveManualExecutions?: boolean;
  saveExecutionProgress?: boolean;
  callerPolicy?: string;
  errorWorkflow?: string;
  timezone?: string;
  executionTimeout?: number;
}

export interface N8nWorkflow {
  id?: string;
  name: string;
  active: boolean;
  nodes: N8nNode[];
  connections: N8nConnections;
  settings?: N8nWorkflowSettings;
  staticData?: Record<string, any>;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  versionId?: string;
}

// 常用节点类型枚举
export enum N8nNodeType {
  START = 'n8n-nodes-base.start',
  WEBHOOK = 'n8n-nodes-base.webhook',
  CRON = 'n8n-nodes-base.cron',
  HTTP_REQUEST = 'n8n-nodes-base.httpRequest',
  SET = 'n8n-nodes-base.set',
  IF = 'n8n-nodes-base.if',
  FUNCTION = 'n8n-nodes-base.function',
  FUNCTION_ITEM = 'n8n-nodes-base.functionItem',
  MYSQL = 'n8n-nodes-base.mysql',
  POSTGRES = 'n8n-nodes-base.postgres',
  MONGODB = 'n8n-nodes-base.mongoDb',
  EMAIL_SEND = 'n8n-nodes-base.emailSend',
  SLACK = 'n8n-nodes-base.slack',
  TELEGRAM = 'n8n-nodes-base.telegram',
  DISCORD = 'n8n-nodes-base.discord',
  GOOGLE_SHEETS = 'n8n-nodes-base.googleSheets',
  AIRTABLE = 'n8n-nodes-base.airtable',
  REDIS = 'n8n-nodes-base.redis',
  SPLIT_IN_BATCHES = 'n8n-nodes-base.splitInBatches',
  MERGE = 'n8n-nodes-base.merge',
  WAIT = 'n8n-nodes-base.wait',
  EXECUTE_COMMAND = 'n8n-nodes-base.executeCommand',
  CODE = 'n8n-nodes-base.code'
} 