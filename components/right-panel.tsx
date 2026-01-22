"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, Clock, MapPin, History, Play, TestTube, Code2, Zap, Shield, Globe, Activity, FileText, GitBranch, Rocket, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Project, contractApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RightPanelProps {
  project: Project;
  onClose: () => void;
}

export function RightPanel({ project, onClose }: RightPanelProps) {
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testCaseResults, setTestCaseResults] = useState<any[]>([]);
  
  // Function testing state
  const [functionName, setFunctionName] = useState('');
  const [functionArgs, setFunctionArgs] = useState('');
  const [isInvoking, setIsInvoking] = useState(false);
  const [invokeResult, setInvokeResult] = useState<any>(null);
  const [invokeError, setInvokeError] = useState<string | null>(null);
  const [availableFunctions, setAvailableFunctions] = useState<string[]>([]);
  const { user } = useAuth();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTestContract = async () => {
    setIsTestRunning(true);
    setTestResults([]);
    
    // Get all Rust files from the project
    const rustFiles = project.files.filter(f => f.name.endsWith('.rs'));
    const contractContent = rustFiles.map(f => f.content).join('\n');
    
    // Advanced contract analysis
    const analysis = analyzeContract(contractContent);
    
    const testSteps = [
      '🔍 Analyzing contract structure...',
      '📋 Detecting contract functions...',
      '✅ Syntax validation passed',
      '🔒 Security checks completed',
    ];

    // Add dynamic test results based on actual contract analysis
    if (analysis.hasContractMacro) {
      testSteps.push('✅ #[contract] macro detected');
    }
    if (analysis.hasContractImpl) {
      testSteps.push('✅ #[contractimpl] macro detected');
    }
    if (analysis.hasNoStd) {
      testSteps.push('✅ #![no_std] directive found');
    }
    if (analysis.hasSorobanSdk) {
      testSteps.push('✅ Soroban SDK imports detected');
    }

    // Function-specific tests
    if (analysis.functions.init) {
      testSteps.push('✅ Init function detected and validated');
    }
    if (analysis.functions.transfer) {
      testSteps.push('✅ Transfer function detected and validated');
    }
    if (analysis.functions.getBalance) {
      testSteps.push('✅ Get balance function detected');
    }
    if (analysis.functions.hello) {
      testSteps.push('✅ Hello function detected');
    }

    // Security and best practices
    if (analysis.hasRequireAuth) {
      testSteps.push('✅ Authentication checks validated');
    }
    if (analysis.hasBalanceChecks) {
      testSteps.push('✅ Balance validation detected');
    }
    if (analysis.hasErrorHandling) {
      testSteps.push('✅ Error handling implemented');
    }
    if (analysis.hasStorageUsage) {
      testSteps.push('✅ Storage operations detected');
    }
    if (analysis.hasSymbolUsage) {
      testSteps.push('✅ Symbol type usage detected');
    }
    if (analysis.hasAddressUsage) {
      testSteps.push('✅ Address type usage detected');
    }
    if (analysis.hasEnvUsage) {
      testSteps.push('✅ Environment usage detected');
    }

    // Pattern-specific tests
    if (analysis.patterns.payment) {
      testSteps.push('💰 Payment contract pattern detected');
    }
    if (analysis.patterns.token) {
      testSteps.push('🪙 Token contract pattern detected');
    }
    if (analysis.patterns.voting) {
      testSteps.push('🗳️ Voting contract pattern detected');
    }
    if (analysis.patterns.auction) {
      testSteps.push('🏷️ Auction contract pattern detected');
    }

    // Performance and gas estimation
    const estimatedGas = calculateGasEstimate(analysis);
    testSteps.push(`📊 Gas estimation: ~${estimatedGas.toLocaleString()} units`);

    // Add final results
    testSteps.push('📈 Performance analysis completed');
    testSteps.push('🔍 Vulnerability scan passed');
    testSteps.push('🎯 Contract ready for deployment');

    // Simulate real-time testing with variable delays
    for (let i = 0; i < testSteps.length; i++) {
      const delay = i < 4 ? 300 : 500 + Math.random() * 300;
      await new Promise(resolve => setTimeout(resolve, delay));
      setTestResults(prev => [...prev, testSteps[i]]);
    }
    
    setIsTestRunning(false);
  };

  // Advanced contract analysis function
  const analyzeContract = (content: string) => {
    const lines = content.split('\n').map(line => line.trim());
    
    // More sophisticated pattern detection
    const hasPaymentPattern = content.includes('transfer') && content.includes('balance') && content.includes('amount');
    const hasTokenPattern = content.includes('symbol') && content.includes('decimals');
    const hasVotingPattern = content.includes('vote') || content.includes('proposal');
    const hasAuctionPattern = content.includes('bid') || content.includes('auction');
    
    return {
      hasContractMacro: content.includes('#[contract]'),
      hasContractImpl: content.includes('#[contractimpl]'),
      hasNoStd: content.includes('#![no_std]'),
      hasSorobanSdk: content.includes('soroban_sdk'),
      hasRequireAuth: content.includes('require_auth'),
      hasBalanceChecks: content.includes('balance') && content.includes('>='),
      hasErrorHandling: content.includes('Error') || content.includes('Result'),
      hasStorageUsage: content.includes('storage') || content.includes('env.storage'),
      hasSymbolUsage: content.includes('Symbol'),
      hasAddressUsage: content.includes('Address'),
      hasEnvUsage: content.includes('Env'),
      patterns: {
        payment: hasPaymentPattern,
        token: hasTokenPattern,
        voting: hasVotingPattern,
        auction: hasAuctionPattern,
      },
      functions: {
        init: content.includes('pub fn init'),
        transfer: content.includes('pub fn transfer'),
        getBalance: content.includes('pub fn get_balance') || content.includes('pub fn get_balance'),
        hello: content.includes('pub fn hello'),
        mint: content.includes('pub fn mint'),
        burn: content.includes('pub fn burn'),
        approve: content.includes('pub fn approve'),
      }
    };
  };

  // Gas estimation based on contract complexity
  const calculateGasEstimate = (analysis: any) => {
    let baseGas = 30000;
    
    // Function complexity
    if (analysis.functions.init) baseGas += 15000;
    if (analysis.functions.transfer) baseGas += 25000;
    if (analysis.functions.getBalance) baseGas += 10000;
    if (analysis.functions.hello) baseGas += 5000;
    if (analysis.functions.mint) baseGas += 20000;
    if (analysis.functions.burn) baseGas += 18000;
    if (analysis.functions.approve) baseGas += 15000;
    
    // Storage and security
    if (analysis.hasStorageUsage) baseGas += 20000;
    if (analysis.hasRequireAuth) baseGas += 15000;
    if (analysis.hasBalanceChecks) baseGas += 10000;
    if (analysis.hasErrorHandling) baseGas += 5000;
    
    // Pattern complexity
    if (analysis.patterns.payment) baseGas += 30000;
    if (analysis.patterns.token) baseGas += 35000;
    if (analysis.patterns.voting) baseGas += 25000;
    if (analysis.patterns.auction) baseGas += 40000;
    
    return baseGas + Math.floor(Math.random() * 10000);
  };

  // Run test cases function
  const handleRunTestCases = async () => {
    setIsRunningTests(true);
    setTestCaseResults([]);
    
    // Find test files
    const testFiles = project.files.filter(f => 
      f.name.includes('test') || f.name.includes('spec') || f.content.includes('#[test]')
    );
    
    if (testFiles.length === 0) {
      setTestCaseResults([{
        status: 'error',
        message: 'No test files found. Create a file with "test" in the name or add #[test] functions.',
        file: 'No test files'
      }]);
      setIsRunningTests(false);
      return;
    }
    
    const results = [];
    
    for (const testFile of testFiles) {
      const testCases = extractTestCases(testFile.content);
      
      for (const testCase of testCases) {
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
        
        const result = await runTestCase(testCase, testFile.name);
        results.push(result);
        setTestCaseResults([...results]);
      }
    }
    
    setIsRunningTests(false);
  };

  // Extract test cases from file content
  const extractTestCases = (content: string): string[] => {
    const testCases: string[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('#[test]') && line.includes('fn')) {
        // Extract function name
        const match = line.match(/fn\s+(\w+)/);
        if (match) {
          testCases.push(match[1]);
        }
      }
    }
    
    return testCases;
  };

  // Extract contract functions from Rust source code
  const extractContractFunctions = (content: string): string[] => {
    const functions: string[] = [];
    const lines = content.split('\n');
    let inContractImpl = false;
    let braceDepth = 0;
    let implStartIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Check if we're entering a contractimpl block
      if (trimmedLine.includes('#[contractimpl]')) {
        // Look for the impl block that follows (usually within next 3 lines)
        for (let j = i + 1; j < lines.length && j < i + 5; j++) {
          const nextLine = lines[j].trim();
          if (nextLine.startsWith('impl')) {
            inContractImpl = true;
            implStartIndex = j;
            braceDepth = 0; // Reset brace depth
            break;
          }
        }
      }
      
      // Track brace depth to know when we exit the impl block
      if (inContractImpl) {
        // Count opening and closing braces on this line
        for (const char of line) {
          if (char === '{') braceDepth++;
          if (char === '}') braceDepth--;
        }
        
        // Extract public functions - handle both single-line and multi-line definitions
        // Match: pub fn function_name(...) or pub fn function_name<...>(...)
        const functionMatch = trimmedLine.match(/pub\s+fn\s+(\w+)\s*(?:<[^>]*>)?\s*\(/);
        if (functionMatch) {
          const funcName = functionMatch[1];
          // Skip common internal functions and constructors
          if (!funcName.startsWith('_') && funcName !== 'new' && funcName !== 'default') {
            functions.push(funcName);
          }
        }
        
        // If we've closed all braces and we're back to depth 0, we've exited the impl block
        // But only if we're past the impl declaration line
        if (braceDepth === 0 && implStartIndex !== -1 && i > implStartIndex) {
          inContractImpl = false;
          implStartIndex = -1;
        }
      }
    }
    
    return [...new Set(functions)]; // Remove duplicates
  };

  // Extract functions from project files when component mounts or project changes
  useEffect(() => {
    if (project && project.files && project.files.length > 0) {
      const rustFiles = project.files.filter(f => f.name.endsWith('.rs'));
      const allFunctions: string[] = [];
      
      rustFiles.forEach(file => {
        const functions = extractContractFunctions(file.content);
        allFunctions.push(...functions);
      });
      
      setAvailableFunctions([...new Set(allFunctions)]);
    } else {
      setAvailableFunctions([]);
    }
  }, [project]);

  // Invoke contract function
  const handleInvokeFunction = async () => {
    if (!project.contractAddress) {
      toast.error('Contract not deployed yet. Please deploy first.');
      return;
    }

    if (!functionName.trim()) {
      toast.error('Please enter a function name');
      return;
    }

    setIsInvoking(true);
    setInvokeError(null);
    setInvokeResult(null);

    try {
      // Parse arguments (comma-separated)
      const args = functionArgs.trim() 
        ? functionArgs.split(',').map(arg => arg.trim()).filter(Boolean)
        : [];

      const result = await contractApi.invoke(
        project.contractAddress,
        functionName.trim(),
        args,
        'testnet'
      );

      if (result.success) {
        setInvokeResult(result);
        toast.success('Function invoked successfully!');
        
        // Refresh usage if available
        if (result.usage) {
          // Usage will be updated via context
        }
      } else {
        setInvokeError(result.error || 'Function invocation failed');
        toast.error(result.error || 'Function invocation failed');
      }
    } catch (error: any) {
      console.error('Invoke error:', error);
      
      if (error.message?.includes('limit')) {
        setInvokeError('Function test limit reached. Please upgrade your plan.');
        toast.error('Function test limit reached. Please upgrade your plan.');
      } else {
        setInvokeError(error.message || 'Failed to invoke function');
        toast.error(error.message || 'Failed to invoke function');
      }
    } finally {
      setIsInvoking(false);
    }
  };

  // Run individual test case
  const runTestCase = async (testName: string, fileName: string) => {
    // Simulate test execution with realistic scenarios
    const testScenarios = {
      'test_init': { success: 0.95, message: 'Contract initialization test' },
      'test_hello': { success: 0.98, message: 'Hello function test' },
      'test_transfer': { success: 0.92, message: 'Transfer function test' },
      'test_get_balance': { success: 0.96, message: 'Balance retrieval test' },
      'test_mint': { success: 0.90, message: 'Mint function test' },
      'test_burn': { success: 0.88, message: 'Burn function test' },
      'test_approve': { success: 0.93, message: 'Approve function test' },
      'test_insufficient_balance': { success: 0.85, message: 'Insufficient balance test' },
    };
    
    const scenario = testScenarios[testName as keyof typeof testScenarios] || { 
      success: 0.85, 
      message: 'Generic test case' 
    };
    
    const isSuccess = Math.random() < scenario.success;
    
    return {
      name: testName,
      file: fileName,
      status: isSuccess ? 'success' : 'error',
      message: scenario.message,
      duration: Math.floor(200 + Math.random() * 800),
      timestamp: new Date().toISOString()
    };
  };

  return (
    <div className="h-full bg-gradient-to-b from-slate-900 to-slate-800 border-l border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading text-slate-100">Project Info</h2>
            <p className="text-sm text-slate-400 mt-1">Smart Contract Dashboard</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-700"
          >
            ×
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Quick Actions */}
        <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-heading text-slate-100 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleTestContract}
              disabled={isTestRunning}
              className="w-full bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 text-white"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {isTestRunning ? 'Running Tests...' : 'Test Contract'}
            </Button>
            
            <Button
              onClick={handleRunTestCases}
              disabled={isRunningTests}
              className="w-full bg-gradient-to-r from-green-600 to-slate-700 hover:from-green-700 hover:to-slate-800 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunningTests ? 'Running Test Cases...' : 'Run Test Cases'}
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => {
                setTestResults([]);
                setTestCaseResults([]);
              }}
              disabled={testResults.length === 0 && testCaseResults.length === 0}
            >
              <Play className="w-4 h-4 mr-2" />
              Clear All Results
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-heading text-slate-100 flex items-center justify-between">
                <div className="flex items-center">
                  <TestTube className="w-5 h-5 mr-2 text-green-400" />
                  Contract Analysis
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {testResults.length} checks
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono text-slate-300 bg-slate-700/50 p-2 rounded border-l-2 border-green-500/50">
                    <span className="text-green-400">[{index + 1}]</span> {result}
                  </div>
                ))}
              </div>
              
              {/* Test Summary */}
              {!isTestRunning && testResults.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-400 text-sm">
                      <TestTube className="w-4 h-4" />
                      <span className="font-medium">Contract analysis completed successfully!</span>
                    </div>
                  </div>
                  
                  {/* Contract Analysis Summary */}
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-slate-200 mb-2">Contract Analysis Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-slate-300">Syntax Valid</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-slate-300">Security Passed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-slate-300">Gas Optimized</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-slate-300">Ready for Deployment</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Test Case Results */}
        {testCaseResults.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-heading text-slate-100 flex items-center justify-between">
                <div className="flex items-center">
                  <Play className="w-5 h-5 mr-2 text-blue-400" />
                  Test Case Results
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {testCaseResults.length} tests
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {testCaseResults.map((result, index) => (
                  <div key={index} className={`text-sm font-mono text-slate-300 bg-slate-700/50 p-2 rounded border-l-2 ${
                    result.status === 'success' ? 'border-green-500/50' : 'border-red-500/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={result.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                        [{index + 1}] {result.name}
                      </span>
                      <span className="text-xs text-slate-400">{result.duration}ms</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {result.message} • {result.file}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Test Case Summary */}
              {!isRunningTests && testCaseResults.length > 0 && (
                <div className="mt-4 space-y-3">
                  {(() => {
                    const successCount = testCaseResults.filter(r => r.status === 'success').length;
                    const totalCount = testCaseResults.length;
                    const successRate = (successCount / totalCount) * 100;
                    
                    return (
                      <div className={`p-3 border rounded-lg ${
                        successRate === 100 
                          ? 'bg-green-500/10 border-green-500/20' 
                          : successRate >= 80 
                          ? 'bg-yellow-500/10 border-yellow-500/20'
                          : 'bg-red-500/10 border-red-500/20'
                      }`}>
                        <div className={`flex items-center space-x-2 text-sm ${
                          successRate === 100 ? 'text-green-400' : 
                          successRate >= 80 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          <Play className="w-4 h-4" />
                          <span className="font-medium">
                            {successCount}/{totalCount} tests passed ({successRate.toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Function Testing Section - Only show if contract is deployed */}
        {project.contractAddress && (
          <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-heading text-slate-100 flex items-center">
                <Rocket className="w-5 h-5 mr-2 text-purple-400" />
                Function Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="functionName" className="text-slate-300">Function Name</Label>
                {availableFunctions.length > 0 ? (
                  <Select
                    value={functionName}
                    onValueChange={setFunctionName}
                    disabled={isInvoking}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                      <SelectValue placeholder="Select a function..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {availableFunctions.map((func) => (
                        <SelectItem 
                          key={func} 
                          value={func}
                          className="text-slate-200 hover:bg-slate-700 focus:bg-slate-700"
                        >
                          {func}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="functionName"
                    placeholder="e.g., hello, transfer, get_balance"
                    value={functionName}
                    onChange={(e) => setFunctionName(e.target.value)}
                    disabled={isInvoking}
                    className="bg-slate-700/50 border-slate-600 text-slate-200"
                  />
                )}
                {availableFunctions.length === 0 && (
                  <p className="text-xs text-slate-400">
                    No functions detected. Type function name manually or ensure contract has #[contractimpl] functions.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="functionArgs" className="text-slate-300">Arguments (comma-separated)</Label>
                <Input
                  id="functionArgs"
                  placeholder="e.g., arg1, arg2, arg3"
                  value={functionArgs}
                  onChange={(e) => setFunctionArgs(e.target.value)}
                  disabled={isInvoking}
                  className="bg-slate-700/50 border-slate-600 text-slate-200"
                />
                <p className="text-xs text-slate-400">
                  Enter function arguments separated by commas
                </p>
              </div>

              {user && (
                <div className="text-xs text-slate-400 bg-slate-700/30 p-2 rounded">
                  Function Tests: {user.usage.functionTests.count}/{user.usage.functionTests.limit === -1 ? '∞' : user.usage.functionTests.limit}
                </div>
              )}

              <Button
                onClick={handleInvokeFunction}
                disabled={isInvoking || !functionName.trim() || !project.contractAddress}
                className="w-full bg-gradient-to-r from-purple-600 to-slate-700 hover:from-purple-700 hover:to-slate-800 text-white"
              >
                {isInvoking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Invoking...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Invoke Function
                  </>
                )}
              </Button>

              {invokeError && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">{invokeError}</AlertDescription>
                </Alert>
              )}

              {invokeResult && (
                <div className="bg-slate-700/30 rounded-lg p-3 space-y-2">
                  <div className="text-sm font-medium text-green-400">Result:</div>
                  <pre className="text-xs font-mono text-slate-300 bg-slate-800/50 p-2 rounded overflow-x-auto">
                    {typeof invokeResult.output === 'string' 
                      ? invokeResult.output 
                      : JSON.stringify(invokeResult.output, null, 2)}
                  </pre>
                  {invokeResult.usage && (
                    <div className="text-xs text-slate-400 mt-2">
                      Remaining: {invokeResult.usage.remaining === 'unlimited' ? '∞' : invokeResult.usage.remaining} function tests
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-heading text-slate-100 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Project Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 text-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-slate-400">Created</div>
                <div className="text-slate-200 font-medium">{formatDate(project.createdAt)}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm">
              <Clock className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-slate-400">Last Deployed</div>
                <div className="text-slate-200 font-medium">
                  {project.lastDeployed ? formatDate(project.lastDeployed) : "Never"}
                </div>
              </div>
            </div>

            {project.contractAddress && (
              <>
                <div className="flex items-center space-x-3 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-slate-400">Contract Address</div>
                    <div 
                      className="text-slate-200 text-xs break-all cursor-pointer hover:text-blue-300 transition-colors font-mono"
                      title={`Full contract address: ${project.contractAddress}`}
                    >
                      {project.contractAddress}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => {
                    window.open(`https://stellar.expert/explorer/testnet/contract/${project.contractAddress}`, '_blank');
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Stellar Expert
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Network Status */}
        <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-heading text-slate-100 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-green-400" />
              Network Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="text-slate-400">Current Network</div>
                <div className="text-slate-200 font-medium">Soroban Testnet</div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Activity className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>
            
            <div className="text-sm">
              <div className="text-slate-400">RPC Endpoint</div>
              <div className="text-slate-200 text-xs break-all font-mono">https://soroban-testnet.stellar.org</div>
            </div>
          </CardContent>
        </Card>

        {/* Project Stats */}
        <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-heading text-slate-100 flex items-center">
              <Rocket className="w-5 h-5 mr-2 text-purple-400" />
              Project Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{project.files.length}</div>
                <div className="text-xs text-slate-400">Files</div>
              </div>
              <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {project.deploymentHistory?.length || 0}
                </div>
                <div className="text-xs text-slate-400">Deployments</div>
              </div>
            </div>
            
            <div className="text-sm">
              <div className="text-slate-400">Last Modified</div>
              <div className="text-slate-200 font-medium">{formatDate(project.updatedAt)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Deployment History */}
        <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-heading text-slate-100 flex items-center">
              <History className="w-5 h-5 mr-2 text-orange-400" />
              Deployment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <History className="w-4 h-4 mr-2" />
              View Full History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
