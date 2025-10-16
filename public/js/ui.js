// UI Service - Handles DOM manipulation and UI state
class UIService {
    constructor() {
        this.elements = {
            // Table elements
            assetsTableBody: document.getElementById('assets-table-body'),
            assetsContainer: document.getElementById('assets-container'),
            loadingState: document.getElementById('loading'),
            errorState: document.getElementById('error'),
            emptyState: document.getElementById('empty-state'),
            
            // Filter elements
            searchInput: document.getElementById('search-input'),
            chainFilter: document.getElementById('chain-filter'),
            protocolFilter: document.getElementById('protocol-filter'),
            yieldFilter: document.getElementById('yield-filter'),
            enabledFilter: document.getElementById('enabled-filter'),
            
            // Modal elements
            createModal: document.getElementById('create-modal'),
            editModal: document.getElementById('edit-modal'),
            
            // Page elements
            assetsListPage: document.getElementById('assets-list-page'),
            assetDetailPage: document.getElementById('asset-detail-page')
        };
        
        this.currentViewAssetId = null;
    }

    showLoading() {
        this.elements.loadingState.classList.remove('hidden');
        this.elements.assetsContainer.classList.add('hidden');
        this.elements.errorState.classList.add('hidden');
        this.elements.emptyState.classList.add('hidden');
    }

    hideLoading() {
        this.elements.loadingState.classList.add('hidden');
    }

    showError(message) {
        this.elements.errorState.classList.remove('hidden');
        this.elements.errorState.querySelector('p').textContent = message;
        this.elements.assetsContainer.classList.add('hidden');
        this.elements.emptyState.classList.add('hidden');
    }

    showEmptyState() {
        this.elements.emptyState.classList.remove('hidden');
        this.elements.assetsContainer.classList.add('hidden');
        this.elements.errorState.classList.add('hidden');
    }

    showTable() {
        this.elements.assetsContainer.classList.remove('hidden');
        this.elements.emptyState.classList.add('hidden');
        this.elements.errorState.classList.add('hidden');
    }

    showAssetsListPage() {
        if (this.elements.assetsListPage) {
            this.elements.assetsListPage.classList.remove('hidden');
        }
        if (this.elements.assetDetailPage) {
            this.elements.assetDetailPage.classList.add('hidden');
        }
        this.currentViewAssetId = null;
    }

    showAssetDetailPage(asset) {
        if (this.elements.assetDetailPage) {
            this.populateAssetDetailPage(asset);
            this.elements.assetDetailPage.classList.remove('hidden');
        }
        if (this.elements.assetsListPage) {
            this.elements.assetsListPage.classList.add('hidden');
        }
        this.currentViewAssetId = asset.id || asset._id;
    }

    populateAssetDetailPage(asset) {
        // Update page title
        const titleElement = document.getElementById('asset-detail-title');
        if (titleElement) {
            titleElement.textContent = `${asset.token} Details`;
        }

        // Populate form fields
        this.populateEditForm(asset);
    }

    renderAssets(assets) {
        if (!assets || assets.length === 0) {
            this.showEmptyState();
            return;
        }

        this.showTable();
        
        const tbody = this.elements.assetsTableBody;
        tbody.innerHTML = '';

        assets.forEach(asset => {
            const row = this.createAssetRow(asset);
            tbody.appendChild(row);
        });
    }

