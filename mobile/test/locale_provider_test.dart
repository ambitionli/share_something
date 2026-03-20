import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:share_something/providers/locale_provider.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test('toggleLocale switches zh <-> en and persists', () async {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    expect(container.read(localeProvider).languageCode, 'zh');

    await container.read(localeProvider.notifier).toggleLocale();
    expect(container.read(localeProvider).languageCode, 'en');

    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getString('app_locale'), 'en');

    await container.read(localeProvider.notifier).toggleLocale();
    expect(container.read(localeProvider).languageCode, 'zh');
    expect(prefs.getString('app_locale'), 'zh');
  });
}
