import axios from 'axios'

const API_BASE_URL = '/api'

export interface GenerateWorkflowResponse {
  success: boolean
  workflow?: any
  userGuide?: {
    credentials: Array<{
      service: string
      type: string
      steps: string[]
      requiredFields: string[]
    }>
    parameters: Array<{
      name: string
      description: string
      example: string
    }>
    dataSources: Array<{
      type: string
      format: string
      requirements: string
    }>
    preparations: string[]
  }
  description?: string
  usage?: any
  error?: string
  details?: string
  suggestion?: string
}

export interface ExamplesResponse {
  examples: Array<{
    name: string
    description: string
    requirement: string
  }>
}

// 生成工作流
export async function generateWorkflow(
  requirement: string,
  openaiKey?: string
): Promise<GenerateWorkflowResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/workflow/generate`, {
      requirement,
      openaiKey
    })
    return response.data
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error('生成工作流失败，请稍后重试')
  }
}

// 获取示例
export async function getExamples(): Promise<ExamplesResponse> {
  try {
    const response = await axios.get(`${API_BASE_URL}/workflow/examples`)
    return response.data
  } catch (error) {
    throw new Error('获取示例失败')
  }
}

// 获取支持的节点类型
export async function getNodeTypes() {
  const response = await fetch(`${API_BASE_URL}/workflow/node-types`)
  if (!response.ok) {
    throw new Error('获取节点类型失败')
  }
  return response.json()
}

// 验证工作流结构
export async function validateWorkflow(workflow: any) {
  const response = await fetch(`${API_BASE_URL}/workflow/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ workflow })
  })
  
  if (!response.ok) {
    throw new Error('验证工作流失败')
  }
  
  return response.json()
} 