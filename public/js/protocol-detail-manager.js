// Protocol Detail Manager - Handles protocol detail page functionality
class ProtocolDetailManager {
    constructor() {
        this.currentProtocol = null;
        this.chains = []; // Store available chains
        this.protocolId = this.getProtocolIdFromUrl();
    }

    getProtocolIdFromUrl() {
        const path = window.location.pathname;
        const matches = path.match(/\/backoffice\/protocols\/([a-f0-9]{24})/);
        return matches ? matches[1] : null;
    }

    async initialize() {
        if (!this.protocolId) {
            this.showProtocolNotFound();
            return;
        }

        try {
            await this.loadChains();
            await this.loadProtocol();
            this.renderProtocolDetails();
        } catch (error) {
            console.error('Failed to initialize protocol detail:', error);
            if (error.message.includes('not found') || error.message.includes('404')) {
                this.showProtocolNotFound();
            } else {
                this.showError('Failed to load protocol details. Please try again.');
            }
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

    async loadProtocol() {
        try {
            this.currentProtocol = await window.apiService.getProtocol(this.protocolId);
            console.log('Loaded protocol:', this.currentProtocol);
        } catch (error) {
            console.error('Error loading protocol:', error);
            throw error;
        }
    }

    showProtocolNotFound() {
        const loadingState = document.getElementById('loadingState');
        const notFoundState = document.getElementById('notFoundState');
        const protocolDetails = document.getElementById('protocolDetails');

        if (loadingState) loadingState.classList.add('hidden');
        if (protocolDetails) protocolDetails.classList.add('hidden');
        if (notFoundState) notFoundState.classList.remove('hidden');
    }

    renderProtocolDetails() {
        const loadingState = document.getElementById('loadingState');
        const notFoundState = document.getElementById('notFoundState');
        const protocolDetails = document.getElementById('protocolDetails');

        // Hide loading and error states
        if (loadingState) loadingState.classList.add('hidden');
        if (notFoundState) notFoundState.classList.add('hidden');
        if (protocolDetails) protocolDetails.classList.remove('hidden');

        this.populateHeader();
        this.populateBasicInfo();
        this.populateSupportedChains();
        this.populateMetadata();
    }

    populateHeader() {
        const protocol = this.currentProtocol;

        // Protocol image
        const protocolImage = document.getElementById('protocolImage');
        if (protocolImage) {
            protocolImage.src = protocol.image;
            protocolImage.alt = protocol.displayName;
            protocolImage.onerror = function () {
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMjQiIGZpbGw9IiNGMUY1RjkiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJDMiAxNy41MjMgNi40NzcgMjIgMTIgMjJDMTcuNTIzIDIyIDIyIDE3LjUyMyAyMiAxMkMyMiA2LjQ3NyAxNy41MjMgMiAxMiAyWk0xMiA2QzEzLjEwNCA2IDE0IDYuODk2IDE0IDhDMTQgOS4xMDQgMTMuMTA0IDEwIDEyIDEwQzEwLjg5NiAxMCAxMCA5LjEwNCAxMCA4QzEwIDYuODk2IDEwLjg5NiA2IDEyIDZaTTEyIDE4QzEwLjM0MyAxOCA5IDE2LjY1NyA9IDE1QzkgMTMuMzQzIDEwLjM0MyAxMiAxMiAxMkMxMy42NTcgMTIgMTUgMTMuMzQzIDE1IDE1QzE1IDE2LjY1NyAxMy42NTcgMTggMTIgMThaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
            };
        }

        // Protocol name and category in header
        const protocolName = document.getElementById('protocolName');
        if (protocolName) {
            protocolName.textContent = protocol.displayName;
        }

        const protocolCategory = document.getElementById('protocolCategory');
        if (protocolCategory) {
            protocolCategory.textContent = protocol.category || 'Uncategorized';
        }
    }

    populateBasicInfo() {
        const protocol = this.currentProtocol;

        // Protocol name detail
        const protocolNameDetail = document.getElementById('protocolNameDetail');
        if (protocolNameDetail) {
            protocolNameDetail.textContent = protocol.name;
        }

        // Display name
        const protocolDisplayName = document.getElementById('protocolDisplayName');
        if (protocolDisplayName) {
            protocolDisplayName.textContent = protocol.displayName;
        }

        // Category badge
        const protocolCategoryBadge = document.getElementById('protocolCategoryBadge');
        if (protocolCategoryBadge) {
            if (protocol.category) {
                protocolCategoryBadge.textContent = protocol.category;
                protocolCategoryBadge.className = `category-badge category-${protocol.category.toLowerCase().replace(/\s+/g, '-')}`;
            } else {
                protocolCategoryBadge.textContent = '—';
                protocolCategoryBadge.className = 'category-badge category-other';
            }
        }

        // Status badge
        const protocolStatusBadge = document.getElementById('protocolStatusBadge');
        if (protocolStatusBadge) {
            protocolStatusBadge.textContent = protocol.enabled ? 'Enabled' : 'Disabled';
            protocolStatusBadge.className = `status-badge ${protocol.enabled ? 'status-enabled' : 'status-disabled'}`;
        }

        // Website
        const protocolWebsite = document.getElementById('protocolWebsite');
        if (protocolWebsite) {
            if (protocol.website) {
                protocolWebsite.innerHTML = `<a href="${protocol.website}" target="_blank" class="text-blue-600 hover:text-blue-800 underline link-hover">${protocol.website}</a>`;
            } else {
                protocolWebsite.textContent = '—';
            }
        }

        // Description
        const protocolDescription = document.getElementById('protocolDescription');
        if (protocolDescription) {
            protocolDescription.textContent = protocol.description || 'No description provided.';
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

    populateMetadata() {
        const protocol = this.currentProtocol;

        // Protocol ID
        const protocolId = document.getElementById('protocolId');
        if (protocolId) {
            protocolId.textContent = protocol.id || protocol._id;
        }

        // Created at
        const protocolCreated = document.getElementById('protocolCreated');
        if (protocolCreated) {
            protocolCreated.textContent = this.formatDate(protocol.createdAt);
        }

        // Updated at
        const protocolUpdated = document.getElementById('protocolUpdated');
        if (protocolUpdated) {
            protocolUpdated.textContent = this.formatDate(protocol.updatedAt);
        }
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }

    editProtocol() {
        this.showEditModal();
    }

    showEditModal() {
        const modal = document.getElementById('edit-modal');
        const form = document.getElementById('editProtocolForm');

        if (modal && form) {
            // Populate chain checkboxes first
            this.populateEditChainCheckboxes();

            // Then populate form with current protocol data
            this.populateEditForm();

            modal.classList.remove('hidden');
            // Force reflow
            modal.offsetHeight;
            modal.classList.remove('opacity-0');
            modal.querySelector('.scale-95').classList.remove('scale-95');
            modal.querySelector('.translate-y-4').classList.remove('translate-y-4');
        }
    }

    hideEditModal() {
        const modal = document.getElementById('edit-modal');
        if (modal) {
            modal.classList.add('opacity-0');
            modal.querySelector('.relative').classList.add('scale-95', 'translate-y-4');

            setTimeout(() => {
                modal.classList.add('hidden');
            }, 200);
        }
    }

    populateEditChainCheckboxes() {
        const container = document.getElementById('editChainCheckboxes');
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
            checkbox.className = 'edit-chain-checkbox rounded border-gray-300 text-primary focus:ring-primary';
            checkbox.value = chain.id;

            const span = document.createElement('span');
            span.className = 'ml-2 text-sm';
            span.textContent = chain.name;

            label.appendChild(checkbox);
            label.appendChild(span);
            container.appendChild(label);
        });
    }

    populateEditForm() {
        const form = document.getElementById('editProtocolForm');
        if (!form || !this.currentProtocol) return;

        const protocol = this.currentProtocol;

        // Populate form fields using specific IDs
        const editName = document.getElementById('editName');
        const editDisplayName = document.getElementById('editDisplayName');
        const editCategory = document.getElementById('editCategory');
        const editImage = document.getElementById('editImage');
        const editWebsite = document.getElementById('editWebsite');
        const editDescription = document.getElementById('editDescription');
        const editEnabled = document.getElementById('editEnabled');

        if (editName) editName.value = protocol.name || '';
        if (editDisplayName) editDisplayName.value = protocol.displayName || '';
        if (editCategory) editCategory.value = protocol.category || '';
        if (editImage) editImage.value = protocol.image || '';
        if (editWebsite) editWebsite.value = protocol.website || '';
        if (editDescription) editDescription.value = protocol.description || '';
        if (editEnabled) editEnabled.value = protocol.enabled ? 'true' : 'false';

        // Handle supported chains checkboxes
        const chainCheckboxes = form.querySelectorAll('.edit-chain-checkbox');
        chainCheckboxes.forEach(checkbox => {
            checkbox.checked = false; // Clear all first
            if (protocol.supportedChains && protocol.supportedChains.find(chain => chain.id === checkbox.value)) {
                checkbox.checked = true;
            }
        });
    }

    async saveProtocol() {
        try {
            const form = document.getElementById('editProtocolForm');
            if (!form) {
                this.showError('Edit form not found');
                return;
            }

            const formData = new FormData(form);

            // Get supported chains from checkboxes
            const supportedChains = [];
            const chainCheckboxes = form.querySelectorAll('.edit-chain-checkbox:checked');
            chainCheckboxes.forEach(checkbox => {
                supportedChains.push(checkbox.value);
            });

            const updateData = {
                name: formData.get('name'),
                displayName: formData.get('displayName'),
                category: formData.get('category') || null,
                image: formData.get('image'),
                website: formData.get('website') || null,
                description: formData.get('description') || null,
                enabled: formData.get('enabled') === 'true',
                supportedChains: supportedChains.length > 0 ? supportedChains : null
            };

            // Validate required fields
            if (!updateData.name || !updateData.displayName || !updateData.image) {
                this.showError('Please fill in all required fields (Name, Display Name, and Image URL).');
                return;
            }

            const response = await window.apiService.updateProtocol(this.protocolId, updateData);

            this.showSuccess('Protocol updated successfully!');
            this.hideEditModal();

            // Reload protocol data and re-render
            await this.loadProtocol();
            this.renderProtocolDetails();

        } catch (error) {
            console.error('Error updating protocol:', error);
            this.showError(error.message || 'Failed to update protocol. Please try again.');
        }
    }

    async deleteProtocol() {
        if (!this.currentProtocol) return;

        const confirmMessage = `Are you sure you want to delete the protocol "${this.currentProtocol.displayName}"?\n\nThis action cannot be undone and may affect existing assets and steps that reference this protocol.`;

        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            await window.apiService.deleteProtocol(this.protocolId);
            this.showSuccess('Protocol deleted successfully!');

            // Redirect to protocols list after a short delay
            setTimeout(() => {
                window.location.href = '/backoffice/protocols';
            }, 1500);

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
} 