import 'package:flutter_test/flutter_test.dart';
import 'package:share_something/services/api_service.dart';

void main() {
  test('defaultApiBaseUrl includes v1 prefix', () {
    expect(defaultApiBaseUrl(), endsWith('/api/v1'));
    expect(defaultApiOrigin(), matches(RegExp(r'^http://[^:]+:\d+$')));
    expect(defaultApiOrigin(), endsWith(':8000'));
  });
}
