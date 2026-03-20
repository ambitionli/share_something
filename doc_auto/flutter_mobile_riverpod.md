# Flutter mobile — Riverpod providers

> 最后更新：2026-03-20

## 新增

- `lib/providers/auth_provider.dart` — `AuthState` / `AuthNotifier`（`init`、`login`、`register`、`logout`），`authServiceProvider` + `authProvider`。
- `lib/providers/cart_provider.dart` — `CartState`（`totalPrice` 汇总）、`CartNotifier`（加购合并数量、`removeItem`、`updateQuantity`、`clearCart`），`cartProvider`。
- `lib/providers/locale_provider.dart` — `LocaleNotifier`（默认 `Locale('zh')`、`toggleLocale` zh/en、`SharedPreferences` 键 `app_locale`），`localeProvider`。

## 依赖

- 认证逻辑使用 `lib/services/auth_service.dart`（Dio + `/api/v1/auth/*`，与后端 JWT 一致）。
- 购物车使用 `lib/models/product.dart`、`lib/models/cart_item.dart`。

## 测试

- `test/auth_provider_test.dart`、`test/cart_provider_test.dart`、`test/locale_provider_test.dart`
- `test/fake_auth_service.dart` — 无网络的 `AuthService` 测试替身

## 说明

- 使用 `flutter_riverpod` 的 `StateNotifierProvider`，未使用 `riverpod_annotation` / code generation。
- `AuthNotifier.init` 在会话恢复失败时 `debugPrint` 并清除本地 token，避免启动崩溃。
