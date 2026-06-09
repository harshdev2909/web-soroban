const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-ide-production.up.railway.app/api';

export interface ProjectFile {
  /** Project-relative tree path, e.g. "src/lib.rs". Falls back to name if absent. */
  path?: string;
  name: string;
  type: string;
  content: string;
}

export interface Project {
  _id: string;
  name: string;
  files: ProjectFile[];
  createdAt: string;
  updatedAt: string;
  lastDeployed?: string;
  contractAddress?: string;
  manifestPath?: string;
  deployTarget?: string | null;
  deploymentHistory?: Array<{
    timestamp: string;
    contractAddress: string;
    status: 'success' | 'failed';
    logs: string[];
  }>;
}

export interface CompileResponse {
  success: boolean;
  logs: Array<{
    type: 'info' | 'error' | 'success';
    message: string;
    timestamp: string;
  }>;
  wasmUrl?: string;
  wasmBase64?: string;
  projectId?: string;
  jobId?: string;
  message?: string;
  error?: string;
}

export interface DeployResponse {
  success: boolean;
  logs: Array<{
    type: 'info' | 'error' | 'success';
    message: string;
    timestamp: string;
  }>;
  contractAddress?: string;
  projectId?: string;
  network?: string;
  walletAddress?: string;
  keypairName?: string;
  transactionXdr?: string;
  requiresWalletSigning?: boolean;
  isMock?: boolean;
  jobId?: string;
  message?: string;
  error?: string;
}

export interface PrepareTransactionResponse {
  success: boolean;
  xdr: string;
  network: string;
  projectId: string;
  walletAddress: string;
}

export interface PrepareDeploymentResponse {
  success: boolean;
  unsignedXDR: string;
  network: string;
  projectId: string;
  tempKeypairName: string;
}

export interface SubmitDeploymentResponse {
  success: boolean;
  logs: Array<{
    type: 'info' | 'error' | 'success';
    message: string;
    timestamp: string;
  }>;
  contractAddress?: string;
  txHash?: string;
  network: string;
  projectId: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  files: string[];
  price?: number;
  hasAccess?: boolean;
}

export interface TemplateDoc {
  id: string;
  name: string;
  description: string;
  category: string;
  files: string[];
  price: number;
  documentation: {
    summary: string;
    usage: string;
    functions: Array<{ name: string; params: string[]; returns: string; description: string }>;
    readMore: string;
  };
}

export interface TemplatePurchaseResponse {
  success: boolean;
  purchaseId?: string;
  template?: { id: string; name: string; price: number; currency: string };
  payment?: {
    address: string;
    amount: number;
    currency: string;
    memo: string;
    network: string;
  };
  message?: string;
  error?: string;
}

export interface TemplateVerifyResponse {
  success: boolean;
  message?: string;
  templateId?: string;
  purchasedTemplates?: string[];
  error?: string;
}