    createAssetRow(asset) {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 cursor-pointer';
        
        const yieldBadge = asset.yieldBearingToken 
            ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Yield-bearing</span>'
            : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Standard</span>';

        const protocolText = asset.protocol || '-';
        const priceText = asset.usdPrice ? `$${Number(asset.usdPrice).toFixed(4)}` : '-';

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap" onclick="window.assetManager.viewAsset('${asset.id || asset._id}')">
                <div class="flex items-center">
                    <img class="h-8 w-8 rounded-full" src="${asset.icon}" alt="${asset.token}" onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"gray\"><circle cx=\"12\" cy=\"12\" r=\"10\"/></svg>'">
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${asset.token}</div>
                        <div class="text-sm text-gray-500">${asset.address.substring(0, 10)}...</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap" onclick="window.assetManager.viewAsset('${asset.id || asset._id}')">
                <span class="text-sm font-medium text-gray-900">${asset.chain}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap" onclick="window.assetManager.viewAsset('${asset.id || asset._id}')">
                <span class="text-sm text-gray-900">${protocolText}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap" onclick="window.assetManager.viewAsset('${asset.id || asset._id}')">
                <span class="text-sm text-gray-900">${priceText}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap" onclick="window.assetManager.viewAsset('${asset.id || asset._id}')">
                ${yieldBadge}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="event.stopPropagation(); window.assetManager.viewAsset('${asset.id || asset._id}')" class="text-indigo-600 hover:text-indigo-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="event.stopPropagation(); window.assetManager.deleteAsset('${asset.id || asset._id}')" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        return row;
    }

    getFilterValues() {
        return {
            search: this.elements.searchInput.value.trim(),
            chain: this.elements.chainFilter.value,
            protocol: this.elements.protocolFilter.value,
            yieldBearing: this.elements.yieldFilter.value === '' ? undefined : this.elements.yieldFilter.value === 'true'
        };
    }

