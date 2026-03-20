import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:share_something/models/user.dart';
import 'package:share_something/providers/auth_provider.dart';
import 'fake_auth_service.dart';

void main() {
  test('init restores user when token exists', () async {
    final fake = FakeAuthService();
    fake.hasToken = true;
    fake.currentUser = const User(
      id: 1,
      phone: '13800000000',
      nickname: 'a',
      avatarUrl: '',
      role: 'buyer',
    );

    final container = ProviderContainer(
      overrides: [
        authServiceProvider.overrideWithValue(fake),
      ],
    );
    addTearDown(container.dispose);

    await container.read(authProvider.notifier).init();
    expect(container.read(authProvider).isLoggedIn, true);
    expect(container.read(authProvider).user?.phone, '13800000000');
    expect(container.read(authProvider).isLoading, false);
  });

  test('init leaves logged out when no token', () async {
    final fake = FakeAuthService();
    final container = ProviderContainer(
      overrides: [authServiceProvider.overrideWithValue(fake)],
    );
    addTearDown(container.dispose);

    await container.read(authProvider.notifier).init();
    expect(container.read(authProvider).isLoggedIn, false);
    expect(container.read(authProvider).user, isNull);
    expect(container.read(authProvider).isLoading, false);
  });

  test('login sets user', () async {
    final fake = FakeAuthService();
    final container = ProviderContainer(
      overrides: [authServiceProvider.overrideWithValue(fake)],
    );
    addTearDown(container.dispose);

    await container.read(authProvider.notifier).login('13900000000', 'secret12');
    expect(container.read(authProvider).isLoggedIn, true);
    expect(container.read(authProvider).user?.phone, '13900000000');
  });

  test('logout clears state', () async {
    final fake = FakeAuthService();
    final container = ProviderContainer(
      overrides: [authServiceProvider.overrideWithValue(fake)],
    );
    addTearDown(container.dispose);

    await container.read(authProvider.notifier).login('13900000000', 'secret12');
    await container.read(authProvider.notifier).logout();
    expect(container.read(authProvider).isLoggedIn, false);
    expect(container.read(authProvider).user, isNull);
  });
}