// Project APIs
export const projectApi = {
  // Get all projects
  async getProjects(): Promise<Project[]> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    return response.json();
  },

  // Get single project
  async getProject(id: string): Promise<Project> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch project');
    }
    return response.json();
  },

  // Build/layout analysis: workspace?, deployable crates, current target, etc.
  async getBuildInfo(id: string): Promise<{
    manifestPath: string;
    deployTarget: string | null;
    isWorkspace: boolean;
    ok: boolean;
    errors: string[];
    warnings: string[];
    deployableCrates: { name: string; dir: string }[];
    requiresTargetSelection: boolean;
  }> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/projects/${id}/build-info`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch build info');
    return response.json();
  },

  // Create new project
  async createProject(name?: string, files?: ProjectFile[], template?: string, isLocal?: boolean): Promise<Project> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, files, template, isLocal }),
    });
    if (!response.ok) {
      throw new Error('Failed to create project');
    }
    return response.json();
  },

  // Update project
  async updateProject(id: string, data: { name?: string; files?: ProjectFile[]; manifestPath?: string; deployTarget?: string | null }): Promise<Project> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update project');
    }
    return response.json();
  },

  // Delete project
  async deleteProject(id: string): Promise<void> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
  },
};

// Jobs API
export const jobsApi = {
  async getJob(jobId: string): Promise<{ success: boolean; job: { _id: string; status: string; result?: any; error?: string } }> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch job');
    }
    return response.json();
  },
};

// Compile API
export const compileApi = {
  async compile(projectId: string, files: ProjectFile[]): Promise<CompileResponse> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/compile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, files }),
    });
    if (!response.ok) {
      throw new Error('Compilation failed');
    }
    const data = await response.json();
    // Ensure logs is always an array
    return {
      ...data,
      logs: Array.isArray(data.logs) ? data.logs : []
    };
  },

  async pollJobResult(jobId: string, onProgress?: (result: CompileResponse) => void): Promise<CompileResponse> {
    const maxAttempts = 120; // 2 minutes max (120 * 1s)
    const pollInterval = 1000; // 1 second
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const jobData = await jobsApi.getJob(jobId);
        const job = jobData.job;
        
        // If job is completed or failed, return the result
        if (job.status === 'completed' || job.status === 'failed') {
          const result: CompileResponse = {
            success: job.status === 'completed',
            logs: Array.isArray(job.result?.logs) ? job.result.logs : [],
            wasmBase64: job.result?.wasmBase64,
            wasmUrl: job.result?.wasmUrl,
            projectId: job.result?.projectId,
            error: job.error || job.result?.error
          };
          
          // Call progress callback with final result
          if (onProgress) {
            onProgress(result);
          }
          
          return result;
        }
        
        // If job is still queued or active, return current logs if available
        if (job.status === 'queued' || job.status === 'active') {
          const currentLogs = Array.isArray(job.result?.logs) ? job.result.logs : [];
          if (onProgress && currentLogs.length > 0) {
            onProgress({
              success: false,
              logs: currentLogs,
              projectId: job.result?.projectId
            });
          }
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error('Error polling job:', error);
        // Continue polling on error
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    // Timeout - return error
    throw new Error('Compilation job timed out');
  },
};

export interface TestCaseResult {
  file?: string;
  name: string;
  passed: boolean;
  ignored?: boolean;
  durationMs?: number;
  output?: string;
}

export interface TestRunResult {
  success: boolean;
  total: number;
  passed: number;
  failed: number;
  ignored: number;
  tests: TestCaseResult[];
  diagnostics?: Array<{ level: string; code?: string; message: string; file?: string; line?: number; column?: number }>;
  compileFailed?: boolean;
  logs: Array<{ type: string; message: string; timestamp: string }>;
  error?: string;
  jobId?: string;
}

// Test API — runs `cargo test` across the crate (unit + integration tests).
export const testApi = {
  async run(projectId: string, files: ProjectFile[]): Promise<{ jobId?: string; logs: any[] }> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/test`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, files }),
    });
    if (!response.ok) throw new Error('Failed to start test run');
    const data = await response.json();
    return { jobId: data.jobId, logs: Array.isArray(data.logs) ? data.logs : [] };
  },

  async pollResult(jobId: string, onProgress?: (logs: any[]) => void): Promise<TestRunResult> {
    const maxAttempts = 300; // up to 5 minutes (tests compile a host build)
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const { job } = await jobsApi.getJob(jobId);
        const currentLogs = Array.isArray(job.result?.logs) ? job.result.logs : [];
        if ((job.status === 'queued' || job.status === 'active') && onProgress && currentLogs.length) {
          onProgress(currentLogs);
        }
        if (job.status === 'completed' || job.status === 'failed') {
          const r = job.result || {};
          return {
            success: job.status === 'completed',
            total: r.total ?? 0,
            passed: r.passed ?? 0,
            failed: r.failed ?? 0,
            ignored: r.ignored ?? 0,
            tests: Array.isArray(r.tests) ? r.tests : [],
            diagnostics: Array.isArray(r.diagnostics) ? r.diagnostics : [],
            compileFailed: !!r.compileFailed,
            logs: currentLogs,
            error: job.error || r.error,
            jobId,
          };
        }
      } catch (e) {
        console.error('Error polling test job:', e);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error('Test job timed out');
  },
};

