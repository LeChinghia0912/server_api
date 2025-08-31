# Products API với Upload Hình Ảnh

API này hỗ trợ quản lý sản phẩm với tính năng upload hình ảnh từ file máy tính.

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
npm run dev
```

## Giao diện người dùng (EJS)

- Truy cập UI: `GET /`
- Tài nguyên tĩnh: `/public`
- API vẫn ở dưới prefix: `/api/v1`

## API Endpoints

### 1. Lấy danh sách sản phẩm
```
GET /api/v1/products
```

### 2. Lấy sản phẩm theo ID
```
GET /api/v1/products/:id
```

### 3. Tạo sản phẩm mới (với hình ảnh)
```
POST /api/v1/products
Content-Type: multipart/form-data

Form data:
- name: string (required)
- description: string (optional)
- price: number (required)
- stock: number (required)
- category_id: number (optional)
- image: file (optional) - Chỉ chấp nhận jpeg, jpg, png, gif, webp, tối đa 5MB
```

### 4. Cập nhật sản phẩm (với hình ảnh)
```
PUT /api/v1/products/:id
Content-Type: multipart/form-data

Form data:
- name: string (optional)
- description: string (optional)
- price: number (optional)
- stock: number (optional)
- category_id: number (optional)
- image: file (optional) - Chỉ chấp nhận jpeg, jpg, png, gif, webp, tối đa 5MB
```

### 5. Xóa sản phẩm
```
DELETE /api/v1/products/:id
```

## Ví dụ sử dụng với cURL

### Tạo sản phẩm với hình ảnh
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -F "name=Laptop Dell" \
  -F "description=Laptop gaming cao cấp" \
  -F "price=25000000" \
  -F "stock=10" \
  -F "category_id=1" \
  -F "image=@/path/to/your/image.jpg"
```

### Cập nhật sản phẩm với hình ảnh mới
```bash
curl -X PUT http://localhost:3000/api/v1/products/1 \
  -F "name=Laptop Dell Updated" \
  -F "price=26000000" \
  -F "image=@/path/to/your/new-image.jpg"
```

## Cấu trúc Database

Bảng `products` có các cột:
- `id`: Primary key
- `name`: Tên sản phẩm
- `description`: Mô tả sản phẩm
- `price`: Giá sản phẩm
- `stock`: Số lượng tồn kho
- `category_id`: ID danh mục (foreign key)
- `image_url`: Đường dẫn hình ảnh
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật

## Lưu ý

1. Hình ảnh được lưu trong thư mục `uploads/` với tên file unique
2. Chỉ chấp nhận các định dạng: jpeg, jpg, png, gif, webp
3. Kích thước file tối đa: 5MB
4. URL hình ảnh sẽ có dạng: `/uploads/filename.ext`
5. Thư mục `uploads/` được loại trừ khỏi git để tránh commit file lớn
