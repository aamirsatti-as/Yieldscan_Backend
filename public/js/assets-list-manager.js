// Assets List Manager - Handles the assets list page functionality
class AssetsListManager {
    constructor() {
        this.currentAssets = [];
        this.filters = {};
        this.debounceTimer = null;
        this.assets = [];
        this.chains = []; // Store available chains
        this.protocols = []; // Store selected chain protocols
        this.currentAsset = null;
        this.setupEventListeners();
    }

    async initialize() {
        try {
            await this.loadChains();
            await this.loadAssets();
            this.populateChainFilter();
            this.populateChainOptions();
        } catch (error) {
            console.error('Failed to initialize:', error);
            this.showToast('Failed to load data', 'error');
        }
    }

    setupEventListeners() {
        // Search input with debounce
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => {
                    this.handleFilterChange();
                }, 300);
            });
        }

        // Filter dropdowns
        ['chainFilter', 'protocolFilter', 'yieldFilter', 'enabledFilter'].forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', () => this.handleFilterChange());
            }
        });

        const element = document.getElementById('chain');
        if (element) {
            element.addEventListener('change', () => this.getProtocolSupportedChains());
        }

        // Lock yield checkbox handlers
        this.setupLockYieldToggle('hasLockYield', 'lockYieldSection');

        // Form submission handlers
        this.setupFormHandlers();
    }

    getProtocolSupportedChains() {
        const selectedChainId = document.getElementById('chain').value;
        if (selectedChainId) {
            apiService.getProtocolsByChainId(selectedChainId)
                .then(protocols => {
                    this.protocols = protocols;
                    this.populateProtocolOptions();
                })
                .catch(error => {
                    console.error('Failed to load protocols:', error);
                });
        } else {
            this.protocols = [];
            this.populateProtocolOptions();
        }
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
    }

    async loadAssets() {
        try {
            this.showLoading();

            const filters = this.getFilterValues();
            const assets = await apiService.getAssets(filters);

            console.log('Loaded assets:', assets);

            this.currentAssets = assets;
            this.hideLoading();
            this.renderAssets(assets);

        } catch (error) {
            console.error('Failed to load assets:', error);
            this.hideLoading();
            this.showToast('Failed to load assets. Please try again.', 'error');
        }
    }

    async handleFilterChange() {
        await this.loadAssets();
    }

    async handleCreateAsset() {
        try {
            const formData = this.getCreateFormData();

            // Validate required fields
            if (!formData.token || !formData.chain || !formData.address) {
                this.showToast('Please fill in all required fields', 'error');
                return;
            }

            await apiService.createAsset(formData);
            this.showToast('Asset created successfully', 'success');
            this.hideCreateModal();
            await this.loadAssets();

        } catch (error) {
            console.error('Failed to create asset:', error);
            this.showToast('Failed to create asset', 'error');
        }
    }

    getFilterValues() {
        return {
            search: document.getElementById('searchInput')?.value || '',
            chain: document.getElementById('chainFilter')?.value || '',
            protocol: document.getElementById('protocolFilter')?.value || '',
            yieldBearing: document.getElementById('yieldFilter')?.value || '',
            enabled: document.getElementById('enabledFilter')?.value || ''
        };
    }

    getCreateFormData() {
        const formData = {
            token: document.getElementById('token').value,
            chain: document.getElementById('chain').value,
            address: document.getElementById('address').value,
            icon: document.getElementById('icon').value,
            chainId: parseInt(document.getElementById('chainId').value),
            decimals: parseInt(document.getElementById('decimals').value),
            maxDecimalsShow: parseInt(document.getElementById('maxDecimalsShow').value),
            usdPrice: parseFloat(document.getElementById('usdPrice').value),
            protocol: document.getElementById('protocol').value,
            underlyingAsset: document.getElementById('underlyingAsset').value,
            withdrawContract: document.getElementById('withdrawContract').value,
            withdrawUri: document.getElementById('withdrawUri').value,
            maturity: document.getElementById('maturity').value,
            yieldBearingToken: document.getElementById('yieldBearingToken').checked,
            enabled: document.getElementById('enabled').checked
        };

        // Handle hasLockYield checkbox and lockYield data
        const hasLockYield = document.getElementById('hasLockYield').checked;
        if (hasLockYield) {
            formData.lockYield = {
                expirationDate: document.getElementById('lockYieldExpirationDate').value,
                protocol: {
                    name: document.getElementById('lockYieldProtocolName').value,
                    swap: document.getElementById('lockYieldSwap').checked,
                    ytAddress: document.getElementById('lockYieldYtAddress').value,
                    ptAddress: document.getElementById('lockYieldPtAddress').value,
                    swapAddress: document.getElementById('lockYieldSwapAddress').value,
                    ytMarketAddress: document.getElementById('lockYieldYtMarketAddress').value,
                    ytDecimals: parseInt(document.getElementById('lockYieldYtDecimals').value) || 18,
                    ptDecimals: parseInt(document.getElementById('lockYieldPtDecimals').value) || 18
                }
            };
        } else {
            formData.lockYield = null;
        }

        return formData;
    }

    renderAssets(assets) {
        const tableBody = document.getElementById('assetsTableBody');
        const table = document.getElementById('assetsTable');
        const emptyState = document.getElementById('emptyState');

        if (!tableBody || !table || !emptyState) return;

        tableBody.innerHTML = '';

        if (assets.length === 0) {
            table.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        table.classList.remove('hidden');

        // Split assets into yield-bearing and non-yield-bearing
        const yieldBearingAssets = assets.filter(asset => asset.yieldBearingToken === true);
        const nonYieldBearingAssets = assets.filter(asset => asset.yieldBearingToken !== true);

        // Sort each group: enabled first, then disabled
        const sortAssetsByStatus = (assetArray) => {
            return assetArray.sort((a, b) => {
                // Sort by enabled status (enabled first)
                if (a.enabled !== b.enabled) {
                    return b.enabled - a.enabled; // true (1) comes before false (0)
                }
                // If same status, sort alphabetically by token name
                return (a.token || '').localeCompare(b.token || '');
            });
        };

        const sortedYieldBearing = sortAssetsByStatus([...yieldBearingAssets]);
        const sortedNonYieldBearing = sortAssetsByStatus([...nonYieldBearingAssets]);

        // Render non-yield-bearing assets section FIRST
        if (sortedNonYieldBearing.length > 0) {
            const nonYieldBearingHeader = this.createSectionHeader('Standard Assets', sortedNonYieldBearing.length, 'bg-gray-100 text-gray-800');
            tableBody.appendChild(nonYieldBearingHeader);

            sortedNonYieldBearing.forEach(asset => {
                const row = this.createAssetRow(asset, 'standard-section');
                tableBody.appendChild(row);
            });
        }

        // Render yield-bearing assets section SECOND
        if (sortedYieldBearing.length > 0) {
            const yieldBearingHeader = this.createSectionHeader('Yield-Bearing Assets', sortedYieldBearing.length, 'bg-green-100 text-green-800');
            tableBody.appendChild(yieldBearingHeader);

            sortedYieldBearing.forEach(asset => {
                const row = this.createAssetRow(asset, 'yield-bearing-section');
                tableBody.appendChild(row);
            });
        }
    }

    createSectionHeader(title, count, badgeClasses) {
        const headerRow = document.createElement('tr');
        headerRow.className = 'section-header';

        headerRow.innerHTML = `
            <td colspan="7" class="px-6 py-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <h3 class="text-sm font-semibold text-gray-900">${title}</h3>
                        <span class="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClasses}">
                            ${count} asset${count !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div class="text-xs text-gray-500">
                        ${count > 0 ? 'Click any row to view details' : 'No assets in this category'}
                    </div>
                </div>
            </td>
        `;

        return headerRow;
    }

    createAssetRow(asset, sectionClass = '') {
        const row = document.createElement('tr');

        // Add base classes and section-specific classes
        let rowClasses = 'asset-row';
        if (sectionClass) {
            rowClasses += ` ${sectionClass}`;
        }
        if (!asset.enabled) {
            rowClasses += ' disabled';
        }

        row.className = rowClasses;

        // Add click handler to the entire row
        row.addEventListener('click', (e) => {
            // Don't navigate if clicking on the delete button
            if (e.target.closest('.action-button')) {
                return;
            }
            window.location.href = `/backoffice/assets/${asset.id || asset._id}`;
        });

        const enabledBadge = asset.enabled
            ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Enabled</span>'
            : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Disabled</span>';

        const yieldBadge = asset.yieldBearingToken
            ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Yes</span>'
            : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">No</span>';

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <img class="h-8 w-8 rounded-full" src="${asset.icon}" alt="${asset.token}" onerror="this.src='data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 24 24\\" fill=\\"gray\\"><circle cx=\\"12\\" cy=\\"12\\" r=\\"10\\"/></svg>
                    <div class="ml-4 asset-info">
                        <div class="text-sm font-medium text-gray-900">${asset.token}</div>
                        <div class="text-sm text-gray-500">${asset.address.substring(0, 10)}...</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">${asset.chain}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${asset.protocol || 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                $${asset.usdPrice?.toFixed(2) || '0.00'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${yieldBadge}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${enabledBadge}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <button onclick="event.stopPropagation(); window.assetsListManager.deleteAsset('${asset.id || asset._id}')" 
                        class="action-button text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50" 
                        title="Delete Asset">
                    <i class="fas fa-trash text-sm"></i>
                </button>
            </td>
        `;

        return row;
    }

    async deleteAsset(assetId) {
        if (!confirm('Are you sure you want to delete this asset?')) {
            return;
        }

        try {
            await apiService.deleteAsset(assetId);
            this.showToast('Asset deleted successfully', 'success');
            await this.loadAssets(); // Refresh the list
        } catch (error) {
            console.error('Failed to delete asset:', error);
            this.showToast('Failed to delete asset', 'error');
        }
    }

    // UI Helper Methods
    showLoading() {
        const loadingState = document.getElementById('loadingState');
        const assetsTable = document.getElementById('assetsTable');
        const emptyState = document.getElementById('emptyState');

        if (loadingState) loadingState.classList.remove('hidden');
        if (assetsTable) assetsTable.classList.add('hidden');
        if (emptyState) emptyState.classList.add('hidden');
    }

    hideLoading() {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) loadingState.classList.add('hidden');
    }

    showCreateModal() {
        const modal = document.getElementById('create-modal');
        if (modal) {
            // Populate chain options when showing the modal
            this.populateChainOptions();
            this.populateProtocolOptions();

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
                const firstInput = document.getElementById('token');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 300);
        }
    }

    hideCreateModal() {
        const modal = document.getElementById('create-modal');
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
                this.clearCreateForm();
            }, 200);
        }
    }

    clearCreateForm() {
        const form = document.getElementById('create-asset-form');
        if (form) {
            form.reset();
            // Hide lock yield section
            const lockYieldSection = document.getElementById('lockYieldSection');
            if (lockYieldSection) {
                lockYieldSection.classList.add('hidden');
            }
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

    async loadChains() {
        try {
            const response = await window.apiService.getChains();
            this.chains = response.chains || response || [];
            console.log('Loaded chains for assets:', this.chains);

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

    populateChainFilter() {
        const chainFilter = document.getElementById('chainFilter');
        if (!chainFilter) return;

        // Clear existing options (keep the "All Chains" option)
        const allChainsOption = chainFilter.querySelector('option[value=""]');
        chainFilter.innerHTML = '';
        if (allChainsOption) {
            chainFilter.appendChild(allChainsOption);
        } else {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'All Chains';
            chainFilter.appendChild(defaultOption);
        }

        // Add chain options
        const enabledChains = this.chains.filter(chain => chain.enabled);
        enabledChains.forEach(chain => {
            const option = document.createElement('option');
            option.value = chain.shortName;
            option.textContent = chain.name;
            chainFilter.appendChild(option);
        });
    }

    populateChainOptions() {
        const chainSelect = document.getElementById('chain');
        if (!chainSelect) return;

        // Clear existing options (keep the "Select Blockchain" option)
        const selectOption = chainSelect.querySelector('option[value=""]');
        chainSelect.innerHTML = '';
        if (selectOption) {
            chainSelect.appendChild(selectOption);
        } else {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select Blockchain';
            chainSelect.appendChild(defaultOption);
        }

        // Add chain options
        const enabledChains = this.chains.filter(chain => chain.enabled);
        enabledChains.forEach(chain => {
            const option = document.createElement('option');
            option.value = chain.id;
            option.textContent = `${chain.name} (${chain.shortName})`;
            chainSelect.appendChild(option);
        });
    }

    populateProtocolOptions() {
        const protocolSelect = document.getElementById('protocol');
        if (!protocolSelect) return;

        // Clear existing options (keep the "Select Protocol" option)
        const selectOption = protocolSelect.querySelector('option[value=""]');
        protocolSelect.innerHTML = '';
        if (selectOption) {
            protocolSelect.appendChild(selectOption);
        } else {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select Protocol';
            protocolSelect.appendChild(defaultOption);
        }

        // Add chain options
        this.protocols.forEach(protocol => {
            const option = document.createElement('option');
            option.value = protocol.name;
            option.textContent = `${protocol.name}`;
            protocolSelect.appendChild(option);
        });
    }
}

// Global functions for modal handling
function showCreateModal() {
    window.assetsListManager.showCreateModal();
}

function hideCreateModal() {
    window.assetsListManager.hideCreateModal();
}

// Export as global
window.assetsListManager = new AssetsListManager(); 