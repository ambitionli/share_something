# Flutter 移动端：API 与数据模型

> 最后更新：2026-03-20（管理员端 API、错误组件与测试）

## 概述

`mobile/lib/services/` 提供基于 **Dio** 的 API 封装；`mobile/lib/models/` 为不可变数据类，含 `fromJson` / `toJson`（无 `json_serializable` 代码生成）。

## 配置

- **默认 API 根地址**：`ApiService` 使用 `dart:io` 的 `Platform`：
  - **Android 模拟器**：`http://10.0.2.2:8000/api/v1`（宿主机 `localhost:8000`）
  - **其他（含 iOS 模拟器）**：`http://localhost:8000/api/v1`
- 构造时可覆盖：`ApiService(baseUrl: 'http://127.0.0.1:8000/api/v1')`
- **dart-define**：`--dart-define=API_BASE_URL=http://10.0.2.2:8000` 时自动拼接 `/api/v1`（与旧 `ApiConfig` 行为一致；`api_config.dart` 已移除）
- **鉴权**：请求拦截器从 `SharedPreferences` 键 `auth_token` 读取并附加 `Authorization: Bearer …`；响应/错误中 **401** 会清除该键。

## 依赖

- `dio`、`shared_preferences`（见 `pubspec.yaml`）
- 为修复无法解析的 `flutter_carousel_widget ^4.0.0`，已改为 `^3.1.0`（2026-03-20）

## 用法示例

```dart
final api = ApiService();
final auth = AuthService(api.dio);
final products = ProductService(api.dio);
final company = CompanyService(api.dio);
final orders = OrderService(api.dio);
final admin = AdminService(api.dio);
```

## ProductService

- 文件：`mobile/lib/services/product_service.dart`
- 列表：`GET /products`（`on_shelf_only`、`page`、`page_size`、`keyword`）。
- 管理员：`POST /products`、`PUT /products/{id}`、`DELETE /products/{id}`（需管理员 JWT）。

## OrderService

- 文件：`mobile/lib/services/order_service.dart`
- 路径均相对于 Dio `baseUrl`（已含 `/api/v1`），例如 `GET /orders`、`POST /orders/{id}/pay`。
- `OrderListPage` 封装分页列表 JSON。
- 管理员：`GET /orders/all`、`POST /orders/{id}/ship`（`express_company`、`tracking_number`）。

## AdminService

- 文件：`mobile/lib/services/admin_service.dart`
- `GET /admin/stats` → `AdminDashboardStats`（订单数、商品数、用户数、`revenue` 字符串）。

## 管理端 UI

- `mobile/lib/screens/admin/admin_hub_screen.dart`：入口与统计卡片。
- `mobile/lib/screens/admin/admin_products_screen.dart`：商品 CRUD 与上架开关。
- `mobile/lib/screens/admin/admin_orders_screen.dart`：全量订单与发货。
- 路由：`/admin`、`/admin/products`、`/admin/orders`（`main.dart`）；个人中心在 `user.role == admin` 时显示「管理后台」。
- 通用错误：`mobile/lib/widgets/error_widget.dart`（`RetryableErrorView`、`localizedApiError`）。

## 测试

- `test/models/json_models_test.dart`：模型 JSON 往返
- `test/services/api_service_test.dart`：默认 base URL 形态
- `test/services/order_service_test.dart`：`listMyOrders` / `payOrder` / `listAllOrders` / `shipOrder` 请求路径与参数
- `test/services/product_service_admin_test.dart`：管理员商品创建/更新/删除
- `test/services/admin_service_test.dart`：`getStats`
- `test/error_widget_test.dart`：`RetryableErrorView` 与 `localizedApiError`

## 修改记录

- 2026-03-20：补充 `OrderService` 与订单相关测试说明。
- 2026-03-20：补充 `ProductService` 管理员接口、`OrderService` 全量订单与发货、`AdminService`、管理端页面、`RetryableErrorView` 及对应测试说明。
