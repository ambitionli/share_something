import 'dart:io';

import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Returns the API origin for the current platform.
/// Android emulator uses [10.0.2.2] to reach the host machine; iOS simulator uses localhost.
String defaultApiOrigin() {
  if (Platform.isAndroid) {
    return 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
}

/// Full base URL for v1 API routes (`/api/v1/...`).
String defaultApiBaseUrl() => '${defaultApiOrigin()}/api/v1';

/// Prefer `--dart-define=API_BASE_URL=http://10.0.2.2:8000` when the platform
/// default is wrong; `/api/v1` is appended automatically.
String resolveDefaultBaseUrl() {
  const String env = String.fromEnvironment('API_BASE_URL', defaultValue: '');
  if (env.isNotEmpty) {
    final String origin = env.replaceAll(RegExp(r'/$'), '');
    return '$origin/api/v1';
  }
  return defaultApiBaseUrl();
}

/// Shared HTTP client with auth header injection and 401 handling.
class ApiService {
  ApiService({
    String? baseUrl,
    Dio? dio,
  }) : dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: baseUrl ?? resolveDefaultBaseUrl(),
                connectTimeout: const Duration(seconds: 15),
                receiveTimeout: const Duration(seconds: 15),
                headers: <String, dynamic>{
                  Headers.contentTypeHeader: Headers.jsonContentType,
                  Headers.acceptHeader: Headers.jsonContentType,
                },
              ),
            ) {
    this.dio.interceptors.addAll(<Interceptor>[
      InterceptorsWrapper(
        onRequest: _attachAuthToken,
        onResponse: _handleUnauthorizedResponse,
        onError: _handleUnauthorizedError,
      ),
    ]);
  }

  final Dio dio;

  static const String authTokenKey = 'auth_token';

  Future<void> _attachAuthToken(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? token = prefs.getString(authTokenKey);
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  Future<void> _handleUnauthorizedResponse(
    Response<dynamic> response,
    ResponseInterceptorHandler handler,
  ) async {
    if (response.statusCode == 401) {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.remove(authTokenKey);
    }
    handler.next(response);
  }

  Future<void> _handleUnauthorizedError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.remove(authTokenKey);
    }
    handler.next(err);
  }
}
