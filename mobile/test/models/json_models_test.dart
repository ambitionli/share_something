import 'package:flutter_test/flutter_test.dart';
import 'package:share_something/models/cart_item.dart';
import 'package:share_something/models/company.dart';
import 'package:share_something/models/product.dart';
import 'package:share_something/models/user.dart';

void main() {
  group('User', () {
    test('fromJson / toJson round-trip', () {
      final u = User.fromJson(<String, dynamic>{
        'id': 1,
        'phone': '13800138000',
        'nickname': 'n',
        'avatar_url': 'http://a/x.png',
        'role': 'admin',
      });
      expect(u.toJson()['role'], 'admin');
      expect(User.fromJson(u.toJson()).nickname, 'n');
    });
  });

  group('Product', () {
    test('fromJson parses snake_case and price as string', () {
      final p = Product.fromJson(<String, dynamic>{
        'id': 2,
        'name': 'x',
        'description': 'd',
        'price': '19.99',
        'images': <String>['u1'],
        'stock': 3,
        'is_on_shelf': true,
        'created_at': '2026-03-20T10:00:00Z',
      });
      expect(p.price, 19.99);
      expect(p.isOnShelf, true);
      expect(p.createdAt.toUtc().year, 2026);
    });

    test('PaginatedProducts.fromJson', () {
      final page = PaginatedProducts.fromJson(<String, dynamic>{
        'items': <Map<String, dynamic>>[
          <String, dynamic>{
            'id': 1,
            'name': 'a',
            'description': '',
            'price': 1,
            'images': <String>[],
            'stock': 0,
            'is_on_shelf': false,
            'created_at': '2026-03-20T10:00:00Z',
          },
        ],
        'total': 1,
        'page': 1,
        'page_size': 10,
      });
      expect(page.items.length, 1);
      expect(page.pageSize, 10);
    });
  });

  group('Company', () {
    test('CompanyInfo and CompanyNews fromJson', () {
      final info = CompanyInfo.fromJson(<String, dynamic>{
        'id': 1,
        'title': 't',
        'description': 'd',
        'photos': <String>['p'],
      });
      expect(info.photos.first, 'p');

      final news = CompanyNews.fromJson(<String, dynamic>{
        'id': 1,
        'title': 't',
        'content': 'c',
        'cover_image': 'ci',
        'is_published': true,
        'published_at': null,
      });
      expect(news.publishedAt, isNull);

      final pn = PaginatedNews.fromJson(<String, dynamic>{
        'items': <Map<String, dynamic>>[news.toJson()],
        'total': 1,
        'page': 1,
        'page_size': 10,
      });
      expect(pn.items.length, 1);
    });
  });

  group('CartItem', () {
    test('copyWith', () {
      final p = Product.fromJson(<String, dynamic>{
        'id': 1,
        'name': 'a',
        'description': '',
        'price': 1,
        'images': <String>[],
        'stock': 1,
        'is_on_shelf': true,
        'created_at': '2026-03-20T10:00:00Z',
      });
      final c = CartItem(product: p, quantity: 2);
      expect(c.copyWith(quantity: 3).quantity, 3);
    });
  });
}
