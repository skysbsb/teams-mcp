import { promises as fs } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
const CACHE_PATH = process.env.TEAMS_MCP_CACHE_PATH ?? join(homedir(), ".teams-mcp-token-cache.json");
const CACHE_LOCK_PATH = `${CACHE_PATH}.lock`;
const LOCK_RETRY_DELAY_MS = 100;
const LOCK_TIMEOUT_MS = 5000;
const STALE_LOCK_MS = 30000;
async function acquireCacheLock() {
    const startedAt = Date.now();
    await fs.mkdir(dirname(CACHE_PATH), { recursive: true });
    while (true) {
        try {
            await fs.mkdir(CACHE_LOCK_PATH);
            return;
        }
        catch (error) {
            const nodeError = error;
            if (nodeError.code !== "EEXIST") {
                throw error;
            }
            try {
                const stat = await fs.stat(CACHE_LOCK_PATH);
                if (Date.now() - stat.mtimeMs > STALE_LOCK_MS) {
                    await fs.rm(CACHE_LOCK_PATH, { recursive: true, force: true });
                    continue;
                }
            }
            catch (statError) {
                if (statError.code !== "ENOENT") {
                    throw statError;
                }
            }
            if (Date.now() - startedAt > LOCK_TIMEOUT_MS) {
                throw new Error(`Timed out waiting for token cache lock: ${CACHE_LOCK_PATH}`);
            }
            await sleep(LOCK_RETRY_DELAY_MS);
        }
    }
}
async function withCacheLock(operation) {
    await acquireCacheLock();
    try {
        return await operation();
    }
    finally {
        await fs.rm(CACHE_LOCK_PATH, { recursive: true, force: true });
    }
}
async function quarantineInvalidCache() {
    const quarantinePath = `${CACHE_PATH}.corrupt.${Date.now()}.${process.pid}`;
    try {
        await fs.rename(CACHE_PATH, quarantinePath);
        return quarantinePath;
    }
    catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Warning: Could not quarantine invalid token cache:", error);
        }
        return undefined;
    }
}
async function writeCacheAtomically(data) {
    const tmpPath = join(dirname(CACHE_PATH), `.${basename(CACHE_PATH)}.${process.pid}.${Date.now()}.tmp`);
    await fs.writeFile(tmpPath, data, { encoding: "utf8", mode: 0o600 });
    await fs.rename(tmpPath, CACHE_PATH);
}
/**
 * Custom file-based cache plugin for MSAL Node
 * Stores tokens (including refresh tokens) in a JSON file
 */
export const cachePlugin = {
    async beforeCacheAccess(cacheContext) {
        await withCacheLock(async () => {
            let data;
            try {
                data = await fs.readFile(CACHE_PATH, "utf8");
            }
            catch (error) {
                // File doesn't exist - start with empty cache.
                if (error.code === "ENOENT") {
                    return;
                }
                console.error("Warning: Could not read token cache:", error);
                return;
            }
            try {
                cacheContext.tokenCache.deserialize(data);
            }
            catch {
                const quarantinePath = await quarantineInvalidCache();
                if (quarantinePath) {
                    console.error("Warning: Token cache is invalid; moved aside:", quarantinePath);
                }
            }
        });
    },
    async afterCacheAccess(cacheContext) {
        if (cacheContext.cacheHasChanged) {
            await withCacheLock(async () => {
                try {
                    const data = cacheContext.tokenCache.serialize();
                    await writeCacheAtomically(data);
                }
                catch (error) {
                    console.error("Warning: Could not write token cache:", error);
                }
            });
        }
    },
};
export { CACHE_PATH };
//# sourceMappingURL=msal-cache.js.map