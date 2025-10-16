// Protocols List Manager - Handles all protocol list functionality
class ProtocolsListManager {
    constructor() {
        this.protocols = [];
        this.filteredProtocols = [];
        this.chains = []; // Store available chains
        this.filters = {
            search: '',
            category: '',
            enabled: ''
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Filter event listeners
        const searchFilter = document.getElementById('searchFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const enabledFilter = document.getElementById('enabledFilter');

        if (searchFilter) {
            searchFilter.addEventListener('input', (e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
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
            await this.loadProtocols();
            this.applyFilters();
        } catch (error) {
            console.error('Failed to initialize protocols list:', error);
            this.showError('Failed to load protocols. Please try again.');
        }
    }

    async loadChains() {
        try {
            const response = await window.apiService.getChains();
            this.chains = response.chains || response || [];
            console.log('Loaded chains:', this.chains);

            // If no chains are loaded, use a minimal fallback
            if (this.chains.length === 0) {
                console.warn('No chains loaded, using fallback chain data');
                this.chains = [
                    { chainId: 1, name: 'Ethereum', shortName: 'ETH', enabled: true },
                    { chainId: 56, name: 'Binance Smart Chain', shortName: 'BSC', enabled: true },
                    { chainId: 137, name: 'Polygon', shortName: 'Polygon', enabled: true },
                    { chainId: 42161, name: 'Arbitrum One', shortName: 'Arbitrum', enabled: true },
                    { chainId: 8453, name: 'Base', shortName: 'Base', enabled: true }
                ];
            }
        } catch (error) {
            console.error('Error loading chains:', error);
            // Use fallback chain data if API fails
            this.chains = [
                { chainId: 1, name: 'Ethereum', shortName: 'ETH', enabled: true },
                { chainId: 56, name: 'Binance Smart Chain', shortName: 'BSC', enabled: true },
                { chainId: 137, name: 'Polygon', shortName: 'Polygon', enabled: true },
                { chainId: 42161, name: 'Arbitrum One', shortName: 'Arbitrum', enabled: true },
                { chainId: 8453, name: 'Base', shortName: 'Base', enabled: true }
            ];
        }
    }

    async loadProtocols() {
        try {
            const response = await window.apiService.getProtocols();
            this.protocols = response.protocols || response || [];
            console.log('Loaded protocols:', this.protocols);
        } catch (error) {
            console.error('Error loading protocols:', error);
            throw error;
        }
    }

    applyFilters() {
        this.filteredProtocols = this.protocols.filter(protocol => {
            // Search filter
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const matchesSearch =
                    protocol.name.toLowerCase().includes(searchTerm) ||
                    protocol.displayName.toLowerCase().includes(searchTerm) ||
                    (protocol.category && protocol.category.toLowerCase().includes(searchTerm)) ||
                    (protocol.description && protocol.description.toLowerCase().includes(searchTerm));

                if (!matchesSearch) return false;
            }

            // Category filter
            if (this.filters.category !== '') {
                if (protocol.category !== this.filters.category) return false;
            }

            // Enabled filter
            if (this.filters.enabled !== '') {
                const isEnabled = this.filters.enabled === 'true';
                if (protocol.enabled !== isEnabled) return false;
            }

            return true;
        });

        this.renderTable();
    }

    renderTable() {
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        const protocolsTable = document.getElementById('protocolsTable');

        // Hide loading state
        if (loadingState) {
            loadingState.classList.add('hidden');
        }

        if (this.filteredProtocols.length === 0) {
            // Show empty state
            if (emptyState) {
                emptyState.classList.remove('hidden');
            }
            if (protocolsTable) {
                protocolsTable.classList.add('hidden');
            }
            return;
        }

        // Show table and hide empty state
        if (emptyState) {
            emptyState.classList.add('hidden');
        }
        if (protocolsTable) {
            protocolsTable.classList.remove('hidden');
        }

        // Render table content
        this.renderTableContent();
    }

    renderTableContent() {
        const tableBody = document.getElementById('protocolsTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        // Group protocols by category
        const categories = ['Lending', 'DEX', 'Staking', 'Yield Farming', 'Yield Trading', 'Restaking'];
        const categorizedProtocols = {};
        const otherProtocols = [];

        // Categorize protocols
        this.filteredProtocols.forEach(protocol => {
            if (!protocol.category || !categories.includes(protocol.category)) {
                otherProtocols.push(protocol);
            } else {
                if (!categorizedProtocols[protocol.category]) {
                    categorizedProtocols[protocol.category] = [];
                }
                categorizedProtocols[protocol.category].push(protocol);
            }
        });

        // Render each category
        categories.forEach(category => {
            const protocols = categorizedProtocols[category];
            if (protocols && protocols.length > 0) {
                const header = this.createSectionHeader(
                    category,
                    protocols.length,
                    this.getCategoryBadgeClass(category),
                    this.getCategorySectionClass(category)
                );
                tableBody.appendChild(header);

                protocols.forEach(protocol => {
                    const row = this.createProtocolRow(protocol, this.getCategorySectionClass(category));
                    tableBody.appendChild(row);
                });
            }
        });

        // Render other protocols
        if (otherProtocols.length > 0) {
            const header = this.createSectionHeader(
                'Other',
                otherProtocols.length,
                'bg-gray-100 text-gray-800',
                'other-section'
            );
            tableBody.appendChild(header);

            otherProtocols.forEach(protocol => {
                const row = this.createProtocolRow(protocol, 'other-section');
                tableBody.appendChild(row);
            });
        }
    }

    getCategoryBadgeClass(category) {
        const badgeClasses = {
            'Lending': 'bg-green-100 text-green-800',
            'DEX': 'bg-blue-100 text-blue-800',
            'Staking': 'bg-purple-100 text-purple-800',
            'Yield Farming': 'bg-yellow-100 text-yellow-800',
            'Yield Trading': 'bg-indigo-100 text-indigo-800',
            'Restaking': 'bg-pink-100 text-pink-800'
        };
        return badgeClasses[category] || 'bg-gray-100 text-gray-800';
    }

    getCategorySectionClass(category) {
        const sectionClasses = {
            'Lending': 'lending-section',
            'DEX': 'dex-section',
            'Staking': 'staking-section',
            'Yield Farming': 'yield-farming-section',
            'Yield Trading': 'yield-trading-section',
            'Restaking': 'restaking-section'
        };
        return sectionClasses[category] || 'other-section';
    }

    createSectionHeader(title, count, badgeClasses, sectionClass) {
        const headerRow = document.createElement('tr');
        headerRow.className = 'section-header';

        headerRow.innerHTML = `
            <td colspan="6" class="px-6 py-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <h3 class="text-sm font-semibold text-gray-900">${title}</h3>
                        <span class="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClasses}">
                            ${count} protocol${count !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div class="text-xs text-gray-500">
                        ${count > 0 ? 'Click any row to view details' : 'No protocols in this category'}
                    </div>
                </div>
            </td>
        `;

        return headerRow;
    }

    createProtocolRow(protocol, sectionClass = '') {
        const row = document.createElement('tr');

        // Add base classes and section-specific classes
        let rowClasses = 'protocol-row';
        if (sectionClass) {
            rowClasses += ` ${sectionClass}`;
        }
        if (!protocol.enabled) {
            rowClasses += ' disabled';
        }

        row.className = rowClasses;

        // Add click handler to navigate to protocol detail
        row.addEventListener('click', () => {
            window.location.href = `/backoffice/protocols/${protocol.id || protocol._id}`;
        });

        // Create supported chains display
        const supportedChainsDisplay = this.formatSupportedChains(protocol.supportedChains);

        // Create status badge
        const statusBadge = protocol.enabled
            ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Enabled</span>'
            : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Disabled</span>';

        // Create category badge
        const categoryBadge = protocol.category
            ? `<span class="category-badge category-${protocol.category.toLowerCase().replace(/\s+/g, '-')}">${protocol.category}</span>`
            : '<span class="category-badge category-other">—</span>';

        // Create website link
        const websiteLink = protocol.website
            ? `<a href="${protocol.website}" target="_blank" class="text-blue-600 hover:text-blue-800 underline" onclick="event.stopPropagation()">Visit</a>`
            : '<span class="text-gray-400">—</span>';

        // Column order: Protocol, Category, Status, Supported Chains, Website
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <img class="protocol-logo mr-3" src="${protocol.image}" alt="${protocol.displayName}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI4IiBoZWlnaHQ9IjI4IiByeD0iMTQiIGZpbGw9IiNGMUY1RjkiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik04IDEuMzMzMzNDNC4zMTgxIDEuMzMzMzMgMS4zMzMzIDQuMzE4MSAxLjMzMzMgOEMxLjMzMzMgMTEuNjgxOSA0LjMxODEgMTQuNjY2NyA4IDE0LjY2NjdDMTEuNjgxOSAxNC42NjY3IDE0LjY2NjcgMTEuNjgxOSAxNC42NjY3IDhDMTQuNjY2NyA0LjMxODEgMTEuNjgxOSAxLjMzMzMzIDggMS4zMzMzM1pNOCA0QzguNzM2NCA0IDkuMzMzMyA0LjU5Njk1IDkuMzMzMyA1LjMzMzMzQzkuMzMzMyA2LjA2OTcxIDguNzM2NCA2LjY2NjY3IDggNi42NjY2N0M3LjI2MzYgNi42NjY2NyA2LjY2NjY3IDYuMDY5NzEgNi42NjY2NyA1LjMzMzMzQzYuNjY2NjcgNC41OTY5NSA3LjI2MzYgNCA4IDRaTTggMTJDNi44OTU0MyAxMiA2IDExLjEwNDYgNiAxMEM2IDguODk1NDMgNi44OTU0MyA4IDggOEM5LjEwNDU3IDggMTAgOC44OTU0MyAxMCAxMEMxMCAxMS4xMDQ2IDkuMTA0NTcgMTIgOCAxMloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo='">
                    <div>
                        <div class="text-sm font-medium text-gray-900 protocol-info">${protocol.displayName}</div>
                        <div class="text-xs text-gray-500">${protocol.name}</div>
                        ${protocol.description ? `<div class="text-xs text-gray-400 mt-1 max-w-xs truncate">${protocol.description}</div>` : ''}
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${categoryBadge}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${statusBadge}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${supportedChainsDisplay}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${websiteLink}</div>
            </td>
        `;

        return row;
    }

    formatSupportedChains(chains) {
        if (!chains || chains.length === 0) {
            return '<span class="text-gray-400">—</span>';
        }

        const displayChains = chains.slice(0, 3).map(chain => {
            const selectedChain = this.chains.find(c => c.chainId === chain.chainId);
            return selectedChain ? selectedChain.shortName : `Chain ${chain.chainId}`;
        });

        if (chains.length > 3) {
            displayChains.push(`+${chains.length - 3} more`);
        }

        return displayChains.join(', ');
    }

    clearFilters() {
        this.filters = {
            search: '',
            category: '',
            enabled: ''
        };

        // Clear UI
        const searchFilter = document.getElementById('searchFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const enabledFilter = document.getElementById('enabledFilter');

        if (searchFilter) searchFilter.value = '';
        if (categoryFilter) categoryFilter.value = '';
        if (enabledFilter) enabledFilter.value = '';

        this.applyFilters();
    }

    showCreateModal() {
        const modal = document.getElementById('create-modal');
        if (modal) {
            // Populate chain checkboxes
            this.populateChainCheckboxes('chainCheckboxes', 'chain-checkbox');

            modal.classList.remove('hidden');
            // Force reflow
            modal.offsetHeight;
            modal.classList.remove('opacity-0');
            modal.querySelector('.scale-95').classList.remove('scale-95');
            modal.querySelector('.translate-y-4').classList.remove('translate-y-4');
        }
    }

    hideCreateModal() {
        const modal = document.getElementById('create-modal');
        if (modal) {
            modal.classList.add('opacity-0');
            modal.querySelector('.relative').classList.add('scale-95', 'translate-y-4');

            setTimeout(() => {
                modal.classList.add('hidden');
                this.resetCreateForm();
            }, 200);
        }
    }

    resetCreateForm() {
        const form = document.getElementById('protocolForm');
        if (form) {
            form.reset();
            // Clear checkboxes
            const checkboxes = form.querySelectorAll('.chain-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            // Set default enabled status
            const enabledSelect = form.querySelector('#enabled');
            if (enabledSelect) {
                enabledSelect.value = 'true';
            }
        }
    }

    async createProtocol() {
        try {
            const form = document.getElementById('protocolForm');
            if (!form) {
                this.showError('Form not found');
                return;
            }

            const formData = new FormData(form);

            // Get supported chains from checkboxes
            const supportedChains = [];
            const chainCheckboxes = form.querySelectorAll('.chain-checkbox:checked');
            chainCheckboxes.forEach(checkbox => {
                supportedChains.push(checkbox.value);
            });

            const protocolData = {
                name: formData.get('name'),
                displayName: formData.get('displayName'),
                image: formData.get('image'),
                website: formData.get('website') || null,
                description: formData.get('description') || null,
                category: formData.get('category') || null,
                enabled: formData.get('enabled') === 'true',
                supportedChains: supportedChains.length > 0 ? supportedChains : null
            };

            // Validate required fields
            if (!protocolData.name || !protocolData.displayName || !protocolData.image) {
                this.showError('Please fill in all required fields (Name, Display Name, and Image URL).');
                return;
            }

            const response = await window.apiService.createProtocol(protocolData);

            this.showSuccess('Protocol created successfully!');
            this.hideCreateModal();
            await this.loadProtocols();
            this.applyFilters();

        } catch (error) {
            console.error('Error creating protocol:', error);
            this.showError(error.message || 'Failed to create protocol. Please try again.');
        }
    }

    editProtocol(protocolId) {
        // Navigate to protocol detail page for editing
        window.location.href = `/backoffice/protocols/${protocolId}`;
    }

    async deleteProtocol(protocolId, protocolName) {
        if (!confirm(`Are you sure you want to delete the protocol "${protocolName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await window.apiService.deleteProtocol(protocolId);
            this.showSuccess('Protocol deleted successfully!');
            await this.loadProtocols();
            this.applyFilters();
        } catch (error) {
            console.error('Error deleting protocol:', error);
            this.showError(error.message || 'Failed to delete protocol. Please try again.');
        }
    }

    showSuccess(message) {
        if (window.uiService) {
            window.uiService.showSuccess(message);
        }
    }

    showError(message) {
        if (window.uiService) {
            window.uiService.showError(message);
        }
    }

    populateSupportedChains() {
        const supportedChainsContainer = document.getElementById('supportedChains');
        if (!supportedChainsContainer) return;

        if (!this.currentProtocol.supportedChains || this.currentProtocol.supportedChains.length === 0) {
            supportedChainsContainer.innerHTML = '<span class="text-gray-500 italic">No supported chains specified</span>';
            return;
        }

        const chainBadges = this.currentProtocol.supportedChains.map(chain => {
            const selectedChain = this.chains.find(c => c.chainId === chain.chainId);
            const chainName = selectedChain ? selectedChain.name : `Chain ${chain.chainId}`;
            return `<span class="chain-badge">${chainName} (${chain.chainId})</span>`;
        }).join('');

        supportedChainsContainer.innerHTML = chainBadges;
    }

    populateChainCheckboxes(containerId, checkboxClass) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Clear existing checkboxes
        container.innerHTML = '';

        // Only show enabled chains
        const enabledChains = this.chains.filter(chain => chain.enabled);

        enabledChains.forEach(chain => {
            const label = document.createElement('label');
            label.className = 'flex items-center';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = `${checkboxClass} rounded border-gray-300 text-primary focus:ring-primary`;
            checkbox.value = chain.id;

            const span = document.createElement('span');
            span.className = 'ml-2 text-sm';
            span.textContent = chain.name;

            label.appendChild(checkbox);
            label.appendChild(span);
            container.appendChild(label);
        });
    }
} 