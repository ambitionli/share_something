import 'package:dio/dio.dart';

import 'package:share_something/models/user.dart';
import 'package:share_something/services/auth_service.dart';

/// Test double for [AuthService] without network I/O.
class FakeAuthService extends AuthService {
  FakeAuthService()
      : super(
          Dio(
            BaseOptions(baseUrl: 'http://127.0.0.1:9/api/v1'),
          ),
        );

  bool hasToken = false;
  User? currentUser;

  @override
  Future<bool> isLoggedIn() async => hasToken;

  @override
  Future<AuthTokens> login(String phone, String password) async {
    hasToken = true;
    currentUser = User(
      id: 1,
      phone: phone,
      nickname: 'test',
      avatarUrl: '',
      role: 'buyer',
    );
    return const AuthTokens(
      accessToken: 'fake-access',
      refreshToken: 'fake-refresh',
      tokenType: 'bearer',
    );
  }

  @override
  Future<AuthTokens> register(String phone, String password, String nickname) async {
    hasToken = true;
    currentUser = User(
      id: 2,
      phone: phone,
      nickname: nickname,
      avatarUrl: '',
      role: 'buyer',
    );
    return const AuthTokens(
      accessToken: 'fake-access',
      refreshToken: 'fake-refresh',
      tokenType: 'bearer',
    );
  }

  @override
  Future<User> getMe() async {
    final u = currentUser;
    if (u == null) {
      throw StateError('no user');
    }
    return u;
  }

  @override
  Future<void> logout() async {
    hasToken = false;
    currentUser = null;
  }
}
