class Products {
    constructor({id, name, description, price, stock, category_id, image_url, created_at, updated_at}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.category_id = category_id;
        this.image_url = image_url;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

module.exports = Products;