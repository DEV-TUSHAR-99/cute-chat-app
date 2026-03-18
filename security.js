// Security Module for Cute Chat App (Enhanced)
// Handles: Rate limiting, validation, encryption, access control, CSRF, comprehensive headers
// FIXES APPLIED:
// - Persistent encryption key management with validation
// - Structured JSON logging with levels
// - Token storage with expiry for CSRF
// - Improved input validation (Unicode support)
// - Enhanced security headers (COOP, COEP, etc.)
// - IP normalization for proxy compatibility
// - Nonce-ready CSP (integration needed in server.js)
// - Cleanup of expired tokens

const crypto = require('crypto');

class ChatSecurity {
    constructor() {
        // Rate limiting storage: key -> { count, firstAttempt }
        this.rateLimits = new Map();

        // Blocked IPs
        this.blockedIPs = new Set();

        // Room access tracking: key -> { count, firstAttempt }
        this.roomAttempts = new Map();

        // Token store for CSRF and other temporary tokens: token -> { data, expiresAt }
        this.tokenStore = new Map();

        // Logger setup (MUST be before loadEncryptionKey)
        this.setupLogger();

        // Load encryption key (CRITICAL: Set CHAT_ENCRYPTION_KEY env var with 64 hex chars)
        this.encryptionKey = this.loadEncryptionKey();

        // Security configuration
        this.config = {
            maxMessagesPerMinute: 30,
            maxRoomJoinAttempts: 5,
            blockDurationMinutes: 30,
            maxMessageLength: 1000,
            maxUsernameLength: 20,
            tokenExpiryHours: 24,
            csrfTokenExpiryMinutes: 60,
            rateLimitWindowMs: 60000, // 1 minute for messages
            roomJoinWindowMs: 300000 // 5 minutes for room join
        };

        // Start cleanup interval
        this.startCleanupInterval();

        this.logger.info('ChatSecurity initialized', {
            env: process.env.NODE_ENV || 'development',
            encryptionKeySource: process.env.CHAT_ENCRYPTION_KEY ? 'environment' : 'temporary (in-memory)'
        });
    }
    
    // ========== ENCRYPTION KEY MANAGEMENT ==========

    loadEncryptionKey() {
        const keyEnv = process.env.CHAT_ENCRYPTION_KEY;
        if (keyEnv) {
            // Accept hex string
            let key = Buffer.isBuffer(keyEnv) ? keyEnv : Buffer.from(keyEnv, 'hex');
            if (key.length !== 32) {
                this.logger.warn('Encryption key must be 32 bytes (64 hex characters). Using temporary key.', {
                    providedLength: key.length
                });
                return crypto.randomBytes(32);
            }
            this.logger.debug('Loaded encryption key from environment');
            return key;
        }
        if (process.env.NODE_ENV === 'production') {
            throw new Error('CHAT_ENCRYPTION_KEY environment variable is required in production mode. Set a 32-byte (64 hex char) key.');
        }
        this.logger.warn('CHAT_ENCRYPTION_KEY not set. Using temporary key. Messages will not be decryptable after server restart!');
        return crypto.randomBytes(32);
    }

    // ========== LOGGING ==========

    setupLogger() {
        const logToFile = process.env.LOG_FILE;
        let logStream = null;

        if (logToFile) {
            const fs = require('fs');
            try {
                logStream = fs.createWriteStream(logToFile, { flags: 'a' });
                this.logger = this.createLogger(logStream);
            } catch (err) {
                console.error('Failed to open log file:', err);
                this.logger = this.createLogger(null);
            }
        } else {
            this.logger = this.createLogger(null);
        }
    }

    createLogger(stream) {
        return {
            info: (msg, meta = {}) => this.log('INFO', msg, meta, stream),
            warn: (msg, meta = {}) => this.log('WARN', msg, meta, stream),
            error: (msg, meta = {}) => this.log('ERROR', msg, meta, stream),
            debug: (msg, meta = {}) => {
                if (process.env.DEBUG) {
                    this.log('DEBUG', msg, meta, stream);
                }
            }
        };
    }

    log(level, message, meta = {}, stream = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...meta
        };
        const logString = JSON.stringify(logEntry) + '\n';