// Templates API
export const templatesApi = {
  async getTemplates(): Promise<Template[]> {
    const token = authApi.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/templates`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    return response.json();
  },

  /** Public: list all marketplace templates with docs (no auth) */
  async getMarketplace(): Promise<{ success: boolean; templates: TemplateDoc[] }> {
    const response = await fetch(`${API_BASE_URL}/templates/marketplace`);
    if (!response.ok) throw new Error('Failed to fetch marketplace');
    return response.json();
  },

  /** Public: single template doc by id */
  async getTemplateDoc(id: string): Promise<{ success: boolean; template: TemplateDoc }> {
    const response = await fetch(`${API_BASE_URL}/templates/marketplace/${id}`);
    if (!response.ok) throw new Error('Template not found');
    return response.json();
  },

  /** Create template purchase intent (same payment gateway as plans) */
  async createPurchase(templateId: string): Promise<TemplatePurchaseResponse> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/templates/purchase`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ templateId }),
    });
    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data.error || data.message || 'Failed to create purchase') as Error & { status?: number };
      err.status = response.status;
      throw err;
    }
    return data;
  },

  /** Verify template payment after sending XLM */
  async verifyTemplatePayment(txHash: string, purchaseId: string): Promise<TemplateVerifyResponse> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/payments/verify-template`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txHash, purchaseId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Verification failed');
    return data;
  },

  async getMyPurchases(): Promise<{ success: boolean; templateIds: string[] }> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/templates/my-purchases`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch purchases');
    return response.json();
  },
};

// Deploy API
export const deployApi = {
  async deploy(projectId: string, wasmBase64: string, network?: string, walletInfo?: { publicKey: string; network: string }): Promise<DeployResponse> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/deploy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, wasmBase64, network, walletInfo }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 403 && errorData.upgradeRequired) {
        throw new Error('DEPLOYMENT_LIMIT_REACHED');
      }
      throw new Error(errorData.error || 'Deployment failed');
    }
    const data = await response.json();
    // Ensure logs is always an array
    return {
      ...data,
      logs: Array.isArray(data.logs) ? data.logs : []
    };
  },

  async pollDeployJobResult(jobId: string, onProgress?: (result: DeployResponse) => void): Promise<DeployResponse> {
    const maxAttempts = 180; // 3 minutes max (180 * 1s)
    const pollInterval = 1000; // 1 second
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const jobData = await jobsApi.getJob(jobId);
        const job = jobData.job;
        
        // If job is completed or failed, return the result
        if (job.status === 'completed' || job.status === 'failed') {
          const result: DeployResponse = {
            success: job.status === 'completed',
            logs: Array.isArray(job.result?.logs) ? job.result.logs : [],
            contractAddress: job.result?.contractAddress,
            network: job.result?.network,
            projectId: job.result?.projectId,
            walletAddress: job.result?.walletAddress,
            keypairName: job.result?.keypairName,
            error: job.error || job.result?.error,
            message: job.result?.message
          };
          
          // Call progress callback with final result
          if (onProgress) {
            onProgress(result);
          }
          
          return result;
        }
        
        // If job is still queued or active, return current logs if available
        if (job.status === 'queued' || job.status === 'active') {
          const currentLogs = Array.isArray(job.result?.logs) ? job.result.logs : [];
          if (onProgress && currentLogs.length > 0) {
            onProgress({
              success: false,
              logs: currentLogs,
              projectId: job.result?.projectId,
              network: job.result?.network
            });
          }
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error('Error polling deployment job:', error);
        // Continue polling on error
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    // Timeout - return error
    throw new Error('Deployment job timed out');
  },

  async deployWithSorobanCLI(projectId: string, wasmBase64: string, network?: string, walletInfo?: { publicKey: string; network: string }, alias?: string): Promise<DeployResponse> {
    const response = await fetch(`${API_BASE_URL}/deploy/soroban-cli`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, wasmBase64, network, walletInfo, alias }),
    });
    if (!response.ok) {
      throw new Error('Soroban CLI deployment failed');
    }
    return response.json();
  },

  async prepareTransaction(projectId: string, wasmBase64: string, walletAddress: string, network?: string): Promise<PrepareTransactionResponse> {
    const response = await fetch(`${API_BASE_URL}/deploy/prepare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, wasmBase64, walletAddress, network }),
    });
    if (!response.ok) {
      throw new Error('Failed to prepare transaction');
    }
    return response.json();
  },

  async submitSignedTransaction(projectId: string, signedTransactionXdr: string, network?: string): Promise<DeployResponse> {
    const response = await fetch(`${API_BASE_URL}/deploy/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, signedTransactionXdr, network }),
    });
    if (!response.ok) {
      throw new Error('Transaction submission failed');
    }
    return response.json();
  },

  // New deployment flow methods
  async prepareDeployment(projectId: string, wasmBase64: string, network?: string): Promise<PrepareDeploymentResponse> {
    const response = await fetch(`${API_BASE_URL}/deploy/prepare-deployment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, wasmBase64, network }),
    });
    if (!response.ok) {
      throw new Error('Failed to prepare deployment');
    }
    return response.json();
  },

  async submitDeployment(projectId: string, signedXDR: string, network?: string, tempKeypairName?: string): Promise<SubmitDeploymentResponse> {
    const response = await fetch(`${API_BASE_URL}/deploy/submit-deployment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, signedXDR, network, tempKeypairName }),
    });
    if (!response.ok) {
      throw new Error('Failed to submit deployment');
    }
    return response.json();
  },
};

