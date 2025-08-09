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
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    return response.json();
  },

  // Get single project
  async getProject(id: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch project');
    }
    return response.json();
  },

  // Create new project
  async createProject(name?: string, files?: ProjectFile[], template?: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, files, template }),
    });
    if (!response.ok) {
      throw new Error('Failed to create project');
    }
    return response.json();
  },

  // Update project
  async updateProject(id: string, data: { name?: string; files?: ProjectFile[] }): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
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
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
  },
};

// Compile API
export const compileApi = {
  async compile(projectId: string, files: ProjectFile[]): Promise<CompileResponse> {
    const response = await fetch(`${API_BASE_URL}/compile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, files }),
    });
    if (!response.ok) {
      throw new Error('Compilation failed');
    }
    return response.json();
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
    const response = await fetch(`${API_BASE_URL}/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, wasmBase64, network, walletInfo }),
    });
    if (!response.ok) {
      throw new Error('Deployment failed');
    }
    return response.json();
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