        // Output to console (stderr for errors, stdout for others)
        const out = level === 'ERROR' ? console.error : console.info;
        out(logString.substring(0, logString.length - 1));

        if (stream) {
            stream.write(logString);
        }
    }

    // Override old logSecurityEvent to use new logger
    logSecurityEvent(event, details) {
        this.logger.info(event, details);
    }

    // ========== IP HANDLING ==========

    normalizeIp(ip) {
        if (!ip || ip === 'unknown') return 'unknown';
        // Strip IPv6 prefix ::ffff: for mapped IPv4
        if (ip.startsWith('::ffff:')) {
            return ip.substring(7);
        }
        return ip;
    }

    getClientIp(req) {
        // Express's req.ip is set if trust proxy is configured
        let ip = req.ip;
        if (!ip) {
            ip = req.connection.remoteAddress;
            if (!ip && req.headers['x-forwarded-for']) {
                ip = req.headers['x-forwarded-for'].split(',')[0].trim();
            }
        }
        return this.normalizeIp(ip);
    }

    // ========== RATE LIMITING ==========

    checkRateLimit(identifier, type = 'message') {
        const now = Date.now();
        const key = `${identifier}:${type}`;

        if (!this.rateLimits.has(key)) {
            this.rateLimits.set(key, { count: 1, firstAttempt: now });
            return { allowed: true, remaining: this.config.maxMessagesPerMinute - 1 };
        }

        const limit = this.rateLimits.get(key);
        const timeWindow = type === 'message' ? this.config.rateLimitWindowMs : this.config.roomJoinWindowMs;
        const maxAllowed = type === 'message' ? this.config.maxMessagesPerMinute : this.config.maxRoomJoinAttempts;

        // Reset window if expired
        if (now - limit.firstAttempt > timeWindow) {
            this.rateLimits.set(key, { count: 1, firstAttempt: now });
            return { allowed: true, remaining: maxAllowed - 1 };
        }

        limit.count++;

        if (limit.count > maxAllowed) {
            return {
                allowed: false,
                reason: `Rate limit exceeded. Max ${maxAllowed} ${type}s per ${timeWindow/60000} minutes.`,
                retryAfter: Math.ceil((limit.firstAttempt + timeWindow - now) / 1000)
            };
        }

        return { allowed: true, remaining: maxAllowed - limit.count };
    }
    
    // ========== IP BLOCKING ==========

    blockIP(ip, durationMinutes = this.config.blockDurationMinutes) {
        ip = this.normalizeIp(ip);
        this.blockedIPs.add(ip);
        const unblockTime = Date.now() + durationMinutes * 60 * 1000;
        setTimeout(() => {
            this.blockedIPs.delete(ip);
            this.logger.debug('IP unblocked', { ip: this.hashIP(ip) });
        }, durationMinutes * 60 * 1000);
    }

    isIPBlocked(ip) {
        ip = this.normalizeIp(ip);
        return this.blockedIPs.has(ip);
    }
    
    // ========== INPUT VALIDATION ==========

    sanitizeInput(input) {
        if (typeof input !== 'string') return '';

        // Remove null bytes
        let sanitized = input.replace(/\0/g, '');

        // Remove HTML tags
        sanitized = sanitized.replace(/<[^>]*>/g, '');

        // Escape special characters
        sanitized = sanitized
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');

        // Normalize whitespace (trim and collapse multiple spaces)
        sanitized = sanitized.trim().replace(/\s+/g, ' ');

        return sanitized;
    }
    
    validateUsername(username) {
        const errors = [];

        if (!username || typeof username !== 'string') {
            errors.push('Username is required');
            return { valid: false, errors };
        }

        const sanitized = this.sanitizeInput(username);

        if (sanitized.length < 2) {
            errors.push('Username must be at least 2 characters');
        }

        if (sanitized.length > this.config.maxUsernameLength) {
            errors.push(`Username must be less than ${this.config.maxUsernameLength} characters`);
        }

        // Check for only numbers
        if (/^[0-9]+$/.test(sanitized)) {
            errors.push('Username cannot be only numbers');
        }

        // Blacklist reserved words
        const spamPatterns = ['admin', 'moderator', 'support', 'system', 'official', 'root', 'null', 'undefined'];
        if (spamPatterns.some(pattern => sanitized.toLowerCase().includes(pattern))) {
            errors.push('Reserved username');
        }

        return {
            valid: errors.length === 0,
            errors,
            sanitized: sanitized.substring(0, this.config.maxUsernameLength)
        };
    }
    
    validateMessage(message) {
        const errors = [];

        if (!message || typeof message !== 'string') {
            errors.push('Message is required');
            return { valid: false, errors };
        }

        const sanitized = this.sanitizeInput(message);

        if (sanitized.length === 0) {
            errors.push('Message cannot be empty');
            return { valid: false, errors };
        }

        if (sanitized.length > this.config.maxMessageLength) {
            errors.push(`Message too long (max ${this.config.maxMessageLength} chars)`);
        }

        // Spam detection patterns
        const spamPatterns = [
            /(.{2,})\1{4,}/, // Repeated sequences (e.g., "abcabcabc")
            /(ha|he|ho|en|em)\1{3,}/gi, // Repeated laughter
            /(https?:\/\/|www\.)[\w-]+\.[\w-]{2,}/gi, // URLs (optional)
            /[^\x00-\x7F]{10,}/ // Long non-ASCII sequences
        ];

        spamPatterns.forEach(pattern => {
            if (pattern.test(sanitized)) {
                errors.push('Message contains suspicious content');
            }
        });

        // Flood detection: too many same characters
        const charCounts = {};
        for (let char of sanitized) {
            charCounts[char] = (charCounts[char] || 0) + 1;
            if (charCounts[char] > 50) {
                errors.push('Too many repeated characters');
                break;
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            sanitized: sanitized.substring(0, this.config.maxMessageLength)
        };
    }
    
    validateToken(token) {
        if (!token || typeof token !== 'string') {
            return { valid: false, reason: 'Invalid token format' };
        }

        const parts = token.split('_');

        if (parts.length === 2) {
            // Full token: roomId_token
            const [roomId, tokenPart] = parts;

            if (!roomId || !tokenPart) {
                return { valid: false, reason: 'Invalid token components' };
            }

            if (tokenPart.length < 8) {
                return { valid: false, reason: 'Token too short' };
            }

            // Validate roomId is hex (32 chars)
            if (!/^[a-f0-9]{32}$/.test(roomId)) {
                return { valid: false, reason: 'Invalid room ID format' };
            }

            return { valid: true, roomId, tokenPart };
        } else if (parts.length === 1) {
            // Just token part (no roomId)
            const tokenPart = parts[0];

            if (tokenPart.length < 8) {
                return { valid: false, reason: 'Token too short' };
            }

            return { valid: true, roomId: null, tokenPart };
        } else {
            return { valid: false, reason: 'Invalid token format' };
        }
    }
    
    // ========== TOKEN STORAGE & CSRF ==========

    /**
     * Store a token with expiry (for CSRF, etc.)
     */
    storeToken(token, data, ttlMs = this.config.csrfTokenExpiryMinutes * 60 * 1000) {
        const expiresAt = Date.now() + ttlMs;
        this.tokenStore.set(token, { data, expiresAt });
        this.logger.debug('Token stored', {
            tokenPreview: token.substring(0, 8) + '...',
            expiresAt: new Date(expiresAt).toISOString()
        });
    }

    /**
     * Retrieve and validate token, auto-remove if expired
     */
    getStoredToken(token) {
        const entry = this.tokenStore.get(token);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.tokenStore.delete(token);
            this.logger.debug('Token expired', { tokenPreview: token.substring(0, 8) + '...' });
            return null;
        }

        return entry.data;
    }

    /**
     * Generate a CSRF token for a given identifier (e.g., user session, socket ID)
     */
    generateCsrfToken(identifier) {
        const token = crypto.randomBytes(16).toString('hex');
        this.storeToken(token, { type: 'csrf', identifier }, this.config.csrfTokenExpiryMinutes * 60 * 1000);
        return token;
    }

    /**
     * Validate a CSRF token for an identifier
     */
    validateCsrfToken(token, identifier) {
        const data = this.getStoredToken(token);
        if (!data) return false;
        if (data.type !== 'csrf') return false;
        if (data.identifier !== identifier) return false;
        // One-time use: remove after validation
        this.tokenStore.delete(token);
        return true;
    }

    // ========== ENCRYPTION ==========
    
    encryptMessage(message) {
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

            let encrypted = cipher.update(message, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            const authTag = cipher.getAuthTag();

            return {
                encrypted: encrypted,
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex')
            };
        } catch (error) {
            this.logger.error('Encryption error', { error: error.message });
            return null;
        }
    }
    
    decryptMessage(encryptedData) {
        try {
            const decipher = crypto.createDecipheriv(
                'aes-256-gcm',
                this.encryptionKey,
                Buffer.from(encryptedData.iv, 'hex')
            );

            decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

            let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            this.logger.error('Decryption error', { error: error.message });
            return null;
        }
    }
    
    // ========== ROOM SECURITY ==========
    
    trackRoomAttempt(roomId, ip) {
        ip = this.normalizeIp(ip);
        const key = `${roomId}:${ip}`;
        const now = Date.now();

        if (!this.roomAttempts.has(key)) {
            this.roomAttempts.set(key, { count: 1, firstAttempt: now });
            return { allowed: true };
        }

        const attempts = this.roomAttempts.get(key);

        if (now - attempts.firstAttempt > this.config.roomJoinWindowMs) {
            this.roomAttempts.set(key, { count: 1, firstAttempt: now });
            return { allowed: true };
        }

        attempts.count++;

        if (attempts.count > this.config.maxRoomJoinAttempts) {
            this.blockIP(ip, 30);
            return {
                allowed: false,
                reason: 'Too many failed attempts. IP blocked for 30 minutes.'
            };
        }

        return { allowed: true, remaining: this.config.maxRoomJoinAttempts - attempts.count };
    }
    
    clearRoomAttempts(roomId, ip) {
        ip = this.normalizeIp(ip);
        const key = `${roomId}:${ip}`;
        this.roomAttempts.delete(key);
    }
    
    // ========== SECURITY HEADERS ==========

    getSecurityHeaders(options = {}) {
        // Nonce can be passed if server integrates CSP nonce
        // const nonce = options.nonce ? `'nonce-${options.nonce}'` : '';

        return {
            // Prevent MIME type sniffing
            'X-Content-Type-Options': 'nosniff',

            // Clickjacking protection
            'X-Frame-Options': 'DENY',

            // XSS protection (legacy, for older browsers)
            'X-XSS-Protection': '1; mode=block',

            // Referrer policy
            'Referrer-Policy': 'strict-origin-when-cross-origin',

            // Content Security Policy
            // NOTE: 'unsafe-inline' is required for inline scripts.
            // For better security, move scripts to external files and remove 'unsafe-inline'.
            // Consider using nonce: script-src 'self' 'nonce-...' ...
            'Content-Security-Policy': [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' https://cdn.socket.io https://fonts.googleapis.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src https://fonts.gstatic.com",
                "connect-src 'self' wss: https:",
                "img-src 'self' data: https:",
                "object-src 'none'",
                "base-uri 'none'",
                "form-action 'self'",
                "upgrade-insecure-requests"
            ].join('; '),

            // HTTP Strict Transport Security (HTTPS only, but sent always)
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

            // Permissions Policy
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',

            // Modern security headers for cross-origin isolation
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',

            // Prevent IE from opening downloads
            'X-Download-Options': 'noopen',

            // Restrict cross-domain policies for Flash/Acrobat
            'X-Permitted-Cross-Domain-Policies': 'none',

            // Disable DNS prefetching to prevent information leakage
            'X-DNS-Prefetch-Control': 'off'
        };
    }
    
    // ========== HASHING ==========

    hashIP(ip) {
        // Use a consistent salt from environment or fallback to a static string
        // In production, set IP_HASH_SALT to a random secret
        const salt = process.env.IP_HASH_SALT || 'default-insufficient-salt-change-me';
        const hashInput = ip + (Buffer.isBuffer(salt) ? salt.toString('hex') : salt);
        return crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 16);
    }
    
    // ========== CLEANUP ==========

    startCleanupInterval() {
        setInterval(() => {
            const now = Date.now();
            let cleaned = 0;

            // Clean old rate limits (older than 10 minutes)
            for (const [key, limit] of this.rateLimits) {
                if (now - limit.firstAttempt > 600000) {
                    this.rateLimits.delete(key);
                    cleaned++;
                }
            }

            // Clean old room attempts (older than 10 minutes)
            for (const [key, attempt] of this.roomAttempts) {
                if (now - attempt.firstAttempt > 600000) {
                    this.roomAttempts.delete(key);
                    cleaned++;
                }
            }

            // Clean expired tokens
            for (const [token, entry] of this.tokenStore) {
                if (now > entry.expiresAt) {
                    this.tokenStore.delete(token);
                    cleaned++;
                }
            }

            if (cleaned > 0) {
                this.logger.debug('Cleanup completed', { cleanedEntries: cleaned });
            }
        }, 300000); // Every 5 minutes
    }
    
    // ========== EXPRESS MIDDLEWARE ==========

    middleware(options = {}) {
        return (req, res, next) => {
            // Get client IP using our method (requires app.set('trust proxy', 1) in Express)
            const clientIp = this.getClientIp(req);

            // Check if IP blocked
            if (this.isIPBlocked(clientIp)) {
                this.logSecurityEvent('IP_BLOCKED', {
                    ip: this.hashIP(clientIp),
                    path: req.path,
                    method: req.method
                });
                return res.status(403).json({ error: 'Access denied' });
            }

            // Rate limit connections if enabled
            if (options.rateLimitConnections) {
                const connCheck = this.checkRateLimit(clientIp, 'connection');
                if (!connCheck.allowed) {
                    this.logSecurityEvent('CONNECTION_RATE_LIMITED', {
                        ip: this.hashIP(clientIp),
                        reason: connCheck.reason
                    });
                    return res.status(429).json({
                        error: connCheck.reason,
                        retryAfter: connCheck.retryAfter
                    });
                }
            }

            // Set security headers
            const headers = this.getSecurityHeaders(options);
            Object.entries(headers).forEach(([key, value]) => {
                res.setHeader(key, value);
            });

            // Log request
            this.logSecurityEvent('REQUEST', {
                method: req.method,
                path: req.path,
                ip: this.hashIP(clientIp),
                userAgent: req.get('User-Agent')?.substring(0, 100) // Truncate
            });

            next();
        };
    }

    // ========== SOCKET.IO MIDDLEWARE ==========

    socketMiddleware() {
        return (socket, next) => {
            const ip = this.getClientIpFromSocket(socket);

            if (this.isIPBlocked(ip)) {
                this.logger.warn('Socket connection blocked: IP blocked', { ip: this.hashIP(ip) });
                return next(new Error('IP blocked'));
            }

            // Rate limit socket connections
            const rateCheck = this.checkRateLimit(ip, 'connection');
            if (!rateCheck.allowed) {
                this.logSecurityEvent('SOCKET_CONNECTION_BLOCKED', {
                    ip: this.hashIP(ip),
                    reason: rateCheck.reason
                });
                return next(new Error(rateCheck.reason));
            }

            next();
        };
    }

    getClientIpFromSocket(socket) {
        let ip = socket.handshake.address;
        // Normalize IPv6
        if (ip && ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
        }
        // Check X-Forwarded-For header if present
        if (!ip && socket.handshake.headers['x-forwarded-for']) {
            ip = socket.handshake.headers['x-forwarded-for'].split(',')[0].trim();
            ip = this.normalizeIp(ip);
        }
        return ip || 'unknown';
    }

    // ========== UTILITY ==========

    // Generate cryptographically secure random token
    generateSecureToken(bytes = 16) {
        return crypto.randomBytes(bytes).toString('hex');
    }

    // Validate a UUID (for room IDs if needed)
    isValidUUID(str) {
        return /^[0-9a-f]{32}$/.test(str); // 32 hex chars
    }
}

module.exports = ChatSecurity;