// Auth API
export interface User {
  _id: string;
  email: string;
  walletAddress?: string;
  name?: string;
  picture?: string;
  authMethod: 'gmail' | 'github' | 'discord' | 'wallet' | 'both';
  subscription: {
    plan: 'free' | 'plan2' | 'plan3';
    status: 'active' | 'cancelled' | 'expired';
    startDate: string;
    endDate?: string;
    autoRenew: boolean;
  };
  usage: {
    deployments: {
      count: number;
      limit: number;
      lastResetDate: string;
    };
    functionTests: {
      count: number;
      limit: number;
      lastResetDate: string;
    };
  };
  purchasedTemplates?: string[];
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  message?: string;
}

export interface WalletChallengeResponse {
  success: boolean;
  challenge: string;
  timestamp: number;
  expiresAt: number;
}

export const authApi = {
  // Get current user
  async getCurrentUser(): Promise<{ success: boolean; user: User }> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to get user');
    }
    return response.json();
  },

  // Google OAuth login
  googleLogin() {
    window.location.href = `${API_BASE_URL.replace('/api', '')}/api/auth/google`;
  },

  githubLogin() {
    window.location.href = `${API_BASE_URL.replace('/api', '')}/api/auth/github`;
  },

  discordLogin() {
    window.location.href = `${API_BASE_URL.replace('/api', '')}/api/auth/discord`;
  },

  // Get wallet challenge
  async getWalletChallenge(walletAddress: string): Promise<WalletChallengeResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/wallet/challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });
    if (!response.ok) {
      throw new Error('Failed to get wallet challenge');
    }
    return response.json();
  },

  // Verify wallet signature
  async verifyWallet(walletAddress: string, signature: string, challenge: string, challengeTimestamp: number, email?: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/wallet/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress, signature, challenge, challengeTimestamp, email }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Wallet verification failed');
    }
    return response.json();
  },

  // Logout
  async logout(): Promise<void> {
    const token = this.getToken();
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    this.clearToken();
  },

  // Link wallet to account
  async linkWallet(walletAddress: string, signature: string, challenge: string): Promise<AuthResponse> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/auth/link-wallet`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress, signature, challenge }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to link wallet');
    }
    return response.json();
  },

  // Token management
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token') || new URLSearchParams(window.location.search).get('token');
  },

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  },

  clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  },
};

// Subscription API
export interface SubscriptionPlan {
  name: string;
  price: number;
  currency?: string;
  features: {
    compilations: string | number;
    deployments: string | number;
    functionTests: string | number;
  };
}

export interface SubscriptionResponse {
  success: boolean;
  subscription?: {
    plan: string;
    status: string;
    startDate: string;
    endDate?: string;
    autoRenew: boolean;
  };
  usage?: any;
  plans?: Record<string, SubscriptionPlan>;
  payment?: {
    address: string;
    amount: number;
    currency: string;
    memo: string;
    network: string;
  };
  error?: string;
}

export const subscriptionApi = {
  // Get available plans
  async getPlans(): Promise<SubscriptionResponse> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/plans`);
    if (!response.ok) {
      throw new Error('Failed to get plans');
    }
    return response.json();
  },

  // Get current subscription
  async getCurrent(): Promise<SubscriptionResponse> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/subscriptions/current`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to get subscription');
    }
    return response.json();
  },

  // Create subscription
  async create(plan: 'plan2' | 'plan3'): Promise<SubscriptionResponse> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/subscriptions/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create subscription');
    }
    return response.json();
  },

  // Cancel subscription
  async cancel(): Promise<SubscriptionResponse> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/subscriptions/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to cancel subscription');
    }
    return response.json();
  },
};

// Payment API
export interface PaymentResponse {
  success: boolean;
  payment?: {
    txHash: string;
    status: string;
    amount: number;
  };
  subscription?: {
    plan: string;
    status: string;
    endDate?: string;
  };
  error?: string;
  message?: string;
}

export const paymentApi = {
  // Verify payment
  async verify(txHash: string, plan: 'plan2' | 'plan3'): Promise<PaymentResponse> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txHash, plan }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Payment verification failed');
    }
    return response.json();
  },

  // Get payment history
  async getHistory(limit = 10): Promise<{ success: boolean; payments: PaymentHistoryItem[] }> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/payments/history?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to get payment history');
    }
    return response.json();
  },
};

export interface PaymentHistoryItem {
  _id: string;
  plan: string;
  amount: number;
  currency: string;
  txHash: string;
  network: string;
  status: string;
  confirmedAt?: string | null;
  createdAt: string;
  fromAddress?: string;
  toAddress?: string;
}

export interface UsageLogEntry {
  _id?: string;
  action: 'compile' | 'deploy' | 'function_test';
  projectId?: string | null;
  contractAddress?: string | null;
  functionName?: string | null;
  success: boolean;
  error?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Usage API
export interface UsageResponse {
  success: boolean;
  usage?: {
    deployments: {
      count: number;
      limit: number;
      remaining: number | string;
      lastResetDate: string;
    };
    functionTests: {
      count: number;
      limit: number;
      remaining: number | string;
      lastResetDate: string;
    };
  };
  statistics?: unknown;
  logs?: UsageLogEntry[];
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  database: string;
}

// Wallet API — per-user server-managed Stellar testnet wallet.
// The secret key is never returned by the backend and never stored client-side.
export interface WalletInfo {
  success?: boolean;
  publicKey: string;
  funded: boolean;
  balance: number;
}

export const walletApi = {
  /** Get the logged-in user's testnet wallet (public info only). */
  async me(): Promise<WalletInfo> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/wallet/me`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to load wallet');
    return response.json();
  },

  /** Create + fund the wallet if missing (call right after login). */
  async ensure(): Promise<WalletInfo> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/wallet/ensure`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to ensure wallet');
    return response.json();
  },

  /** Re-run Friendbot if the testnet balance is low. */
  async fund(): Promise<WalletInfo> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/wallet/fund`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fund wallet');
    return response.json();
  },
};

