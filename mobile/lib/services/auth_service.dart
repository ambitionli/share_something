import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/user.dart';
import 'api_service.dart';

/// Login / register token payload from `POST /auth/login` and `POST /auth/register`.
class AuthTokens {
  const AuthTokens({
    required this.accessToken,
    required this.refreshToken,
    required this.tokenType,
  });

  final String accessToken;
  final String refreshToken;
  final String tokenType;

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    return AuthTokens(
      accessToken: json['access_token'] as String,
      refreshToken: json['refresh_token'] as String,
      tokenType: json['token_type'] as String? ?? 'bearer',
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'access_token': accessToken,
      'refresh_token': refreshToken,
      'token_type': tokenType,
    };
  }
}

class AuthService {
  AuthService(this._dio);

  final Dio _dio;

  Future<AuthTokens> login(String phone, String password) async {
    final Response<dynamic> response = await _dio.post<dynamic>(
      '/auth/login',
      data: <String, dynamic>{
        'phone': phone,
        'password': password,
      },
    );
    final AuthTokens tokens = AuthTokens.fromJson(
      response.data as Map<String, dynamic>,
    );
    await _persistAccessToken(tokens.accessToken);
    return tokens;
  }

  Future<AuthTokens> register(
    String phone,
    String password,
    String nickname,
  ) async {
    final Response<dynamic> response = await _dio.post<dynamic>(
      '/auth/register',
      data: <String, dynamic>{
        'phone': phone,
        'password': password,
        'nickname': nickname,
      },
    );
    final AuthTokens tokens = AuthTokens.fromJson(
      response.data as Map<String, dynamic>,
    );
    await _persistAccessToken(tokens.accessToken);
    return tokens;
  }

  Future<User> getMe() async {
    final Response<dynamic> response =
        await _dio.get<dynamic>('/auth/me');
    return User.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> logout() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove(ApiService.authTokenKey);
  }

  Future<bool> isLoggedIn() async {
    final String? token = await getToken();
    return token != null && token.isNotEmpty;
  }

  Future<String?> getToken() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString(ApiService.authTokenKey);
  }

  Future<void> _persistAccessToken(String accessToken) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString(ApiService.authTokenKey, accessToken);
  }
}
