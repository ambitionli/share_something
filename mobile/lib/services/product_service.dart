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

  Future<Product> createProduct({
    required String name,
    String description = '',
    required double price,
    List<String> images = const <String>[],
    int stock = 0,
    bool isOnShelf = false,
  }) async {
    final Response<dynamic> response = await _dio.post<dynamic>(
      '/products',
      data: <String, dynamic>{
        'name': name,
        'description': description,
        'price': price,
        'images': images,
        'stock': stock,
        'is_on_shelf': isOnShelf,
      },
    );
    return Product.fromJson(response.data as Map<String, dynamic>);
  }

  Future<Product> updateProduct(
    int id, {
    String? name,
    String? description,
    double? price,
    List<String>? images,
    int? stock,
    bool? isOnShelf,
  }) async {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (name != null) {
      data['name'] = name;
    }
    if (description != null) {
      data['description'] = description;
    }
    if (price != null) {
      data['price'] = price;
    }
    if (images != null) {
      data['images'] = images;
    }
    if (stock != null) {
      data['stock'] = stock;
    }
    if (isOnShelf != null) {
      data['is_on_shelf'] = isOnShelf;
    }
    final Response<dynamic> response =
        await _dio.put<dynamic>('/products/$id', data: data);
    return Product.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> deleteProduct(int id) async {
    await _dio.delete<void>('/products/$id');
  }
}
