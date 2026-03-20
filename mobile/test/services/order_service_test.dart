import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:share_something/services/order_service.dart';

void main() {
  test('listMyOrders GET /orders with query params', () async {
    String? capturedPath;
    Map<String, dynamic>? capturedQuery;
    final Dio dio = Dio(
      BaseOptions(baseUrl: 'http://localhost:8000/api/v1'),
    );
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (RequestOptions options, RequestInterceptorHandler handler) {
          capturedPath = options.path;
          capturedQuery = Map<String, dynamic>.from(options.queryParameters);
          handler.resolve(
            Response<dynamic>(
              requestOptions: options,
              data: <String, dynamic>{
                'items': <Map<String, dynamic>>[],
                'total': 0,
                'page': 2,
                'page_size': 10,
              },
            ),
          );
        },
      ),
    );

    final OrderService service = OrderService(dio);
    final OrderListPage page = await service.listMyOrders(
      page: 2,
      pageSize: 10,
      statusFilter: 'paid',
    );

    expect(capturedPath, '/orders');
    expect(capturedQuery!['page'], 2);
    expect(capturedQuery!['page_size'], 10);
    expect(capturedQuery!['status_filter'], 'paid');
    expect(page.items, isEmpty);
    expect(page.total, 0);
    expect(page.page, 2);
    expect(page.pageSize, 10);
  });

  test('payOrder POST /orders/{id}/pay', () async {
    String? capturedMethod;
    String? capturedPath;
    final Dio dio = Dio(
      BaseOptions(baseUrl: 'http://localhost:8000/api/v1'),
    );
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (RequestOptions options, RequestInterceptorHandler handler) {
          capturedMethod = options.method;
          capturedPath = options.path;
          handler.resolve(
            Response<dynamic>(
              requestOptions: options,
              data: <String, dynamic>{'id': 7, 'status': 'paid'},
            ),
          );
        },
      ),
    );

    final OrderService service = OrderService(dio);
    final Map<String, dynamic> json = await service.payOrder(7);

    expect(capturedMethod, 'POST');
    expect(capturedPath, '/orders/7/pay');
    expect(json['status'], 'paid');
  });

  test('listAllOrders GET /orders/all with query params', () async {
    String? capturedPath;
    Map<String, dynamic>? capturedQuery;
    final Dio dio = Dio(
      BaseOptions(baseUrl: 'http://localhost:8000/api/v1'),
    );
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (RequestOptions options, RequestInterceptorHandler handler) {
          capturedPath = options.path;
          capturedQuery = Map<String, dynamic>.from(options.queryParameters);
          handler.resolve(
            Response<dynamic>(
              requestOptions: options,
              data: <String, dynamic>{
                'items': <Map<String, dynamic>>[],
                'total': 0,
                'page': 1,
                'page_size': 20,
              },
            ),
          );
        },
      ),
    );

    final OrderService service = OrderService(dio);
    final OrderListPage page = await service.listAllOrders(
      page: 1,
      pageSize: 20,
      statusFilter: 'paid',
    );

    expect(capturedPath, '/orders/all');
    expect(capturedQuery!['page'], 1);
    expect(capturedQuery!['page_size'], 20);
    expect(capturedQuery!['status_filter'], 'paid');
    expect(page.items, isEmpty);
  });

  test('shipOrder POST /orders/{id}/ship with body', () async {
    String? capturedPath;
    Object? capturedData;
    final Dio dio = Dio(
      BaseOptions(baseUrl: 'http://localhost:8000/api/v1'),
    );
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (RequestOptions options, RequestInterceptorHandler handler) {
          capturedPath = options.path;
          capturedData = options.data;
          handler.resolve(
            Response<dynamic>(
              requestOptions: options,
              data: <String, dynamic>{'id': 3, 'status': 'shipped'},
            ),
          );
        },
      ),
    );

    final OrderService service = OrderService(dio);
    final Map<String, dynamic> json = await service.shipOrder(
      3,
      expressCompany: 'SF',
      trackingNumber: 'SF123',
    );

    expect(capturedPath, '/orders/3/ship');
    expect(capturedData, <String, dynamic>{
      'express_company': 'SF',
      'tracking_number': 'SF123',
    });
    expect(json['status'], 'shipped');
  });
}
