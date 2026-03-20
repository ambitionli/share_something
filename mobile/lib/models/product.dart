class Product {
  const Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.images,
    required this.stock,
    required this.isOnShelf,
    required this.createdAt,
  });

  final int id;
  final String name;
  final String description;
  final double price;
  final List<String> images;
  final int stock;
  final bool isOnShelf;
  final DateTime createdAt;

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as int,
      name: json['name'] as String,
      description: json['description'] as String? ?? '',
      price: _parseDouble(json['price']),
      images: (json['images'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const <String>[],
      stock: json['stock'] as int,
      isOnShelf: json['is_on_shelf'] as bool,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'images': images,
      'stock': stock,
      'is_on_shelf': isOnShelf,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

class PaginatedProducts {
  const PaginatedProducts({
    required this.items,
    required this.total,
    required this.page,
    required this.pageSize,
  });

  final List<Product> items;
  final int total;
  final int page;
  final int pageSize;

  factory PaginatedProducts.fromJson(Map<String, dynamic> json) {
    return PaginatedProducts(
      items: (json['items'] as List<dynamic>)
          .map((e) => Product.fromJson(e as Map<String, dynamic>))
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

double _parseDouble(Object? value) {
  if (value is double) {
    return value;
  }
  if (value is int) {
    return value.toDouble();
  }
  if (value is String) {
    return double.parse(value);
  }
  throw FormatException('Cannot parse price: $value');
}