export interface UsageSummaryDay {
  date: string;
  compile: number;
  deploy: number;
  function_test: number;
}

export interface UsageSummaryResponse {
  success: boolean;
  summary: {
    totalEvents: number;
    uniqueUsers: number;
    totals: {
      compile: number;
      deploy: number;
      function_test: number;
    };
    periodStart: string;
    periodEnd: string;
  };
  daily: UsageSummaryDay[];
}

export const usageApi = {
  // Get usage statistics
  async getUsage(): Promise<UsageResponse> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/usage`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to get usage');
    }
    return response.json();
  },
};

export interface ActivityLogEntry {
  _id: string;
  action: 'compile' | 'deploy' | 'function_test';
  projectId?: string | null;
  contractAddress?: string | null;
  functionName?: string | null;
  success: boolean;
  error?: string | null;
  createdAt: string;
  user?: { email: string; name: string | null } | null;
}

export interface PlatformPaymentItem extends PaymentHistoryItem {
  user?: { email: string; name: string | null } | null;
}

export const analyticsApi = {
  // Project-wide usage summary (all users)
  async getUsageSummary(): Promise<UsageSummaryResponse> {
    const response = await fetch(`${API_BASE_URL}/usage/summary`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error('Failed to get usage summary');
    }
    return response.json();
  },

  // Platform-wide activity logs (all users)
  async getActivityLogs(limit = 50): Promise<{ success: boolean; logs: ActivityLogEntry[] }> {
    const response = await fetch(`${API_BASE_URL}/usage/activity?limit=${limit}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error('Failed to get activity logs');
    }
    return response.json();
  },

  // Platform-wide transaction history (all users)
  async getAllTransactions(limit = 50): Promise<{ success: boolean; payments: PlatformPaymentItem[] }> {
    const response = await fetch(`${API_BASE_URL}/payments/all?limit=${limit}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error('Failed to get transaction history');
    }
    return response.json();
  },
};

export const systemApi = {
  async getHealth(): Promise<HealthResponse> {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error('Failed to get health status');
    }
    return response.json();
  },
};

// Contract API — spec-driven, type-aware invoke pipeline.
export interface SpecInput {
  name: string;
  type: string;
}
export interface SpecFunction {
  name: string;
  doc: string;
  inputs: SpecInput[];
  outputs: string[];
}
export interface ContractSpecResponse {
  success: boolean;
  contractId?: string;
  functions?: SpecFunction[];
  error?: string;
}

export interface InvokeResponse {
  success: boolean;
  readOnly: boolean;
  status: 'simulated' | 'submitted' | 'success' | 'failed';
  result?: any;
  returnValue?: any;
  txHash?: string;
  resourceFee?: string;
  cost?: any;
  latestLedger?: number;
  events?: any[];
  error?: string;
  invocationId?: string;
}

export interface FunctionTestCase {
  id: string;
  contractId: string;
  functionName: string;
  name: string;
  args: Record<string, any>;
  expected?: { mode: 'success' | 'equals' | 'contains'; value?: any } | null;
  createdAt: string;
}

export interface RunTestsResponse {
  success: boolean;
  total: number;
  passed: number;
  results: Array<{
    testId: string;
    name: string;
    functionName: string;
    status: 'pass' | 'fail';
    actual: any;
    expected: any;
    error?: string | null;
  }>;
}

function authHeaders(): Record<string, string> {
  const token = authApi.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const contractApi = {
  // Fetch the parsed function list for the type-aware invoke form.
  async getSpec(contractId: string): Promise<ContractSpecResponse> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/spec`, {
      headers: authHeaders(),
    });
    return response.json();
  },

  // Invoke a function. Pass an args object keyed by parameter name. Set
  // execute=true to sign + submit a state-changing call (otherwise simulate).
  async invoke(
    contractId: string,
    functionName: string,
    args: Record<string, any> = {},
    opts: { execute?: boolean; clientRef?: string } = {}
  ): Promise<InvokeResponse> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/invoke`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ functionName, args, execute: opts.execute ?? false, clientRef: opts.clientRef ?? null }),
    });
    const data = await response.json();
    if (!response.ok && data.error) throw new Error(data.error);
    return data;
  },

  // --- Saved function tests ---
  async listTests(contractId: string): Promise<{ success: boolean; tests: FunctionTestCase[] }> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/tests`, { headers: authHeaders() });
    return response.json();
  },

  async saveTest(
    contractId: string,
    test: { functionName: string; name: string; args: Record<string, any>; expected?: any }
  ): Promise<{ success: boolean; test: FunctionTestCase }> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/tests`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(test),
    });
    return response.json();
  },

  async deleteTest(contractId: string, testId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/tests/${testId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return response.json();
  },

  async runTests(contractId: string, functionName?: string): Promise<RunTestsResponse> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/tests/run`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(functionName ? { functionName } : {}),
    });
    return response.json();
  },
};

