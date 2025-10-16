// Main Application Entry Point
class App {
    constructor() {
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                this.start();
            }
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Application failed to start');
        }
    }

    async start() {
        try {
            // Initialize core services
            this.setupGlobalHandlers();
            
            // Initialize asset manager
            await assetManager.initialize();
            
            this.isInitialized = true;
            console.log('App initialized successfully');
            
        } catch (error) {
            console.error('Failed to start app:', error);
            uiService.showError('Failed to initialize application');
        }
    }

    setupGlobalHandlers() {
        // Mobile sidebar toggle
        window.toggleMobileSidebar = () => {
            const overlay = document.getElementById('mobile-sidebar-overlay');
            overlay.classList.toggle('hidden');
        };

        // Modal handlers
        window.showCreateModal = () => {
            assetManager.showCreateModal();
        };

        window.hideCreateModal = () => {
            uiService.hideCreateModal();
        };

        window.hideEditModal = () => {
            uiService.hideEditModal();
        };

        window.goBackToAssetsList = () => {
            assetManager.goBackToAssetsList();
        };

        // Global error handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            uiService.showToast('An unexpected error occurred', 'error');
        });

        // Global click handler for closing dropdowns/modals when clicking outside
        document.addEventListener('click', (event) => {
            // Future: Handle closing dropdowns/modals
        });

        // Global step modal functions
        window.showCreateStepModal = () => {
            assetManager.showCreateStepModal();
        };

        window.hideCreateStepModal = () => {
            assetManager.hideCreateStepModal();
        };
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed inset-0 bg-red-600 text-white p-4 z-50 flex items-center justify-center';
        errorDiv.innerHTML = `
            <div class="text-center">
                <h2 class="text-xl font-bold mb-2">Application Error</h2>
                <p>${message}</p>
                <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-white text-red-600 rounded">
                    Reload Page
                </button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Initialize the application
const app = new App();
app.initialize(); 