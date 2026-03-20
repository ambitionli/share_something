import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../l10n/app_localizations.dart';
import '../../models/product.dart';
import '../../services/product_service.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';

class ProductListScreen extends ConsumerStatefulWidget {
  const ProductListScreen({super.key});

  @override
  ConsumerState<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends ConsumerState<ProductListScreen> {
  final _searchCtrl = TextEditingController();
  List<Product> _products = [];
  int _total = 0;
  int _page = 1;
  bool _loading = false;
  bool _hasMore = true;
  final _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadProducts();
    _scrollCtrl.addListener(() {
      if (_scrollCtrl.position.pixels >= _scrollCtrl.position.maxScrollExtent - 200 && !_loading && _hasMore) {
        _loadProducts(loadMore: true);
      }
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadProducts({bool loadMore = false}) async {
    if (_loading) return;
    setState(() => _loading = true);

    final page = loadMore ? _page + 1 : 1;
    try {
      final dio = ref.read(apiServiceProvider).dio;
      final service = ProductService(dio);
      final result = await service.listProducts(page: page, pageSize: 10, onShelfOnly: true, keyword: _searchCtrl.text);

      setState(() {
        if (loadMore) {
          _products.addAll(result.items);
        } else {
          _products = result.items;
        }
        _total = result.total;
        _page = page;
        _hasMore = _products.length < _total;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final apiOrigin = defaultApiOrigin();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: TextField(
            controller: _searchCtrl,
            decoration: InputDecoration(
              hintText: l10n.searchProducts,
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16),
              suffixIcon: _searchCtrl.text.isNotEmpty
                  ? IconButton(icon: const Icon(Icons.clear), onPressed: () { _searchCtrl.clear(); _loadProducts(); })
                  : null,
            ),
            onSubmitted: (_) => _loadProducts(),
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => _loadProducts(),
            child: _products.isEmpty && !_loading
                ? Center(child: Text(l10n.noData))
                : GridView.builder(
                    controller: _scrollCtrl,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.72,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                    ),
                    itemCount: _products.length + (_hasMore ? 1 : 0),
                    itemBuilder: (context, i) {
                      if (i >= _products.length) {
                        return const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()));
                      }
                      final p = _products[i];
                      return GestureDetector(
                        onTap: () => context.go('/products/${p.id}'),
                        child: Card(
                          clipBehavior: Clip.antiAlias,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: p.images.isNotEmpty
                                    ? Image.network('$apiOrigin${p.images[0]}', fit: BoxFit.cover, width: double.infinity,
                                        errorBuilder: (_, __, ___) => _placeholder())
                                    : _placeholder(),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(8),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(p.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                                    const SizedBox(height: 4),
                                    Text('¥${p.price.toStringAsFixed(2)}', style: TextStyle(color: Colors.red[700], fontWeight: FontWeight.bold, fontSize: 16)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ),
      ],
    );
  }

  Widget _placeholder() => Container(
    color: Colors.grey[200],
    width: double.infinity,
    child: const Icon(Icons.image_outlined, size: 48, color: Colors.grey),
  );
}
