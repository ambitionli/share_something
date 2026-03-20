import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../l10n/app_localizations.dart';
import '../../models/product.dart';
import '../../services/product_service.dart';
import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../services/api_service.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  const ProductDetailScreen({super.key, required this.productId});

  final int productId;

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  Product? _product;
  bool _loading = true;
  int _currentImage = 0;

  @override
  void initState() {
    super.initState();
    _loadProduct();
  }

  Future<void> _loadProduct() async {
    try {
      final dio = ref.read(apiServiceProvider).dio;
      final service = ProductService(dio);
      final product = await service.getProduct(widget.productId);
      setState(() { _product = product; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final apiOrigin = defaultApiOrigin();

    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.productDetail)),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_product == null) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.productDetail)),
        body: Center(child: Text(l10n.noData)),
      );
    }

    final p = _product!;
    final soldOut = p.stock <= 0;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.productDetail)),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (p.images.isNotEmpty)
              SizedBox(
                height: 300,
                child: PageView.builder(
                  itemCount: p.images.length,
                  onPageChanged: (i) => setState(() => _currentImage = i),
                  itemBuilder: (_, i) => Image.network(
                    '$apiOrigin${p.images[i]}',
                    fit: BoxFit.cover,
                    width: double.infinity,
                    errorBuilder: (_, __, ___) => Container(color: Colors.grey[200], child: const Icon(Icons.image, size: 80, color: Colors.grey)),
                  ),
                ),
              )
            else
              Container(height: 300, color: Colors.grey[200], child: const Center(child: Icon(Icons.image_outlined, size: 80, color: Colors.grey))),
            if (p.images.length > 1)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(8),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: List.generate(p.images.length, (i) => Container(
                      width: 8, height: 8,
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _currentImage == i ? Theme.of(context).colorScheme.primary : Colors.grey[300],
                      ),
                    )),
                  ),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('¥${p.price.toStringAsFixed(2)}', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.red[700])),
                  const SizedBox(height: 8),
                  Text(p.name, style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Chip(label: Text('${l10n.stock}: ${p.stock}'), avatar: Icon(soldOut ? Icons.warning : Icons.inventory_2, size: 18)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (p.description.isNotEmpty) ...[
                    Text(l10n.productDetail, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text(p.description, style: Theme.of(context).textTheme.bodyLarge),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: soldOut ? null : () {
                    ref.read(cartProvider.notifier).addItem(p);
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${l10n.addToCart} ✓'), duration: const Duration(seconds: 1)));
                  },
                  icon: const Icon(Icons.shopping_cart_outlined),
                  label: Text(soldOut ? l10n.soldOut : l10n.addToCart),
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: FilledButton.icon(
                  onPressed: soldOut ? null : () {
                    ref.read(cartProvider.notifier).addItem(p);
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.addToCart), duration: const Duration(seconds: 1)));
                  },
                  icon: const Icon(Icons.flash_on),
                  label: Text(soldOut ? l10n.soldOut : l10n.buyNow),
                  style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
