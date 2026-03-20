import 'package:dio/dio.dart';

/// Dashboard figures from [GET /admin/stats].
class AdminDashboardStats {
  const AdminDashboardStats({
    required this.totalOrders,
    required this.totalProducts,
    required this.totalUsers,
    required this.revenue,
  });

  final int totalOrders;
  final int totalProducts;
  final int totalUsers;
  final String revenue;

  factory AdminDashboardStats.fromJson(Map<String, dynamic> json) {
    return AdminDashboardStats(
      totalOrders: json['total_orders'] as int,
      totalProducts: json['total_products'] as int,
      totalUsers: json['total_users'] as int,
      revenue: json['revenue'].toString(),
    );
  }
}

class AdminService {
  AdminService(this._dio);

  final Dio _dio;

  Future<AdminDashboardStats> getStats() async {
    final Response<dynamic> response =
        await _dio.get<dynamic>('/admin/stats');
    return AdminDashboardStats.fromJson(
      response.data as Map<String, dynamic>,
    );
  }
}
