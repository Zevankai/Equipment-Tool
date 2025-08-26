/**
 * API Client for Equipment Manager
 * Handles communication with the backend API and provides fallback to local storage
 */

class EquipmentAPIClient {
    constructor(options = {}) {
        this.baseURL = options.baseURL || this.getBaseURL();
        this.enableBackend = options.enableBackend !== false;
        this.enableLocalStorage = options.enableLocalStorage !== false;
        this.onSyncConflict = options.onSyncConflict || this.defaultConflictHandler;
        this.onError = options.onError || console.error;
        
        // Track if backend is available
        this.backendAvailable = null;
    }

    getBaseURL() {
        // Auto-detect base URL based on current environment
        if (typeof window !== 'undefined') {
            const { protocol, hostname, port } = window.location;
            
            // Local development
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                return `${protocol}//${hostname}:${port}`;
            }
            
            // Production - should be set via environment or auto-detected
            return window.location.origin;
        }
        
        return '';
    }

    async checkBackendHealth() {
        if (!this.enableBackend) {
            this.backendAvailable = false;
            return false;
        }

        try {
            const response = await fetch(`${this.baseURL}/api/health`, {
                method: 'GET',
                timeout: 5000
            });
            this.backendAvailable = response.ok;
            return response.ok;
        } catch (error) {
            this.backendAvailable = false;
            return false;
        }
    }

    async loadCharacters(roomId) {
        const results = {
            local: null,
            remote: null,
            source: 'none'
        };

        try {
            // Always try to load from local storage first for immediate response
            if (this.enableLocalStorage) {
                results.local = this.loadFromLocalStorage(roomId);
                results.source = 'local';
            }

            // Try to sync with backend if available
            if (this.enableBackend && await this.checkBackendHealth()) {
                try {
                    const response = await fetch(`${this.baseURL}/api/characters?roomId=${encodeURIComponent(roomId)}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        results.remote = await response.json();
                        
                        // If we have both local and remote data, perform sync
                        if (results.local && Object.keys(results.local).length > 0) {
                            const syncResult = await this.syncData(roomId, results.local);
                            results.source = 'synced';
                            return syncResult.characters;
                        } else {
                            // No local data, use remote
                            if (this.enableLocalStorage) {
                                this.saveToLocalStorage(roomId, results.remote);
                            }
                            results.source = 'remote';
                            return results.remote;
                        }
                    }
                } catch (error) {
                    this.onError('Failed to load from backend:', error);
                }
            }

            // Fallback to local storage
            return results.local || {};

        } catch (error) {
            this.onError('Failed to load characters:', error);
            return {};
        }
    }

    async saveCharacter(roomId, characterId, characterData) {
        let saved = false;

        try {
            // Save to local storage immediately for responsiveness
            if (this.enableLocalStorage) {
                const localData = this.loadFromLocalStorage(roomId) || {};
                localData[characterId] = {
                    ...characterData,
                    lastModified: new Date().toISOString()
                };
                this.saveToLocalStorage(roomId, localData);
                saved = true;
            }

            // Try to save to backend
            if (this.enableBackend && this.backendAvailable !== false) {
                try {
                    const response = await fetch(`${this.baseURL}/api/characters`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            roomId,
                            characterId,
                            name: characterData.name,
                            data: characterData.data
                        })
                    });

                    if (response.ok) {
                        const result = await response.json();
                        
                        // Update local storage with server timestamp
                        if (this.enableLocalStorage) {
                            const localData = this.loadFromLocalStorage(roomId) || {};
                            localData[characterId] = {
                                ...characterData,
                                lastModified: result.lastModified
                            };
                            this.saveToLocalStorage(roomId, localData);
                        }
                        
                        return result;
                    } else {
                        this.backendAvailable = false;
                    }
                } catch (error) {
                    this.onError('Failed to save to backend:', error);
                    this.backendAvailable = false;
                }
            }

            return saved ? characterData : null;

        } catch (error) {
            this.onError('Failed to save character:', error);
            return null;
        }
    }

    async deleteCharacter(roomId, characterId) {
        let deleted = false;

        try {
            // Remove from local storage
            if (this.enableLocalStorage) {
                const localData = this.loadFromLocalStorage(roomId) || {};
                delete localData[characterId];
                this.saveToLocalStorage(roomId, localData);
                deleted = true;
            }

            // Try to delete from backend
            if (this.enableBackend && this.backendAvailable !== false) {
                try {
                    const response = await fetch(`${this.baseURL}/api/characters?roomId=${encodeURIComponent(roomId)}&characterId=${encodeURIComponent(characterId)}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        this.backendAvailable = false;
                    }
                } catch (error) {
                    this.onError('Failed to delete from backend:', error);
                    this.backendAvailable = false;
                }
            }

            return deleted;

        } catch (error) {
            this.onError('Failed to delete character:', error);
            return false;
        }
    }

    async syncData(roomId, localData) {
        if (!this.enableBackend || this.backendAvailable === false) {
            return { characters: localData, syncResult: { message: 'Backend not available' } };
        }

        try {
            const response = await fetch(`${this.baseURL}/api/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomId,
                    localData
                })
            });

            if (response.ok) {
                const result = await response.json();
                
                // Handle conflicts if any
                if (result.syncResult.conflicts && result.syncResult.conflicts.length > 0) {
                    for (const conflict of result.syncResult.conflicts) {
                        await this.onSyncConflict(conflict);
                    }
                }

                // Update local storage with synced data
                if (this.enableLocalStorage) {
                    this.saveToLocalStorage(roomId, result.characters);
                }

                return result;
            } else {
                this.backendAvailable = false;
                return { characters: localData, syncResult: { error: 'Sync failed' } };
            }

        } catch (error) {
            this.onError('Sync failed:', error);
            this.backendAvailable = false;
            return { characters: localData, syncResult: { error: error.message } };
        }
    }

    defaultConflictHandler(conflict) {
        // Default: prefer server data
        console.warn('Sync conflict detected, preferring server data:', conflict);
        return 'server';
    }

    loadFromLocalStorage(roomId) {
        if (!this.enableLocalStorage || typeof localStorage === 'undefined') {
            return null;
        }

        try {
            const key = `equipment-manager/characters/${roomId}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            this.onError('Failed to load from local storage:', error);
            return null;
        }
    }

    saveToLocalStorage(roomId, data) {
        if (!this.enableLocalStorage || typeof localStorage === 'undefined') {
            return false;
        }

        try {
            const key = `equipment-manager/characters/${roomId}`;
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            this.onError('Failed to save to local storage:', error);
            return false;
        }
    }

    // Utility method to get sync status
    getSyncStatus() {
        return {
            backendEnabled: this.enableBackend,
            backendAvailable: this.backendAvailable,
            localStorageEnabled: this.enableLocalStorage,
            localStorageAvailable: typeof localStorage !== 'undefined'
        };
    }
}

// For backward compatibility and easier integration
if (typeof window !== 'undefined') {
    window.EquipmentAPIClient = EquipmentAPIClient;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EquipmentAPIClient;
}