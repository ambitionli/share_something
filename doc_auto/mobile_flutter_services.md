# Flutter 移动端：API 与数据模型

> 最后更新：2026-03-20

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
```

## 测试

- `test/models/json_models_test.dart`：模型 JSON 往返
- `test/services/api_service_test.dart`：默认 base URL 形态
