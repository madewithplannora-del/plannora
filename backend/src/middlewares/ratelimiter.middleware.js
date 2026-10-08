/*
    Token bucket rate limiting.

    A caller is given a small bucket of tokens and earns them back one at a
    time as time passes, instead of having the whole allowance handed back when
    a window expires. So someone who burns the whole bucket does not get a full
    refill in one go - they have to wait for tokens to trickle back.

    Buckets live in this process. Before running more than one instance, move
    the `buckets` Map behind a shared store (Redis) - `takeToken` is the only
    function that touches bucket state.
*/

const buckets = new Map();

// Buckets idle for this long are dropped, so the Map cannot grow without bound.
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

function takeToken(key, capacity, refillMs) {

    const now = Date.now();

    let bucket = buckets.get(key);

    if (!bucket) {

        bucket = {
            tokens: capacity,
            updatedAt: now,
            lastSeen: now
        };

        buckets.set(key, bucket);

    } else {

        const refills = Math.floor((now - bucket.updatedAt) / refillMs);

        if (refills > 0) {

            bucket.tokens = Math.min(capacity, bucket.tokens + refills);

            /*
                Advance only by the tokens actually granted, so the leftover
                time towards the next token is not thrown away.
            */
            bucket.updatedAt += refills * refillMs;

        }

        bucket.lastSeen = now;

    }

    if (bucket.tokens < 1) {

        const retryAfterMs = refillMs - (now - bucket.updatedAt);

        return {
            allowed: false,
            retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000))
        };

    }

    bucket.tokens -= 1;

    return {
        allowed: true,
        remaining: bucket.tokens
    };

}

function createTokenBucketLimiter({ name, capacity, refillMs, message }) {

    return function tokenBucketLimiter(req, res, next) {

        const clientIp = req.ip || req.socket?.remoteAddress || "127.0.0.1";

        const result = takeToken(
            `${name}:${clientIp}`,
            capacity,
            refillMs
        );

        res.set("RateLimit-Limit", String(capacity));

        if (!result.allowed) {

            res.set("RateLimit-Remaining", "0");
            res.set("RateLimit-Reset", String(result.retryAfterSeconds));
            res.set("Retry-After", String(result.retryAfterSeconds));

            return res.status(429).json({
                success: false,
                message
            });

        }

        res.set("RateLimit-Remaining", String(result.remaining));

        return next();

    };

}

/*
      CAPACITY 5, THEN ONE TOKEN BACK PER MINUTE                              
      Change `refillMs` to tune how fast the bucket trickles back.            
*/
const AuthRateLimiter = createTokenBucketLimiter({
    name: "auth",
    capacity: 5,
    refillMs: 60 * 1000,
    message: "Too many authentication attempts. Please wait a moment and try again."
});

// Authenticated vendor operations
const ApiRateLimiter = createTokenBucketLimiter({
    name: "api",
    capacity: 30,
    refillMs: 2 * 1000,
    message: "Too many requests. Please slow down and try again shortly."
});

// Public endpoints, including the ones that increment visit/contact counters
const PublicRateLimiter = createTokenBucketLimiter({
    name: "public",
    capacity: 20,
    refillMs: 3 * 1000,
    message: "Too many requests. Please slow down and try again shortly."
});

// Housekeeping: drop idle buckets so memory does not grow forever.
// unref() so this timer never keeps the process alive on its own.
setInterval(() => {

    const now = Date.now();

    for (const [key, bucket] of buckets) {

        if (now - bucket.lastSeen > IDLE_TIMEOUT_MS) {
            buckets.delete(key);
        }

    }

}, IDLE_TIMEOUT_MS).unref();

module.exports = {
    AuthRateLimiter,
    ApiRateLimiter,
    PublicRateLimiter
};
