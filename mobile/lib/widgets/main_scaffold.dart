import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../l10n/app_localizations.dart';
import '../providers/cart_provider.dart';

class MainScaffold extends ConsumerWidget {
  const MainScaffold({super.key, required this.child});

  final Widget child;

  static int _indexFromPath(String path) {
    if (path.startsWith('/products')) return 1;
    if (path == '/cart') return 2;
    if (path == '/profile') return 3;
    return 0;
  }

  static const _paths = ['/', '/products', '/cart', '/profile'];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final cartCount = ref.watch(cartProvider).items.length;
    final location = GoRouterState.of(context).uri.path;

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _indexFromPath(location),
        onDestinationSelected: (i) => context.go(_paths[i]),
        destinations: [
          NavigationDestination(icon: const Icon(Icons.home_outlined), selectedIcon: const Icon(Icons.home), label: l10n.home),
          NavigationDestination(icon: const Icon(Icons.store_outlined), selectedIcon: const Icon(Icons.store), label: l10n.products),
          NavigationDestination(
            icon: Badge(
              isLabelVisible: cartCount > 0,
              label: Text('$cartCount'),
              child: const Icon(Icons.shopping_cart_outlined),
            ),
            selectedIcon: Badge(
              isLabelVisible: cartCount > 0,
              label: Text('$cartCount'),
              child: const Icon(Icons.shopping_cart),
            ),
            label: l10n.cart,
          ),
          NavigationDestination(icon: const Icon(Icons.person_outlined), selectedIcon: const Icon(Icons.person), label: l10n.mine),
        ],
      ),
    );
  }
}