// Invite API (kept for backward compatibility, but deprecated)
export interface InviteCheckResponse {
  success: boolean;
  hasInvite: boolean;
  isWaitlist?: boolean;
  isNew?: boolean;
  used?: boolean;
  message: string;
}

export interface InviteValidateResponse {
  success: boolean;
  message: string;
  invite?: {
    email: string;
    inviteCode: string;
    usedAt?: string;
  };
  error?: string;
}

// INVITE API - COMMENTED OUT - Replaced with premium gifting system
/*
export const inviteApi = {
  // Check if user has invite
  async checkInvite(email: string): Promise<InviteCheckResponse> {
    const response = await fetch(`${API_BASE_URL}/invites/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      throw new Error('Failed to check invite status');
    }
    return response.json();
  },

  // Validate invite code
  async validateInvite(email: string, inviteCode: string): Promise<InviteValidateResponse> {
    const response = await fetch(`${API_BASE_URL}/invites/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, inviteCode }),
    });
    
    const data = await response.json();
    
    // Handle waitlist error (404 status)
    if (response.status === 404 && data.error === 'waitlist') {
      return {
        success: false,
        error: 'waitlist',
        message: data.message || 'You are on the waitlist'
      };
    }
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to validate invite code');
    }
    return data;
  },
};
*/

