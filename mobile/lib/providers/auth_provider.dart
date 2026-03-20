import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';

class AuthState {
  final bool isLoggedIn;
  final User? user;
  final bool isLoading;

  AuthState({
    this.isLoggedIn = false,
    this.user,
    this.isLoading = false,
  });

  AuthState copyWith({
    bool? isLoggedIn,
    User? user,
    bool? isLoading,
  }) {
    return AuthState(
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._authService) : super(AuthState());

  final AuthService _authService;

  /// Restores session from stored JWT; loads [User] when a token exists.
  Future<void> init() async {
    state = state.copyWith(isLoading: true);
    try {
      if (!await _authService.isLoggedIn()) {
        state = state.copyWith(isLoading: false);
        return;
      }
      final user = await _authService.getMe();
      state = AuthState(isLoggedIn: true, user: user, isLoading: false);
    } catch (e, st) {
      debugPrint('AuthNotifier.init failed: $e');
      debugPrint('$st');
      await _authService.logout();
      state = AuthState(isLoading: false);
    }
  }

  Future<void> login(String phone, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      await _authService.login(phone, password);
      final user = await _authService.getMe();
      state = AuthState(isLoggedIn: true, user: user, isLoading: false);
    } catch (e, st) {
      state = state.copyWith(isLoading: false);
      Error.throwWithStackTrace(e, st);
    }
  }

  Future<void> register(String phone, String password, String nickname) async {
    state = state.copyWith(isLoading: true);
    try {
      await _authService.register(phone, password, nickname);
      final user = await _authService.getMe();
      state = AuthState(isLoggedIn: true, user: user, isLoading: false);
    } catch (e, st) {
      state = state.copyWith(isLoading: false);
      Error.throwWithStackTrace(e, st);
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    try {
      await _authService.logout();
      state = AuthState(isLoading: false);
    } catch (e, st) {
      state = state.copyWith(isLoading: false);
      Error.throwWithStackTrace(e, st);
    }
  }
}

final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.read(apiServiceProvider).dio);
});

final authProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final service = ref.read(authServiceProvider);
  return AuthNotifier(service);
});
