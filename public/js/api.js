// API Service - Handles all backend communication
class ApiService {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, finalOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || errorData.details || `HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            return await response.text();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // Assets API methods
    async getAssets(filters = {}) {
        const params = new URLSearchParams();

        // Include disabled assets for backoffice
        params.append('includeDisabled', 'true');

        if (filters.search) params.append('search', filters.search);
        if (filters.chain) params.append('chain', filters.chain);
        if (filters.protocol) params.append('protocol', filters.protocol);
        if (filters.yieldBearing !== undefined) params.append('yieldBearing', filters.yieldBearing);
        if (filters.enabled !== undefined && filters.enabled !== '') params.append('enabled', filters.enabled);

        const queryString = params.toString();
        const url = queryString ? `/assets?${queryString}` : '/assets';

        const response = await this.request(url);

        // Extract assets array from response object
        return response.assets || [];
    }

    async getAsset(id) {
        const response = await this.request(`/assets/${id}?includeDisabled=true`);
        return response.asset;
    }

    async createAsset(assetData) {
        return await this.request('/assets', {
            method: 'POST',
            body: JSON.stringify(assetData)
        });
    }

    async updateAsset(id, assetData) {
        return await this.request(`/assets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(assetData)
        });
    }

    async deleteAsset(id) {
        return await this.request(`/assets/${id}`, {
            method: 'DELETE'
        });
    }

    // Steps API methods
    async getSteps(assetId, options = {}) {
        const params = new URLSearchParams();

        // Include disabled steps for backoffice
        params.append('includeDisabled', 'true');

        if (options.protocol) params.append('protocol', options.protocol);

        const queryString = params.toString();
        const url = queryString ? `/steps/asset/${assetId}?${queryString}` : `/steps/asset/${assetId}`;

        const response = await this.request(url);
        return response.steps || [];
    }

    async getStep(id) {
        const response = await this.request(`/steps/${id}`);
        return response.step;
    }

    async createStep(stepData) {
        return await this.request('/steps', {
            method: 'POST',
            body: JSON.stringify(stepData)
        });
    }

    async updateStep(id, stepData) {
        return await this.request(`/steps/${id}`, {
            method: 'PUT',
            body: JSON.stringify(stepData)
        });
    }

    async deleteStep(id) {
        return await this.request(`/steps/${id}`, {
            method: 'DELETE'
        });
    }

    async bulkCreateSteps(assetId, steps) {
        return await this.request('/steps/bulk', {
            method: 'POST',
            body: JSON.stringify({
                assetId,
                steps
            })
        });
    }

    async reorderSteps(assetId, stepOrders) {
        return await this.request(`/steps/reorder/${assetId}`, {
            method: 'POST',
            body: JSON.stringify({
                stepOrders
            })
        });
    }

    // Chains API methods
    async getChains(filters = {}) {
        const params = new URLSearchParams();

        // Include disabled chains for backoffice
        params.append('includeDisabled', 'true');

        if (filters.enabled !== undefined && filters.enabled !== '') params.append('enabled', filters.enabled);
        if (filters.testnet !== undefined && filters.testnet !== '') params.append('testnet', filters.testnet);

        const queryString = params.toString();
        const url = queryString ? `/chains?${queryString}` : '/chains';

        const response = await this.request(url);

        // Extract chains array from response object
        return response.chains || response || [];
    }

    async getChain(id) {
        const response = await this.request(`/chains/${id}?includeDisabled=true`);
        return response.chain;
    }

    async getChainByChainId(chainId) {
        const response = await this.request(`/chains/chainId/${chainId}?includeDisabled=true`);
        return response.chain;
    }

    async createChain(chainData) {
        return await this.request('/chains', {
            method: 'POST',
            body: JSON.stringify(chainData)
        });
    }

    async updateChain(id, chainData) {
        return await this.request(`/chains/${id}`, {
            method: 'PUT',
            body: JSON.stringify(chainData)
        });
    }

    async deleteChain(id) {
        return await this.request(`/chains/${id}`, {
            method: 'DELETE'
        });
    }

    async bulkCreateChains(chains) {
        return await this.request('/chains/bulk', {
            method: 'POST',
            body: JSON.stringify({
                chains
            })
        });
    }

    // Protocols API methods
    async getProtocols(filters = {}) {
        const params = new URLSearchParams();

        // Include disabled protocols for backoffice
        params.append('includeDisabled', 'true');

        if (filters.enabled !== undefined && filters.enabled !== '') params.append('enabled', filters.enabled);
        if (filters.category) params.append('category', filters.category);

        const queryString = params.toString();
        const url = queryString ? `/protocols?${queryString}` : '/protocols';

        const response = await this.request(url);

        // Extract protocols array from response object
        return response.protocols || response || [];
    }

    async getProtocol(id) {
        const response = await this.request(`/protocols/${id}?includeDisabled=true`);
        return response.protocol;
    }

    async getProtocolByName(name) {
        const response = await this.request(`/protocols/name/${name}?includeDisabled=true`);
        return response.protocol;
    }

    async getProtocolsByChainId(chainId) {
        const response = await this.request(`/protocols/chain/${chainId}?includeDisabled=true`);
        return response.protocols;
    }

    async createProtocol(protocolData) {
        return await this.request('/protocols', {
            method: 'POST',
            body: JSON.stringify(protocolData)
        });
    }

    async updateProtocol(id, protocolData) {
        return await this.request(`/protocols/${id}`, {
            method: 'PUT',
            body: JSON.stringify(protocolData)
        });
    }

    async deleteProtocol(id) {
        return await this.request(`/protocols/${id}`, {
            method: 'DELETE'
        });
    }

    async bulkCreateProtocols(protocols) {
        return await this.request('/protocols/bulk', {
            method: 'POST',
            body: JSON.stringify({
                protocols
            })
        });
    }
}

// Export as global for now
window.apiService = new ApiService(); 