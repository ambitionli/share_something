import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:share_something/l10n/app_localizations.dart';
import 'package:share_something/widgets/error_widget.dart';

void main() {
  testWidgets('RetryableErrorView shows message and retry', (WidgetTester tester) async {
    int retries = 0;
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
        ],
        supportedLocales: AppLocalizations.supportedLocales,
        home: Scaffold(
          body: RetryableErrorView(
            message: 'test error',
            onRetry: () {
              retries++;
            },
          ),
        ),
      ),
    );

    expect(find.text('test error'), findsOneWidget);
    await tester.tap(find.byType(FilledButton));
    expect(retries, 1);
  });

  test('localizedApiError maps Dio connection error to networkError', () async {
    final AppLocalizations l10n = await AppLocalizations.delegate.load(
      const Locale('en'),
    );
    final String msg = localizedApiError(
      l10n,
      DioException(
        requestOptions: RequestOptions(path: '/x'),
        type: DioExceptionType.connectionError,
      ),
    );
    expect(msg, l10n.networkError);
  });
}
