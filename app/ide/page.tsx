"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useWalletKit } from '@/contexts/WalletKitContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { networkApi } from '@/lib/mainnetApi'
import { getNetwork } from '@/lib/networks'
import { MainnetDeployDialog, type DeployConfirmDetails } from '@/components/network/mainnet-deploy-dialog'
import { projectApi, compileApi, deployApi, testApi, jobsApi, Project, ProjectFile, Template, usageApi } from '@/lib/api'
import { pathOf, baseName } from '@/lib/paths'
import { socketService } from '@/lib/socket'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ProjectSelector } from '@/components/project-selector'
import { Sidebar } from '@/components/sidebar'
import { EditorPanel } from '@/components/editor-panel'
import { BottomPanel, LogEntry } from '@/components/bottom-panel'
import { Navbar } from '@/components/navbar'
import { LoginModal } from '@/components/login-modal'
import { SubscriptionModal } from '@/components/subscription-modal'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CommandPalette, type PaletteCommand } from '@/components/command-palette'
import { StatusBar } from '@/components/status-bar'
import { Skeleton } from '@/components/ui/skeleton'
import { RightDock, type DockTab } from '@/components/copilot/right-dock'
import {
  Loader2,
  Hammer,
  Rocket,
  FilePlus2,
  FlaskConical,
  Save,
  Terminal,
  FileCode2,
  Store,
  Home,
  Sparkles,
} from 'lucide-react'

function IDELoading({ label = 'Loading IDE…' }: { label?: string }) {
  return (
    <div className="relative grid h-screen place-items-center overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" aria-hidden />
      <div className="relative text-center">
        <Loader2 className="mx-auto h-9 w-9 animate-spin text-brand" />
        <p className="mt-4 font-mono text-sm tracking-wide text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function IDEPageFallback() {
  return <IDELoading />
}

/** Three-zone skeleton matching the IDE shell — shown while the project loads. */
function IDESkeleton() {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Navbar shell */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="hidden h-9 w-80 rounded-lg lg:block" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        {/* Explorer */}
        <div className="hidden w-[20%] flex-col gap-3 border-r border-border p-3 md:flex">
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-3 w-24" />
          <div className="mt-2 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-full rounded-md" style={{ opacity: 1 - i * 0.12 }} />
            ))}
          </div>
        </div>
        {/* Editor (hero) */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <Skeleton className="h-6 w-24 rounded" />
            <Skeleton className="h-6 w-24 rounded" />
            <div className="ml-auto flex gap-2">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
          <div className="flex-1 space-y-2.5 p-4">
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton key={i} className="h-3.5 rounded" style={{ width: `${35 + ((i * 37) % 55)}%` }} />
            ))}
          </div>
        </div>
        {/* Right panel */}
        <div className="hidden w-[28%] flex-col gap-4 border-l border-border p-3 lg:flex">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
      {/* Status bar */}
      <div className="h-7 border-t border-border" />
    </div>
  )
}

