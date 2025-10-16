// Step Creator - Handles custom step creation functionality
class StepCreator {
    constructor() {
        this.modal = null;
        this.currentAssetId = null;
        this.currentAsset = null;
        this.currentSteps = [];
        this.functionInputs = [];
        this.functionOutputs = [];
        this.isEditMode = false; // Add edit mode flag
        this.editingStepId = null; // Track which step is being edited
        this.addressType = {};
    }

    initialize() {
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        // Create modal HTML structure with improved UX and modern design
        const modalHTML = `
            <div id="create-step-modal" class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full hidden z-50 transition-all duration-300 opacity-0">
                <div class="relative top-4 mx-auto p-6 border-0 w-[98vw] max-w-7xl shadow-2xl rounded-2xl bg-white max-h-[96vh] overflow-hidden flex flex-col scale-95 translate-y-4 transition-all duration-200">
                    <!-- Modal Header -->
                    <div class="flex items-center justify-between pb-6 border-b border-gray-100">
                        <div class="flex items-center space-x-3">
                            <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <i class="fas fa-cog text-white text-lg"></i>
                            </div>
                            <div>
                                <h3 id="modal-title" class="text-2xl font-bold text-gray-900">Create Custom Step</h3>
                                <p class="text-sm text-gray-500 mt-1">Configure a new step for your asset workflow</p>
                            </div>
                        </div>
                        <button onclick="window.stepCreator.hideModal()" 
                                class="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
                            <i class="fas fa-times text-lg group-hover:scale-110 transition-transform"></i>
                        </button>
                    </div>

                    <!-- Modal Content -->
                    <div class="flex-1 overflow-y-auto py-6">
                        <form id="create-step-form" class="space-y-8">
                            <!-- Progress Indicator -->
                            <div class="mb-8">
                                <div class="flex items-center justify-between mb-4">
                                    <div class="flex items-center space-x-4">
                                        <div class="flex items-center space-x-2">
                                            <div class="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                                            <span class="text-sm font-medium text-indigo-600">Basic Info</span>
                                        </div>
                                        <div class="w-16 h-0.5 bg-gray-200"></div>
                                        <div class="flex items-center space-x-2">
                                            <div class="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                                            <span class="text-sm font-medium text-gray-400">Function Config</span>
                                        </div>
                                        <div class="w-16 h-0.5 bg-gray-200"></div>
                                        <div class="flex items-center space-x-2">
                                            <div class="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                                            <span class="text-sm font-medium text-gray-400">Parameters</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 1: Basic Information -->
                            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                                <div class="flex items-center space-x-3 mb-6">
                                    <div class="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                                        <i class="fas fa-info-circle text-sm"></i>
                                    </div>
                                    <h4 class="text-xl font-semibold text-gray-900">Basic Information</h4>
                                </div>
                                
                                <!-- Primary Fields Row -->
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div class="group">
                                        <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                            <i class="fas fa-sort-numeric-up mr-2 text-blue-500"></i>
                                            Step Order
                                            <span class="text-red-500 ml-1">*</span>
                                        </label>
                                        <div class="relative">
                                            <input type="number" id="step-order" required min="1" 
                                                   class="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-0 transition-all duration-200 bg-white px-4 py-3 text-sm font-medium group-hover:border-gray-300">
                                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <i class="fas fa-hashtag text-gray-400 text-xs"></i>
                                            </div>
                                        </div>
                                        <p class="mt-2 text-xs text-gray-500 flex items-center">
                                            <i class="fas fa-info-circle mr-1"></i>
                                            Execution order within the protocol
                                        </p>
                                    </div>
                                    
                                    <div class="group">
                                        <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                            <i class="fas fa-link mr-2 text-blue-500"></i>
                                            Blockchain
                                            <span class="text-red-500 ml-1">*</span>
                                        </label>
                                        <div class="relative">
                                            <select id="step-chain" required 
                                                    class="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-0 transition-all duration-200 bg-white px-4 py-3 text-sm font-medium appearance-none group-hover:border-gray-300">
                                                <option value="">Select Blockchain</option>
                                                <option value="ETH">🔷 Ethereum</option>
                                                <option value="BSC">🟡 BSC</option>
                                                <option value="POLYGON">🟣 Polygon</option>
                                                <option value="ARBITRUM">🔵 Arbitrum</option>
                                            </select>
                                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <i class="fas fa-chevron-down text-gray-400 text-xs"></i>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="group">
                                        <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                            <i class="fas fa-layer-group mr-2 text-blue-500"></i>
                                            Protocol
                                            <span class="text-red-500 ml-1">*</span>
                                        </label>
                                        <div class="relative">
                                            <input type="text" id="step-protocol" required 
                                                   class="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-0 transition-all duration-200 bg-white px-4 py-3 text-sm font-medium group-hover:border-gray-300" 
                                                   placeholder="e.g., Aave, Compound, Uniswap">
                                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <i class="fas fa-cube text-gray-400 text-xs"></i>
                                            </div>
                                        </div>
                                        <p class="mt-2 text-xs text-gray-500 flex items-center">
                                            <i class="fas fa-info-circle mr-1"></i>
                                            DeFi protocol or platform
                                        </p>
                                    </div>
                                </div>

                                <!-- Title and Description -->
                                <div class="space-y-6">
                                    <div class="group">
                                        <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                            <i class="fas fa-tag mr-2 text-blue-500"></i>
                                            Step Title
                                            <span class="text-red-500 ml-1">*</span>
                                        </label>
                                        <input type="text" id="step-title" required 
                                               class="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-0 transition-all duration-200 bg-white px-4 py-3 text-sm font-medium group-hover:border-gray-300" 
                                               placeholder="e.g., Deposit USDC to Aave Pool">
                                    </div>
                                    
                                    <div class="group">
                                        <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                            <i class="fas fa-align-left mr-2 text-blue-500"></i>
                                            Description
                                            <span class="text-red-500 ml-1">*</span>
                                        </label>
                                        <textarea id="step-description" required rows="3" 
                                                  class="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-0 transition-all duration-200 bg-white px-4 py-3 text-sm resize-none group-hover:border-gray-300" 
                                                  placeholder="Describe what this step accomplishes in the workflow..."></textarea>
                                    </div>
                                </div>

                                <!-- Contract Address -->
                                <div class="mt-6 group">
                                    <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                        <i class="fas fa-file-contract mr-2 text-blue-500"></i>
                                        Contract Address
                                        <span class="text-gray-400 ml-1 text-xs">(Optional)</span>
                                    </label>
                                    <div class="relative">
                                        <input type="text" id="step-contract-address" 
                                               class="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-0 transition-all duration-200 bg-white px-4 py-3 text-sm font-mono group-hover:border-gray-300" 
                                               placeholder="0x...">
                                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <i class="fas fa-code text-gray-400 text-xs"></i>
                                        </div>
                                    </div>
                                    <p class="mt-2 text-xs text-gray-500 flex items-center">
                                        <i class="fas fa-info-circle mr-1"></i>
                                        Smart contract address to interact with
                                    </p>
                                </div>

                                <!-- Approval Fields Section -->
                                <div id="approval-fields-section" class="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl hidden">
                                    <div class="flex items-center space-x-3 mb-4">
                                        <div class="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
                                            <i class="fas fa-key text-sm"></i>
                                        </div>
                                        <div>
                                            <h5 class="text-lg font-semibold text-emerald-900">Approval Configuration</h5>
                                            <p class="text-sm text-emerald-700">Configure token approval settings</p>
                                        </div>
                                    </div>
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div class="group">
                                            <label class="block text-sm font-semibold text-emerald-900 mb-3 flex items-center">
                                                <i class="fas fa-coins mr-2"></i>
                                                Token Contract
                                                <span class="text-red-500 ml-1">*</span>
                                            </label>
                                            <input type="text" id="step-approval-from" 
                                                   class="block w-full rounded-xl border-2 border-emerald-200 shadow-sm focus:border-emerald-500 focus:ring-0 transition-all duration-200 bg-white px-4 py-3 text-sm font-mono group-hover:border-emerald-300" 
                                                   placeholder="0x... (token to approve)">
                                            <p class="mt-2 text-xs text-emerald-600">Contract where approve() is called</p>
                                        </div>
                                        
                                        <div class="group">
                                            <label class="block text-sm font-semibold text-emerald-900 mb-3 flex items-center">
                                                <i class="fas fa-shield-alt mr-2"></i>
                                                Spender Contract
                                                <span class="text-red-500 ml-1">*</span>
                                            </label>
                                            <input type="text" id="step-approval-to" 
                                                   class="block w-full rounded-xl border-2 border-emerald-200 shadow-sm focus:border-emerald-500 focus:ring-0 transition-all duration-200 bg-white px-4 py-3 text-sm font-mono group-hover:border-emerald-300" 
                                                   placeholder="0x... (protocol contract)">
                                            <p class="mt-2 text-xs text-emerald-600">Protocol contract receiving approval</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Enabled Toggle -->
                                <div class="mt-6 flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200">
                                    <div class="flex items-center space-x-3">
                                        <i class="fas fa-toggle-on text-green-500 text-lg"></i>
                                        <div>
                                            <span class="text-sm font-semibold text-gray-900">Step Enabled</span>
                                            <p class="text-xs text-gray-500">Step will be active and executable</p>
                                        </div>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="step-enabled" checked class="sr-only peer">
                                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>

                            <!-- Section 2: Function Configuration -->
                            <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                                <div class="flex items-center space-x-3 mb-6">
                                    <div class="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center">
                                        <i class="fas fa-code text-sm"></i>
                                    </div>
                                    <h4 class="text-xl font-semibold text-gray-900">Function Configuration</h4>
                                </div>
                                
                                <!-- JSON Import Section -->
                                <div class="mb-8 p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
                                    <div class="flex items-center justify-between mb-4">
                                        <div class="flex items-center space-x-3">
                                            <div class="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg flex items-center justify-center">
                                                <i class="fas fa-download text-sm"></i>
                                            </div>
                                            <div>
                                                <h5 class="text-lg font-semibold text-gray-900">Quick Import</h5>
                                                <p class="text-sm text-gray-500">Import function config from JSON</p>
                                            </div>
                                        </div>
                                        <button type="button" onclick="window.stepCreator.showJsonExample()" 
                                                class="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                                            <i class="fas fa-eye mr-2"></i>
                                            View Example
                                        </button>
                                    </div>
                                    
                                    <textarea id="function-json-import" rows="6" 
                                              class="w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-0 transition-all duration-200 bg-gray-50 px-4 py-3 text-sm font-mono resize-none"
                                              placeholder='Paste function configuration JSON here...

Example:
{
  "name": "supply",
  "inputs": [
    { "name": "asset", "type": "address" },
    { "name": "amount", "type": "uint256" }
  ],
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}'></textarea>
                                    
                                    <div class="flex items-center justify-between mt-4">
                                        <p class="text-sm text-gray-500">Paste function JSON to auto-populate fields below</p>
                                        <div class="flex space-x-3">
                                            <button type="button" onclick="window.stepCreator.clearJsonImport()" 
                                                    class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                                                Clear
                                            </button>
                                            <button type="button" onclick="window.stepCreator.previewJson()" 
                                                    class="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                                                <i class="fas fa-search mr-2"></i>
                                                Preview
                                            </button>
                                            <button type="button" onclick="window.stepCreator.importFromJson()" 
                                                    class="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                                                <i class="fas fa-download mr-2"></i>
                                                Import
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Function Basic Settings -->
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div class="group">
                                        <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                            <i class="fas fa-function mr-2 text-purple-500"></i>
                                            Function Name
                                            <span class="text-red-500 ml-1">*</span>
                                        </label>
                                        <input type="text" id="function-name" required 
                                               class="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-0 transition-all duration-200 bg-white px-4 py-3 text-sm font-mono group-hover:border-gray-300" 
                                               placeholder="e.g., deposit, supply, swap">
                                    </div>
                                    
                                    <div class="group">
                                        <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                            <i class="fas fa-cogs mr-2 text-purple-500"></i>
                                            Function Type
                                            <span class="text-red-500 ml-1">*</span>
                                        </label>
                                        <div class="relative">
                                            <select id="function-type" required 
                                                    class="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-0 transition-all duration-200 bg-white px-4 py-3 text-sm appearance-none group-hover:border-gray-300">
                                                <option value="function">🔧 function</option>
                                                <option value="constructor">🏗️ constructor</option>
                                                <option value="fallback">🔄 fallback</option>
                                                <option value="receive">📥 receive</option>
                                            </select>
                                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <i class="fas fa-chevron-down text-gray-400 text-xs"></i>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="group">
                                        <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                            <i class="fas fa-shield-alt mr-2 text-purple-500"></i>
                                            State Mutability
                                            <span class="text-red-500 ml-1">*</span>
                                        </label>
                                        <div class="relative">
                                            <select id="function-mutability" required 
                                                    class="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-0 transition-all duration-200 bg-white px-4 py-3 text-sm appearance-none group-hover:border-gray-300">
                                                <option value="nonpayable">🚫 nonpayable</option>
                                                <option value="payable">💰 payable</option>
                                                <option value="view">👁️ view</option>
                                                <option value="pure">🔒 pure</option>
                                            </select>
                                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <i class="fas fa-chevron-down text-gray-400 text-xs"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 3: Function Parameters -->
                            <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                                <div class="flex items-center space-x-3 mb-6">
                                    <div class="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center">
                                        <i class="fas fa-list text-sm"></i>
                                    </div>
                                    <h4 class="text-xl font-semibold text-gray-900">Function Parameters</h4>
                                </div>

                                <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    <!-- Function Inputs -->
                                    <div class="bg-white rounded-2xl p-6 border-2 border-gray-200">
                                        <div class="flex items-center justify-between mb-6">
                                            <div class="flex items-center space-x-3">
                                                <div class="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                                                    <i class="fas fa-arrow-right text-xs"></i>
                                                </div>
                                                <h5 class="text-lg font-semibold text-gray-900">Inputs</h5>
                                            </div>
                                            <button type="button" onclick="window.stepCreator.addFunctionInput()" 
                                                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
                                                <i class="fas fa-plus mr-2"></i>
                                                Add Input
                                            </button>
                                        </div>
                                        <div id="function-inputs-container" class="space-y-4">
                                            <!-- Function inputs will be added here -->
                                        </div>
                                    </div>

                                    <!-- Function Outputs -->
                                    <div class="bg-white rounded-2xl p-6 border-2 border-gray-200">
                                        <div class="flex items-center justify-between mb-6">
                                            <div class="flex items-center space-x-3">
                                                <div class="w-6 h-6 bg-green-600 text-white rounded-lg flex items-center justify-center">
                                                    <i class="fas fa-arrow-left text-xs"></i>
                                                </div>
                                                <h5 class="text-lg font-semibold text-gray-900">Outputs</h5>
                                            </div>
                                            <button type="button" onclick="window.stepCreator.addFunctionOutput()" 
                                                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md">
                                                <i class="fas fa-plus mr-2"></i>
                                                Add Output
                                            </button>
                                        </div>
                                        <div id="function-outputs-container" class="space-y-4">
                                            <!-- Function outputs will be added here -->
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Address Type Configuration -->
                            <div id="address-type-section" class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100 hidden">
                                <div class="flex items-center space-x-3 mb-6">
                                    <div class="w-8 h-8 bg-yellow-600 text-white rounded-lg flex items-center justify-center">
                                        <i class="fas fa-map-marker-alt text-sm"></i>
                                    </div>
                                    <div>
                                        <h4 class="text-xl font-semibold text-gray-900">Address Type Configuration</h4>
                                        <p class="text-sm text-gray-600 mt-1">Specify which address to use for each address parameter</p>
                                    </div>
                                </div>
                                
                                <div id="address-type-container" class="space-y-4 mb-6">
                                    <!-- Address type mappings will be added here -->
                                </div>
                                
                                <div class="bg-white rounded-xl p-4 border border-yellow-200">
                                    <h6 class="text-sm font-semibold text-yellow-900 mb-3 flex items-center">
                                        <i class="fas fa-info-circle mr-2"></i>
                                        Address Types Reference
                                    </h6>
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                                        <div class="flex items-center space-x-2">
                                            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span><strong>user:</strong> User's wallet address</span>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span><strong>asset:</strong> Current asset's contract</span>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                                            <span><strong>underlying:</strong> Underlying asset contract</span>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                                            <span><strong>contract:</strong> Step's contract address</span>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span><strong>protocol:</strong> Protocol-specific address</span>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <div class="w-3 h-3 bg-gray-500 rounded-full"></div>
                                            <span><strong>custom:</strong> Custom address</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <!-- Modal Footer -->
                    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
                        <div class="flex items-center space-x-2 text-sm text-gray-500">
                            <i class="fas fa-shield-check text-green-500"></i>
                            <span>All fields will be validated before saving</span>
                        </div>
                        
                        <div class="flex space-x-3">
                            <button type="button" onclick="window.stepCreator.hideModal()" 
                                    class="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md">
                                <i class="fas fa-times mr-2"></i>
                                Cancel
                            </button>
                            <button type="submit" id="submit-button" form="create-step-form"
                                    class="inline-flex items-center px-8 py-3 border-2 border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                                <i id="submit-icon" class="fas fa-plus mr-2"></i>
                                <span id="submit-text">Create Step</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to document body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('create-step-modal');
    }

    setupEventListeners() {
        const form = document.getElementById('create-step-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleCreateStep();
            });
        }

        // Add event listener for function name to show/hide approval fields
        const functionNameInput = document.getElementById('function-name');
        if (functionNameInput) {
            functionNameInput.addEventListener('input', (e) => {
                this.toggleApprovalFields(e.target.value);
            });
        }
    }

    toggleApprovalFields(functionName) {
        const approvalSection = document.getElementById('approval-fields-section');
        if (!approvalSection) return;

        if (functionName && functionName.toLowerCase() === 'approve') {
            approvalSection.classList.remove('hidden');
        } else {
            approvalSection.classList.add('hidden');
        }
    }

    showModal(assetId, asset, steps, protocolName = null) {
        this.isEditMode = false;
        this.editingStepId = null;
        this.currentAssetId = assetId;
        this.currentAsset = asset;
        this.currentSteps = steps;

        // Update modal title and button
        document.getElementById('modal-title').textContent = 'Create Custom Step';
        document.getElementById('submit-icon').className = 'fas fa-plus mr-2';
        document.getElementById('submit-text').textContent = 'Create Step';

        // Calculate next step order for the specific protocol
        let nextOrder = 1;
        if (protocolName && steps.length > 0) {
            // Filter steps for this specific protocol only
            const protocolSteps = steps.filter(s => (s.protocol || 'General') === protocolName);
            if (protocolSteps.length > 0) {
                nextOrder = Math.max(...protocolSteps.map(s => s.stepOrder || s.order)) + 1;
            }
        } else if (steps.length > 0) {
            // If no specific protocol, still calculate based on all steps for backward compatibility
            // But this shouldn't happen in the new protocol-based system
            nextOrder = Math.max(...steps.map(s => s.stepOrder || s.order)) + 1;
        }

        // Pre-fill form with defaults
        this.resetForm();
        document.getElementById('step-order').value = nextOrder;
        document.getElementById('step-chain').value = asset.chain;
        
        // Pre-fill protocol
        if (protocolName) {
            document.getElementById('step-protocol').value = protocolName;
            // Make protocol field readonly if specified
            document.getElementById('step-protocol').readOnly = true;
            document.getElementById('step-protocol').classList.add('bg-gray-100');
        } else {
            // Allow protocol selection
            document.getElementById('step-protocol').readOnly = false;
            document.getElementById('step-protocol').classList.remove('bg-gray-100');
            
            // Pre-fill with asset protocol if available
            if (asset.protocol) {
                document.getElementById('step-protocol').value = asset.protocol;
            }
        }

        // Show modal
        if (this.modal) {
            this.modal.classList.remove('hidden');
            
            // Add entrance animation
            setTimeout(() => {
                this.modal.classList.remove('opacity-0');
                const content = this.modal.querySelector('.relative');
                if (content) {
                    content.classList.remove('scale-95', 'translate-y-4');
                }
            }, 10);
            
            // Focus on first input for better UX
            setTimeout(() => {
                const firstInput = document.getElementById('step-order');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 300);
        }
    }

    showEditModal(assetId, asset, steps, stepId) {
        this.isEditMode = true;
        this.editingStepId = stepId;
        this.currentAssetId = assetId;
        this.currentAsset = asset;
        this.currentSteps = steps;

        // Update modal title and button
        document.getElementById('modal-title').textContent = 'Edit Step';
        document.getElementById('submit-icon').className = 'fas fa-save mr-2';
        document.getElementById('submit-text').textContent = 'Update Step';

        // Find the step to edit
        const stepToEdit = steps.find(s => (s.id || s._id) === stepId);
        if (!stepToEdit) {
            this.showToast('Step not found', 'error');
            return;
        }

        // Pre-fill form with step data
        this.resetForm();
        this.populateFormWithStep(stepToEdit);

        // Show modal
        if (this.modal) {
            this.modal.classList.remove('hidden');
            
            // Add entrance animation
            setTimeout(() => {
                this.modal.classList.remove('opacity-0');
                const content = this.modal.querySelector('.relative');
                if (content) {
                    content.classList.remove('scale-95', 'translate-y-4');
                }
            }, 10);
            
            // Focus on first input for better UX
            setTimeout(() => {
                const firstInput = document.getElementById('step-order');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 300);
        }
    }

    populateFormWithStep(step) {
        // Basic information
        document.getElementById('step-order').value = step.stepOrder || step.order;
        document.getElementById('step-chain').value = step.chain;
        document.getElementById('step-protocol').value = step.protocol || 'General';
        document.getElementById('step-title').value = step.title;
        document.getElementById('step-description').value = step.description;
        document.getElementById('step-contract-address').value = step.contractAddress || '';
        document.getElementById('step-enabled').checked = step.enabled;

        // Approval fields
        document.getElementById('step-approval-from').value = step.approvalFrom || '';
        document.getElementById('step-approval-to').value = step.approvalTo || '';

        // Address type configuration
        this.addressType = step.addressType || {};

        // Function configuration
        if (step.functionConfig) {
            document.getElementById('function-name').value = step.functionConfig.name || '';
            document.getElementById('function-type').value = step.functionConfig.type || 'function';
            document.getElementById('function-mutability').value = step.functionConfig.stateMutability || 'nonpayable';

            // Show/hide approval fields based on function name
            this.toggleApprovalFields(step.functionConfig.name);

            // Function inputs
            if (step.functionConfig.inputs && Array.isArray(step.functionConfig.inputs)) {
                this.functionInputs = step.functionConfig.inputs.map((input, index) => ({
                    id: Date.now() + index,
                    name: input.name || '',
                    type: input.type || 'uint256'
                }));
            }

            // Function outputs
            if (step.functionConfig.outputs && Array.isArray(step.functionConfig.outputs)) {
                this.functionOutputs = step.functionConfig.outputs.map((output, index) => ({
                    id: Date.now() + 1000 + index,
                    name: output.name || '',
                    type: output.type || 'uint256'
                }));
            }

            // Re-render inputs and outputs (this will also update address type section)
            this.renderFunctionInputs();
            this.renderFunctionOutputs();
        }

        // Make protocol field readonly in edit mode to maintain protocol organization
        document.getElementById('step-protocol').readOnly = true;
        document.getElementById('step-protocol').classList.add('bg-gray-100');
    }

    hideModal() {
        if (this.modal) {
            // Add exit animation
            this.modal.classList.add('opacity-0');
            const content = this.modal.querySelector('.relative');
            if (content) {
                content.classList.add('scale-95', 'translate-y-4');
            }
            
            setTimeout(() => {
                this.modal.classList.add('hidden');
                this.modal.classList.remove('opacity-0');
                if (content) {
                    content.classList.remove('scale-95', 'translate-y-4');
                }
                this.resetForm();
            }, 200);
        }
    }

    resetForm() {
        // Clear all form fields
        const form = document.getElementById('create-step-form');
        if (form) {
            form.reset();
        }

        // Clear JSON import textarea
        const jsonTextarea = document.getElementById('function-json-import');
        if (jsonTextarea) {
            jsonTextarea.value = '';
        }

        // Clear approval fields
        document.getElementById('step-approval-from').value = '';
        document.getElementById('step-approval-to').value = '';
        
        // Hide approval fields section
        const approvalSection = document.getElementById('approval-fields-section');
        if (approvalSection) {
            approvalSection.classList.add('hidden');
        }

        // Reset address type configuration
        this.addressType = {};
        const addressTypeSection = document.getElementById('address-type-section');
        if (addressTypeSection) {
            addressTypeSection.classList.add('hidden');
        }

        // Reset function inputs and outputs
        this.functionInputs = [];
        this.functionOutputs = [];
        this.renderFunctionInputs();
        this.renderFunctionOutputs();

        // Set default values
        document.getElementById('step-enabled').checked = true;
        document.getElementById('function-type').value = 'function';
        document.getElementById('function-mutability').value = 'nonpayable';
        
        // Reset protocol field state
        const protocolField = document.getElementById('step-protocol');
        if (protocolField) {
            protocolField.readOnly = false;
            protocolField.classList.remove('bg-gray-100');
        }
    }

    addFunctionInput() {
        const input = {
            id: Date.now(),
            name: '',
            type: 'uint256'
        };
        this.functionInputs.push(input);
        this.renderFunctionInputs();
    }

    removeFunctionInput(id) {
        this.functionInputs = this.functionInputs.filter(input => input.id !== id);
        this.renderFunctionInputs();
    }

    addFunctionOutput() {
        const output = {
            id: Date.now(),
            name: '',
            type: 'uint256'
        };
        this.functionOutputs.push(output);
        this.renderFunctionOutputs();
    }

    removeFunctionOutput(id) {
        this.functionOutputs = this.functionOutputs.filter(output => output.id !== id);
        this.renderFunctionOutputs();
    }

    renderFunctionInputs() {
        const container = document.getElementById('function-inputs-container');
        if (!container) return;

        if (this.functionInputs.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-inbox text-2xl text-gray-400"></i>
                    </div>
                    <p class="text-sm font-medium">No input parameters defined</p>
                    <p class="text-xs mt-1">Click "Add Input" to define function parameters</p>
                </div>
            `;
        } else {
            container.innerHTML = this.functionInputs.map((input, index) => `
                <div class="group relative bg-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                    <div class="flex items-start space-x-4">
                        <!-- Parameter Index -->
                        <div class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-semibold mt-6">
                            ${index + 1}
                        </div>
                        
                        <!-- Parameter Fields -->
                        <div class="flex-1 space-y-4">
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                    <i class="fas fa-tag mr-1 text-blue-500"></i>
                                    Parameter Name
                                    <span class="text-red-500 ml-1">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., amount, spender, to" 
                                    value="${input.name}"
                                    onchange="window.stepCreator.updateFunctionInput(${input.id}, 'name', this.value)"
                                    class="block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-0 transition-all duration-200 text-sm px-3 py-2 bg-white"
                                >
                            </div>
                            
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                    <i class="fas fa-code mr-1 text-blue-500"></i>
                                    Parameter Type
                                    <span class="text-red-500 ml-1">*</span>
                                </label>
                                <div class="relative">
                                    <select 
                                        onchange="window.stepCreator.updateFunctionInput(${input.id}, 'type', this.value)"
                                        class="block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-0 transition-all duration-200 text-sm px-3 py-2 bg-white appearance-none"
                                    >
                                        <option value="">Select parameter type</option>
                                        <option value="address" ${input.type === 'address' ? 'selected' : ''}>📍 address</option>
                                        <option value="uint256" ${input.type === 'uint256' ? 'selected' : ''}>🔢 uint256</option>
                                        <option value="uint128" ${input.type === 'uint128' ? 'selected' : ''}>🔢 uint128</option>
                                        <option value="uint64" ${input.type === 'uint64' ? 'selected' : ''}>🔢 uint64</option>
                                        <option value="uint32" ${input.type === 'uint32' ? 'selected' : ''}>🔢 uint32</option>
                                        <option value="uint16" ${input.type === 'uint16' ? 'selected' : ''}>🔢 uint16</option>
                                        <option value="uint8" ${input.type === 'uint8' ? 'selected' : ''}>🔢 uint8</option>
                                        <option value="int256" ${input.type === 'int256' ? 'selected' : ''}>➕➖ int256</option>
                                        <option value="bytes32" ${input.type === 'bytes32' ? 'selected' : ''}>📦 bytes32</option>
                                        <option value="bytes" ${input.type === 'bytes' ? 'selected' : ''}>📦 bytes</option>
                                        <option value="string" ${input.type === 'string' ? 'selected' : ''}>📝 string</option>
                                        <option value="bool" ${input.type === 'bool' ? 'selected' : ''}>✅ bool</option>
                                    </select>
                                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <i class="fas fa-chevron-down text-gray-400 text-xs"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Remove Button -->
                        <div class="flex-shrink-0 mt-6">
                            <button 
                                type="button" 
                                onclick="window.stepCreator.removeFunctionInput(${input.id})"
                                class="w-8 h-8 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 flex items-center justify-center group border border-red-200 hover:border-red-500"
                                title="Remove parameter"
                            >
                                <i class="fas fa-trash text-sm group-hover:scale-110 transition-transform"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        // Update address type section whenever inputs change
        this.updateAddressTypeSection();
    }

    renderFunctionOutputs() {
        const container = document.getElementById('function-outputs-container');
        if (!container) return;

        if (this.functionOutputs.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-inbox text-2xl text-gray-400"></i>
                    </div>
                    <p class="text-sm font-medium">No output parameters defined</p>
                    <p class="text-xs mt-1">Click "Add Output" to define return values</p>
                </div>
            `;
        } else {
            container.innerHTML = this.functionOutputs.map((output, index) => `
                <div class="group relative bg-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-green-300 hover:bg-green-50 transition-all duration-200">
                    <div class="flex items-start space-x-4">
                        <!-- Output Index -->
                        <div class="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-semibold mt-6">
                            ${index + 1}
                        </div>
                        
                        <!-- Output Fields -->
                        <div class="flex-1 space-y-4">
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                    <i class="fas fa-tag mr-1 text-green-500"></i>
                                    Return Name
                                    <span class="text-gray-400 ml-1 text-xs">(Optional)</span>
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., success, tokenId, balance" 
                                    value="${output.name}"
                                    onchange="window.stepCreator.updateFunctionOutput(${output.id}, 'name', this.value)"
                                    class="block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-green-500 focus:ring-0 transition-all duration-200 text-sm px-3 py-2 bg-white"
                                >
                            </div>
                            
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                    <i class="fas fa-code mr-1 text-green-500"></i>
                                    Return Type
                                    <span class="text-red-500 ml-1">*</span>
                                </label>
                                <div class="relative">
                                    <select 
                                        onchange="window.stepCreator.updateFunctionOutput(${output.id}, 'type', this.value)"
                                        class="block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-green-500 focus:ring-0 transition-all duration-200 text-sm px-3 py-2 bg-white appearance-none"
                                    >
                                        <option value="">Select return type</option>
                                        <option value="address" ${output.type === 'address' ? 'selected' : ''}>📍 address</option>
                                        <option value="uint256" ${output.type === 'uint256' ? 'selected' : ''}>🔢 uint256</option>
                                        <option value="uint128" ${output.type === 'uint128' ? 'selected' : ''}>🔢 uint128</option>
                                        <option value="uint64" ${output.type === 'uint64' ? 'selected' : ''}>🔢 uint64</option>
                                        <option value="uint32" ${output.type === 'uint32' ? 'selected' : ''}>🔢 uint32</option>
                                        <option value="uint16" ${output.type === 'uint16' ? 'selected' : ''}>🔢 uint16</option>
                                        <option value="uint8" ${output.type === 'uint8' ? 'selected' : ''}>🔢 uint8</option>
                                        <option value="int256" ${output.type === 'int256' ? 'selected' : ''}>➕➖ int256</option>
                                        <option value="bytes32" ${output.type === 'bytes32' ? 'selected' : ''}>📦 bytes32</option>
                                        <option value="bytes" ${output.type === 'bytes' ? 'selected' : ''}>📦 bytes</option>
                                        <option value="string" ${output.type === 'string' ? 'selected' : ''}>📝 string</option>
                                        <option value="bool" ${output.type === 'bool' ? 'selected' : ''}>✅ bool</option>
                                    </select>
                                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <i class="fas fa-chevron-down text-gray-400 text-xs"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Remove Button -->
                        <div class="flex-shrink-0 mt-6">
                            <button 
                                type="button" 
                                onclick="window.stepCreator.removeFunctionOutput(${output.id})"
                                class="w-8 h-8 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 flex items-center justify-center group border border-red-200 hover:border-red-500"
                                title="Remove parameter"
                            >
                                <i class="fas fa-trash text-sm group-hover:scale-110 transition-transform"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    updateFunctionInput(id, field, value) {
        const input = this.functionInputs.find(i => i.id === id);
        if (input) {
            input[field] = value;
        }
    }

    updateFunctionOutput(id, field, value) {
        const output = this.functionOutputs.find(o => o.id === id);
        if (output) {
            output[field] = value;
        }
    }

    async handleCreateStep() {
        try {
            const formData = this.getFormData();
            
            // Validate required fields
            if (!formData.title || !formData.description || !formData.chain || !formData.protocol || !formData.functionConfig.name) {
                this.showToast('Please fill in all required fields including protocol', 'error');
                return;
            }

            if (this.isEditMode) {
                // Update existing step
                console.log('Updating step:', this.editingStepId, formData);

                // Check if step order conflicts with existing steps (excluding the current step)
                const existingStep = this.currentSteps.find(s => 
                    (s.stepOrder || s.order) === formData.order && 
                    (s.protocol || 'General') === formData.protocol &&
                    (s.id || s._id) !== this.editingStepId
                );
                if (existingStep) {
                    if (!confirm(`Another step with order ${formData.order} already exists for protocol ${formData.protocol}. Do you want to continue?`)) {
                        return;
                    }
                }

                const response = await apiService.updateStep(this.editingStepId, formData);
                console.log('Step updated successfully:', response);
                
                this.showToast('Step updated successfully', 'success');
            } else {
                // Create new step
                console.log('Creating custom step:', formData);

                // Check if step order already exists for the same protocol
                const existingStep = this.currentSteps.find(s => 
                    (s.stepOrder || s.order) === formData.order && 
                    (s.protocol || 'General') === formData.protocol
                );
                if (existingStep) {
                    if (!confirm(`A step with order ${formData.order} already exists for protocol ${formData.protocol}. Do you want to continue?`)) {
                        return;
                    }
                }

                const response = await apiService.createStep(formData);
                console.log('Step created successfully:', response);
                
                this.showToast('Step created successfully', 'success');
            }

            this.hideModal();
            
            // Notify the asset detail manager to reload steps
            if (window.assetDetailManager) {
                await window.assetDetailManager.loadSteps(this.currentAssetId);
            }

        } catch (error) {
            console.error(`Failed to ${this.isEditMode ? 'update' : 'create'} step:`, error);
            this.showToast(`Failed to ${this.isEditMode ? 'update' : 'create'} step: ${error.message}`, 'error');
        }
    }

    getFormData() {
        const approvalFrom = document.getElementById('step-approval-from').value.trim();
        const approvalTo = document.getElementById('step-approval-to').value.trim();
        
        const data = {
            assetId: this.currentAssetId,
            order: parseInt(document.getElementById('step-order').value),
            title: document.getElementById('step-title').value,
            description: document.getElementById('step-description').value,
            chain: document.getElementById('step-chain').value,
            protocol: document.getElementById('step-protocol').value,
            contractAddress: document.getElementById('step-contract-address').value || undefined,
            functionConfig: {
                name: document.getElementById('function-name').value,
                type: document.getElementById('function-type').value,
                stateMutability: document.getElementById('function-mutability').value,
                inputs: this.functionInputs.map(input => ({
                    name: input.name || '',
                    type: input.type
                })),
                outputs: this.functionOutputs.map(output => ({
                    name: output.name || '',
                    type: output.type
                }))
            },
            enabled: document.getElementById('step-enabled').checked
        };

        // Add approval fields if they have values
        if (approvalFrom) {
            data.approvalFrom = approvalFrom;
        }
        if (approvalTo) {
            data.approvalTo = approvalTo;
        }

        // Add addressType if there are any mappings
        if (this.addressType && Object.keys(this.addressType).length > 0) {
            data.addressType = this.addressType;
        }

        return data;
    }

    showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed top-6 right-6 z-[60] space-y-3';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        let bgColor, iconClass, borderColor;
        
        switch (type) {
            case 'error':
                bgColor = 'bg-red-50';
                iconClass = 'fas fa-exclamation-circle text-red-500';
                borderColor = 'border-red-200';
                break;
            case 'success':
                bgColor = 'bg-green-50';
                iconClass = 'fas fa-check-circle text-green-500';
                borderColor = 'border-green-200';
                break;
            case 'warning':
                bgColor = 'bg-yellow-50';
                iconClass = 'fas fa-exclamation-triangle text-yellow-500';
                borderColor = 'border-yellow-200';
                break;
            default:
                bgColor = 'bg-blue-50';
                iconClass = 'fas fa-info-circle text-blue-500';
                borderColor = 'border-blue-200';
        }
        
        toast.className = `${bgColor} ${borderColor} border-2 rounded-xl shadow-lg p-4 mb-3 transition-all duration-300 transform translate-x-full max-w-md`;
        toast.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    <i class="${iconClass}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 leading-relaxed">${message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="flex-shrink-0 w-6 h-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </div>
        `;

        container.appendChild(toast);

        // Trigger entrance animation
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('translate-x-full', 'opacity-0');
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    // JSON Import Methods
    showJsonExample() {
        const exampleJson = {
            inputs: [
                { name: 'asset', type: 'address' },
                { name: 'amount', type: 'uint256' },
                { name: 'onBehalfOf', type: 'address' },
                { name: 'referralCode', type: 'uint16' }
            ],
            name: 'supply',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function'
        };

        const textarea = document.getElementById('function-json-import');
        if (textarea) {
            textarea.value = JSON.stringify(exampleJson, null, 2);
        }

        this.showToast('Example JSON loaded. Click "Import JSON" to populate the form.', 'info');
    }

    clearJsonImport() {
        const textarea = document.getElementById('function-json-import');
        if (textarea) {
            textarea.value = '';
        }
    }

    previewJson() {
        try {
            const textarea = document.getElementById('function-json-import');
            if (!textarea || !textarea.value.trim()) {
                this.showToast('Please paste a JSON configuration first', 'error');
                return;
            }

            let functionConfig;
            try {
                functionConfig = JSON.parse(textarea.value.trim());
            } catch (parseError) {
                this.showToast('Invalid JSON format. Please check your syntax.', 'error');
                return;
            }

            // Enhanced validation
            const validationErrors = this.validateJsonConfig(functionConfig);
            if (validationErrors.length > 0) {
                this.showToast('Validation errors: ' + validationErrors.join('; '), 'error');
                return;
            }

            // Show preview information
            const inputCount = functionConfig.inputs ? functionConfig.inputs.length : 0;
            const outputCount = functionConfig.outputs ? functionConfig.outputs.length : 0;
            const preview = `Preview: Function "${functionConfig.name}" with ${inputCount} inputs and ${outputCount} outputs. Type: ${functionConfig.type || 'function'}, Mutability: ${functionConfig.stateMutability || 'nonpayable'}`;
            
            this.showToast(preview, 'info');

        } catch (error) {
            console.error('Error previewing JSON:', error);
            this.showToast('Error previewing JSON: ' + error.message, 'error');
        }
    }

    importFromJson() {
        try {
            const textarea = document.getElementById('function-json-import');
            if (!textarea || !textarea.value.trim()) {
                this.showToast('Please paste a JSON configuration first', 'error');
                return;
            }

            let functionConfig;
            try {
                functionConfig = JSON.parse(textarea.value.trim());
            } catch (parseError) {
                this.showToast('Invalid JSON format. Please check your syntax.', 'error');
                return;
            }

            // Enhanced validation
            const validationErrors = this.validateJsonConfig(functionConfig);
            if (validationErrors.length > 0) {
                this.showToast('Validation errors: ' + validationErrors.join('; '), 'error');
                return;
            }

            // Populate basic function fields
            document.getElementById('function-name').value = functionConfig.name || '';
            document.getElementById('function-type').value = functionConfig.type || 'function';
            document.getElementById('function-mutability').value = functionConfig.stateMutability || 'nonpayable';

            // Show/hide approval fields based on function name
            this.toggleApprovalFields(functionConfig.name);

            // Clear existing inputs and outputs
            this.functionInputs = [];
            this.functionOutputs = [];

            // Import inputs
            if (functionConfig.inputs && functionConfig.inputs.length > 0) {
                functionConfig.inputs.forEach((input, index) => {
                    if (input.name && input.type) {
                        this.functionInputs.push({
                            id: Date.now() + index,
                            name: input.name,
                            type: this.normalizeType(input.type)
                        });
                    }
                });
            }

            // Import outputs
            if (functionConfig.outputs && functionConfig.outputs.length > 0) {
                functionConfig.outputs.forEach((output, index) => {
                    this.functionOutputs.push({
                        id: Date.now() + 1000 + index,
                        name: output.name || '',
                        type: this.normalizeType(output.type || 'uint256')
                    });
                });
            }

            // Re-render inputs and outputs
            this.renderFunctionInputs();
            this.renderFunctionOutputs();

            // Clear the JSON textarea
            textarea.value = '';

            const inputCount = this.functionInputs.length;
            const outputCount = this.functionOutputs.length;
            this.showToast(`Function configuration imported! ${inputCount} inputs, ${outputCount} outputs`, 'success');

        } catch (error) {
            console.error('Error importing JSON:', error);
            this.showToast('Error importing JSON: ' + error.message, 'error');
        }
    }

    // Normalize type names to match our dropdown options
    normalizeType(type) {
        const supportedTypes = [
            'uint256', 'address', 'bool', 'bytes', 'string', 
            'uint8', 'uint16', 'uint32', 'uint64', 'uint128', 
            'int256', 'bytes32', 'bytes4'
        ];
        
        if (supportedTypes.includes(type)) {
            return type;
        }
        
        // Handle common variations
        if (type === 'uint') return 'uint256';
        if (type === 'int') return 'int256';
        if (type.startsWith('uint') && !supportedTypes.includes(type)) {
            // For unsupported uint types, default to uint256
            return 'uint256';
        }
        if (type.startsWith('int') && !supportedTypes.includes(type)) {
            // For unsupported int types, default to int256
            return 'int256';
        }
        if (type.startsWith('bytes') && !supportedTypes.includes(type)) {
            // For unsupported bytes types, default to bytes
            return 'bytes';
        }
        
        // Default fallback
        return 'uint256';
    }

    // Enhanced validation for imported JSON
    validateJsonConfig(config) {
        const errors = [];

        if (!config.name || typeof config.name !== 'string') {
            errors.push('Function name is required and must be a string');
        }

        if (!Array.isArray(config.inputs)) {
            errors.push('Inputs must be an array');
        } else {
            config.inputs.forEach((input, index) => {
                if (!input.name || typeof input.name !== 'string') {
                    errors.push(`Input ${index + 1}: name is required and must be a string`);
                }
                if (!input.type || typeof input.type !== 'string') {
                    errors.push(`Input ${index + 1}: type is required and must be a string`);
                }
            });
        }

        if (!Array.isArray(config.outputs)) {
            errors.push('Outputs must be an array');
        } else {
            config.outputs.forEach((output, index) => {
                if (output.type && typeof output.type !== 'string') {
                    errors.push(`Output ${index + 1}: type must be a string`);
                }
            });
        }

        const validTypes = ['function', 'constructor', 'fallback', 'receive'];
        if (config.type && !validTypes.includes(config.type)) {
            errors.push('Type must be one of: ' + validTypes.join(', '));
        }

        const validMutability = ['nonpayable', 'payable', 'view', 'pure'];
        if (config.stateMutability && !validMutability.includes(config.stateMutability)) {
            errors.push('State mutability must be one of: ' + validMutability.join(', '));
        }

        return errors;
    }

    updateAddressTypeSection() {
        const section = document.getElementById('address-type-section');
        const container = document.getElementById('address-type-container');
        
        if (!section || !container) return;

        // Find all address-type parameters
        const addressInputs = this.functionInputs.filter(input => input.type === 'address');
        
        if (addressInputs.length === 0) {
            section.classList.add('hidden');
            return;
        }

        section.classList.remove('hidden');
        
        if (addressInputs.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-map-marker-alt text-2xl text-gray-400"></i>
                    </div>
                    <p class="text-sm font-medium">No address parameters found</p>
                    <p class="text-xs mt-1">Add address-type inputs to configure address mappings</p>
                </div>
            `;
        } else {
            container.innerHTML = addressInputs.map((input, index) => `
                <div class="group bg-white border-2 border-yellow-200 rounded-xl p-5 hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-200">
                    <div class="flex items-start space-x-4">
                        <!-- Parameter Index -->
                        <div class="flex-shrink-0 w-8 h-8 bg-yellow-600 text-white rounded-lg flex items-center justify-center text-sm font-semibold">
                            ${index + 1}
                        </div>
                        
                        <!-- Parameter Info and Selection -->
                        <div class="flex-1 space-y-4">
                            <div class="flex items-center space-x-3">
                                <div class="flex items-center space-x-2">
                                    <i class="fas fa-code text-yellow-600"></i>
                                    <span class="text-sm font-semibold text-gray-900">Parameter:</span>
                                    <code class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-mono">${input.name}</code>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <i class="fas fa-tag text-yellow-600"></i>
                                    <span class="text-sm text-gray-600">Type:</span>
                                    <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">address</span>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                    <i class="fas fa-map-marker-alt mr-2 text-yellow-600"></i>
                                    Address Source
                                    <span class="text-red-500 ml-1">*</span>
                                </label>
                                <div class="relative">
                                    <select 
                                        onchange="window.stepCreator.updateAddressType('${input.name}', this.value)"
                                        class="block w-full rounded-xl border-2 border-yellow-200 shadow-sm focus:border-yellow-500 focus:ring-0 transition-all duration-200 bg-white px-4 py-3 text-sm appearance-none group-hover:border-yellow-300"
                                    >
                                        <option value="">Select address source</option>
                                        <option value="user" ${this.addressType[input.name] === 'user' ? 'selected' : ''}>👤 User's Wallet Address</option>
                                        <option value="asset" ${this.addressType[input.name] === 'asset' ? 'selected' : ''}>🏦 Current Asset Contract</option>
                                        <option value="underlying" ${this.addressType[input.name] === 'underlying' ? 'selected' : ''}>🔗 Underlying Asset Contract</option>
                                        <option value="contract" ${this.addressType[input.name] === 'contract' ? 'selected' : ''}>📄 Step Contract Address</option>
                                        <option value="protocol" ${this.addressType[input.name] === 'protocol' ? 'selected' : ''}>🏛️ Protocol-Specific Address</option>
                                        <option value="custom" ${this.addressType[input.name] === 'custom' ? 'selected' : ''}>⚙️ Custom Address</option>
                                    </select>
                                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <i class="fas fa-chevron-down text-gray-400 text-xs"></i>
                                    </div>
                                </div>
                                ${this.getAddressTypeDescription(this.addressType[input.name])}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    getAddressTypeDescription(addressType) {
        const descriptions = {
            'user': 'The address of the user performing the transaction',
            'asset': 'The contract address of the current asset being processed',
            'underlying': 'The contract address of the underlying token (for wrapped/derivative tokens)',
            'contract': 'The contract address specified in the step configuration',
            'protocol': 'A protocol-specific address that will be determined by the protocol logic',
            'custom': 'A custom address that will be specified separately'
        };

        if (addressType && descriptions[addressType]) {
            return `<p class="mt-2 text-xs text-yellow-700 flex items-center">
                <i class="fas fa-info-circle mr-1"></i>
                ${descriptions[addressType]}
            </p>`;
        }
        return '';
    }

    updateAddressType(parameterName, addressType) {
        if (!this.addressType) {
            this.addressType = {};
        }
        
        if (addressType) {
            this.addressType[parameterName] = addressType;
        } else {
            delete this.addressType[parameterName];
        }
    }
}

// Initialize and export as global
window.stepCreator = new StepCreator();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.stepCreator.initialize();
}); 