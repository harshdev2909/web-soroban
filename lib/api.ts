const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-ide-production.up.railway.app/api';

export interface ProjectFile {
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
  async updateProject(id: string, data: { name?: string; files?: ProjectFile[] }): Promise<Project> {
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

// Templates API
export const templatesApi = {
  async getTemplates(): Promise<Template[]> {
    const response = await fetch(`${API_BASE_URL}/templates`);
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
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
  authMethod: 'gmail' | 'wallet' | 'both';
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
  async getHistory(limit = 10): Promise<{ success: boolean; payments: any[] }> {
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
  statistics?: any;
  logs?: any[];
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  mongodb: string;
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

// Contract API
export interface InvokeResponse {
  success: boolean;
  output?: any;
  contractAddress?: string;
  functionName?: string;
  args?: any[];
  usage?: {
    count: number;
    limit: number;
    remaining: number | string;
  };
  error?: string;
}

export const contractApi = {
  // Invoke contract function
  async invoke(contractAddress: string, functionName: string, args: any[] = [], network = 'testnet'): Promise<InvokeResponse> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/contracts/${contractAddress}/invoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ functionName, args, network }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to invoke contract');
    }
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