// Premium Gifts API - New system for gifting premium subscriptions
export interface PremiumGiftResponse {
  success: boolean;
  message: string;
  user?: {
    email: string;
    subscription: {
      plan: string;
      status: string;
      startDate: string;
      endDate: string | null;
    };
  };
  isNewUser?: boolean;
  error?: string;
}

export interface PremiumGiftBulkResponse {
  success: boolean;
  message: string;
  results: {
    success: number;
    failed: number;
    skipped: number;
  };
  details: {
    success: Array<{ email: string; isNewUser?: boolean }>;
    failed: Array<{ email: string; error: string }>;
    skipped: Array<{ email: string; reason: string }>;
  };
  error?: string;
}

export interface PremiumUser {
  email: string;
  name?: string;
  picture?: string;
  subscription: {
    plan: string;
    status: string;
    startDate: string;
    endDate: string | null;
  };
  createdAt: string;
}

export const premiumGiftsApi = {
  // Gift premium to a single user
  async giftPremium(email: string, durationDays: number = 30): Promise<PremiumGiftResponse> {
    const token = localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    const response = await fetch(`${API_BASE_URL}/premium-gifts/gift`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ email, durationDays }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to gift premium');
    }
    
    return response.json();
  },

  // Gift premium to multiple users
  async giftBulk(emails: string[], durationDays: number = 30): Promise<PremiumGiftBulkResponse> {
    const token = localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    const response = await fetch(`${API_BASE_URL}/premium-gifts/gift-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ emails, durationDays }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to gift premium in bulk');
    }
    
    return response.json();
  },

  // List all premium users
  async listPremiumUsers(limit: number = 100, skip: number = 0): Promise<{ success: boolean; users: PremiumUser[]; total: number }> {
    const token = localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    const response = await fetch(`${API_BASE_URL}/premium-gifts/list?limit=${limit}&skip=${skip}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to list premium users');
    }
    
    return response.json();
  },
};

// Keep inviteApi for backward compatibility but return error
export const inviteApi = {
  async checkInvite(email: string): Promise<InviteCheckResponse> {
    throw new Error('Invite system has been disabled. Please contact support for premium access.');
  },
  async validateInvite(email: string, inviteCode: string): Promise<InviteValidateResponse> {
    throw new Error('Invite system has been disabled. Please contact support for premium access.');
  },
}; 