// Chain Detail Manager - Handles chain detail page functionality
class ChainDetailManager {
    constructor() {
        this.currentChainId = null;
        this.chain = null;
    }

    async initialize(chainId) {
        this.currentChainId = chainId;
        console.log('Initializing chain detail manager with ID:', chainId);
        
        if (!chainId) {
            this.showChainNotFound();
            return;
        }

        try {
            await this.loadChain();
            if (this.chain) {
                this.renderChainDetails();
                this.showMainContent();
            } else {
                this.showChainNotFound();
            }
        } catch (error) {
            console.error('Failed to load chain:', error);
            this.showChainNotFound();
        }
    }

    async loadChain() {
        try {
            this.chain = await apiService.getChain(this.currentChainId);
            console.log('Loaded chain:', this.chain);
        } catch (error) {
            console.error('Error loading chain:', error);
            throw error;
        }
    }

    renderChainDetails() {
        if (!this.chain) return;

        // Header
        this.updateElement('chainIcon', 'src', this.chain.image);
        this.updateElement('chainTitle', 'textContent', this.chain.name);
        this.updateElement('chainSubtitle', 'textContent', `${this.chain.shortName} • Chain ID: ${this.chain.chainId}`);

        // Status badges
        const statusElement = document.getElementById('chainStatus');
        const typeElement = document.getElementById('chainType');
        
        if (statusElement) {
            statusElement.textContent = this.chain.enabled ? 'Enabled' : 'Disabled';
            statusElement.className = `status-badge ${this.chain.enabled ? 'enabled' : 'disabled'}`;
        }

        if (typeElement) {
            typeElement.textContent = this.chain.testnet ? 'Testnet' : 'Mainnet';
            typeElement.className = `status-badge ${this.chain.testnet ? 'testnet' : 'mainnet'}`;
        }

        // Chain information
        this.updateElement('chainId', 'textContent', this.chain.chainId);
        this.updateElement('chainName', 'textContent', this.chain.name);
        this.updateElement('chainShortName', 'textContent', this.chain.shortName);
        this.updateElement('chainSymbol', 'textContent', this.chain.symbol);
        this.updateElement('chainDecimals', 'textContent', this.chain.decimals);
        this.updateElement('chainNetworkType', 'textContent', this.chain.testnet ? 'Testnet' : 'Mainnet');

        // Network configuration
        this.updateElement('chainRpcUrl', 'textContent', this.chain.rpcUrl);
        
        const explorerLink = document.getElementById('explorerLink');
        if (explorerLink) {
            explorerLink.href = this.chain.explorerUrl;
            explorerLink.textContent = this.chain.explorerUrl;
        }

        const imageLink = document.getElementById('imageLink');
        if (imageLink) {
            imageLink.href = this.chain.image;
            imageLink.textContent = this.chain.image;
        }

        this.updateElement('chainEnabledStatus', 'textContent', this.chain.enabled ? 'Enabled' : 'Disabled');

        // Description (optional)
        if (this.chain.description) {
            const descSection = document.getElementById('chainDescriptionSection');
            const descElement = document.getElementById('chainDescription');
            if (descSection && descElement) {
                descSection.classList.remove('hidden');
                descElement.textContent = this.chain.description;
            }
        }

        // Metadata
        this.updateElement('chainCreatedAt', 'textContent', this.formatDate(this.chain.createdAt));
        this.updateElement('chainUpdatedAt', 'textContent', this.formatDate(this.chain.updatedAt));
    }

    updateElement(id, property, value) {
        const element = document.getElementById(id);
        if (element && value !== undefined) {
            element[property] = value;
        }
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showMainContent() {
        const loadingState = document.getElementById('loadingState');
        const chainNotFound = document.getElementById('chainNotFound');
        const mainContent = document.getElementById('mainContent');

        if (loadingState) loadingState.classList.add('hidden');
        if (chainNotFound) chainNotFound.classList.add('hidden');
        if (mainContent) mainContent.classList.remove('hidden');
    }

    showChainNotFound() {
        const loadingState = document.getElementById('loadingState');
        const chainNotFound = document.getElementById('chainNotFound');
        const mainContent = document.getElementById('mainContent');

        if (loadingState) loadingState.classList.add('hidden');
        if (mainContent) mainContent.classList.add('hidden');
        if (chainNotFound) chainNotFound.classList.remove('hidden');
    }

    editChain() {
        if (!this.chain) return;
        
        // Populate edit form
        this.populateEditForm();
        this.showEditModal();
    }

    populateEditForm() {
        if (!this.chain) return;

        // Populate form fields
        const fields = {
            'editChainId': this.chain.chainId,
            'editName': this.chain.name,
            'editShortName': this.chain.shortName,
            'editSymbol': this.chain.symbol,
            'editDecimals': this.chain.decimals,
            'editImage': this.chain.image,
            'editRpcUrl': this.chain.rpcUrl,
            'editExplorerUrl': this.chain.explorerUrl,
            'editTestnet': this.chain.testnet.toString(),
            'editEnabled': this.chain.enabled.toString(),
            'editDescription': this.chain.description || ''
        };

        for (const [fieldId, value] of Object.entries(fields)) {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = value;
            }
        }
    }

    showEditModal() {
        const modal = document.getElementById('edit-modal');
        if (modal) {
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

    hideEditModal() {
        const modal = document.getElementById('edit-modal');
        if (modal) {
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

    async saveChain() {
        try {
            const form = document.getElementById('editChainForm');
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

            await apiService.updateChain(this.currentChainId, chainData);
            this.showSuccess('Chain updated successfully!');
            this.hideEditModal();
            
            // Reload chain data
            await this.loadChain();
            this.renderChainDetails();
            
        } catch (error) {
            console.error('Error updating chain:', error);
            this.showError(error.message || 'Failed to update chain');
        }
    }

    async deleteChain() {
        if (!confirm('Are you sure you want to delete this chain? This action cannot be undone.')) {
            return;
        }

        try {
            await apiService.deleteChain(this.currentChainId);
            this.showSuccess('Chain deleted successfully!');
            
            // Redirect to chains list
            window.location.href = '/backoffice/chains';
            
        } catch (error) {
            console.error('Failed to delete chain:', error);
            this.showError('Failed to delete chain');
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