    showCreateModal() {
        if (this.elements.createModal) {
            this.elements.createModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideCreateModal() {
        if (this.elements.createModal) {
            this.elements.createModal.classList.add('hidden');
            document.body.style.overflow = '';
            this.resetCreateForm();
        }
    }

    showEditModal(asset) {
        if (this.elements.editModal) {
            this.populateEditForm(asset);
            this.elements.editModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideEditModal() {
        if (this.elements.editModal) {
            this.elements.editModal.classList.add('hidden');
            document.body.style.overflow = '';
            this.resetEditForm();
        }
    }

    populateEditForm(asset) {
        // Populate basic fields
        document.getElementById('edit-token').value = asset.token || '';
        document.getElementById('edit-chain').value = asset.chain || '';
        document.getElementById('edit-address').value = asset.address || '';
        document.getElementById('edit-icon').value = asset.icon || '';
        document.getElementById('edit-chainId').value = asset.chainId || '';
        document.getElementById('edit-decimals').value = asset.decimals || '';
        document.getElementById('edit-maxDecimalsShow').value = asset.maxDecimalsShow || '';
        document.getElementById('edit-usdPrice').value = asset.usdPrice || '';
        document.getElementById('edit-protocol').value = asset.protocol || '';
        document.getElementById('edit-yieldBearingToken').checked = asset.yieldBearingToken || false;
        document.getElementById('edit-enabled').checked = asset.enabled !== false;

        // Handle lockYield
        const hasLockYield = asset.lockYield && Object.keys(asset.lockYield).length > 0;
        document.getElementById('edit-hasLockYield').checked = hasLockYield;
        
        const lockYieldSection = document.getElementById('edit-lockYieldSection');
        if (hasLockYield) {
            lockYieldSection.classList.remove('hidden');
            this.populateLockYieldForm(asset.lockYield, 'edit-');
        } else {
            lockYieldSection.classList.add('hidden');
        }

        // Store asset ID for form submission
        this.currentEditAssetId = asset.id || asset._id;
    }

    populateLockYieldForm(lockYield, prefix = '') {
        if (!lockYield) return;

        const setFieldValue = (fieldId, value) => {
            const element = document.getElementById(prefix + fieldId);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value || false;
                } else if (element.type === 'date' && value) {
                    // Convert date string to YYYY-MM-DD format
                    const date = new Date(value);
                    element.value = date.toISOString().split('T')[0];
                } else {
                    element.value = value || '';
                }
            }
        };

        setFieldValue('lockYieldExpirationDate', lockYield.expirationDate);
        setFieldValue('lockYieldProtocolName', lockYield.protocol?.name);
        setFieldValue('lockYieldSwap', lockYield.protocol?.swap);
        setFieldValue('lockYieldYtAddress', lockYield.protocol?.ytAddress);
        setFieldValue('lockYieldPtAddress', lockYield.protocol?.ptAddress);
        setFieldValue('lockYieldSwapAddress', lockYield.protocol?.swapAddress);
        setFieldValue('lockYieldYtMarketAddress', lockYield.protocol?.ytMarketAddress);
        setFieldValue('lockYieldYtDecimals', lockYield.protocol?.ytDecimals);
        setFieldValue('lockYieldPtDecimals', lockYield.protocol?.ptDecimals);
    }

    resetCreateForm() {
        const form = document.getElementById('create-asset-form');
        if (form) {
            form.reset();
            document.getElementById('lockYieldSection').classList.add('hidden');
        }
    }

    resetEditForm() {
        const form = document.getElementById('edit-asset-form');
        if (form) {
            form.reset();
            document.getElementById('edit-lockYieldSection').classList.add('hidden');
        }
        this.currentEditAssetId = null;
    }

    getCreateFormData() {
        const hasLockYield = document.getElementById('hasLockYield').checked;
        
        const formData = {
            token: document.getElementById('token').value,
            chain: document.getElementById('chain').value,
            address: document.getElementById('address').value,
            icon: document.getElementById('icon').value,
            chainId: parseInt(document.getElementById('chainId').value),
            decimals: parseInt(document.getElementById('decimals').value),
            maxDecimalsShow: parseInt(document.getElementById('maxDecimalsShow').value),
            usdPrice: parseFloat(document.getElementById('usdPrice').value),
            protocol: document.getElementById('protocol').value || undefined,
            yieldBearingToken: document.getElementById('yieldBearingToken').checked,
            enabled: document.getElementById('enabled').checked
        };

        if (hasLockYield) {
            formData.lockYield = this.getLockYieldFormData('');
        }

        return formData;
    }

    getEditFormData() {
        const hasLockYield = document.getElementById('edit-hasLockYield').checked;
        
        const formData = {
            token: document.getElementById('edit-token').value,
            chain: document.getElementById('edit-chain').value,
            address: document.getElementById('edit-address').value,
            icon: document.getElementById('edit-icon').value,
            chainId: parseInt(document.getElementById('edit-chainId').value),
            decimals: parseInt(document.getElementById('edit-decimals').value),
            maxDecimalsShow: parseInt(document.getElementById('edit-maxDecimalsShow').value),
            usdPrice: parseFloat(document.getElementById('edit-usdPrice').value),
            protocol: document.getElementById('edit-protocol').value || undefined,
            yieldBearingToken: document.getElementById('edit-yieldBearingToken').checked,
            enabled: document.getElementById('edit-enabled').checked
        };

        if (hasLockYield) {
            formData.lockYield = this.getLockYieldFormData('edit-');
        } else {
            formData.lockYield = null;
        }

        return formData;
    }

    getLockYieldFormData(prefix) {
        return {
            expirationDate: document.getElementById(prefix + 'lockYieldExpirationDate').value || undefined,
            protocol: {
                name: document.getElementById(prefix + 'lockYieldProtocolName').value || undefined,
                swap: document.getElementById(prefix + 'lockYieldSwap').checked,
                ytAddress: document.getElementById(prefix + 'lockYieldYtAddress').value || undefined,
                ptAddress: document.getElementById(prefix + 'lockYieldPtAddress').value || undefined,
                swapAddress: document.getElementById(prefix + 'lockYieldSwapAddress').value || undefined,
                ytMarketAddress: document.getElementById(prefix + 'lockYieldYtMarketAddress').value || undefined,
                ytDecimals: parseInt(document.getElementById(prefix + 'lockYieldYtDecimals').value) || undefined,
                ptDecimals: parseInt(document.getElementById(prefix + 'lockYieldPtDecimals').value) || undefined
            }
        };
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg text-white transform transition-transform duration-300 translate-x-full ${
            type === 'error' ? 'bg-red-500' : 
            type === 'success' ? 'bg-green-500' : 
            'bg-blue-500'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Export as global
window.uiService = new UIService(); 