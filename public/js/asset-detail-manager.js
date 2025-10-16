// Asset Detail Manager - Handles the individual asset detail page functionality
class AssetDetailManager {
    constructor() {
        this.currentAsset = null;
        this.currentAssetId = null;
        this.currentSteps = [];
        this.currentTab = 'details';
        this.protocols = []; // Available protocols for this asset
        this.activeProtocol = null; // Currently active protocol tab
        this.chains = []; // Store available chains
        this.asset = null;
        this.steps = [];
        this.isEditMode = false;
        this.assetId = this.getAssetIdFromUrl();
        this.setupEventListeners();
    }

    getAssetIdFromUrl() {
        const path = window.location.pathname;
        const matches = path.match(/\/backoffice\/assets\/([a-f0-9]{24})/);
        return matches ? matches[1] : null;
    }

    async initialize() {
        if (!this.assetId) {
            this.showAssetNotFound();
            return;
        }

        try {
            await this.loadChains();
            await this.loadAsset();
            await this.loadSteps();
            this.renderAssetDetails();
        } catch (error) {
            console.error('Failed to initialize asset detail:', error);
            if (error.message.includes('not found') || error.message.includes('404')) {
                this.showAssetNotFound();
            } else {
                this.showError('Failed to load asset details. Please try again.');
            }
        }
    }

    setupEventListeners() {
        // Lock yield checkbox handlers
        this.setupLockYieldToggle('edit-hasLockYield', 'edit-lockYieldSection');

        // Form submission handlers
        this.setupFormHandlers();
        
        // Add protocol form handler
        this.setupAddProtocolForm();
    }

    setupLockYieldToggle(checkboxId, sectionId) {
        const checkbox = document.getElementById(checkboxId);
        const section = document.getElementById(sectionId);
        
        if (checkbox && section) {
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
        }
    }

