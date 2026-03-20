import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:share_something/services/product_service.dart';

void main() {
  test('createProduct POST /products', () async {
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
              data: <String, dynamic>{
                'id': 1,
                'name': 'A',
                'description': '',
                'price': '9.99',
                'images': <String>[],
                'stock': 2,
                'is_on_shelf': true,
                'created_at': '2026-01-01T00:00:00.000000',
              },
            ),
          );
        },
      ),
    );

    final ProductService service = ProductService(dio);
    final result = await service.createProduct(
      name: 'A',
      price: 9.99,
      stock: 2,
      isOnShelf: true,
    );

    expect(capturedPath, '/products');
    expect(capturedData, <String, dynamic>{
      'name': 'A',
      'description': '',
      'price': 9.99,
      'images': <String>[],
      'stock': 2,
      'is_on_shelf': true,
    });
    expect(result.name, 'A');
  });

  test('updateProduct PUT /products/{id}', () async {
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
              data: <String, dynamic>{
                'id': 5,
                'name': 'B',
                'description': '',
                'price': '1.00',
                'images': <String>[],
                'stock': 0,
                'is_on_shelf': false,
                'created_at': '2026-01-01T00:00:00.000000',
              },
            ),
          );
        },
      ),
    );

    final ProductService service = ProductService(dio);
    await service.updateProduct(5, isOnShelf: false);

    expect(capturedPath, '/products/5');
    expect(capturedData, <String, dynamic>{'is_on_shelf': false});
  });

  test('deleteProduct DELETE /products/{id}', () async {
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
              statusCode: 204,
            ),
          );
        },
      ),
    );

    final ProductService service = ProductService(dio);
    await service.deleteProduct(9);

    expect(capturedMethod, 'DELETE');
    expect(capturedPath, '/products/9');
  });
}
