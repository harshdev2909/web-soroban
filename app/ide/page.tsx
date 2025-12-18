"use client"

import { useState, useEffect, useRef } from 'react'
import { useAccount } from '@/hooks/useAccount'
import { useConnect } from '@/hooks/useConnect'
import { projectApi, compileApi, deployApi, jobsApi, Project, ProjectFile, Template } from '@/lib/api'
import { socketService } from '@/lib/socket'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ProjectSelector } from '@/components/project-selector'
import { Sidebar } from '@/components/sidebar'
import { EditorPanel } from '@/components/editor-panel'
import { RightPanel } from '@/components/right-panel'
import { BottomPanel, LogEntry } from '@/components/bottom-panel'
import { Navbar } from '@/components/navbar'
import { InviteModal } from '@/components/invite-modal'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

export default function IDEPage() {
  const [project, setProject] = useState<Project | null>(null)
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompiling, setIsCompiling] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')
  const [hasAccess, setHasAccess] = useState(false)
  const currentJobIdRef = useRef<string | null>(null)

  const account = useAccount()
  const { connect } = useConnect()

  // Initialize WebSocket connection on mount
  useEffect(() => {
    socketService.connect();
    
    return () => {
      // Cleanup: unsubscribe from current job and disconnect
      if (currentJobIdRef.current) {
        socketService.unsubscribeFromJob(currentJobIdRef.current);
      }
      socketService.disconnect();
    };
  }, [])

  // Always require invite verification - no localStorage dependency
  useEffect(() => {
    // Always show invite modal - require verification every time
    setHasAccess(false)
    setIsInviteModalOpen(true)
    setIsLoading(false)
  }, [])

  // Load initial project on component mount - ONLY if user has access
  useEffect(() => {
    if (!hasAccess) {
      return // Don't load project if no access
    }
    
    const loadInitialProject = async () => {
      try {
        const projects = await projectApi.getProjects();
        if (projects.length > 0) {
          setProject(projects[0]);
          setActiveFile(projects[0].files[0]);
        } else {
          // Create a default project if none exist
          const newProject = await projectApi.createProject("My Soroban Contract");
          
          // Add a default test file to the project
          const testFile: ProjectFile = {
            name: "tests.rs",
            content: `#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Symbol, Address, vec};

#[contract]
pub struct TestContract;

#[contractimpl]
impl TestContract {
    pub fn init(env: Env) {
        // Initialize test contract
        env.storage().instance().set(&Symbol::new(&env, "owner"), &env.current_contract_address());
    }
    
    pub fn test_hello(env: Env, name: Symbol) -> Symbol {
        // Test function
        name
    }
    
    pub fn test_transfer(env: Env, from: Address, to: Address, amount: i128) -> bool {
        // Test transfer function
        from.require_auth();
        
        let balance_key = Symbol::new(&env, "balance");
        let from_balance = env.storage().instance().get(&balance_key).unwrap_or(0);
        
        if from_balance >= amount {
            env.storage().instance().set(&balance_key, &(from_balance - amount));
            true
        } else {
            false
        }
    }
    
    pub fn test_get_balance(env: Env, address: Address) -> i128 {
        // Test balance function
        let balance_key = Symbol::new(&env, "balance");
        env.storage().instance().get(&balance_key).unwrap_or(0)
    }
    
    pub fn test_mint(env: Env, to: Address, amount: i128) -> bool {
        // Test mint function
        let balance_key = Symbol::new(&env, "balance");
        let current_balance = env.storage().instance().get(&balance_key).unwrap_or(0);
        env.storage().instance().set(&balance_key, &(current_balance + amount));
        true
    }
    
    pub fn test_burn(env: Env, from: Address, amount: i128) -> bool {
        // Test burn function
        from.require_auth();
        
        let balance_key = Symbol::new(&env, "balance");
        let current_balance = env.storage().instance().get(&balance_key).unwrap_or(0);
        
        if current_balance >= amount {
            env.storage().instance().set(&balance_key, &(current_balance - amount));
            true
        } else {
            false
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{Address, Symbol};
    
    #[test]
    fn test_init() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TestContract);
        env.as_contract(&contract_id, || {
            TestContract::init(env.clone());
        });
    }
    
    #[test]
    fn test_hello() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TestContract);
        env.as_contract(&contract_id, || {
            let name = Symbol::new(&env, "World");
            let result = TestContract::test_hello(env.clone(), name);
            assert_eq!(result, name);
        });
    }
    
    #[test]
    fn test_transfer() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TestContract);
        let from = Address::random(&env);
        let to = Address::random(&env);
        
        env.as_contract(&contract_id, || {
            // Set initial balance
            let balance_key = Symbol::new(&env, "balance");
            env.storage().instance().set(&balance_key, &100);
            
            // Test transfer
            let result = TestContract::test_transfer(env.clone(), from, to, 50);
            assert!(result);
            
            // Verify balance
            let new_balance = TestContract::test_get_balance(env.clone(), from);
            assert_eq!(new_balance, 50);
        });
    }
    
    #[test]
    fn test_mint() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TestContract);
        let to = Address::random(&env);
        
        env.as_contract(&contract_id, || {
            let result = TestContract::test_mint(env.clone(), to, 100);
            assert!(result);
            
            let balance = TestContract::test_get_balance(env.clone(), to);
            assert_eq!(balance, 100);
        });
    }
    
    #[test]
    fn test_burn() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TestContract);
        let from = Address::random(&env);
        
        env.as_contract(&contract_id, || {
            // Set initial balance
            let balance_key = Symbol::new(&env, "balance");
            env.storage().instance().set(&balance_key, &100);
            
            let result = TestContract::test_burn(env.clone(), from, 30);
            assert!(result);
            
            let balance = TestContract::test_get_balance(env.clone(), from);
            assert_eq!(balance, 70);
        });
    }
    
    #[test]
    fn test_insufficient_balance() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TestContract);
        let from = Address::random(&env);
        let to = Address::random(&env);
        
        env.as_contract(&contract_id, || {
            // Set low balance
            let balance_key = Symbol::new(&env, "balance");
            env.storage().instance().set(&balance_key, &10);
            
            // Try to transfer more than available
            let result = TestContract::test_transfer(env.clone(), from, to, 50);
            assert!(!result);
        });
    }
}`,
            type: 'rust'
          };
          
          // Update the project with the test file
          const updatedProject = await projectApi.updateProject(newProject._id, {
            files: [...newProject.files, testFile]
          });
          
          setProject(updatedProject);
          setActiveFile(updatedProject.files[0]);
        }
      } catch (error) {
        console.error("Failed to load initial project:", error);
        toast.error("Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialProject();
  }, [hasAccess]);

  // Helper function to save local project to DB if needed
  const ensureProjectSaved = async (currentProject: Project): Promise<Project> => {
    // Check if project is local (starts with "local-")
    if (currentProject._id.startsWith('local-')) {
      try {
        // Save project to database with isLocal flag so it won't show in project list
        const savedProject = await projectApi.createProject(currentProject.name, currentProject.files, undefined, true);
        // Update project state with saved project
        setProject(savedProject);
        toast.success("Project saved for compilation/deployment");
        return savedProject;
      } catch (error) {
        console.error("Failed to save local project:", error);
        toast.error("Failed to save project. Compilation may fail.");
        // Return original project anyway
        return currentProject;
      }
    }
    return currentProject;
  };

  const handleCompile = async () => {
    if (!project || !activeFile) return;

    setIsCompiling(true);
    setIsBottomPanelOpen(true);

    // Clear previous logs and start fresh
    setLogs([{
      type: "info",
      message: "🔨 Starting compilation...",
      timestamp: new Date().toISOString()
    }]);

    try {
      // Ensure project is saved to DB if it's a local project
      const projectToCompile = await ensureProjectSaved(project);
      
      const result = await compileApi.compile(projectToCompile._id, projectToCompile.files);
      
      // Add initial compilation logs (ensure logs is an array)
      const logsArray = Array.isArray(result.logs) ? result.logs : [];
      setLogs(prev => [...prev, ...logsArray]);
      
      // If we got a jobId, subscribe to WebSocket updates
      if (result.jobId) {
        currentJobIdRef.current = result.jobId;
        
        setLogs(prev => [...prev, {
          type: "info",
          message: "⏳ Waiting for compilation to complete...",
          timestamp: new Date().toISOString()
        }]);
        
        // Subscribe to WebSocket for real-time logs
        console.log('[Frontend] Subscribing to job:', result.jobId);
        socketService.subscribeToJob(result.jobId, {
          onLog: (logEntry) => {
            console.log('[Frontend] Received log via WebSocket:', logEntry);
            setLogs(prev => {
              // Avoid duplicates by checking message and timestamp
              const exists = prev.some(log => 
                log.message === logEntry.message && log.timestamp === logEntry.timestamp
              );
              if (!exists) {
                console.log('[Frontend] Adding new log:', logEntry.message);
              }
              return exists ? prev : [...prev, logEntry];
            });
          },
          onStatus: (status, result) => {
            console.log('[Frontend] Received status via WebSocket:', status, result);
            if (status === 'completed' || status === 'failed') {
              // Unsubscribe when job completes
              socketService.unsubscribeFromJob(result.jobId);
              currentJobIdRef.current = null;
              
              if (status === 'completed') {
                setLogs(prev => [...prev, {
                  type: "success",
                  message: "✅ Compilation successful! WASM file generated.",
                  timestamp: new Date().toISOString()
                }]);
                
                if (result.wasmBase64) {
                  const wasmSize = Math.round(result.wasmBase64.length * 0.75);
                  setLogs(prev => [...prev, {
                    type: "info",
                    message: `📦 WASM file size: ~${wasmSize} bytes`,
                    timestamp: new Date().toISOString()
                  }]);
                }
                
                toast.success("Compilation successful!");
              } else {
                setLogs(prev => [...prev, {
                  type: "error",
                  message: `❌ Compilation failed: ${result.error || 'Unknown error'}`,
                  timestamp: new Date().toISOString()
                }]);
                toast.error("Compilation failed");
              }
            }
          }
        });
        
        // Fallback: Also poll as backup (in case WebSocket fails)
        // Poll with progress updates to show logs even if WebSocket fails
        const finalResult = await compileApi.pollJobResult(result.jobId, (progressResult) => {
          // Update logs as we get progress updates from polling
          const progressLogs = Array.isArray(progressResult.logs) ? progressResult.logs : [];
          if (progressLogs.length > 0) {
            setLogs(prev => {
              const existingMessages = new Set(prev.map(log => log.message));
              const newLogs = progressLogs.filter(log => !existingMessages.has(log.message));
              if (newLogs.length > 0) {
                console.log('[Frontend] Adding logs from polling:', newLogs.length, 'new logs');
              }
              return [...prev, ...newLogs];
            });
          }
        });
        
        // Add final logs if not already shown
        const finalLogs = Array.isArray(finalResult.logs) ? finalResult.logs : [];
        setLogs(prev => {
          const existingMessages = new Set(prev.map(log => log.message));
          const newLogs = finalLogs.filter(log => !existingMessages.has(log.message));
          return [...prev, ...newLogs];
        });
        
        // Show success/failure message if not already shown
        if (finalResult.success) {
          if (!logs.some(log => log.message.includes('Compilation successful'))) {
            setLogs(prev => [...prev, {
              type: "success",
              message: "✅ Compilation successful! WASM file generated.",
              timestamp: new Date().toISOString()
            }]);
            
            if (finalResult.wasmBase64 && !logs.some(log => log.message.includes('WASM file size'))) {
              const wasmSize = Math.round(finalResult.wasmBase64.length * 0.75);
              setLogs(prev => [...prev, {
                type: "info",
                message: `📦 WASM file size: ~${wasmSize} bytes`,
                timestamp: new Date().toISOString()
              }]);
            }
            
            toast.success("Compilation successful!");
          }
        } else {
          if (!logs.some(log => log.message.includes('Compilation failed'))) {
            setLogs(prev => [...prev, {
              type: "error",
              message: `❌ Compilation failed: ${finalResult.error || 'Unknown error'}`,
              timestamp: new Date().toISOString()
            }]);
            toast.error("Compilation failed");
          }
        }
      } else {
        // Handle immediate result (non-async)
        if (result.success) {
          setLogs(prev => [...prev, {
            type: "success",
            message: "✅ Compilation successful! WASM file generated.",
            timestamp: new Date().toISOString()
          }]);
          
          if (result.wasmBase64) {
            const wasmSize = Math.round(result.wasmBase64.length * 0.75);
            setLogs(prev => [...prev, {
              type: "info",
              message: `📦 WASM file size: ~${wasmSize} bytes`,
              timestamp: new Date().toISOString()
            }]);
          }
          
          toast.success("Compilation successful!");
        } else {
          setLogs(prev => [...prev, {
            type: "error",
            message: "❌ Compilation failed",
            timestamp: new Date().toISOString()
          }]);
          toast.error("Compilation failed");
        }
      }
    } catch (error) {
      console.error("Compilation error:", error);
      setLogs(prev => [...prev, {
        type: "error",
        message: `❌ Compilation failed: ${(error as Error).message}`,
        timestamp: new Date().toISOString()
      }]);
      toast.error("Compilation failed");
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDeploy = async () => {
    if (!project) return;

    setIsDeploying(true);
    setIsBottomPanelOpen(true);

    try {
      // Ensure project is saved to DB if it's a local project
      const projectToDeploy = await ensureProjectSaved(project);
      
      // Step 1: Compile the project to get WASM
      setLogs([{
        type: "info",
        message: "🚀 Starting deployment process...",
        timestamp: new Date().toISOString()
      }]);
      
      toast.info("Compiling contract...");
      const compileResult = await compileApi.compile(projectToDeploy._id, projectToDeploy.files);
      const compileLogsArray = Array.isArray(compileResult.logs) ? compileResult.logs : [];
      setLogs(prev => [...prev, ...compileLogsArray]);
      
      let finalCompileResult = compileResult;
      
      // If we got a jobId, poll for the compilation result
      if (compileResult.jobId) {
        setLogs(prev => [...prev, {
          type: "info",
          message: "⏳ Waiting for compilation to complete...",
          timestamp: new Date().toISOString()
        }]);
        
        // Poll for compilation results with progress updates
        finalCompileResult = await compileApi.pollJobResult(compileResult.jobId, (progressResult) => {
          // Update logs as we get progress updates
          const progressLogs = Array.isArray(progressResult.logs) ? progressResult.logs : [];
          if (progressLogs.length > 0) {
            setLogs(prev => {
              const existingMessages = new Set(prev.map(log => log.message));
              const newLogs = progressLogs.filter(log => !existingMessages.has(log.message));
              return [...prev, ...newLogs];
            });
          }
        });
        
        // Add final compilation logs
        const finalCompileLogs = Array.isArray(finalCompileResult.logs) ? finalCompileResult.logs : [];
        setLogs(prev => {
          const existingMessages = new Set(prev.map(log => log.message));
          const newLogs = finalCompileLogs.filter(log => !existingMessages.has(log.message));
          return [...prev, ...newLogs];
        });
      }
      
      if (!finalCompileResult.success || !finalCompileResult.wasmBase64) {
        // Add error message if compilation failed
        const errorMessage = finalCompileResult.error || "Compilation failed";
        setLogs(prev => [...prev, {
          type: "error",
          message: `❌ Compilation failed: ${errorMessage}`,
          timestamp: new Date().toISOString()
        }]);
        toast.error("Compilation failed, cannot deploy");
        setIsDeploying(false);
        return;
      }

      setLogs(prev => [...prev, {
        type: "success",
        message: "✅ Compilation successful! WASM generated.",
        timestamp: new Date().toISOString()
      }]);

      // Step 2: Deploy directly using the simplified service
      setLogs(prev => [...prev, {
        type: "info",
        message: "🌐 Deploying to Stellar testnet...",
        timestamp: new Date().toISOString()
      }]);
      
      toast.info("Deploying contract...");
      const deployResult = await deployApi.deploy(projectToDeploy._id, finalCompileResult.wasmBase64, 'testnet');
      
      // Add initial deployment logs (ensure logs is an array)
      const deployLogsArray = Array.isArray(deployResult.logs) ? deployResult.logs : [];
      setLogs(prev => [...prev, ...deployLogsArray]);
      
      let finalDeployResult = deployResult;
      
      // If we got a jobId, subscribe to WebSocket updates
      if (deployResult.jobId) {
        // Unsubscribe from previous job if any
        if (currentJobIdRef.current) {
          socketService.unsubscribeFromJob(currentJobIdRef.current);
        }
        currentJobIdRef.current = deployResult.jobId;
        
        setLogs(prev => [...prev, {
          type: "info",
          message: "⏳ Waiting for deployment to complete...",
          timestamp: new Date().toISOString()
        }]);
        
        // Subscribe to WebSocket for real-time logs
        socketService.subscribeToJob(deployResult.jobId, {
          onLog: (logEntry) => {
            setLogs(prev => {
              // Avoid duplicates by checking message and timestamp
              const exists = prev.some(log => 
                log.message === logEntry.message && log.timestamp === logEntry.timestamp
              );
              return exists ? prev : [...prev, logEntry];
            });
          },
          onStatus: async (status, result) => {
            if (status === 'completed' || status === 'failed') {
              // Unsubscribe when job completes
              socketService.unsubscribeFromJob(result.jobId || deployResult.jobId);
              currentJobIdRef.current = null;
              
              if (status === 'completed' && result.contractAddress) {
                setLogs(prev => [...prev, {
                  type: "success",
                  message: `🎉 Deployment successful! Contract deployed at: ${result.contractAddress}`,
                  timestamp: new Date().toISOString()
                }]);
                
                if (result.network) {
                  setLogs(prev => [...prev, {
                    type: "info",
                    message: `🌐 Network: ${result.network}`,
                    timestamp: new Date().toISOString()
                  }]);
                }
                
                if (result.walletAddress) {
                  setLogs(prev => [...prev, {
                    type: "info",
                    message: `👛 Deployed by: ${result.walletAddress}`,
                    timestamp: new Date().toISOString()
                  }]);
                }
                
                toast.success(`Deployment successful! Contract: ${result.contractAddress}`);
                
                // Add explorer link
                if (result.contractAddress) {
                  const explorerUrl = `https://stellar.expert/explorer/testnet/contract/${result.contractAddress}`;
                  setLogs(prev => [...prev, {
                    type: "info",
                    message: `🔗 View on Stellar Expert: ${explorerUrl}`,
                    timestamp: new Date().toISOString()
                  }]);
                }
                
                // Update project
                try {
                  const updatedProject = await projectApi.getProject(projectToDeploy._id);
                  setProject(updatedProject);
                } catch (fetchError) {
                  console.warn('Failed to fetch updated project:', fetchError);
                  if (projectToDeploy) {
                    setProject({
                      ...projectToDeploy,
                      contractAddress: result.contractAddress,
                      lastDeployed: new Date().toISOString()
                    });
                  }
                }
              } else {
                const errorMessage = result.error || 'Deployment failed';
                setLogs(prev => [...prev, {
                  type: "error",
                  message: `❌ Deployment failed: ${errorMessage}`,
                  timestamp: new Date().toISOString()
                }]);
                toast.error(`Deployment failed: ${errorMessage}`);
              }
            }
          }
        });
        
        // Fallback: Also poll as backup (in case WebSocket fails)
        // Poll with progress updates to show logs even if WebSocket fails
        finalDeployResult = await deployApi.pollDeployJobResult(deployResult.jobId, (progressResult) => {
          // Update logs as we get progress updates from polling
          const progressLogs = Array.isArray(progressResult.logs) ? progressResult.logs : [];
          if (progressLogs.length > 0) {
            setLogs(prev => {
              const existingMessages = new Set(prev.map(log => log.message));
              const newLogs = progressLogs.filter(log => !existingMessages.has(log.message));
              if (newLogs.length > 0) {
                console.log('[Frontend] Adding deployment logs from polling:', newLogs.length, 'new logs');
              }
              return [...prev, ...newLogs];
            });
          }
        });
        
        // Add final logs if not already shown
        const finalDeployLogs = Array.isArray(finalDeployResult.logs) ? finalDeployResult.logs : [];
        setLogs(prev => {
          const existingMessages = new Set(prev.map(log => log.message));
          const newLogs = finalDeployLogs.filter(log => !existingMessages.has(log.message));
          return [...prev, ...newLogs];
        });
        
        // Show success/failure message if not already shown
        if (finalDeployResult.success && finalDeployResult.contractAddress) {
          if (!logs.some(log => log.message.includes('Deployment successful'))) {
            setLogs(prev => [...prev, {
              type: "success",
              message: `🎉 Deployment successful! Contract deployed at: ${finalDeployResult.contractAddress}`,
              timestamp: new Date().toISOString()
            }]);
            
            toast.success(`Deployment successful! Contract: ${finalDeployResult.contractAddress}`);
            
            // Update project
            try {
              const updatedProject = await projectApi.getProject(projectToDeploy._id);
              setProject(updatedProject);
            } catch (fetchError) {
              console.warn('Failed to fetch updated project:', fetchError);
              if (projectToDeploy) {
                setProject({
                  ...projectToDeploy,
                  contractAddress: finalDeployResult.contractAddress,
                  lastDeployed: new Date().toISOString()
                });
              }
            }
          }
        } else if (!finalDeployResult.success) {
          if (!logs.some(log => log.message.includes('Deployment failed'))) {
            const errorMessage = finalDeployResult.error || "Deployment failed";
            setLogs(prev => [...prev, {
              type: "error",
              message: `❌ Deployment failed: ${errorMessage}`,
              timestamp: new Date().toISOString()
            }]);
            toast.error(`Deployment failed: ${errorMessage}`);
          }
        }
      } else {
        // Handle immediate result (non-async deployment)
        if (finalDeployResult.success && finalDeployResult.contractAddress) {
          setLogs(prev => [...prev, {
            type: "success",
            message: `🎉 Deployment successful! Contract deployed at: ${finalDeployResult.contractAddress}`,
            timestamp: new Date().toISOString()
          }]);
          
          toast.success(`Deployment successful! Contract: ${finalDeployResult.contractAddress}`);
          
          // Update project
          try {
            const updatedProject = await projectApi.getProject(projectToDeploy._id);
            setProject(updatedProject);
          } catch (fetchError) {
            console.warn('Failed to fetch updated project:', fetchError);
            if (projectToDeploy) {
              setProject({
                ...projectToDeploy,
                contractAddress: finalDeployResult.contractAddress,
                lastDeployed: new Date().toISOString()
              });
            }
          }
        } else {
          const errorMessage = finalDeployResult.error || "Deployment failed";
          setLogs(prev => [...prev, {
            type: "error",
            message: `Deployment failed: ${errorMessage}`,
            timestamp: new Date().toISOString()
          }]);
          toast.error(`Deployment failed: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error("Deployment error:", error);
      setLogs(prev => [...prev, {
        type: "error",
        message: `Deployment failed: ${(error as Error).message}`,
        timestamp: new Date().toISOString()
      }]);
      toast.error("Deployment failed");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleFileSelect = (file: ProjectFile) => {
    setActiveFile(file);
  };

  const handleFileContentChange = async (content: string) => {
    if (!project || !activeFile) return;

    const updatedFile = { ...activeFile, content };
    setActiveFile(updatedFile);

    // Update the file in the project
    const updatedFiles = project.files.map((f) => 
      f.name === activeFile.name ? updatedFile : f
    );
    
    const updatedProject = { ...project, files: updatedFiles };
    setProject(updatedProject);

    // Don't send PUT request when template code changes
    // File changes are saved locally only
  };

  const handleProjectSelect = (selectedProject: Project) => {
    setProject(selectedProject);
    setActiveFile(selectedProject.files[0]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleProjectCreate = (newProject: Project) => {
    setProject(newProject);
    setActiveFile(newProject.files[0]);
  };

  const handleTemplateSelect = async (template: Template) => {
    // Template selection is now handled by ProjectSelector with name modal
    // This function is kept for backward compatibility but project creation
    // happens in ProjectSelector after user enters the project name
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!project) return;
    
    try {
      const updatedFiles = project.files.filter(file => file.name !== fileName);
      const updatedProject = await projectApi.updateProject(project._id, { files: updatedFiles });
      setProject(updatedProject);
      
      // If the deleted file was active, switch to the first remaining file
      if (activeFile?.name === fileName) {
        setActiveFile(updatedFiles[0]);
      }
      
      toast.success(`File "${fileName}" deleted successfully!`);
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast.error("Failed to delete file");
    }
  };

  const handleProjectNameChange = async (name: string) => {
    if (!project) return;
    // Update local state only, don't send PUT request
    setProject({ ...project, name });
  };

  const handleNewFile = (fileName?: string) => {
    if (!project) return;
    
    const timestamp = Date.now();
    const defaultName = fileName || `contract_${timestamp}.rs`;
    
    // Check if it's a test file
    const isTestFile = defaultName.includes('test') || defaultName.includes('spec');
    const fileExtension = defaultName.endsWith('.rs') ? '' : '.rs';
    const finalName = defaultName + fileExtension;
    
    // Check for duplicate names
    const existingFile = project.files.find(f => f.name === finalName);
    if (existingFile) {
      alert('A file with this name already exists!');
      return;
    }

    let defaultContent = '';
    
    if (isTestFile) {
      // Test file template
      defaultContent = `#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Symbol, Address, vec};

#[contract]
pub struct TestContract;

#[contractimpl]
impl TestContract {
    pub fn init(env: Env) {
        // Initialize test contract
        env.storage().instance().set(&Symbol::new(&env, "owner"), &env.current_contract_address());
    }
    
    pub fn test_hello(env: Env, name: Symbol) -> Symbol {
        // Test function
        name
    }
    
    pub fn test_transfer(env: Env, from: Address, to: Address, amount: i128) -> bool {
        // Test transfer function
        from.require_auth();
        
        let balance_key = Symbol::new(&env, "balance");
        let from_balance = env.storage().instance().get(&balance_key).unwrap_or(0);
        
        if from_balance >= amount {
            env.storage().instance().set(&balance_key, &(from_balance - amount));
            true
        } else {
            false
        }
    }
    
    pub fn test_get_balance(env: Env, address: Address) -> i128 {
        // Test balance function
        let balance_key = Symbol::new(&env, "balance");
        env.storage().instance().get(&balance_key).unwrap_or(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{Address, Symbol};
    
    #[test]
    fn test_init() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TestContract);
        env.as_contract(&contract_id, || {
            TestContract::init(env.clone());
        });
    }
    
    #[test]
    fn test_hello() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TestContract);
        env.as_contract(&contract_id, || {
            let name = Symbol::new(&env, "World");
            let result = TestContract::test_hello(env.clone(), name);
            assert_eq!(result, name);
        });
    }
    
    #[test]
    fn test_transfer() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TestContract);
        let from = Address::random(&env);
        let to = Address::random(&env);
        
        env.as_contract(&contract_id, || {
            // Set initial balance
            let balance_key = Symbol::new(&env, "balance");
            env.storage().instance().set(&balance_key, &100);
            
            // Test transfer
            let result = TestContract::test_transfer(env.clone(), from, to, 50);
            assert!(result);
            
            // Verify balance
            let new_balance = TestContract::test_get_balance(env.clone(), from);
            assert_eq!(new_balance, 50);
        });
    }
}`;
    } else {
      // Regular contract template
      defaultContent = `#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Symbol, Address};

#[contract]
pub struct MyContract;

#[contractimpl]
impl MyContract {
    pub fn init(env: Env) {
        // Contract initialization
        env.storage().instance().set(&Symbol::new(&env, "owner"), &env.current_contract_address());
    }
    
    pub fn hello(env: Env, name: Symbol) -> Symbol {
        // Your contract logic here
        name
    }
    
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        
        let balance_key = Symbol::new(&env, "balance");
        let from_balance = env.storage().instance().get(&balance_key).unwrap_or(0);
        
        require!(from_balance >= amount, Error::InsufficientBalance);
        
        // Update balances
        env.storage().instance().set(&balance_key, &(from_balance - amount));
        let to_balance = env.storage().instance().get(&balance_key).unwrap_or(0);
        env.storage().instance().set(&balance_key, &(to_balance + amount));
    }
    
    pub fn get_balance(env: Env, address: Address) -> i128 {
        let balance_key = Symbol::new(&env, "balance");
        env.storage().instance().get(&balance_key).unwrap_or(0)
    }
}

#[derive(Clone)]
pub enum Error {
    InsufficientBalance,
}

impl From<Error> for soroban_sdk::Error {
    fn from(error: Error) -> Self {
        match error {
            Error::InsufficientBalance => soroban_sdk::Error::from_type_and_code(1, 1),
        }
    }
}`;
    }

    const newFile: ProjectFile = {
      name: finalName,
      content: defaultContent,
      type: 'rust'
    };

    setProject(prev => {
      if (!prev) return null;
      return {
        ...prev,
        files: [...prev.files, newFile]
      };
    });

    setActiveFile(newFile);
  };

  const handleSaveProject = async () => {
    if (!project) return;
    try {
      // Update the project with current files
      const updatedProject = await projectApi.updateProject(project._id, { 
        files: project.files
      });
      setProject(updatedProject);
      toast.success("Project saved successfully!");
    } catch (error) {
      console.error("Failed to save project:", error);
      toast.error("Failed to save project");
    }
  };

  const handleRightPanelClose = () => {
    // This could be used to hide the right panel if needed
    console.log("Right panel close requested");
  };

  const handleInviteSuccess = () => {
    // Grant access after successful verification - no localStorage
    setHasAccess(true)
    setIsInviteModalOpen(false)
    setIsLoading(true) // Start loading IDE now that access is granted
    toast.success('Welcome! You now have access to the IDE.')
    
    // Load project after access is granted
    const loadInitialProject = async () => {
      try {
        const projects = await projectApi.getProjects();
        if (projects.length > 0) {
          setProject(projects[0]);
          setActiveFile(projects[0].files[0]);
        } else {
          // Create a default project if none exist
          const newProject = await projectApi.createProject("My Soroban Contract");
          setProject(newProject);
          setActiveFile(newProject.files[0]);
        }
      } catch (error) {
        console.error("Failed to load initial project:", error);
        toast.error("Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialProject();
  };

  // Show invite modal if no access - BLOCK IDE ACCESS
  if (!hasAccess) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
        <div className="text-center">
          <InviteModal
            open={isInviteModalOpen}
            onOpenChange={setIsInviteModalOpen}
            userEmail={userEmail}
            onSuccess={handleInviteSuccess}
          />
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Access Required</h1>
            <p className="text-gray-400">Please enter your invite code to access the IDE</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading IDE...</p>
        </div>
      </div>
    );
  }

  if (!project || !activeFile) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No project loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Navbar 
        walletAddress={account?.address || null}
        onConnectWallet={connect}
        onInviteClick={() => setIsInviteModalOpen(true)}
        projectSelector={
          <ProjectSelector
            currentProject={project}
            onProjectSelect={handleProjectSelect}
            onProjectCreate={handleProjectCreate}
            onTemplateSelect={handleTemplateSelect}
          />
        }
      />
      
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={isBottomPanelOpen ? 70 : 100}>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={20} minSize={15}>
                <Sidebar 
                  project={project}
                  activeFile={activeFile}
                  onFileSelect={handleFileSelect}
                  onProjectNameChange={handleProjectNameChange}
                  onNewFile={handleNewFile}
                  onSaveProject={handleSaveProject}
                  onDeleteFile={handleDeleteFile}
                />
              </ResizablePanel>
              
              <ResizableHandle />
              
              <ResizablePanel defaultSize={50}>
                <EditorPanel 
                  activeFile={activeFile}
                  files={project.files}
                  onFileSelect={handleFileSelect}
                  onFileContentChange={handleFileContentChange}
                  onCompile={handleCompile}
                  onDeploy={handleDeploy}
                  isCompiling={isCompiling}
                  isDeploying={isDeploying}
                />
              </ResizablePanel>
              
              <ResizableHandle />
              
              <ResizablePanel defaultSize={30} minSize={20}>
                <RightPanel project={project} onClose={handleRightPanelClose} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          
          {isBottomPanelOpen && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={30} minSize={20}>
                <BottomPanel 
                  logs={logs} 
                  onClose={() => setIsBottomPanelOpen(false)} 
                  onClear={handleClearLogs}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
} 