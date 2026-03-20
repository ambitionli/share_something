import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../l10n/app_localizations.dart';
import '../../models/company.dart';
import '../../models/product.dart';
import '../../services/company_service.dart';
import '../../services/product_service.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  CompanyInfo? _company;
  List<CompanyNews> _news = [];
  List<Product> _hotProducts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final dio = ref.read(apiServiceProvider).dio;
      final companyService = CompanyService(dio);
      final productService = ProductService(dio);

      final results = await Future.wait([
        companyService.getCompanyInfo(),
        companyService.listNews(page: 1, pageSize: 5),
        productService.listProducts(page: 1, pageSize: 6, onShelfOnly: true),
      ]);

      setState(() {
        _company = results[0] as CompanyInfo?;
        _news = (results[1] as PaginatedNews).items;
        _hotProducts = (results[2] as PaginatedProducts).items;
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

    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (_company != null) ...[
            Card(
              clipBehavior: Clip.antiAlias,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.business, color: Color(0xFF6366F1)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(_company!.title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(_company!.description, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey[600])),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
          if (_news.isNotEmpty) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(l10n.latestNews, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 8),
            ..._news.map((n) => Card(
              child: ListTile(
                leading: const Icon(Icons.article_outlined),
                title: Text(n.title, maxLines: 1, overflow: TextOverflow.ellipsis),
                subtitle: Text(n.content, maxLines: 2, overflow: TextOverflow.ellipsis),
              ),
            )),
            const SizedBox(height: 16),
          ],
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(l10n.products, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
              TextButton(
                onPressed: () => context.go('/products'),
                child: Text(l10n.viewAll),
              ),
            ],
          ),
          const SizedBox(height: 8),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.75,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: _hotProducts.length,
            itemBuilder: (context, index) {
              final p = _hotProducts[index];
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
                                errorBuilder: (_, __, ___) => const _PlaceholderImage())
                            : const _PlaceholderImage(),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(p.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
                            const SizedBox(height: 4),
                            Text('¥${p.price.toStringAsFixed(2)}', style: TextStyle(color: Colors.red[700], fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _PlaceholderImage extends StatelessWidget {
  const _PlaceholderImage();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey[200],
      width: double.infinity,
      child: const Icon(Icons.image_outlined, size: 48, color: Colors.grey),
    );
  }
}
