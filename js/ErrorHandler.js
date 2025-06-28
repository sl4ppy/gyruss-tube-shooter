/**
 * Error Handler Class
 * Provides centralized error handling and logging throughout the game
 */

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.enabled = true;
        
        this.setupGlobalErrorHandling();
    }
    
    setupGlobalErrorHandling() {
        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('Unhandled Promise Rejection', event.reason);
        });
        
        // Catch global errors
        window.addEventListener('error', (event) => {
            this.handleError('Global Error', event.error || event.message, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        console.log('ErrorHandler: Global error handling initialized');
    }
    
    handleError(type, error, context = {}) {
        if (!this.enabled) return;
        
        const errorInfo = {
            type: type,
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : null,
            timestamp: new Date().toISOString(),
            context: context
        };
        
        this.errors.push(errorInfo);
        
        // Keep only the most recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        // Log the error
        this.logError(errorInfo);
        
        // Show user-friendly error message if needed
        this.showUserError(errorInfo);
    }
    
    logError(errorInfo) {
        const logMessage = `[${errorInfo.timestamp}] ${errorInfo.type}: ${errorInfo.message}`;
        
        if (errorInfo.stack) {
            console.error(logMessage, errorInfo.stack);
        } else {
            console.error(logMessage);
        }
        
        if (errorInfo.context && Object.keys(errorInfo.context).length > 0) {
            console.error('Context:', errorInfo.context);
        }
    }
    
    showUserError(errorInfo) {
        // Only show critical errors to the user
        const criticalErrors = [
            'Asset Loading Failed',
            'Game Initialization Failed',
            'Critical System Error'
        ];
        
        if (criticalErrors.includes(errorInfo.type)) {
            this.displayErrorModal(errorInfo);
        }
    }
    
    displayErrorModal(errorInfo) {
        // Create error modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: 'Courier New', monospace;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: #1a1a1a;
            border: 2px solid #ff0000;
            border-radius: 10px;
            padding: 20px;
            max-width: 500px;
            color: white;
            text-align: center;
        `;
        
        content.innerHTML = `
            <h2 style="color: #ff0000; margin-top: 0;">⚠️ Error Occurred</h2>
            <p><strong>${errorInfo.type}</strong></p>
            <p>${errorInfo.message}</p>
            <p style="font-size: 12px; color: #888;">
                Time: ${new Date(errorInfo.timestamp).toLocaleString()}
            </p>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: #ff0000; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                Dismiss
            </button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
    }
    
    // Asset loading error handler
    handleAssetError(assetType, assetKey, error) {
        this.handleError('Asset Loading Failed', error, {
            assetType: assetType,
            assetKey: assetKey
        });
        
        // Create fallback asset
        this.createFallbackAsset(assetType, assetKey);
    }
    
    createFallbackAsset(assetType, assetKey) {
        console.log(`ErrorHandler: Creating fallback ${assetType} for ${assetKey}`);
        
        // This will be handled by the specific managers
        // (Player, EnemyManager, etc. will create procedural assets)
    }
    
    // Game system error handler
    handleSystemError(system, error, context = {}) {
        this.handleError('System Error', error, {
            system: system,
            ...context
        });
    }
    
    // Performance error handler
    handlePerformanceError(metric, value, threshold) {
        this.handleError('Performance Warning', `Performance metric ${metric} exceeded threshold`, {
            metric: metric,
            value: value,
            threshold: threshold
        });
    }
    
    // Get error statistics
    getErrorStats() {
        const stats = {
            total: this.errors.length,
            byType: {},
            recent: this.errors.slice(-10)
        };
        
        this.errors.forEach(error => {
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
        });
        
        return stats;
    }
    
    // Clear errors
    clearErrors() {
        this.errors = [];
        console.log('ErrorHandler: Errors cleared');
    }
    
    // Enable/disable error handling
    enable() {
        this.enabled = true;
        console.log('ErrorHandler: Error handling enabled');
    }
    
    disable() {
        this.enabled = false;
        console.log('ErrorHandler: Error handling disabled');
    }
    
    // Export errors for debugging
    exportErrors() {
        return JSON.stringify(this.errors, null, 2);
    }
}

// Create global error handler instance
window.gameErrorHandler = new ErrorHandler(); 