    setupFormHandlers() {
        // Edit form handler
        const editForm = document.getElementById('edit-asset-form');
        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleUpdateAsset();
            });
        }
    }

    setupAddProtocolForm() {
        const addProtocolForm = document.getElementById('add-protocol-form');
        if (addProtocolForm) {
            addProtocolForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleAddProtocol();
            });
        }
    }

    async loadAsset() {
        try {
            console.log('Loading asset with ID:', this.assetId);
            
            const asset = await apiService.getAsset(this.assetId);
            console.log('Loaded asset:', asset);
            
            this.currentAsset = asset;
            this.populateAssetPage(asset);
            this.showMainContent();
            
        } catch (error) {
            console.error('Failed to load asset:', error);
            this.showAssetNotFound();
        }
    }

    populateAssetPage(asset) {
        // Update header
        const assetIcon = document.getElementById('assetIcon');
        const assetTitle = document.getElementById('assetTitle');
        const assetSubtitle = document.getElementById('assetSubtitle');
        const assetStatus = document.getElementById('assetStatus');

        if (assetIcon) {
            assetIcon.src = asset.icon;
            assetIcon.alt = asset.token;
        }

        if (assetTitle) {
            assetTitle.textContent = asset.token;
        }

        if (assetSubtitle) {
            assetSubtitle.textContent = `${asset.chain} • ${asset.address}`;
        }

        if (assetStatus) {
            if (asset.enabled) {
                assetStatus.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800';
                assetStatus.textContent = 'Enabled';
            } else {
                assetStatus.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
                assetStatus.textContent = 'Disabled';
            }
        }

        // Update page title
        document.title = `YieldScan - ${asset.token} Asset Details`;

        // Populate asset details content
        this.populateAssetDetails(asset);
    }

    populateAssetDetails(asset) {
        const content = document.getElementById('assetDetailsContent');
        if (!content) return;

        const lockYieldHtml = asset.lockYield ? `
            <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 class="text-sm font-medium text-blue-900 mb-3">Lock Yield Configuration</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="font-medium text-blue-800">Protocol:</span>
                        <span class="ml-2 text-blue-700">${asset.lockYield?.protocol?.name || 'N/A'}</span>
                    </div>
                    <div>
                        <span class="font-medium text-blue-800">Expiration:</span>
                        <span class="ml-2 text-blue-700">${asset.lockYield?.expirationDate || 'N/A'}</span>
                    </div>
                    <div>
                        <span class="font-medium text-blue-800">YT Address:</span>
                        <span class="ml-2 text-blue-700 font-mono text-xs">${asset.lockYield?.protocol?.ytAddress || 'N/A'}</span>
                    </div>
                    <div>
                        <span class="font-medium text-blue-800">PT Address:</span>
                        <span class="ml-2 text-blue-700 font-mono text-xs">${asset.lockYield?.protocol?.ptAddress || 'N/A'}</span>
                    </div>
                </div>
            </div>
        ` : '';

        content.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <dl class="space-y-4">
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Token Symbol</dt>
                            <dd class="text-sm text-gray-900">${asset.token}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Chain</dt>
                            <dd class="text-sm text-gray-900">${asset.chain}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Contract Address</dt>
                            <dd class="text-sm text-gray-900 font-mono break-all">${asset.address}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Chain ID</dt>
                            <dd class="text-sm text-gray-900">${asset.chainId}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Decimals</dt>
                            <dd class="text-sm text-gray-900">${asset.decimals}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Max Decimals to Show</dt>
                            <dd class="text-sm text-gray-900">${asset.maxDecimalsShow}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Underlying Asset</dt>
                            <dd class="text-sm text-gray-900 font-mono break-all">${asset.underlyingAsset || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Withdraw Contract</dt>
                            <dd class="text-sm text-gray-900 font-mono break-all">${asset.withdrawContract || 'N/A'}</dd>
                        </div>
                    </dl>
                </div>
                <div>
                    <dl class="space-y-4">
                        <div>
                            <dt class="text-sm font-medium text-gray-500">USD Price</dt>
                            <dd class="text-sm text-gray-900">$${asset.usdPrice?.toFixed(2) || '0.00'}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Protocol</dt>
                            <dd class="text-sm text-gray-900">${asset.protocol || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Withdraw URI</dt>
                            <dd class="text-sm text-gray-900 break-all">${asset.withdrawUri || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Maturity</dt>
                            <dd class="text-sm text-gray-900">${asset.maturity || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Yield Bearing</dt>
                            <dd class="text-sm text-gray-900">
                                ${asset.yieldBearingToken ? 
                                    '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Yes</span>' : 
                                    '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">No</span>'
                                }
                            </dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Status</dt>
                            <dd class="text-sm text-gray-900">
                                ${asset.enabled ? 
                                    '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Enabled</span>' : 
                                    '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Disabled</span>'
                                }
                            </dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Has Lock Yield</dt>
                            <dd class="text-sm text-gray-900">
                                ${asset.lockYield ? 
                                    '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Yes</span>' : 
                                    '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">No</span>'
                                }
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
            ${lockYieldHtml}
        `;
    }

    // Tab management
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        const detailsTab = document.getElementById('asset-details-tab');
        const stepsTab = document.getElementById('deposit-steps-tab');
        const detailsContent = document.getElementById('asset-details-content');
        const stepsContent = document.getElementById('deposit-steps-content');

        // Reset all tabs
        [detailsTab, stepsTab].forEach(tab => {
            if (tab) {
                tab.className = 'tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm';
            }
        });

        // Hide all content
        [detailsContent, stepsContent].forEach(content => {
            if (content) {
                content.classList.add('hidden');
            }
        });

        // Activate selected tab
        if (tabName === 'details') {
            if (detailsTab) {
                detailsTab.className = 'tab-button active border-indigo-500 text-indigo-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm';
            }
            if (detailsContent) {
                detailsContent.classList.remove('hidden');
            }
        } else if (tabName === 'steps') {
            if (stepsTab) {
                stepsTab.className = 'tab-button active border-indigo-500 text-indigo-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm';
            }
            if (stepsContent) {
                stepsContent.classList.remove('hidden');
            }
            // Load steps when switching to steps tab
            if (this.currentAssetId) {
                this.loadSteps(this.currentAssetId);
            }
        }

        // Update URL state
        this.updateURLState(tabName, this.activeProtocol);
    }

    // Step management methods
    async loadSteps(assetId) {
        try {
            const stepsLoading = document.getElementById('steps-loading');
            const protocolContent = document.getElementById('protocol-content');
            const noProtocolsState = document.getElementById('no-protocols-state');

            // Show loading
            if (protocolContent) protocolContent.classList.add('hidden');
            if (noProtocolsState) noProtocolsState.classList.add('hidden');
            if (stepsLoading) stepsLoading.classList.remove('hidden');

            const steps = await apiService.getStepsByAssetId(assetId);
            this.currentSteps = steps;

            // Hide loading
            if (stepsLoading) stepsLoading.classList.add('hidden');

            // Group steps by protocol and render protocol tabs
            this.groupStepsByProtocol(steps);
            this.renderProtocolTabs();
            this.renderActiveProtocolContent();

        } catch (error) {
            console.error('Failed to load steps:', error);
            if (stepsLoading) stepsLoading.classList.add('hidden');
            this.showToast('Failed to load steps', 'error');
        }
    }

    groupStepsByProtocol(steps) {
        const protocolMap = {};
        
        steps.forEach(step => {
            const protocol = step.protocol || 'General';
            if (!protocolMap[protocol]) {
                protocolMap[protocol] = {
                    name: protocol,
                    steps: []
                };
            }
            protocolMap[protocol].steps.push(step);
        });

        // Sort steps within each protocol by order
        Object.values(protocolMap).forEach(protocol => {
            protocol.steps.sort((a, b) => (a.stepOrder || a.order) - (b.stepOrder || b.order));
        });

        this.protocols = Object.values(protocolMap);
        
        // Set active protocol - prioritize URL parameter, then previous selection, then first available
        if (this.activeProtocol) {
            // Check if the activeProtocol from URL actually exists
            const protocolExists = this.protocols.find(p => p.name === this.activeProtocol);
            if (!protocolExists && this.protocols.length > 0) {
                this.activeProtocol = this.protocols[0].name;
            }
        } else if (this.protocols.length > 0) {
            this.activeProtocol = this.protocols[0].name;
        }
        
        console.log('Grouped protocols:', this.protocols.map(p => p.name), 'Active:', this.activeProtocol);
    }

    renderProtocolTabs() {
        const tabsContainer = document.getElementById('protocol-tabs');
        const protocolContent = document.getElementById('protocol-content');
        const noProtocolsState = document.getElementById('no-protocols-state');

        if (!tabsContainer) return;

        if (this.protocols.length === 0) {
            tabsContainer.innerHTML = '';
            if (protocolContent) protocolContent.classList.add('hidden');
            if (noProtocolsState) noProtocolsState.classList.remove('hidden');
            return;
        }

        if (protocolContent) protocolContent.classList.remove('hidden');
        if (noProtocolsState) noProtocolsState.classList.add('hidden');

        tabsContainer.innerHTML = this.protocols.map(protocol => {
            const isActive = protocol.name === this.activeProtocol;
            const activeClass = isActive 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
            
            return `
                <button onclick="window.assetDetailManager.switchProtocolTab('${protocol.name}')" 
                        class="protocol-tab whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeClass}">
                    <i class="fas fa-cube mr-2"></i>
                    ${protocol.name}
                    <span class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary bg-primary/10 rounded-full">
                        ${protocol.steps.length}
                    </span>
                </button>
            `;
        }).join('');
    }

    renderActiveProtocolContent() {
        const protocolContent = document.getElementById('protocol-content');
        if (!protocolContent || !this.activeProtocol) return;

        const activeProtocolData = this.protocols.find(p => p.name === this.activeProtocol);
        if (!activeProtocolData) return;

        const steps = activeProtocolData.steps;

        protocolContent.innerHTML = `
            <div class="protocol-content-header flex items-center justify-between mb-6">
                <div>
                    <h4 class="text-lg font-semibold text-gray-900">${this.activeProtocol} Protocol</h4>
                    <p class="text-sm text-gray-500">${steps.length} step${steps.length !== 1 ? 's' : ''} configured</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="window.assetDetailManager.createApprovalStep('${this.activeProtocol}')" 
                            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <i class="fas fa-check mr-2"></i>
                        Add Approval Step
                    </button>
                    <button onclick="window.assetDetailManager.showCreateStepModal('${this.activeProtocol}')" 
                            class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-indigo-700">
                        <i class="fas fa-plus mr-2"></i>
                        Add Step
                    </button>
                </div>
            </div>

            <div class="protocol-steps">
                ${steps.length === 0 ? this.renderEmptyProtocolState() : this.renderProtocolSteps(steps)}
            </div>
        `;
    }

    renderProtocolSteps(steps) {
        return steps.map(step => this.createStepElementHTML(step)).join('');
    }

    renderEmptyProtocolState() {
        return `
            <div class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <i class="fas fa-list-ol text-gray-400 text-2xl mb-2"></i>
                <p class="text-sm text-gray-500 mb-4">No steps in this protocol yet</p>
                <div class="flex justify-center space-x-2">
                    <button onclick="window.assetDetailManager.createApprovalStep('${this.activeProtocol}')" 
                            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <i class="fas fa-check mr-2"></i>
                        Add Approval Step
                    </button>
                    <button onclick="window.assetDetailManager.showCreateStepModal('${this.activeProtocol}')" 
                            class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700">
                        <i class="fas fa-plus mr-2"></i>
                        Add Custom Step
                    </button>
                </div>
            </div>
        `;
    }

    switchProtocolTab(protocolName) {
        this.activeProtocol = protocolName;
        this.renderProtocolTabs();
        this.renderActiveProtocolContent();
        
        // Update URL state with new protocol
        this.updateURLState('steps', protocolName);
    }

    createStepElementHTML(step) {
        const div = document.createElement('div');
        div.className = 'step-card border border-gray-200 rounded-lg p-4 mb-4';

        const enabledBadge = step.enabled 
            ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Enabled</span>'
            : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Disabled</span>';

        div.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                        <div class="step-order-badge flex items-center justify-center w-8 h-8 rounded-full">
                            <span class="text-sm font-medium text-white">${step.stepOrder || step.order}</span>
                        </div>
                        <h4 class="text-lg font-medium text-gray-900">${step.title}</h4>
                        ${enabledBadge}
                    </div>
                    <p class="text-sm text-gray-600 mb-3">${step.description}</p>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span class="font-medium text-gray-500">Chain:</span>
                            <span class="ml-1 text-gray-900">${step.chain}</span>
                        </div>
                        <div>
                            <span class="font-medium text-gray-500">Protocol:</span>
                            <span class="ml-1 text-gray-900">${step.protocol || 'General'}</span>
                        </div>
                        <div>
                            <span class="font-medium text-gray-500">Contract:</span>
                            <span class="ml-1 text-gray-900 font-mono text-xs">${step.contractAddress || 'N/A'}</span>
                        </div>
                        <div>
                            <span class="font-medium text-gray-500">Function:</span>
                            <span class="ml-1 text-gray-900">${step.functionConfig.name}</span>
                        </div>
                    </div>
                </div>
                <div class="flex space-x-2 ml-4">
                    <button onclick="window.assetDetailManager.editStep('${step.id || step._id}')" class="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="window.assetDetailManager.deleteStep('${step.id || step._id}')" class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        return div.outerHTML;
    }

    async createApprovalStep(protocolName) {
        console.log('=== CREATE APPROVAL STEP DEBUG ===');
        console.log('currentAssetId:', this.currentAssetId);
        console.log('currentAsset:', this.currentAsset);
        console.log('protocolName:', protocolName);
        
        if (!this.currentAssetId || !this.currentAsset) {
            this.showToast('No asset selected', 'error');
            return;
        }

        if (!protocolName) {
            this.showToast('No protocol specified', 'error');
            return;
        }

        // Use the step creator modal with approval function pre-filled
        if (window.stepCreator) {
            // Show the modal
            window.stepCreator.showModal(this.currentAssetId, this.currentAsset, this.currentSteps, protocolName);
            
            // Pre-fill the function configuration for approval
            setTimeout(() => {
                // Set function name to 'approve' which will trigger the approval fields to show
                const functionNameInput = document.getElementById('function-name');
                if (functionNameInput) {
                    functionNameInput.value = 'approve';
                    functionNameInput.dispatchEvent(new Event('input')); // Trigger the approval fields visibility
                }

                // Pre-fill title and description
                const titleInput = document.getElementById('step-title');
                const descriptionInput = document.getElementById('step-description');
                const approvalFromInput = document.getElementById('step-approval-from');
                
                if (titleInput) {
                    titleInput.value = `Approve ${this.currentAsset.token}`;
                }
                if (descriptionInput) {
                    descriptionInput.value = `Approve ${this.currentAsset.token} tokens for spending by the ${protocolName} protocol contract`;
                }
                if (approvalFromInput) {
                    approvalFromInput.value = this.currentAsset.address;
                }

                // Pre-fill function inputs
                if (window.stepCreator.functionInputs) {
                    window.stepCreator.functionInputs = [
                        { id: Date.now(), name: 'spender', type: 'address' },
                        { id: Date.now() + 1, name: 'amount', type: 'uint256' }
                    ];
                    window.stepCreator.renderFunctionInputs();
                }

                // Pre-fill function outputs
                if (window.stepCreator.functionOutputs) {
                    window.stepCreator.functionOutputs = [
                        { id: Date.now() + 100, name: '', type: 'bool' }
                    ];
                    window.stepCreator.renderFunctionOutputs();
                }
            }, 100); // Small delay to ensure modal is rendered
        } else {
            this.showToast('Step creator not available', 'error');
        }
    }

    // Test method to debug current state
    debugCurrentState() {
        console.log('=== DEBUG CURRENT STATE ===');
        console.log('currentAssetId:', this.currentAssetId);
        console.log('currentAsset:', this.currentAsset);
        console.log('currentSteps:', this.currentSteps);
        
        alert(`Current State:
currentAssetId: ${this.currentAssetId}
currentAsset: ${this.currentAsset ? 'loaded' : 'null'}
currentSteps count: ${this.currentSteps?.length || 0}`);
    }

    async editStep(stepId) {
        if (!this.currentAssetId || !this.currentAsset) {
            this.showToast('No asset selected', 'error');
            return;
        }

        // Use the step creator modal for editing
        if (window.stepCreator) {
            window.stepCreator.showEditModal(this.currentAssetId, this.currentAsset, this.currentSteps, stepId);
        } else {
            this.showToast('Step editor not available', 'error');
        }
    }

    async deleteStep(stepId) {
        if (!confirm('Are you sure you want to delete this step?')) {
            return;
        }

        try {
            await apiService.deleteStep(stepId);
            this.showToast('Step deleted successfully', 'success');
            
            // Reload steps
            if (this.currentAssetId) {
                await this.loadSteps(this.currentAssetId);
            }

        } catch (error) {
            console.error('Failed to delete step:', error);
            this.showToast('Failed to delete step', 'error');
        }
    }

    showCreateStepModal(protocolName) {
        if (!this.currentAssetId || !this.currentAsset) {
            this.showToast('No asset selected', 'error');
            return;
        }

        // Use the step creator modal
        if (window.stepCreator) {
            window.stepCreator.showModal(this.currentAssetId, this.currentAsset, this.currentSteps, protocolName);
        } else {
            this.showToast('Step creator not available', 'error');
        }
    }

    // Protocol management methods
    showAddProtocolModal() {
        const modal = document.getElementById('add-protocol-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Add entrance animation
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                const content = modal.querySelector('.relative');
                if (content) {
                    content.classList.remove('scale-95', 'translate-y-4');
                }
            }, 10);
            
            // Focus on first input for better UX
            setTimeout(() => {
                const firstInput = document.getElementById('protocol-name');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 300);
        }
    }

    hideAddProtocolModal() {
        const modal = document.getElementById('add-protocol-modal');
        if (modal) {
            // Add exit animation
            modal.classList.add('opacity-0');
            const content = modal.querySelector('.relative');
            if (content) {
                content.classList.add('scale-95', 'translate-y-4');
            }
            
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('opacity-0');
                if (content) {
                    content.classList.remove('scale-95', 'translate-y-4');
                }
                // Clear form
                const form = document.getElementById('add-protocol-form');
                if (form) form.reset();
            }, 200);
        }
    }

    async handleAddProtocol() {
        try {
            const protocolName = document.getElementById('protocol-name').value.trim();
            const protocolDescription = document.getElementById('protocol-description').value.trim();

            if (!protocolName) {
                this.showToast('Protocol name is required', 'error');
                return;
            }

            // Check if protocol already exists
            const existingProtocol = this.protocols.find(p => p.name.toLowerCase() === protocolName.toLowerCase());
            if (existingProtocol) {
                this.showToast(`Protocol "${protocolName}" already exists`, 'error');
                return;
            }

            // Add new protocol to the list
            this.protocols.push({
                name: protocolName,
                description: protocolDescription,
                steps: []
            });

            // Set as active protocol
            this.activeProtocol = protocolName;

            // Re-render tabs and content
            this.renderProtocolTabs();
            this.renderActiveProtocolContent();

            this.hideAddProtocolModal();
            this.showToast(`Protocol "${protocolName}" created successfully`, 'success');

            // Update URL to reflect new active protocol
            this.updateURLState('steps', protocolName);

        } catch (error) {
            console.error('Failed to add protocol:', error);
            this.showToast('Failed to add protocol', 'error');
        }
    }

    // Asset editing methods
    editAsset() {
        if (!this.currentAsset) {
            this.showToast('No asset loaded', 'error');
            return;
        }

        this.populateEditChainDropdown();
        this.populateEditForm(this.currentAsset);
        this.showEditModal();
    }

    populateEditChainDropdown() {
        const editChainSelect = document.getElementById('edit-chain');
        if (!editChainSelect) return;

        // Clear existing options (keep the "Select Blockchain" option)
        const selectOption = editChainSelect.querySelector('option[value=""]');
        editChainSelect.innerHTML = '';
        if (selectOption) {
            editChainSelect.appendChild(selectOption);
        } else {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select Blockchain';
            editChainSelect.appendChild(defaultOption);
        }

        // Add chain options
        const enabledChains = this.chains.filter(chain => chain.enabled);
        enabledChains.forEach(chain => {
            const option = document.createElement('option');
            option.value = chain.shortName;
            option.textContent = `${chain.name} (${chain.shortName})`;
            editChainSelect.appendChild(option);
        });
    }

    populateEditForm(asset) {
        // Populate basic fields
        const fields = [
            'token', 'chain', 'address', 'icon', 'chainId', 'decimals', 
            'maxDecimalsShow', 'usdPrice', 'protocol', 'underlyingAsset', 
            'withdrawContract', 'withdrawUri', 'maturity'
        ];

        fields.forEach(field => {
            const element = document.getElementById(`edit-${field}`);
            if (element && asset[field] !== undefined) {
                element.value = asset[field];
            }
        });

        // Populate checkboxes
        const checkboxes = ['yieldBearingToken', 'enabled'];
        checkboxes.forEach(field => {
            const element = document.getElementById(`edit-${field}`);
            if (element) {
                element.checked = asset[field] || false;
            }
        });

        // Handle lock yield section
        const hasLockYield = asset.lockYield && Object.keys(asset.lockYield).length > 0;
        const hasLockYieldCheckbox = document.getElementById('edit-hasLockYield');
        const lockYieldSection = document.getElementById('edit-lockYieldSection');
        
        if (hasLockYieldCheckbox) {
            hasLockYieldCheckbox.checked = hasLockYield;
        }
        
        if (lockYieldSection) {
            if (hasLockYield && asset.lockYield) {
                lockYieldSection.classList.remove('hidden');
                
                // Populate lock yield fields
                const lockYieldFields = [
                    'expirationDate', 'protocolName', 'ytAddress', 'ptAddress',
                    'swapAddress', 'ytMarketAddress', 'ytDecimals', 'ptDecimals'
                ];

                lockYieldFields.forEach(field => {
                    const element = document.getElementById(`edit-lockYield${field.charAt(0).toUpperCase() + field.slice(1)}`);
                    if (element && asset.lockYield.protocol && asset.lockYield.protocol[field] !== undefined) {
                        element.value = asset.lockYield.protocol[field];
                    } else if (element && asset.lockYield[field] !== undefined) {
                        element.value = asset.lockYield[field];
                    }
                });

                const swapCheckbox = document.getElementById('edit-lockYieldSwap');
                if (swapCheckbox && asset.lockYield.protocol) {
                    swapCheckbox.checked = asset.lockYield.protocol.swap || false;
                }
            } else {
                lockYieldSection.classList.add('hidden');
            }
        }
    }

    async handleUpdateAsset() {
        try {
            if (!this.currentAssetId) {
                this.showToast('No asset selected for editing', 'error');
                return;
            }

            const formData = this.getEditFormData();
            
            // Validate required fields
            if (!formData.token || !formData.chain || !formData.address) {
                this.showToast('Please fill in all required fields', 'error');
                return;
            }

            await apiService.updateAsset(this.currentAssetId, formData);
            this.showToast('Asset updated successfully', 'success');
            this.hideEditModal();
            
            // Reload the asset
            await this.loadAsset(this.currentAssetId);
            
        } catch (error) {
            console.error('Failed to update asset:', error);
            this.showToast('Failed to update asset', 'error');
        }
    }

    getEditFormData() {
        const formData = {
            token: document.getElementById('edit-token').value,
            chain: document.getElementById('edit-chain').value,
            address: document.getElementById('edit-address').value,
            icon: document.getElementById('edit-icon').value,
            chainId: parseInt(document.getElementById('edit-chainId').value),
            decimals: parseInt(document.getElementById('edit-decimals').value),
            maxDecimalsShow: parseInt(document.getElementById('edit-maxDecimalsShow').value),
            usdPrice: parseFloat(document.getElementById('edit-usdPrice').value),
            protocol: document.getElementById('edit-protocol').value,
            underlyingAsset: document.getElementById('edit-underlyingAsset').value,
            withdrawContract: document.getElementById('edit-withdrawContract').value,
            withdrawUri: document.getElementById('edit-withdrawUri').value,
            maturity: document.getElementById('edit-maturity').value,
            yieldBearingToken: document.getElementById('edit-yieldBearingToken').checked,
            enabled: document.getElementById('edit-enabled').checked
        };

        // Handle hasLockYield checkbox and lockYield data
        const hasLockYield = document.getElementById('edit-hasLockYield').checked;
        if (hasLockYield) {
            formData.lockYield = {
                expirationDate: document.getElementById('edit-lockYieldExpirationDate').value,
                protocol: {
                    name: document.getElementById('edit-lockYieldProtocolName').value,
                    swap: document.getElementById('edit-lockYieldSwap').checked,
                    ytAddress: document.getElementById('edit-lockYieldYtAddress').value,
                    ptAddress: document.getElementById('edit-lockYieldPtAddress').value,
                    swapAddress: document.getElementById('edit-lockYieldSwapAddress').value,
                    ytMarketAddress: document.getElementById('edit-lockYieldYtMarketAddress').value,
                    ytDecimals: parseInt(document.getElementById('edit-lockYieldYtDecimals').value) || 18,
                    ptDecimals: parseInt(document.getElementById('edit-lockYieldPtDecimals').value) || 18
                }
            };
        } else {
            formData.lockYield = null;
        }

        return formData;
    }

    async deleteAsset() {
        if (!confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
            return;
        }

        try {
            await apiService.deleteAsset(this.currentAssetId);
            this.showToast('Asset deleted successfully', 'success');
            
            // Redirect to assets list
            window.location.href = '/backoffice/assets';
            
        } catch (error) {
            console.error('Failed to delete asset:', error);
            this.showToast('Failed to delete asset', 'error');
        }
    }

    // UI Helper Methods
    showMainContent() {
        const loadingState = document.getElementById('loadingState');
        const assetNotFound = document.getElementById('assetNotFound');
        const mainContent = document.getElementById('mainContent');

        if (loadingState) loadingState.classList.add('hidden');
        if (assetNotFound) assetNotFound.classList.add('hidden');
        if (mainContent) mainContent.classList.remove('hidden');
    }

    showAssetNotFound() {
        const loadingState = document.getElementById('loadingState');
        const assetNotFound = document.getElementById('assetNotFound');
        const mainContent = document.getElementById('mainContent');

        if (loadingState) loadingState.classList.add('hidden');
        if (mainContent) mainContent.classList.add('hidden');
        if (assetNotFound) assetNotFound.classList.remove('hidden');
    }

    showEditModal() {
        this.populateEditForm(this.currentAsset);
        const modal = document.getElementById('edit-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Add entrance animation
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                const content = modal.querySelector('.relative');
                if (content) {
                    content.classList.remove('scale-95', 'translate-y-4');
                }
            }, 10);
            
            // Focus on first input for better UX
            setTimeout(() => {
                const firstInput = document.getElementById('edit-token');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 300);
        }
    }

    hideEditModal() {
        const modal = document.getElementById('edit-modal');
        if (modal) {
            // Add exit animation
            modal.classList.add('opacity-0');
            const content = modal.querySelector('.relative');
            if (content) {
                content.classList.add('scale-95', 'translate-y-4');
            }
            
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('opacity-0');
                if (content) {
                    content.classList.remove('scale-95', 'translate-y-4');
                }
            }, 200);
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        const bgColor = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500';
        
        toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg mb-4 transition-all duration-300 transform translate-x-full`;
        toast.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        container.appendChild(toast);

        // Trigger animation
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('translate-x-full');
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    restoreStateFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        const protocol = urlParams.get('protocol');

        console.log('Restoring state from URL - tab:', tab, 'protocol:', protocol);

        // Set active protocol if specified
        if (protocol) {
            this.activeProtocol = decodeURIComponent(protocol);
        }

        // Switch to the specified tab (defaults to details)
        if (tab === 'steps') {
            // Need to wait for steps to load before switching
            setTimeout(() => {
                this.switchTab('steps');
            }, 100);
        } else {
            this.switchTab('details');
        }
    }

    updateURLState(tab = null, protocol = null) {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Update tab parameter
        if (tab) {
            urlParams.set('tab', tab);
        }
        
        // Update protocol parameter
        if (protocol && tab === 'steps') {
            urlParams.set('protocol', encodeURIComponent(protocol));
        } else if (tab === 'details') {
            // Remove protocol parameter when switching to details tab
            urlParams.delete('protocol');
        }

        // Update URL without page reload
        const newURL = `${window.location.pathname}?${urlParams.toString()}`;
        history.replaceState(null, '', newURL);
        
        console.log('Updated URL state:', newURL);
    }

    async loadChains() {
        try {
            const response = await window.apiService.getChains();
            this.chains = response.chains || response || [];
            console.log('Loaded chains for asset detail:', this.chains);
            
            // If no chains are loaded, use a minimal fallback
            if (this.chains.length === 0) {
                console.warn('No chains loaded, using fallback chain data');
                this.chains = [
                    { chainId: 1, name: 'Ethereum', shortName: 'ETH', enabled: true },
                    { chainId: 56, name: 'Binance Smart Chain', shortName: 'BSC', enabled: true },
                    { chainId: 137, name: 'Polygon', shortName: 'POLYGON', enabled: true },
                    { chainId: 42161, name: 'Arbitrum One', shortName: 'ARB', enabled: true }
                ];
            }
        } catch (error) {
            console.error('Error loading chains:', error);
            // Use fallback chain data if API fails
            this.chains = [
                { chainId: 1, name: 'Ethereum', shortName: 'ETH', enabled: true },
                { chainId: 56, name: 'Binance Smart Chain', shortName: 'BSC', enabled: true },
                { chainId: 137, name: 'Polygon', shortName: 'POLYGON', enabled: true },
                { chainId: 42161, name: 'Arbitrum One', shortName: 'ARB', enabled: true }
            ];
        }
    }
}

// Export as global
window.assetDetailManager = new AssetDetailManager(); 