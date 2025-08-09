"use client"

import { useState, useEffect } from 'react'
import { useAccount } from '@/hooks/useAccount'
import { useConnect } from '@/hooks/useConnect'
import { projectApi, compileApi, deployApi, Project, ProjectFile } from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ProjectSelector } from '@/components/project-selector'
import { Sidebar } from '@/components/sidebar'
import { EditorPanel } from '@/components/editor-panel'
import { RightPanel } from '@/components/right-panel'
import { BottomPanel, LogEntry } from '@/components/bottom-panel'
import { Navbar } from '@/components/navbar'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

export default function IDEPage() {
  const [project, setProject] = useState<Project | null>(null)
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompiling, setIsCompiling] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false)

  const account = useAccount()
  const { connect } = useConnect()

  // Load initial project on component mount
  useEffect(() => {
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
  }, []);

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
      const result = await compileApi.compile(project._id, project.files);
      
      // Add compilation logs
      setLogs(prev => [...prev, ...result.logs]);
      
      if (result.success) {
        setLogs(prev => [...prev, {
          type: "success",
          message: "✅ Compilation successful! WASM file generated.",
          timestamp: new Date().toISOString()
        }]);
        
        if (result.wasmBase64) {
          const wasmSize = Math.round(result.wasmBase64.length * 0.75); // Approximate size
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
      // Step 1: Compile the project to get WASM
      setLogs([{
        type: "info",
        message: "🚀 Starting deployment process...",
        timestamp: new Date().toISOString()
      }]);
      
      toast.info("Compiling contract...");
      const compileResult = await compileApi.compile(project._id, project.files);
      setLogs(prev => [...prev, ...compileResult.logs]);
      
      if (!compileResult.success || !compileResult.wasmBase64) {
        setLogs(prev => [...prev, {
          type: "error",
          message: "❌ Compilation failed, cannot deploy",
          timestamp: new Date().toISOString()
        }]);
        toast.error("Compilation failed, cannot deploy");
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
      const deployResult = await deployApi.deploy(project._id, compileResult.wasmBase64, 'testnet');
      
      // Add deployment logs
      setLogs(prev => [...prev, ...deployResult.logs]);
      
      if (deployResult.success && deployResult.contractAddress) {
        // Update project with new contract address (optional)
        try {
          const updatedProject = await projectApi.getProject(project._id);
          setProject(updatedProject);
        } catch (fetchError) {
          console.warn('Failed to fetch updated project:', fetchError);
          // Don't fail the deployment - it was successful
          // Update the project locally with the contract address
          if (project) {
            setProject({
              ...project,
              contractAddress: deployResult.contractAddress,
              lastDeployed: new Date().toISOString()
            });
          }
        }
        
        setLogs(prev => [...prev, {
          type: "success",
          message: `🎉 Deployment successful! Contract deployed at: ${deployResult.contractAddress}`,
          timestamp: new Date().toISOString()
        }]);
        
        if (deployResult.network) {
          setLogs(prev => [...prev, {
            type: "info",
            message: `🌐 Network: ${deployResult.network}`,
            timestamp: new Date().toISOString()
          }]);
        }
        
        if (deployResult.walletAddress) {
          setLogs(prev => [...prev, {
            type: "info",
            message: `👛 Deployed by: ${deployResult.walletAddress}`,
            timestamp: new Date().toISOString()
          }]);
        }
        
        toast.success(`Deployment successful! Contract: ${deployResult.contractAddress}`);
        
        // Add transaction explorer link if available
        if (deployResult.contractAddress) {
          const explorerUrl = `https://stellar.expert/explorer/testnet/contract/${deployResult.contractAddress}`;
          setLogs(prev => [...prev, {
            type: "info",
            message: `🔗 View on Stellar Expert: ${explorerUrl}`,
            timestamp: new Date().toISOString()
          }]);
        }
      } else {
        setLogs(prev => [...prev, {
          type: "error",
          message: "❌ Deployment failed",
          timestamp: new Date().toISOString()
        }]);
        toast.error("Deployment failed");
      }
    } catch (error) {
      console.error("Deployment error:", error);
      setLogs(prev => [...prev, {
        type: "error",
        message: `❌ Deployment failed: ${(error as Error).message}`,
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

    // Save to backend
    try {
      await projectApi.updateProject(project._id, { files: updatedFiles });
    } catch (error) {
      console.error("Failed to save file:", error);
      toast.error("Failed to save file");
    }
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
    try {
      const updatedProject = await projectApi.updateProject(project._id, { name });
      setProject(updatedProject);
    } catch (error) {
      console.error("Failed to update project name:", error);
      toast.error("Failed to update project name");
    }
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
        projectSelector={
          <ProjectSelector
            currentProject={project}
            onProjectSelect={handleProjectSelect}
            onProjectCreate={handleProjectCreate}
            onTemplateSelect={() => {}}
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