class AssetManager {
    constructor() {
        this.cache = {};
        this.totalImagens = 0;
        this.imagensCarregadas = 0;
    }

    // Precarrega um array de URLs e só resolve quando TODAS estiverem na memória
    carregarImagens(urls) {
        return new Promise((resolve) => {
            if (urls.length === 0) return resolve();

            this.totalImagens = urls.length;
            this.imagensCarregadas = 0;

            urls.forEach((url) => {
                if (this.cache[url]) {
                    this.incrementarCarga(resolve);
                    return;
                }

                const img = new Image();
                img.onload = () => {
                    this.cache[url] = img;
                    this.incrementarCarga(resolve);
                };
                img.onerror = () => {
                    console.error(`Erro ao carregar a imagem: ${url}`);
                    this.incrementarCarga(resolve);
                };
                img.src = url;
            });
        });
    }

    incrementarCarga(resolve) {
        this.imagensCarregadas++;
        if (this.imagensCarregadas >= this.totalImagens) {
            resolve();
        }
    }

    obter(url) {
        return this.cache[url];
    }
}

// Instância global para ser usada pelas classes do jogo
const assets = new AssetManager();