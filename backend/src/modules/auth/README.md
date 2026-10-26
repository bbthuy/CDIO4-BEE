# Auth Module

Module xác thực người dùng sử dụng JWT (JSON Web Tokens) với access token và refresh token.

## Tính năng

- **JWT Authentication**: Sử dụng access token và refresh token
- **Bearer Token**: Xác thực qua Authorization header với format `Bearer <token>`
- **Global Guard**: Tự động bảo vệ tất cả routes (trừ những route được đánh dấu `@Public()`)
- **Token Refresh**: Tự động làm mới access token khi hết hạn
- **Logout**: Vô hiệu hóa refresh token khi logout

## Cấu hình Environment Variables

Thêm các biến môi trường sau vào file `.env`:

```env
# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret_here
ACCESS_TOKEN_EXPIRATION=1h
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRATION=7d
```

## API Endpoints

### Authentication

#### POST `/api/v1/auth/register`

Đăng ký tài khoản mới.

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

**Validation Rules:**

- Password phải có ít nhất 8 ký tự
- Password phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt
- Password và confirmPassword phải giống nhau
- Email phải là định dạng hợp lệ và chưa được sử dụng

**Response:**

```json
{
  "message": "SUCCESSFUL",
  "status": 201,
  "code": "CREATED",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "uuid",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "status": "active"
    }
  }
}
```

#### POST `/api/v1/auth/login`

Đăng nhập người dùng.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "SUCCESSFUL",
  "status": 200,
  "code": "SUCCESSFUL",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "status": "active"
    }
  }
}
```

#### POST `/api/v1/auth/refresh`

Làm mới access token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/v1/auth/logout`

Đăng xuất người dùng.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Headers:**

```
Authorization: Bearer <access_token>
```

## Sử dụng trong Controllers

### Bảo vệ Route

Mặc định, tất cả routes đều được bảo vệ bởi JWT authentication. Để cho phép truy cập công khai, sử dụng decorator `@Public()`:

```typescript
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
export class UserController {
  @Post()
  @Public() // Route này không cần authentication
  async createUser() {
    // ...
  }

  @Get()
  // Route này cần authentication
  async getUsers() {
    // ...
  }
}
```

### Lấy thông tin User hiện tại

Sử dụng decorator `@CurrentUser()` để lấy thông tin user đã đăng nhập:

```typescript
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UserController {
  @Get('profile/me')
  async getCurrentUserProfile(@CurrentUser() user: any) {
    // user chứa thông tin từ JWT payload
    console.log(user.userId, user.email);
  }
}
```

## Cấu trúc JWT Payload

### Access Token

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "type": "access",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Refresh Token

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "type": "refresh",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Middleware và Guards

### JwtAuthGuard

Guard tự động kiểm tra JWT token trong Authorization header.

### AuthMiddleware

Middleware tùy chọn để kiểm tra token trước khi vào route.

## Bảo mật

- Access token có thời hạn ngắn (mặc định 1h)
- Refresh token có thời hạn dài hơn (mặc định 7d)
- Refresh token được lưu trữ trong memory và bị vô hiệu hóa khi logout
- Password được hash bằng bcrypt
- Chỉ user có status "active" mới có thể đăng nhập

## Error Handling

Tất cả các lỗi đều sử dụng format chuẩn từ `ERROR_MESSAGES` constants:

### Authentication Errors

- `401 UNAUTHORIZED_ACCESS_DENIED`: Token không hợp lệ hoặc hết hạn
- `401 INVALID_CREDENTIALS`: Thông tin đăng nhập không chính xác
- `401 USER_NOT_ACTIVE`: User không tồn tại hoặc bị khóa
- `401 INVALID_TOKEN`: Token không hợp lệ
- `401 TOKEN_EXPIRED`: Token đã hết hạn
- `401 INVALID_TOKEN_TYPE`: Loại token không đúng
- `401 TOKEN_REVOKED`: Token đã bị vô hiệu hóa
- `401 INVALID_REFRESH_TOKEN`: Refresh token không hợp lệ
- `401 AUTHORIZATION_HEADER_REQUIRED`: Thiếu Authorization header
- `401 INVALID_AUTHORIZATION_FORMAT`: Format Authorization header không đúng

### Registration Errors

- `400 PASSWORD_MISMATCH`: Password và confirm password không khớp
- `400 EMAIL_ALREADY_EXISTS`: Email đã tồn tại
- `400 REGISTRATION_FAILED`: Lỗi khi tạo tài khoản

### User Errors

- `404 USER_NOT_FOUND`: User không tồn tại
- `400 EMAIL_ALREADY_EXISTS`: Email đã tồn tại
- `400 INVALID_PASSWORD_FORMAT`: Password không đáp ứng yêu cầu bảo mật
