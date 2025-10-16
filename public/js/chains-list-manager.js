// Chains List Manager - Handles all chain list functionality
class ChainsListManager {
    constructor() {
        this.chains = [];
        this.filteredChains = [];
        this.filters = {
            search: '',
            testnet: '',
            enabled: ''
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Filter event listeners
        const searchFilter = document.getElementById('searchFilter');
        const testnetFilter = document.getElementById('testnetFilter');
        const enabledFilter = document.getElementById('enabledFilter');

        if (searchFilter) {
            searchFilter.addEventListener('input', (e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        if (testnetFilter) {
            testnetFilter.addEventListener('change', (e) => {
                this.filters.testnet = e.target.value;
                this.applyFilters();
            });
        }

        if (enabledFilter) {
            enabledFilter.addEventListener('change', (e) => {
                this.filters.enabled = e.target.value;
                this.applyFilters();
            });
        }
    }

    async initialize() {
        try {
            await this.loadChains();
            this.applyFilters();
        } catch (error) {
            console.error('Failed to initialize chains list:', error);
            this.showError('Failed to load chains. Please try again.');
        }
    }

    async loadChains() {
        try {
            const response = await window.apiService.getChains();
            this.chains = response.chains || response || [];
            console.log('Loaded chains:', this.chains);
        } catch (error) {
            console.error('Error loading chains:', error);
            throw error;
        }
    }

    applyFilters() {
        this.filteredChains = this.chains.filter(chain => {
            // Search filter
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const matchesSearch = 
                    chain.name.toLowerCase().includes(searchTerm) ||
                    chain.shortName.toLowerCase().includes(searchTerm) ||
                    chain.symbol.toLowerCase().includes(searchTerm) ||
                    chain.chainId.toString().includes(searchTerm);
                
                if (!matchesSearch) return false;
            }

            // Testnet filter
            if (this.filters.testnet !== '') {
                const isTestnet = this.filters.testnet === 'true';
                if (chain.testnet !== isTestnet) return false;
            }

            // Enabled filter
            if (this.filters.enabled !== '') {
                const isEnabled = this.filters.enabled === 'true';
                if (chain.enabled !== isEnabled) return false;
            }

            return true;
        });

        this.renderTable();
    }

    renderTable() {
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        const chainsTable = document.getElementById('chainsTable');
        
        // Hide loading state
        if (loadingState) {
            loadingState.classList.add('hidden');
        }

        if (this.filteredChains.length === 0) {
            // Show empty state
            if (emptyState) {
                emptyState.classList.remove('hidden');
            }
            if (chainsTable) {
                chainsTable.classList.add('hidden');
            }
            return;
        }

        // Show table and hide empty state
        if (emptyState) {
            emptyState.classList.add('hidden');
        }
        if (chainsTable) {
            chainsTable.classList.remove('hidden');
        }

        // Render table content
        this.renderTableContent();
    }

    renderTableContent() {
        const tableBody = document.getElementById('chainsTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        // Group chains by network type
        const mainnetChains = this.filteredChains.filter(chain => !chain.testnet);
        const testnetChains = this.filteredChains.filter(chain => chain.testnet);

        // Render mainnet chains
        if (mainnetChains.length > 0) {
            const mainnetHeader = this.createSectionHeader(
                'Mainnet Networks', 
                mainnetChains.length, 
                'bg-green-100 text-green-800'
            );
            tableBody.appendChild(mainnetHeader);

            mainnetChains.forEach(chain => {
                const row = this.createChainRow(chain, 'mainnet-section');
                tableBody.appendChild(row);
            });
        }

        // Render testnet chains
        if (testnetChains.length > 0) {
            const testnetHeader = this.createSectionHeader(
                'Testnet Networks', 
                testnetChains.length, 
                'bg-yellow-100 text-yellow-800'
            );
            tableBody.appendChild(testnetHeader);

            testnetChains.forEach(chain => {
                const row = this.createChainRow(chain, 'testnet-section');
                tableBody.appendChild(row);
            });
        }
    }

    createSectionHeader(title, count, badgeClasses) {
        const headerRow = document.createElement('tr');
        headerRow.className = 'section-header';
        
        headerRow.innerHTML = `
            <td colspan="6" class="px-6 py-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <h3 class="text-sm font-semibold text-gray-900">${title}</h3>
                        <span class="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClasses}">
                            ${count} chain${count !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div class="text-xs text-gray-500">
                        ${count > 0 ? 'Click any row to view details' : 'No chains in this category'}
                    </div>
                </div>
            </td>
        `;
        
        return headerRow;
    }

    createChainRow(chain, sectionClass = '') {
        const row = document.createElement('tr');
        
        // Add base classes and section-specific classes
        let rowClasses = 'chain-row';
        if (sectionClass) {
            rowClasses += ` ${sectionClass}`;
        }
        if (!chain.enabled) {
            rowClasses += ' disabled';
        }
        
        row.className = rowClasses;
        
        // Add click handler to the entire row
        row.addEventListener('click', (e) => {
            // Don't navigate if clicking on the delete button
            if (e.target.closest('.action-button')) {
                return;
            }
            window.location.href = `/backoffice/chains/${chain.id || chain._id}`;
        });
        
        const enabledBadge = chain.enabled 
            ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Enabled</span>'
            : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Disabled</span>';

        const networkBadge = chain.testnet 
            ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Testnet</span>'
            : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Mainnet</span>';

        const truncatedRpcUrl = chain.rpcUrl.length > 40 
            ? chain.rpcUrl.substring(0, 40) + '...' 
            : chain.rpcUrl;

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <img class="h-8 w-8 rounded-full flex-shrink-0" src="${chain.image}" alt="${chain.name}" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iMTYiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMkMxMS4zMTM3IDIgMTQgNC42ODYzIDE0IDhDMTQgMTEuMzEzNyAxMS4zMTM3IDE0IDggMTRDNC42ODYzIDE0IDIgMTEuMzEzNyAyIDhDMiA0LjY4NjMgNC42ODYzIDIgOCAyWiIgZmlsbD0iIzZCNzI4MCIvPgo8L3N2Zz4KPC9zdmc+Cg=='">
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${chain.name}</div>
                        <div class="text-sm text-gray-500">${chain.shortName} • ${chain.symbol}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-mono text-gray-900">${chain.chainId}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${networkBadge}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${enabledBadge}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 font-mono" title="${chain.rpcUrl}">${truncatedRpcUrl}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button onclick="editChain('${chain.id || chain._id}')" class="action-button inline-flex items-center px-2 py-1 border border-gray-300 text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                    <i class="fas fa-edit mr-1"></i>
                    Edit
                </button>
                <button onclick="deleteChain('${chain.id || chain._id}')" class="action-button inline-flex items-center px-2 py-1 border border-red-300 text-xs leading-4 font-medium rounded text-red-700 bg-white hover:bg-red-50">
                    <i class="fas fa-trash mr-1"></i>
                    Delete
                </button>
            </td>
        `;
        
        return row;
    }

    clearFilters() {
        this.filters = {
            search: '',
            testnet: '',
            enabled: ''
        };

        // Reset form elements
        const searchFilter = document.getElementById('searchFilter');
        const testnetFilter = document.getElementById('testnetFilter');
        const enabledFilter = document.getElementById('enabledFilter');

        if (searchFilter) searchFilter.value = '';
        if (testnetFilter) testnetFilter.value = '';
        if (enabledFilter) enabledFilter.value = '';

        this.applyFilters();
    }

    showCreateModal() {
        const modal = document.getElementById('create-modal');
        if (modal) {
            // Reset form
            const form = document.getElementById('chainForm');
            if (form) {
                form.reset();
            }

            // Show modal with animation
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                const modalContent = modal.querySelector('.relative');
                if (modalContent) {
                    modalContent.classList.remove('scale-95', 'translate-y-4');
                }
            }, 10);
        }
    }

    hideCreateModal() {
        const modal = document.getElementById('create-modal');
        if (modal) {
            // Hide modal with animation
            modal.classList.add('opacity-0');
            const modalContent = modal.querySelector('.relative');
            if (modalContent) {
                modalContent.classList.add('scale-95', 'translate-y-4');
            }
            
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 200);
        }
    }

    async createChain() {
        try {
            const form = document.getElementById('chainForm');
            if (!form) return;

            const formData = new FormData(form);
            const chainData = {
                chainId: parseInt(formData.get('chainId')),
                name: formData.get('name'),
                shortName: formData.get('shortName'),
                image: formData.get('image'),
                rpcUrl: formData.get('rpcUrl'),
                explorerUrl: formData.get('explorerUrl'),
                symbol: formData.get('symbol'),
                decimals: parseInt(formData.get('decimals')),
                enabled: formData.get('enabled') === 'true',
                testnet: formData.get('testnet') === 'true',
                description: formData.get('description') || undefined
            };

            // Validate required fields
            const requiredFields = ['chainId', 'name', 'shortName', 'image', 'rpcUrl', 'explorerUrl', 'symbol', 'decimals'];
            for (const field of requiredFields) {
                if (!chainData[field] && chainData[field] !== 0) {
                    this.showError(`${field} is required`);
                    return;
                }
            }

            await window.apiService.createChain(chainData);
            this.showSuccess('Chain created successfully!');
            this.hideCreateModal();
            await this.loadChains();
            this.applyFilters();
        } catch (error) {
            console.error('Error creating chain:', error);
            this.showError(error.message || 'Failed to create chain');
        }
    }

    showSuccess(message) {
        if (window.uiService) {
            window.uiService.showToast(message, 'success');
        } else {
            alert(message);
        }
    }

    showError(message) {
        if (window.uiService) {
            window.uiService.showToast(message, 'error');
        } else {
            alert(message);
        }
    }
}

// Global functions for inline event handlers
window.editChain = async function(chainId) {
    // Redirect to chain detail page
    window.location.href = `/backoffice/chains/${chainId}`;
};

window.deleteChain = async function(chainId) {
    if (!confirm('Are you sure you want to delete this chain? This action cannot be undone.')) {
        return;
    }

    try {
        await window.apiService.deleteChain(chainId);
        window.chainsListManager.showSuccess('Chain deleted successfully!');
        await window.chainsListManager.loadChains();
        window.chainsListManager.applyFilters();
    } catch (error) {
        console.error('Error deleting chain:', error);
        window.chainsListManager.showError('Failed to delete chain');
    }
}; 