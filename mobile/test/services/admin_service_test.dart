import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:share_something/services/admin_service.dart';

void main() {
  test('getStats GET /admin/stats', () async {
    String? capturedPath;
    final Dio dio = Dio(
      BaseOptions(baseUrl: 'http://localhost:8000/api/v1'),
    );
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (RequestOptions options, RequestInterceptorHandler handler) {
          capturedPath = options.path;
          handler.resolve(
            Response<dynamic>(
              requestOptions: options,
              data: <String, dynamic>{
                'total_orders': 10,
                'total_products': 3,
                'total_users': 5,
                'revenue': '100.50',
              },
            ),
          );
        },
      ),
    );

    final AdminService service = AdminService(dio);
    final AdminDashboardStats stats = await service.getStats();

    expect(capturedPath, '/admin/stats');
    expect(stats.totalOrders, 10);
    expect(stats.totalProducts, 3);
    expect(stats.totalUsers, 5);
    expect(stats.revenue, '100.50');
  });
}