function IDEPageContent() {
  const [project, setProject] = useState<Project | null>(null)
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompiling, setIsCompiling] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [usage, setUsage] = useState<any>(null)
  const [cursor, setCursor] = useState({ line: 1, col: 1 })
  // One docked right panel hosting both Copilot + Contract (tabbed).
  const [isDockOpen, setIsDockOpen] = useState(true)
  const [dockTab, setDockTab] = useState<DockTab>('copilot')
  // Bumped to refocus the Copilot composer (⌘I).
  const [copilotFocus, setCopilotFocus] = useState(0)
  // Promise-driven mainnet deploy confirmation (fee preview).
  const [deployConfirm, setDeployConfirm] = useState<{ open: boolean; details: DeployConfirmDetails | null; resolve?: (ok: boolean) => void }>({ open: false, details: null })
  const [diagnostics, setDiagnostics] = useState<any[]>([])
  // Workspace deploy: when >1 deployable contract and no target chosen yet.
  const [deployTargetChoices, setDeployTargetChoices] = useState<{ name: string; dir: string }[] | null>(null)
  const currentJobIdRef = useRef<string | null>(null)
  // Autosave: edits persist to the DB after a short idle, so work survives refresh.
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSaveRef = useRef<null | (() => Promise<void>)>(null)

  const { user, loading: authLoading, isAuthenticated, refreshUser } = useAuth()
  const { address, openWalletModal, signTransaction } = useWalletKit()
  const { network } = useNetwork()
  const searchParams = useSearchParams()
  const router = useRouter()

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

  // Cmd/Ctrl+I focuses the Copilot (opening it if needed).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        setIsDockOpen(true)
        setDockTab('copilot')
        setCopilotFocus((n) => n + 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // When the Copilot applies (or undoes) edits, swap in the updated project and
  // keep the user on the same file (its content may have changed).
  const handleCopilotApplied = (updated: Project) => {
    setProject(updated)
    const activePath = activeFile ? pathOf(activeFile) : null
    const next = (activePath && updated.files.find((f) => pathOf(f) === activePath)) || updated.files[0] || null
    setActiveFile(next)
  }

  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        setIsLoginModalOpen(true)
        setIsLoading(false)
      } else {
        loadUsage()
        // Keep isLoading true here — loadInitialProject() owns turning it
        // off once the project is actually fetched. Clearing it now would
        // briefly show the "No project loaded" screen while the project
        // request is still in flight.
      }
    }
  }, [authLoading, isAuthenticated])

  const loadUsage = async () => {
    try {
      const response = await usageApi.getUsage()
      if (response.success && response.usage) {
        setUsage(response.usage)
      }
    } catch (error) {
      console.error('Failed to load usage:', error)
    }
  }

  // Load initial project on component mount - ONLY if authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      return // Don't load project if not authenticated
    }
    
    const loadInitialProject = async () => {
      try {
        // If opened from marketplace with ?template=id, create a new project from that template
        const templateId = searchParams.get('template');
        if (templateId && typeof window !== 'undefined') {
          try {
            const projectName = templateId
              .split('-')
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(' ');
            const newProject = await projectApi.createProject(projectName, undefined, templateId);
            setProject(newProject);
            setActiveFile(newProject.files?.[0] || null);
            if (newProject.files?.[0]) {
              localStorage.setItem('lastProjectId', newProject._id);
              localStorage.setItem('lastActiveFileName', newProject.files[0].name);
            }
            router.replace('/ide', { scroll: false });
            toast.success(`Opened "${projectName}" from template`);
            return;
          } catch (err) {
            console.warn('Failed to create project from template:', err);
            toast.error('Could not open template. Opening IDE with existing projects.');
          }
        }

        const projects = await projectApi.getProjects();
        
        // Try to restore last project from localStorage
        if (typeof window !== 'undefined' && projects.length > 0) {
          const lastProjectId = localStorage.getItem('lastProjectId');
          const lastActiveFileName = localStorage.getItem('lastActiveFileName');
          
          if (lastProjectId) {
            // Find the saved project
            const savedProject = projects.find(p => p._id === lastProjectId);
            if (savedProject) {
              setProject(savedProject);
              
              // Try to restore the active file (key is a tree path; tolerate a
              // legacy bare name from before multi-file support).
              if (lastActiveFileName) {
                const savedFile = savedProject.files.find(
                  f => pathOf(f) === lastActiveFileName || f.name === lastActiveFileName
                );
                if (savedFile) {
                  setActiveFile(savedFile);
                } else {
                  setActiveFile(savedProject.files[0]);
                  localStorage.setItem('lastActiveFileName', savedProject.files[0] ? pathOf(savedProject.files[0]) : '');
                }
              } else {
                setActiveFile(savedProject.files[0]);
                localStorage.setItem('lastActiveFileName', savedProject.files[0] ? pathOf(savedProject.files[0]) : '');
              }
              
              // Update localStorage with current project
              localStorage.setItem('lastProjectId', savedProject._id);
              return; // Successfully restored, exit early
            }
          }
        }
        
        // Fallback: load first project or create new one
        if (projects.length > 0) {
          const firstProject = projects[0];
          setProject(firstProject);
          setActiveFile(firstProject.files[0]);
          
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('lastProjectId', firstProject._id);
            localStorage.setItem('lastActiveFileName', firstProject.files[0]?.name || '');
          }
        } else {
          // Create a default project if none exist
          const newProject = await projectApi.createProject("My Soroban Contract");
          
          setProject(newProject);
          setActiveFile(newProject.files[0] || null);
          
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('lastProjectId', newProject._id);
            localStorage.setItem('lastActiveFileName', newProject.files[0]?.name || '');
          }
          
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
          
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('lastProjectId', updatedProject._id);
            localStorage.setItem('lastActiveFileName', updatedProject.files[0]?.name || '');
          }
        }
      } catch (error) {
        console.error("Failed to load initial project:", error);
        toast.error("Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialProject();
  }, [isAuthenticated]);

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

  // Console helpers — append one line, or merge a batch from a job result
  // (deduped by message so socket + poll never double-print).
  const appendLog = (type: LogEntry['type'], message: string) =>
    setLogs((prev) => [...prev, { type, message, timestamp: new Date().toISOString() }]);

  const mergeLogs = (incoming?: LogEntry[]) => {
    if (!Array.isArray(incoming) || incoming.length === 0) return;
    setLogs((prev) => {
      const seen = new Set(prev.map((l) => l.message));
      const fresh = incoming.filter((l) => !seen.has(l.message));
      return fresh.length ? [...prev, ...fresh] : prev;
    });
  };

  const handleCompile = async () => {
    if (!project || !activeFile) return;

    setIsCompiling(true);
    setIsBottomPanelOpen(true);
    setDiagnostics([]);

    // Clear previous logs and start fresh
    setLogs([{
      type: "info",
      message: "Starting compilation…",
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
          message: "Waiting for compilation to complete…",
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

              // Structured compiler diagnostics -> editor gutter markers.
              if (Array.isArray(result.diagnostics)) setDiagnostics(result.diagnostics);

              if (status === 'completed') {
                setLogs(prev => [...prev, {
                  type: "success",
                  message: "Compilation complete. WASM generated.",
                  timestamp: new Date().toISOString()
                }]);
                
                if (result.wasmBase64) {
                  const wasmSize = Math.round(result.wasmBase64.length * 0.75);
                  setLogs(prev => [...prev, {
                    type: "info",
                    message: `WASM size: ~${wasmSize} bytes`,
                    timestamp: new Date().toISOString()
                  }]);
                }
                
                toast.success("Compilation complete");
              } else {
                setLogs(prev => [...prev, {
                  type: "error",
                  message: `Compilation failed: ${result.error || 'Unknown error'}`,
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
          if (!logs.some(log => log.message.includes('Compilation complete'))) {
            setLogs(prev => [...prev, {
              type: "success",
              message: "Compilation complete. WASM generated.",
              timestamp: new Date().toISOString()
            }]);
            
            if (finalResult.wasmBase64 && !logs.some(log => log.message.includes('WASM size'))) {
              const wasmSize = Math.round(finalResult.wasmBase64.length * 0.75);
              setLogs(prev => [...prev, {
                type: "info",
                message: `WASM size: ~${wasmSize} bytes`,
                timestamp: new Date().toISOString()
              }]);
            }
            
            toast.success("Compilation complete");
          }
        } else {
          if (!logs.some(log => log.message.includes('Compilation failed'))) {
            setLogs(prev => [...prev, {
              type: "error",
              message: `Compilation failed: ${finalResult.error || 'Unknown error'}`,
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
            message: "Compilation complete. WASM generated.",
            timestamp: new Date().toISOString()
          }]);
          
          if (result.wasmBase64) {
            const wasmSize = Math.round(result.wasmBase64.length * 0.75);
            setLogs(prev => [...prev, {
              type: "info",
              message: `WASM size: ~${wasmSize} bytes`,
              timestamp: new Date().toISOString()
            }]);
          }
          
          toast.success("Compilation complete");
        } else {
          setLogs(prev => [...prev, {
            type: "error",
            message: "Compilation failed",
            timestamp: new Date().toISOString()
          }]);
          toast.error("Compilation failed");
        }
      }
    } catch (error) {
      console.error("Compilation error:", error);
      setLogs(prev => [...prev, {
        type: "error",
        message: `Compilation failed: ${(error as Error).message}`,
        timestamp: new Date().toISOString()
      }]);
      toast.error("Compilation failed");
    } finally {
      setIsCompiling(false);
    }
  };

  // Run `cargo test` across the crate; stream per-file results to the console.
  const handleRunTests = async () => {
    if (!project) return;
    setIsTesting(true);
    setIsBottomPanelOpen(true);
    try {
      const projectToTest = await ensureProjectSaved(project);
      setLogs([{ type: "info", message: "Running cargo test…", timestamp: new Date().toISOString() }]);

      const start = await testApi.run(projectToTest._id, projectToTest.files);
      if (!start.jobId) {
        toast.error("Failed to start tests");
        return;
      }

      const result = await testApi.pollResult(start.jobId, (logs) => {
        setLogs((prev) => {
          const seen = new Set(prev.map((l) => l.message + l.timestamp));
          const fresh = logs.filter((l) => !seen.has(l.message + l.timestamp));
          return fresh.length ? [...prev, ...fresh] : prev;
        });
      });

      if (result.compileFailed) {
        if (Array.isArray(result.diagnostics)) setDiagnostics(result.diagnostics);
        setLogs((prev) => [...prev, { type: "error", message: "Tests failed to compile (see gutter markers).", timestamp: new Date().toISOString() }]);
        toast.error("Tests failed to compile");
      } else {
        for (const t of result.tests) {
          setLogs((prev) => [...prev, {
            type: t.passed ? "success" : "error",
            message: `${t.passed ? "✓" : "✗"} ${t.file ? `${t.file} — ` : ""}${t.name}${t.durationMs != null ? ` (${t.durationMs}ms)` : ""}`,
            timestamp: new Date().toISOString(),
          }]);
          if (!t.passed && t.output) {
            setLogs((prev) => [...prev, { type: "error", message: t.output as string, timestamp: new Date().toISOString() }]);
          }
        }
        setLogs((prev) => [...prev, {
          type: result.success ? "success" : "error",
          message: `Tests ${result.passed}/${result.total} passed${result.failed ? `, ${result.failed} failed` : ""}.`,
          timestamp: new Date().toISOString(),
        }]);
        if (result.success) toast.success(`Tests ${result.passed}/${result.total} passed`);
        else toast.error(`${result.failed} test(s) failed (${result.passed}/${result.total} passed)`);
      }
    } catch (e) {
      toast.error(`Test run failed: ${(e as Error).message}`);
    } finally {
      setIsTesting(false);
    }
  };

  // Persist the chosen workspace deploy target, then resume deployment.
  const chooseDeployTarget = async (name: string) => {
    if (!project) return;
    try {
      const updated = await projectApi.updateProject(project._id, { deployTarget: name });
      setProject(updated);
      setDeployTargetChoices(null);
      toast.success(`Deploy target set to "${name}"`);
      handleDeploy();
    } catch {
      toast.error('Failed to set deploy target');
    }
  };

  // Refresh the project after a successful deploy so the contract id + spec are
  // available immediately (the Contract Control panel can invoke right away).
  const refreshAfterDeploy = async (id: string, contractAddress: string) => {
    try {
      setProject(await projectApi.getProject(id));
    } catch {
      setProject((prev) =>
        prev ? { ...prev, contractAddress, lastDeployed: new Date().toISOString() } : prev,
      );
    }
    // Surface the freshly deployed contract's invoke form.
    setIsDockOpen(true);
    setDockTab('contract');
  };

  // Open the fee-preview dialog and resolve when the user decides.
  const confirmDeploy = (details: DeployConfirmDetails) =>
    new Promise<boolean>((resolve) => setDeployConfirm({ open: true, details, resolve }));
  const resolveDeployConfirm = (ok: boolean) => {
    deployConfirm.resolve?.(ok);
    setDeployConfirm({ open: false, details: null });
  };

  // Mainnet deploy: simulate → show fee → explicit confirm → sign. Non-custodial
  // (browser wallet, default) is a two-signature flow (upload, then create);
  // custodial is the explicit opt-in. Real XLM — never auto-deployed.
  const runMainnetDeploy = async (proj: Project, wasmBase64: string) => {
    let mode: 'connected' | 'custodial' = 'connected';
    try {
      mode = (await networkApi.getSigningMode()).mainnetSigningMode;
    } catch { /* default connected */ }

    if (mode === 'custodial') {
      // Best-effort fee preview for the custodial wallet (simulate the upload).
      let pk = '';
      let balance: number | undefined;
      let feeXlm: string | undefined;
      try {
        const w = await networkApi.wallet('mainnet');
        pk = w.publicKey;
        balance = w.balance;
        feeXlm = (await networkApi.deployPrepare({ projectId: proj._id, wasmBase64, sourcePk: pk, network: 'mainnet', step: 'upload' })).feeXlm;
      } catch { /* unfunded / preview unavailable — dialog shows "shown at submit" */ }

      const ok = await confirmDeploy({ mode: 'custodial', signer: pk, feeXlm, steps: 1, balance });
      if (!ok) {
        appendLog('info', 'Mainnet deploy cancelled.');
        return;
      }
      appendLog('info', 'Deploying to MAINNET (custodial)…');
      const r = await networkApi.deployCustodial({ projectId: proj._id, wasmBase64, network: 'mainnet', confirm: true });
      if (r.contractAddress) {
        appendLog('success', `Contract deployed · ${r.contractAddress}`);
        toast.success('Deployed to mainnet', { description: r.contractAddress });
        await refreshAfterDeploy(proj._id, r.contractAddress);
      } else {
        appendLog('error', `Deployment failed: ${r.error || 'unknown error'}`);
        toast.error(r.error || 'Mainnet deploy failed');
      }
      return;
    }

    // Non-custodial: the connected browser wallet signs both steps.
    const signer = address || (await openWalletModal());
    if (!signer) {
      appendLog('error', 'Connect a wallet to deploy on mainnet.');
      toast.error('Connect a wallet first');
      return;
    }

    appendLog('info', `Preparing mainnet upload — signer ${signer.slice(0, 6)}…${signer.slice(-4)}`);
    const up = await networkApi.deployPrepare({ projectId: proj._id, wasmBase64, sourcePk: signer, network: 'mainnet', step: 'upload' });
    let balance: number | undefined;
    // Balance of the CONNECTED signer (it pays the fees), not the custodial wallet.
    try { balance = (await networkApi.balance('mainnet', signer)).balance; } catch { /* preview only */ }

    const ok = await confirmDeploy({ mode: 'connected', signer, feeXlm: up.feeXlm, steps: 2, balance });
    if (!ok) {
      appendLog('info', 'Mainnet deploy cancelled.');
      return;
    }

    appendLog('info', `Sign step 1 of 2 in your wallet (upload, fee ≈ ${up.feeXlm} XLM)…`);
    const signedUpload = await signTransaction(up.xdr, up.passphrase);
    const upRes = await networkApi.deploySubmit({ network: 'mainnet', step: 'upload', signedXdr: signedUpload });
    appendLog('success', `Wasm uploaded · tx ${upRes.txHash}`);

    appendLog('info', 'Preparing contract creation…');
    const cr = await networkApi.deployPrepare({
      projectId: proj._id, wasmBase64, sourcePk: signer, network: 'mainnet', step: 'create',
      wasmHashHex: upRes.wasmHashHex || up.wasmHashHex,
    });
    appendLog('info', `Sign step 2 of 2 in your wallet (create, fee ≈ ${cr.feeXlm} XLM)…`);
    const signedCreate = await signTransaction(cr.xdr, cr.passphrase);
    const crRes = await networkApi.deploySubmit({
      projectId: proj._id, network: 'mainnet', step: 'create', signedXdr: signedCreate, sourcePk: signer, wasmBase64,
    });
    if (crRes.contractAddress) {
      appendLog('success', `Contract deployed · ${crRes.contractAddress}`);
      toast.success('Deployed to mainnet', { description: crRes.contractAddress });
      await refreshAfterDeploy(proj._id, crRes.contractAddress);
    } else {
      appendLog('error', 'Deployed, but could not read the contract id — check the explorer.');
    }
  };

  const handleDeploy = async () => {
    if (!project) return;

    setIsDeploying(true);
    setIsBottomPanelOpen(true);

    try {
      if (usage && typeof usage.deployments?.remaining === 'number' && usage.deployments.remaining <= 0) {
        toast.error('Deployment limit reached. Please upgrade your plan.');
        setIsSubscriptionModalOpen(true);
        return;
      }

      // Persist edits, then ensure the project exists server-side.
      await flushSave();
      const projectToDeploy = await ensureProjectSaved(project);

      // Workspace with >1 deployable contract: pick the crate before building
      // (the wasm is target-specific). build-info is best-effort.
      try {
        const info = await projectApi.getBuildInfo(projectToDeploy._id);
        if (info.requiresTargetSelection) {
          setDeployTargetChoices(info.deployableCrates);
          return;
        }
      } catch { /* fall through to a normal deploy */ }

      // 1. Compile to wasm.
      setLogs([{ type: 'info', message: 'Compiling contract…', timestamp: new Date().toISOString() }]);
      const started = await compileApi.compile(projectToDeploy._id, projectToDeploy.files);
      mergeLogs(started.logs);
      const compiled = started.jobId
        ? await compileApi.pollJobResult(started.jobId, (p) => mergeLogs(p.logs))
        : started;
      mergeLogs(compiled.logs);

      if (!compiled.success || !compiled.wasmBase64) {
        appendLog('error', `Compilation failed: ${compiled.error || 'unknown error'}`);
        toast.error('Compilation failed — cannot deploy');
        return;
      }
      appendLog('success', 'Compiled. WASM ready.');

      // MAINNET takes the confirmation-gated, fee-previewed path (non-custodial
      // browser signing by default, or the custodial opt-in).
      if (network === 'mainnet') {
        await runMainnetDeploy(projectToDeploy, compiled.wasmBase64);
        return;
      }

      // 2. Deploy (single source of truth: poll the job; it streams logs + the
      // final result, so no parallel socket handler is needed).
      appendLog('info', 'Deploying to Stellar testnet…');
      const startedDeploy = await deployApi.deploy(projectToDeploy._id, compiled.wasmBase64, 'testnet');
      mergeLogs(startedDeploy.logs);
      const deployed = startedDeploy.jobId
        ? await deployApi.pollDeployJobResult(startedDeploy.jobId, (p) => mergeLogs(p.logs))
        : startedDeploy;
      mergeLogs(deployed.logs);

      if (deployed.success && deployed.contractAddress) {
        appendLog('success', `Contract deployed · ${deployed.contractAddress}`);
        toast.success('Deployment successful', { description: deployed.contractAddress });
        await refreshAfterDeploy(projectToDeploy._id, deployed.contractAddress);
      } else {
        appendLog('error', `Deployment failed: ${deployed.error || 'unknown error'}`);
        toast.error(deployed.error || 'Deployment failed');
      }
    } catch (error: any) {
      if (error?.message === 'DEPLOYMENT_LIMIT_REACHED' || error?.message?.includes('limit')) {
        toast.error('Deployment limit reached. Please upgrade your plan.');
        setIsSubscriptionModalOpen(true);
      } else {
        appendLog('error', `Deployment failed: ${error?.message || 'unknown error'}`);
        toast.error('Deployment failed');
      }
    } finally {
      setIsDeploying(false);
      if (isAuthenticated) loadUsage();
    }
  };

  // Persist a project's files to the DB. Local-only projects (not yet created
  // server-side) are saved on first compile/deploy via ensureProjectSaved.
  const persistFiles = async (proj: Project, files: ProjectFile[]) => {
    if (proj._id.startsWith('local-')) return;
    try {
      setSaveStatus('saving');
      await projectApi.updateProject(proj._id, { files });
      setSaveStatus('saved');
    } catch (error) {
      console.error('Autosave failed:', error);
      setSaveStatus('error');
    }
  };

  // Debounce an autosave; the latest pending save is also flushed on project
  // switch and unmount so nothing is lost.
  const scheduleSave = (proj: Project, files: ProjectFile[]) => {
    pendingSaveRef.current = () => persistFiles(proj, files);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const run = pendingSaveRef.current;
      pendingSaveRef.current = null;
      saveTimerRef.current = null;
      run?.();
    }, 900);
  };

  const flushSave = async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    const run = pendingSaveRef.current;
    pendingSaveRef.current = null;
    if (run) await run();
  };

  // Flush any pending autosave when the component unmounts.
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      pendingSaveRef.current?.();
    };
  }, []);

  const handleFileSelect = (file: ProjectFile) => {
    setActiveFile(file);

    // Save active file to localStorage for persistence
    if (typeof window !== 'undefined' && project) {
      localStorage.setItem('lastActiveFileName', pathOf(file));
      localStorage.setItem('lastProjectId', project._id);
    }
  };

  const handleFileContentChange = async (content: string) => {
    if (!project || !activeFile) return;

    const updatedFile = { ...activeFile, content };
    setActiveFile(updatedFile);

    // Update the file in the project (match by tree path, not leaf name).
    const activePath = pathOf(activeFile);
    const updatedFiles = project.files.map((f) =>
      pathOf(f) === activePath ? updatedFile : f
    );

    const updatedProject = { ...project, files: updatedFiles };
    setProject(updatedProject);

    // Autosave to the DB after the user pauses typing.
    scheduleSave(updatedProject, updatedFiles);
  };

  const handleProjectSelect = async (selectedProject: Project) => {
    // Persist any pending edits to the project we're leaving before switching.
    await flushSave();
    setSaveStatus('idle');
    setProject(selectedProject);
    setActiveFile(selectedProject.files[0]);

    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastProjectId', selectedProject._id);
      localStorage.setItem('lastActiveFileName', selectedProject.files[0] ? pathOf(selectedProject.files[0]) : '');
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleProjectCreate = (newProject: Project) => {
    setProject(newProject);
    setActiveFile(newProject.files[0]);
    
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastProjectId', newProject._id);
      localStorage.setItem('lastActiveFileName', newProject.files[0]?.name || '');
    }
  };

  const handleTemplateSelect = async (_template: Template) => {
    // Template selection is now handled by ProjectSelector with name modal
    // This function is kept for backward compatibility but project creation
    // happens in ProjectSelector after user enters the project name
  };

  const handleDeleteFile = async (filePath: string) => {
    if (!project) return;

    try {
      const updatedFiles = project.files.filter(file => pathOf(file) !== filePath);
      const updatedProject = await projectApi.updateProject(project._id, { files: updatedFiles });
      setProject(updatedProject);

      // If the deleted file was active, switch to the first remaining file
      if (activeFile && pathOf(activeFile) === filePath) {
        const newActiveFile = updatedProject.files[0];
        setActiveFile(newActiveFile);
        if (typeof window !== 'undefined' && newActiveFile) {
          localStorage.setItem('lastActiveFileName', pathOf(newActiveFile));
          localStorage.setItem('lastProjectId', updatedProject._id);
        }
      } else if (typeof window !== 'undefined') {
        localStorage.setItem('lastProjectId', updatedProject._id);
      }

      toast.success(`Deleted "${filePath}"`);
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast.error("Failed to delete file");
    }
  };

  // Rename / move a file to a new tree path (updates content's owner, persists).
  const handleRenameFile = async (oldPath: string, newPath: string) => {
    if (!project) return;
    if (oldPath === newPath) return;
    if (project.files.some((f) => pathOf(f) === newPath)) {
      toast.error("A file at this path already exists");
      return;
    }
    try {
      const updatedFiles = project.files.map((f) =>
        pathOf(f) === oldPath ? { ...f, path: newPath, name: baseName(newPath) } : f
      );
      const updatedProject = await projectApi.updateProject(project._id, { files: updatedFiles });
      setProject(updatedProject);
      const moved = updatedProject.files.find((f) => pathOf(f) === newPath) || null;
      if (activeFile && pathOf(activeFile) === oldPath && moved) {
        setActiveFile(moved);
        if (typeof window !== 'undefined') localStorage.setItem('lastActiveFileName', newPath);
      }
      toast.success(`Renamed to "${newPath}"`);
    } catch (error) {
      console.error("Failed to rename file:", error);
      toast.error("Failed to rename file");
    }
  };

  const handleProjectNameChange = async (name: string) => {
    if (!project) return;
    const updatedProject = { ...project, name };
    setProject(updatedProject);
    // Persist the rename (debounced) so it survives refresh.
    if (!project._id.startsWith('local-')) {
      pendingSaveRef.current = async () => {
        try {
          setSaveStatus('saving');
          await projectApi.updateProject(updatedProject._id, { name });
          setSaveStatus('saved');
        } catch (error) {
          console.error('Failed to save project name:', error);
          setSaveStatus('error');
        }
      };
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const run = pendingSaveRef.current;
        pendingSaveRef.current = null;
        saveTimerRef.current = null;
        run?.();
      }, 900);
    }
  };

  const handleNewFile = async (inputPath?: string) => {
    if (!project) return;

    const timestamp = Date.now();
    const raw = (inputPath || `src/contract_${timestamp}.rs`).trim();
    // Add .rs only when the leaf has no extension; intermediate folders in the
    // path are created implicitly by the build context.
    const leaf = raw.split('/').pop() || raw;
    const finalName = leaf.includes('.') ? raw : `${raw}.rs`;

    // Check if it's a test file
    const isTestFile = /test|spec/.test(finalName);

    // Check for duplicate paths
    if (project.files.some((f) => pathOf(f) === finalName)) {
      toast.error('A file at this path already exists');
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
      path: finalName,
      name: baseName(finalName),
      content: defaultContent,
      type: 'rust'
    };

    const updatedFiles = [...project.files, newFile];
    const updatedProject = { ...project, files: updatedFiles };
    setProject(updatedProject);
    setActiveFile(newFile);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastProjectId', updatedProject._id);
      localStorage.setItem('lastActiveFileName', pathOf(newFile));
    }

    // Persist immediately so the new file survives refresh.
    if (!project._id.startsWith('local-')) {
      try {
        setSaveStatus('saving');
        const saved = await projectApi.updateProject(project._id, { files: updatedFiles });
        setProject(saved);
        const savedActive = saved.files.find((f) => pathOf(f) === pathOf(newFile));
        if (savedActive) setActiveFile(savedActive);
        setSaveStatus('saved');
      } catch (error) {
        console.error('Failed to save new file:', error);
        setSaveStatus('error');
        toast.error('Failed to save new file');
      }
    }
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

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="relative grid h-screen place-items-center overflow-hidden bg-background px-6">
        <div className="pointer-events-none absolute inset-0 bg-radial-fade" aria-hidden />
        <div className="pointer-events-none absolute inset-0 grain" aria-hidden />
        <div className="relative max-w-md text-center">
          <LoginModal open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
          <img src="/websoroban_logo.png" alt="" className="mx-auto mb-6 h-14 w-14 object-contain" aria-hidden />
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Sign in to <span className="text-gradient-brand">WebSoroban</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Authentication is required to open the IDE.
          </p>
          <Button className="mt-6" onClick={() => setIsLoginModalOpen(true)}>
            Sign in to continue
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <IDESkeleton />;
  }

  if (!project || !activeFile) {
    return (
      <div className="grid h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">No project loaded</p>
      </div>
    );
  }

  const editorLanguage = activeFile.name.endsWith('.rs')
    ? 'Rust'
    : activeFile.name.endsWith('.toml')
    ? 'TOML'
    : activeFile.name.endsWith('.json')
    ? 'JSON'
    : 'Plain Text'

  const paletteCommands: PaletteCommand[] = [
    { id: 'compile', group: 'Actions', label: 'Compile project', hint: '⌘B', icon: Hammer, disabled: isCompiling, perform: () => handleCompile() },
    { id: 'deploy', group: 'Actions', label: 'Deploy to testnet', icon: Rocket, disabled: isDeploying, perform: () => handleDeploy() },
    { id: 'test', group: 'Actions', label: 'Run tests', icon: FlaskConical, disabled: isTesting, perform: () => handleRunTests() },
    { id: 'new-file', group: 'Actions', label: 'New file', icon: FilePlus2, perform: () => handleNewFile() },
    { id: 'save', group: 'Actions', label: 'Save project', hint: '⌘S', icon: Save, perform: () => handleSaveProject() },
    { id: 'logs', group: 'Actions', label: 'Toggle console', icon: Terminal, perform: () => setIsBottomPanelOpen((v) => !v) },
    ...project.files.map((f) => ({
      id: `file-${pathOf(f)}`,
      group: 'Files',
      label: pathOf(f),
      icon: FileCode2,
      keywords: ['open', pathOf(f), f.name],
      perform: () => handleFileSelect(f),
    })),
    { id: 'nav-templates', group: 'Go to', label: 'Templates', icon: Store, perform: () => router.push('/marketplace') },
    { id: 'nav-home', group: 'Go to', label: 'Home', icon: Home, perform: () => router.push('/') },
  ]

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background">
      {/* Ambient deep-space backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-fade" aria-hidden />
      <CommandPalette open={isCommandOpen} onOpenChange={setIsCommandOpen} commands={paletteCommands} />
      <Navbar
        user={user}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onSubscriptionClick={() => setIsSubscriptionModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandOpen(true)}
        projectSelector={
          <ProjectSelector
            currentProject={project}
            onProjectSelect={handleProjectSelect}
            onProjectCreate={handleProjectCreate}
            onTemplateSelect={handleTemplateSelect}
          />
        }
      />
      
      {/* Modals */}
      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
      />
      <SubscriptionModal
        open={isSubscriptionModalOpen}
        onOpenChange={(open) => {
          setIsSubscriptionModalOpen(open)
          if (!open) {
            loadUsage()
            refreshUser()
          }
        }}
      />
      {/* Mainnet deploy confirmation with fee preview */}
      <MainnetDeployDialog open={deployConfirm.open} details={deployConfirm.details} onResolve={resolveDeployConfirm} />

      {/* Workspace deploy-target picker (multiple deployable contracts) */}
      <Dialog open={deployTargetChoices !== null} onOpenChange={(o) => !o && setDeployTargetChoices(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Choose a contract to deploy</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This workspace has multiple deployable contracts. Pick which crate to deploy — it&apos;s saved as the
            project&apos;s deploy target and used for future deploys (you can change it later).
          </p>
          <div className="mt-2 space-y-2">
            {(deployTargetChoices || []).map((c) => (
              <button
                key={c.name}
                onClick={() => chooseDeployTarget(c.name)}
                className="flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2.5 text-left transition-colors hover:border-brand/50 hover:bg-accent"
              >
                <span className="font-mono text-sm text-foreground">{c.name}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{c.dir || '(root)'}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1">
          <div className="min-h-0 min-w-0 flex-1">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={isBottomPanelOpen ? 70 : 100}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={20} minSize={14} maxSize={32}>
                  <Sidebar
                    project={project}
                    activeFile={activeFile}
                    onFileSelect={handleFileSelect}
                    onProjectNameChange={handleProjectNameChange}
                    onNewFile={handleNewFile}
                    onRenameFile={handleRenameFile}
                    onSaveProject={handleSaveProject}
                    onDeleteFile={handleDeleteFile}
                  />
                </ResizablePanel>

                <ResizableHandle />

                {/* Editor — the hero */}
                <ResizablePanel defaultSize={80} minSize={30} className="min-w-0">
                  <EditorPanel
                    activeFile={activeFile}
                    files={project.files}
                    onFileSelect={handleFileSelect}
                    onFileContentChange={handleFileContentChange}
                    onCompile={handleCompile}
                    onDeploy={handleDeploy}
                    onTest={handleRunTests}
                    isCompiling={isCompiling}
                    isDeploying={isDeploying}
                    isTesting={isTesting}
                    onCursorChange={setCursor}
                    diagnostics={diagnostics}
                  />
                </ResizablePanel>

              </ResizablePanelGroup>
            </ResizablePanel>

            {isBottomPanelOpen && (
              <>
                <ResizableHandle />
                <ResizablePanel defaultSize={30} minSize={15}>
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

          {isDockOpen && (
            <div className="hidden w-[400px] shrink-0 lg:block xl:w-[460px]">
              <RightDock
                tab={dockTab}
                onTabChange={setDockTab}
                onClose={() => setIsDockOpen(false)}
                project={project}
                activeFile={activeFile}
                diagnostics={diagnostics}
                ensureProjectSaved={ensureProjectSaved}
                onApplied={handleCopilotApplied}
                onDeploy={handleDeploy}
                focusSignal={copilotFocus}
                walletAddress={address || user?.walletAddress}
              />
            </div>
          )}
        </div>

        {!isDockOpen && (
          <button
            onClick={() => {
              setIsDockOpen(true)
              setDockTab('copilot')
              setCopilotFocus((n) => n + 1)
            }}
            className="fixed bottom-10 right-5 z-40 flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground shadow-lg transition hover:border-brand/60 hover:bg-accent"
          >
            <Sparkles className="h-4 w-4 text-brand" /> Copilot
            <span className="rounded bg-muted px-1 font-mono text-[9px] text-muted-foreground">⌘I</span>
          </button>
        )}

        {/* Single full-width status bar */}
        <StatusBar
          language={editorLanguage}
          cursor={cursor}
          charCount={(activeFile.content || '').length}
          lineCount={(activeFile.content || '').split('\n').length}
          errors={logs.filter((l) => l.type === 'error').length}
          warnings={logs.filter((l) => l.type === 'warning').length}
          saveStatus={saveStatus}
          network={getNetwork(network).label}
          isMainnet={network === 'mainnet'}
          consoleOpen={isBottomPanelOpen}
          onToggleConsole={() => setIsBottomPanelOpen((v) => !v)}
          rightPanelOpen={isDockOpen}
          onToggleRightPanel={() => setIsDockOpen((v) => !v)}
        />
      </div>
    </div>
  );
}

export default function IDEPage() {
  return (
    <Suspense fallback={<IDEPageFallback />}>
      <IDEPageContent />
    </Suspense>
  )
} 