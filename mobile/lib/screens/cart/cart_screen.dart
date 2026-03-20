import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../l10n/app_localizations.dart';
import '../../providers/cart_provider.dart';
import '../../services/api_service.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final cart = ref.watch(cartProvider);
    final apiOrigin = defaultApiOrigin();

    if (cart.items.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.shopping_cart_outlined, size: 80, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(l10n.cartEmpty, style: TextStyle(fontSize: 16, color: Colors.grey[600])),
          ],
        ),
      );
    }

    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: cart.items.length,
            itemBuilder: (context, i) {
              final item = cart.items[i];
              final p = item.product;
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: p.images.isNotEmpty
                            ? Image.network('$apiOrigin${p.images[0]}', width: 80, height: 80, fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => _imgPlaceholder())
                            : _imgPlaceholder(),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(p.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
                            const SizedBox(height: 4),
                            Text('¥${p.price.toStringAsFixed(2)}', style: TextStyle(color: Colors.red[700], fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                      Column(
                        children: [
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.remove_circle_outline, size: 22),
                                onPressed: () => ref.read(cartProvider.notifier).updateQuantity(p.id, item.quantity - 1),
                              ),
                              Text('${item.quantity}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              IconButton(
                                icon: const Icon(Icons.add_circle_outline, size: 22),
                                onPressed: () => ref.read(cartProvider.notifier).updateQuantity(p.id, item.quantity + 1),
                              ),
                            ],
                          ),
                          TextButton(
                            onPressed: () => ref.read(cartProvider.notifier).removeItem(p.id),
                            child: Text(l10n.delete, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8, offset: const Offset(0, -2))],
          ),
          child: SafeArea(
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(l10n.cartTotal, style: const TextStyle(color: Colors.grey)),
                      Text('¥${cart.totalPrice.toStringAsFixed(2)}', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.red[700])),
                    ],
                  ),
                ),
                FilledButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('订单功能将在阶段四实现 / Orders coming in Phase 4')),
                    );
                  },
                  style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14)),
                  child: Text(l10n.checkout),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _imgPlaceholder() => Container(
    width: 80, height: 80,
    color: Colors.grey[200],
    child: const Icon(Icons.image_outlined, color: Colors.grey),
  );
}
