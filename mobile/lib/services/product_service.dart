import 'package:dio/dio.dart';

import '../models/product.dart';

class ProductService {
  ProductService(this._dio);

  final Dio _dio;

  Future<PaginatedProducts> listProducts({
    int page = 1,
    int pageSize = 10,
    bool onShelfOnly = true,
    String keyword = '',
  }) async {
    final Response<dynamic> response = await _dio.get<dynamic>(
      '/products',
      queryParameters: <String, dynamic>{
        'page': page,
        'page_size': pageSize,
        'on_shelf_only': onShelfOnly,
        'keyword': keyword,
      },
    );
    return PaginatedProducts.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  Future<Product> getProduct(int id) async {
    final Response<dynamic> response =
        await _dio.get<dynamic>('/products/$id');
    return Product.fromJson(response.data as Map<String, dynamic>);
  }
}
