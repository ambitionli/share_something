import 'package:dio/dio.dart';

import '../models/company.dart';

class CompanyService {
  CompanyService(this._dio);

  final Dio _dio;

  Future<CompanyInfo?> getCompanyInfo() async {
    final Response<dynamic> response =
        await _dio.get<dynamic>('/company/info');
    final Object? data = response.data;
    if (data == null) {
      return null;
    }
    return CompanyInfo.fromJson(data as Map<String, dynamic>);
  }

  Future<PaginatedNews> listNews({
    int page = 1,
    int pageSize = 10,
    bool publishedOnly = true,
  }) async {
    final Response<dynamic> response = await _dio.get<dynamic>(
      '/company/news',
      queryParameters: <String, dynamic>{
        'page': page,
        'page_size': pageSize,
        'published_only': publishedOnly,
      },
    );
    return PaginatedNews.fromJson(
      response.data as Map<String, dynamic>,
    );
  }
}
