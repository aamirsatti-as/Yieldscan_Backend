// Asset Manager - Handles asset-related business logic
class AssetManager {
    constructor() {
        this.currentAssets = [];
        this.filters = {};
        this.debounceTimer = null;
        this.currentTab = 'details'; // Track current tab
        this.currentSteps = []; // Track steps for current asset
        this.currentAssetId = null; // Track currently viewed asset ID as backup
    }

    async initialize() {
        this.setupEventListeners();
        await this.loadAssets();
    }

    setupEventListeners() {
        // Search input with debounce
        uiService.elements.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.handleFilterChange();
            }, 300);
        });

        // Filter dropdowns
        ['chainFilter', 'protocolFilter', 'yieldFilter', 'enabledFilter'].forEach(filterId => {
            const element = uiService.elements[filterId];
            if (element) {
                element.addEventListener('change', () => this.handleFilterChange());
            }
        });

        // Lock yield checkbox handlers
        this.setupLockYieldToggle('hasLockYield', 'lockYieldSection');
        this.setupLockYieldToggle('edit-hasLockYield', 'edit-lockYieldSection');

        // Form submission handlers
        this.setupFormHandlers();
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
        // Create form handler
        const createForm = document.getElementById('create-asset-form');
        if (createForm) {
            createForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleCreateAsset();
            });
        }

        // Edit form handler
        const editForm = document.getElementById('edit-asset-form');
        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleUpdateAsset();
            });
        }

        // Create step form handler
        const createStepForm = document.getElementById('create-step-form');
        if (createStepForm) {
            createStepForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleCreateStep();
            });
        }
    }

    async loadAssets() {
        try {
            uiService.showLoading();
            
            const filters = uiService.getFilterValues();
            const assets = await apiService.getAssets(filters);
            
            console.log('Loaded assets:', assets);
            console.log('First asset:', assets[0]);
            
            this.currentAssets = assets;
            uiService.hideLoading();
            uiService.renderAssets(assets);
            
        } catch (error) {
            console.error('Failed to load assets:', error);
            uiService.hideLoading();
            uiService.showError('Failed to load assets. Please try again.');
        }
    }

    async handleFilterChange() {
        await this.loadAssets();
    }

    async handleCreateAsset() {
        try {
            const formData = uiService.getCreateFormData();
            
            // Validate required fields
            if (!formData.token || !formData.chain || !formData.address) {
                uiService.showToast('Please fill in all required fields', 'error');
                return;
            }

            await apiService.createAsset(formData);
            uiService.showToast('Asset created successfully', 'success');
            uiService.hideCreateModal();
            await this.loadAssets();
            
        } catch (error) {
            console.error('Failed to create asset:', error);
            uiService.showToast('Failed to create asset', 'error');
        }
    }

    async handleUpdateAsset() {
        try {
            if (!uiService.currentEditAssetId) {
                uiService.showToast('No asset selected for editing', 'error');
                return;
            }

            const formData = uiService.getEditFormData();
            
            // Validate required fields
            if (!formData.token || !formData.chain || !formData.address) {
                uiService.showToast('Please fill in all required fields', 'error');
                return;
            }

            await apiService.updateAsset(uiService.currentEditAssetId, formData);
            uiService.showToast('Asset updated successfully', 'success');
            
            // Update the current asset in memory
            const assetIndex = this.currentAssets.findIndex(a => a._id === uiService.currentEditAssetId);
            if (assetIndex !== -1) {
                this.currentAssets[assetIndex] = { ...this.currentAssets[assetIndex], ...formData };
            }
            
            // If we're on the detail page, refresh it
            if (uiService.currentViewAssetId === uiService.currentEditAssetId) {
                const updatedAsset = this.getAssetById(uiService.currentEditAssetId);
                if (updatedAsset) {
                    uiService.populateAssetDetailPage(updatedAsset);
                }
            }
            
        } catch (error) {
            console.error('Failed to update asset:', error);
            uiService.showToast('Failed to update asset', 'error');
        }
    }

    async viewAsset(assetId) {
        try {
            console.log('=== VIEW ASSET DEBUG ===');
            console.log('Viewing asset with ID:', assetId);
            console.log('Current assets:', this.currentAssets);
            
            // Get the current asset data
            let asset = this.getAssetById(assetId);
            console.log('Found asset:', asset);
            
            if (!asset) {
                // If asset not found in current list, try to fetch it from API
                console.log('Asset not found in current list, fetching from API...');
                try {
                    asset = await apiService.getAsset(assetId);
                    console.log('Fetched asset from API:', asset);
                } catch (fetchError) {
                    console.error('Failed to fetch asset from API:', fetchError);
                    uiService.showToast('Asset not found', 'error');
                    return;
                }
            }

            if (!asset) {
                uiService.showToast('Asset not found', 'error');
                return;
            }

            // Update currentAssetId BEFORE showing the detail page
            this.currentAssetId = asset.id || asset._id;
            console.log('Set this.currentAssetId to:', this.currentAssetId);

            // Show asset detail page
            uiService.showAssetDetailPage(asset);
            console.log('After showing asset detail page, uiService.currentViewAssetId:', uiService.currentViewAssetId);
            
            // Also explicitly set window.uiService.currentViewAssetId as backup
            if (window.uiService) {
                window.uiService.currentViewAssetId = asset.id || asset._id;
                console.log('Explicitly set window.uiService.currentViewAssetId to:', window.uiService.currentViewAssetId);
            }
            
            // Switch to details tab by default
            this.switchTab('details');
            
        } catch (error) {
            console.error('Failed to view asset:', error);
            uiService.showToast('Failed to open asset details', 'error');
        }
    }

    goBackToAssetsList() {
        uiService.showAssetsListPage();
        this.currentAssetId = null; // Reset when going back
    }

    async deleteAsset(assetId) {
        if (!confirm('Are you sure you want to delete this asset?')) {
            return;
        }

        try {
            await apiService.deleteAsset(assetId);
            uiService.showToast('Asset deleted successfully', 'success');
            
            // If we're viewing this asset, go back to list
            if (uiService.currentViewAssetId === assetId) {
                this.goBackToAssetsList();
            }
            
            await this.loadAssets(); // Refresh the list
        } catch (error) {
            console.error('Failed to delete asset:', error);
            uiService.showToast('Failed to delete asset', 'error');
        }
    }

    // Utility methods
    getAssetById(assetId) {
        console.log('Looking for asset ID:', assetId);
        console.log('Available asset IDs:', this.currentAssets.map(a => a.id || a._id));
        
        // Try exact match with 'id' field first (API returns 'id')
        let found = this.currentAssets.find(asset => asset.id === assetId);
        
        // If not found, try '_id' field
        if (!found) {
            found = this.currentAssets.find(asset => asset._id === assetId);
        }
        
        // If still not found, try string conversion (in case of ObjectId differences)
        if (!found) {
            found = this.currentAssets.find(asset => String(asset.id || asset._id) === String(assetId));
        }
        
        console.log('Found asset:', found);
        return found;
    }

    refreshAssets() {
        return this.loadAssets();
    }

    showCreateModal() {
        uiService.showCreateModal();
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
            // Load steps when switching to steps tab - use fallback logic
            const currentAssetId = uiService.currentViewAssetId || this.currentAssetId;
            if (currentAssetId) {
                this.loadSteps(currentAssetId);
            }
        }
    }

    // Step management methods
    async loadSteps(assetId) {
        try {
            const stepsContainer = document.getElementById('steps-container');
            const stepsLoading = document.getElementById('steps-loading');
            const stepsEmpty = document.getElementById('steps-empty-state');

            // Show loading
            if (stepsContainer) stepsContainer.classList.add('hidden');
            if (stepsEmpty) stepsEmpty.classList.add('hidden');
            if (stepsLoading) stepsLoading.classList.remove('hidden');

            const steps = await apiService.getStepsByAssetId(assetId);
            this.currentSteps = steps;

            // Hide loading
            if (stepsLoading) stepsLoading.classList.add('hidden');

            if (steps.length === 0) {
                if (stepsEmpty) stepsEmpty.classList.remove('hidden');
            } else {
                this.renderSteps(steps);
                if (stepsContainer) stepsContainer.classList.remove('hidden');
            }

        } catch (error) {
            console.error('Failed to load steps:', error);
            if (stepsLoading) stepsLoading.classList.add('hidden');
            uiService.showToast('Failed to load steps', 'error');
        }
    }

    renderSteps(steps) {
        const container = document.getElementById('steps-container');
        if (!container) return;

        container.innerHTML = '';

        steps.forEach(step => {
            const stepElement = this.createStepElement(step);
            container.appendChild(stepElement);
        });
    }

    createStepElement(step) {
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
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span class="font-medium text-gray-500">Chain:</span>
                            <span class="ml-1 text-gray-900">${step.chain}</span>
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
                    <button onclick="window.assetManager.editStep('${step.id || step._id}')" class="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="window.assetManager.deleteStep('${step.id || step._id}')" class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        return div;
    }

    async createApprovalStep() {
        console.log('=== CREATE APPROVAL STEP DEBUG ===');
        console.log('uiService:', uiService);
        console.log('window.uiService:', window.uiService);
        console.log('uiService.currentViewAssetId:', uiService?.currentViewAssetId);
        console.log('window.uiService.currentViewAssetId:', window.uiService?.currentViewAssetId);
        console.log('this.currentAssetId:', this.currentAssetId);
        
        // Use multiple fallbacks to get the current asset ID
        const currentAssetId = window.uiService?.currentViewAssetId || 
                               uiService?.currentViewAssetId || 
                               this.currentAssetId;
        console.log('Final currentAssetId:', currentAssetId);
        
        if (!currentAssetId) {
            alert('No currentAssetId found!');
            uiService.showToast('No asset selected', 'error');
            return;
        }

        try {
            const asset = this.getAssetById(currentAssetId);
            console.log('Found asset for approval step:', asset);
            
            if (!asset) {
                alert('Asset not found in currentAssets list!');
                uiService.showToast('Asset not found', 'error');
                return;
            }

            // Get the next step order
            const nextOrder = this.currentSteps.length > 0 
                ? Math.max(...this.currentSteps.map(s => s.stepOrder || s.order)) + 1 
                : 1;

            console.log('Creating approval step with order:', nextOrder);

            const approvalStepData = {
                assetId: currentAssetId,
                stepOrder: nextOrder,
                title: `Approve ${asset.token}`,
                description: `Approve ${asset.token} tokens for spending by the protocol contract`,
                chain: asset.chain,
                contractAddress: asset.address, // Use the token's own contract address
                functionConfig: {
                    name: 'approve',
                    inputs: [
                        {
                            name: 'spender',
                            type: 'address'
                        },
                        {
                            name: 'amount',
                            type: 'uint256'
                        }
                    ],
                    outputs: [
                        {
                            name: '',
                            type: 'bool'
                        }
                    ],
                    stateMutability: 'nonpayable',
                    type: 'function'
                },
                enabled: true
            };

            console.log('Approval step data being sent:', JSON.stringify(approvalStepData, null, 2));

            // Add try-catch specifically for the API call
            try {
                const response = await apiService.createStep(approvalStepData);
                console.log('API response:', response);
                uiService.showToast('Approval step created successfully', 'success');
                
                // Reload steps
                await this.loadSteps(currentAssetId);
            } catch (apiError) {
                console.error('API call failed:', apiError);
                console.error('Error details:', apiError.message);
                
                // Try to parse the error response
                if (apiError.message && apiError.message.includes('HTTP error')) {
                    console.log('This looks like an HTTP error, checking response details...');
                }
                
                uiService.showToast(`API Error: ${apiError.message}`, 'error');
                return;
            }

        } catch (error) {
            console.error('Failed to create approval step:', error);
            uiService.showToast('Failed to create approval step', 'error');
        }
    }

    // Test method to debug current state
    debugCurrentState() {
        console.log('=== DEBUG CURRENT STATE ===');
        console.log('this.currentAssetId:', this.currentAssetId);
        console.log('uiService.currentViewAssetId:', uiService?.currentViewAssetId);
        console.log('window.uiService.currentViewAssetId:', window.uiService?.currentViewAssetId);
        console.log('this.currentAssets:', this.currentAssets);
        alert(`Current State:
this.currentAssetId: ${this.currentAssetId}
uiService.currentViewAssetId: ${uiService?.currentViewAssetId}
window.uiService.currentViewAssetId: ${window.uiService?.currentViewAssetId}
currentAssets count: ${this.currentAssets?.length}`);
    }

    showCreateStepModal() {
        const modal = document.getElementById('create-step-modal');
        if (modal) {
            modal.classList.remove('hidden');
            // Clear form
            this.clearCreateStepForm();
        }
    }

    hideCreateStepModal() {
        const modal = document.getElementById('create-step-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    clearCreateStepForm() {
        const form = document.getElementById('create-step-form');
        if (form) {
            form.reset();
            // Clear dynamic function inputs/outputs
            document.getElementById('function-inputs-container').innerHTML = '';
            document.getElementById('function-outputs-container').innerHTML = '';
        }
    }

    async handleCreateStep() {
        try {
            if (!uiService.currentViewAssetId) {
                uiService.showToast('No asset selected', 'error');
                return;
            }

            const stepData = this.getCreateStepFormData();
            stepData.assetId = uiService.currentViewAssetId;

            await apiService.createStep(stepData);
            uiService.showToast('Step created successfully', 'success');
            this.hideCreateStepModal();
            
            // Reload steps
            await this.loadSteps(uiService.currentViewAssetId);

        } catch (error) {
            console.error('Failed to create step:', error);
            uiService.showToast('Failed to create step', 'error');
        }
    }

    getCreateStepFormData() {
        const functionInputs = this.getFunctionInputsFromForm();
        const functionOutputs = this.getFunctionOutputsFromForm();

        return {
            stepOrder: parseInt(document.getElementById('step-order').value),
            title: document.getElementById('step-title').value,
            description: document.getElementById('step-description').value,
            chain: document.getElementById('step-chain').value,
            contractAddress: document.getElementById('step-contractAddress').value,
            functionConfig: {
                name: document.getElementById('function-name').value,
                inputs: functionInputs,
                outputs: functionOutputs,
                stateMutability: document.getElementById('function-mutability').value,
                type: document.getElementById('function-type').value
            },
            enabled: document.getElementById('step-enabled').checked
        };
    }

    getFunctionInputsFromForm() {
        // This will be implemented when we add the dynamic input/output functionality
        return [];
    }

    getFunctionOutputsFromForm() {
        // This will be implemented when we add the dynamic input/output functionality
        return [];
    }

    addFunctionInput() {
        // Placeholder for dynamic function input addition
        console.log('Add function input');
    }

    addFunctionOutput() {
        // Placeholder for dynamic function output addition
        console.log('Add function output');
    }

    async editStep(stepId) {
        // Check if we have the current asset context
        const currentAssetId = uiService?.currentViewAssetId;
        if (!currentAssetId) {
            uiService.showToast('No asset selected', 'error');
            return;
        }

        // Get current asset
        const currentAsset = this.getAssetById(currentAssetId);
        if (!currentAsset) {
            uiService.showToast('Asset not found', 'error');
            return;
        }

        // Use the step creator modal for editing if available
        if (window.stepCreator) {
            window.stepCreator.showEditModal(currentAssetId, currentAsset, this.currentSteps, stepId);
        } else {
            uiService.showToast('Step editor not available', 'error');
        }
    }

    async deleteStep(stepId) {
        if (!confirm('Are you sure you want to delete this step?')) {
            return;
        }

        try {
            await apiService.deleteStep(stepId);
            uiService.showToast('Step deleted successfully', 'success');
            
            // Reload steps
            if (uiService.currentViewAssetId) {
                await this.loadSteps(uiService.currentViewAssetId);
            }

        } catch (error) {
            console.error('Failed to delete step:', error);
            uiService.showToast('Failed to delete step', 'error');
        }
    }
}

// Export as global
window.assetManager = new AssetManager(); 