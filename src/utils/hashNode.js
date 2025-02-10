class HashNode {
    constructor(key, value, next = null) {
        this.key = key;
        this.value = value;
        this.next = next;
    }
}

class HashMap {
    constructor(size = 1000) {
        this.size = 1000;
        this.buckets = new Array(size).fill(null);
    }

    #_hash(key) {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash = (hash * 31 + key.charCodeAt(i)) % this.size;
        }

        return hash;
    }


    /**
     * 
     * @param {*} key 
     * @param {*} value 
     * @param {*} ttl 
     * @returns value
     * store the key value 
     */

    set(key, value, ttl = 300000) {
        const expiresAt = Date.now() + ttl;
        const index = this.#_hash(key);
        const newNode = new HashNode(key, { value, expiresAt })
        if (!this.buckets[index]) {
            this.buckets[index] = newNode;
        } else {
            let current = this.buckets[index];

            while (current.next) {
                if (current.key === key) {
                    current.value = { value, expiresAt }; // update the current value
                    return value;
                }
                current = current.next;
            }

            current.next = newNode;
        }

        return value;
    }

    get(key) {
        const index = this.#_hash(key);
        let current = this.buckets[index];

        while (current) {
            if (current.key === key) {
                return current.value;
            }
            current = current.next;
        }

        return null;
    }


    // let analysis this delete key;
    delete(key) {
        const index = this.#_hash(key);
        let current = this.buckets[index];
        let prev = null;

        while (current) {
            if (current.key === key) {
                if (prev) {
                    prev.next = current.next;
                } else {
                    this.buckets[index] = current.next;
                }

                return true;
            }
            prev = current;
            current = current.next;
        }
        return false;
    }

    exist(key) {
        const index = this.#_hash(key);
        let current = this.buckets[index];

        while (current) {
            if (current.key === key) {
                return current.value;
            }
            current = current.next;
        }

        return null;

    }

}

export default HashMap;