/**
 * Structured Logger for IMRS Backend
 * Provides consistent JSON logging with timestamps and request context
 */

const logger = {
    /**
     * Log with timestamp and context
     * @param {string} level - 'INFO', 'WARN', 'ERROR', 'DEBUG'
     * @param {string} message - Log message
     * @param {object} context - Additional context (request, user, data, etc.)
     */
    log(level, message, context = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...context
        };
        console.log(JSON.stringify(logEntry));
    },

    info(message, context) {
        this.log('INFO', message, context);
    },

    warn(message, context) {
        this.log('WARN', message, context);
    },

    error(message, context) {
        this.log('ERROR', message, context);
    },

    debug(message, context) {
        this.log('DEBUG', message, context);
    },

    /**
     * Log API request
     */
    logRequest(method, path, status = null, error = null) {
        const context = { method, path, status };
        if (error) context.error = error;
        
        const level = status >= 400 ? 'ERROR' : 'INFO';
        this.log(level, `API ${method} ${path}`, context);
    },

    /**
     * Log API response
     */
    logResponse(method, path, status, duration) {
        this.log('INFO', `API ${method} ${path} - ${status}`, { 
            method, 
            path, 
            status, 
            durationMs: duration 
        });
    },

    /**
     * Log Supabase operations
     */
    logDatabase(operation, table, error = null) {
        const level = error ? 'ERROR' : 'INFO';
        const context = { operation, table };
        if (error) context.error = error;
        this.log(level, `Database ${operation} on ${table}`, context);
    }
};

export default logger;
