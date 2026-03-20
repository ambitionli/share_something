import 'package:dio/dio.dart';

/// Paginated list returned by [OrderService.listMyOrders].
class OrderListPage {
  const OrderListPage({
    required this.items,
    required this.total,
    required this.page,
    required this.pageSize,
  });

  final List<Map<String, dynamic>> items;
  final int total;
  final int page;
  final int pageSize;

  factory OrderListPage.fromJson(Map<String, dynamic> json) {
    final raw = json['items'];
    final List<Map<String, dynamic>> items = <Map<String, dynamic>>[];
    if (raw is List<dynamic>) {
      for (final Object? e in raw) {
        if (e is Map<String, dynamic>) {
          items.add(e);
        }
      }
    }
    return OrderListPage(
      items: items,
      total: json['total'] as int,
      page: json['page'] as int,
      pageSize: json['page_size'] as int,
    );
  }
}

/// Line item for creating an order (matches backend `OrderItemCreate`).
class CreateOrderLine {
  const CreateOrderLine({
    required this.productId,
    required this.quantity,
  });

  final int productId;
  final int quantity;

  Map<String, dynamic> toJson() => <String, dynamic>{
        'product_id': productId,
        'quantity': quantity,
      };
}

class OrderService {
  OrderService(this._dio);

  final Dio _dio;

  Future<OrderListPage> listMyOrders({
    int page = 1,
    int pageSize = 10,
    String? statusFilter,
  }) async {
    final Response<dynamic> response = await _dio.get<dynamic>(
      '/orders',
      queryParameters: <String, dynamic>{
        'page': page,
        'page_size': pageSize,
        if (statusFilter != null && statusFilter.isNotEmpty) 'status_filter': statusFilter,
      },
    );
    return OrderListPage.fromJson(response.data as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> getOrder(int id) async {
    final Response<dynamic> response = await _dio.get<dynamic>('/orders/$id');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createOrder({
    required List<CreateOrderLine> items,
    required Map<String, dynamic> shippingAddress,
    String paymentMethod = 'wechat',
  }) async {
    final Response<dynamic> response = await _dio.post<dynamic>(
      '/orders',
      data: <String, dynamic>{
        'items': items.map((CreateOrderLine e) => e.toJson()).toList(),
        'shipping_address': shippingAddress,
        'payment_method': paymentMethod,
      },
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> payOrder(int id) async {
    final Response<dynamic> response =
        await _dio.post<dynamic>('/orders/$id/pay');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> confirmReceipt(int id) async {
    final Response<dynamic> response =
        await _dio.post<dynamic>('/orders/$id/confirm');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> cancelOrder(int id) async {
    final Response<dynamic> response =
        await _dio.post<dynamic>('/orders/$id/cancel');
    return response.data as Map<String, dynamic>;
  }

  /// Admin: all orders (requires admin JWT).
  Future<OrderListPage> listAllOrders({
    int page = 1,
    int pageSize = 10,
    String? statusFilter,
  }) async {
    final Response<dynamic> response = await _dio.get<dynamic>(
      '/orders/all',
      queryParameters: <String, dynamic>{
        'page': page,
        'page_size': pageSize,
        if (statusFilter != null && statusFilter.isNotEmpty) 'status_filter': statusFilter,
      },
    );
    return OrderListPage.fromJson(response.data as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> shipOrder(
    int id, {
    required String expressCompany,
    required String trackingNumber,
  }) async {
    final Response<dynamic> response = await _dio.post<dynamic>(
      '/orders/$id/ship',
      data: <String, dynamic>{
        'express_company': expressCompany,
        'tracking_number': trackingNumber,
      },
    );
    return response.data as Map<String, dynamic>;
  }
}
