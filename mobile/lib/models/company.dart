class CompanyInfo {
  const CompanyInfo({
    required this.id,
    required this.title,
    required this.description,
    required this.photos,
  });

  final int id;
  final String title;
  final String description;
  final List<String> photos;

  factory CompanyInfo.fromJson(Map<String, dynamic> json) {
    return CompanyInfo(
      id: json['id'] as int,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      photos: (json['photos'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const <String>[],
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'title': title,
      'description': description,
      'photos': photos,
    };
  }
}

class CompanyNews {
  const CompanyNews({
    required this.id,
    required this.title,
    required this.content,
    required this.coverImage,
    required this.isPublished,
    this.publishedAt,
  });

  final int id;
  final String title;
  final String content;
  final String coverImage;
  final bool isPublished;
  final DateTime? publishedAt;

  factory CompanyNews.fromJson(Map<String, dynamic> json) {
    return CompanyNews(
      id: json['id'] as int,
      title: json['title'] as String,
      content: json['content'] as String? ?? '',
      coverImage: json['cover_image'] as String? ?? '',
      isPublished: json['is_published'] as bool,
      publishedAt: json['published_at'] != null
          ? DateTime.parse(json['published_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'title': title,
      'content': content,
      'cover_image': coverImage,
      'is_published': isPublished,
      'published_at': publishedAt?.toIso8601String(),
    };
  }
}

class PaginatedNews {
  const PaginatedNews({
    required this.items,
    required this.total,
    required this.page,
    required this.pageSize,
  });

  final List<CompanyNews> items;
  final int total;
  final int page;
  final int pageSize;

  factory PaginatedNews.fromJson(Map<String, dynamic> json) {
    return PaginatedNews(
      items: (json['items'] as List<dynamic>)
          .map((e) => CompanyNews.fromJson(e as Map<String, dynamic>))
          .toList(),
      total: json['total'] as int,
      page: json['page'] as int,
      pageSize: json['page_size'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'items': items.map((e) => e.toJson()).toList(),
      'total': total,
      'page': page,
      'page_size': pageSize,
    };
  }
}
