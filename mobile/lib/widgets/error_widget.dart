import 'package:dio/dio.dart';
import 'package:flutter/material.dart';

import '../l10n/app_localizations.dart';

/// User-facing message for failed API calls (network vs server vs detail).
String localizedApiError(AppLocalizations l10n, Object error) {
  if (error is DioException) {
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.connectionError ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return l10n.networkError;
    }
    if (error.response != null) {
      final int? code = error.response!.statusCode;
      if (code != null && code >= 500) {
        return l10n.serverError;
      }
      final dynamic data = error.response!.data;
      if (data is Map<String, dynamic>) {
        final dynamic detail = data['detail'];
        if (detail != null) {
          return detail.toString();
        }
      }
      return l10n.serverError;
    }
    return l10n.networkError;
  }
  return error.toString();
}

/// Full-screen style error state with retry (used after API failures).
class RetryableErrorView extends StatelessWidget {
  const RetryableErrorView({
    super.key,
    required this.message,
    required this.onRetry,
  });

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = AppLocalizations.of(context)!;
    final ColorScheme scheme = Theme.of(context).colorScheme;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Icon(Icons.cloud_off_outlined, size: 56, color: scheme.error),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: Text(l10n.retry),
            ),
          ],
        ),
      ),
    );
  }
}
