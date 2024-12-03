class Resource {
    constructor(data) {
        this.data = data;
    }

    /**
     * Define cómo se transforma el recurso.
     * Este método debe ser sobreescrito en las clases que hereden.
     */
    transform() {
        throw new Error("El método 'transform()' debe ser implementado en la subclase.");
    }

    /**
     * Aplica la transformación definida en `transform` y retorna los datos procesados.
     */
    toObject() {
        return this.transform(this.data);
    }

    /**
     * Transforma una colección de objetos.
     */
    static collection(dataArray) {
        return dataArray.map((data) => new this(data).toObject());
    }
}

module.exports = Resource;