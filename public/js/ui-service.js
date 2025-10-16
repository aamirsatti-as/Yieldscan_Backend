// UI Service - Handles UI interactions and notifications
class UiService {
    constructor() {
        this.toastContainer = null;
        this.initToastContainer();
    }

    initToastContainer() {
        this.toastContainer = document.getElementById('toast-container');
        if (!this.toastContainer) {
            // Create toast container if it doesn't exist
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'toast-container';
            this.toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(this.toastContainer);
        }
    }

    showToast(message, type = 'info', duration = 5000) {
        const toast = this.createToast(message, type);
        this.toastContainer.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.remove('opacity-0', 'translate-x-full');
            toast.classList.add('opacity-100', 'translate-x-0');
        }, 10);

        // Auto remove
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);

        return toast;
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `
            flex items-center p-4 mb-4 text-sm text-gray-800 rounded-lg shadow-lg 
            opacity-0 translate-x-full transform transition-all duration-300 ease-in-out
            max-w-sm w-full
        `;

        let bgColor, iconClass, textColor;
        switch (type) {
            case 'success':
                bgColor = 'bg-green-100 border border-green-200';
                iconClass = 'fas fa-check-circle text-green-500';
                textColor = 'text-green-800';
                break;
            case 'error':
                bgColor = 'bg-red-100 border border-red-200';
                iconClass = 'fas fa-exclamation-triangle text-red-500';
                textColor = 'text-red-800';
                break;
            case 'warning':
                bgColor = 'bg-yellow-100 border border-yellow-200';
                iconClass = 'fas fa-exclamation-triangle text-yellow-500';
                textColor = 'text-yellow-800';
                break;
            case 'info':
            default:
                bgColor = 'bg-blue-100 border border-blue-200';
                iconClass = 'fas fa-info-circle text-blue-500';
                textColor = 'text-blue-800';
                break;
        }

        toast.classList.add(...bgColor.split(' '));
        toast.classList.add(...textColor.split(' '));

        toast.innerHTML = `
            <div class="flex items-center">
                <i class="${iconClass} mr-3 flex-shrink-0"></i>
                <div class="flex-1">
                    <span class="font-medium">${message}</span>
                </div>
                <button type="button" class="ml-4 -mx-1.5 -my-1.5 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 items-center justify-center" 
                        onclick="this.closest('[class*=opacity]').remove()">
                    <i class="fas fa-times w-3 h-3"></i>
                </button>
            </div>
        `;

        return toast;
    }

    removeToast(toast) {
        if (toast && toast.parentNode) {
            toast.classList.remove('opacity-100', 'translate-x-0');
            toast.classList.add('opacity-0', 'translate-x-full');
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    showSuccess(message) {
        return this.showToast(message, 'success');
    }

    showError(message) {
        return this.showToast(message, 'error');
    }

    showWarning(message) {
        return this.showToast(message, 'warning');
    }

    showInfo(message) {
        return this.showToast(message, 'info');
    }

    // Confirmation dialog
    showConfirmDialog(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const result = confirm(`${title}\n\n${message}`);
            resolve(result);
        });
    }

    // Loading state management
    showLoading(element, text = 'Loading...') {
        if (element) {
            element.innerHTML = `
                <div class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    <span class="text-sm text-gray-600">${text}</span>
                </div>
            `;
        }
    }

    hideLoading(element, originalContent = '') {
        if (element) {
            element.innerHTML = originalContent;
        }
    }
}

// Export as global
window.UiService = UiService; 