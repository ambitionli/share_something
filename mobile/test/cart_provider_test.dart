import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:share_something/models/product.dart';
import 'package:share_something/providers/cart_provider.dart';

Product _p(int id, double price) {
  return Product(
    id: id,
    name: 'p$id',
    description: '',
    price: price,
    images: const [],
    stock: 10,
    isOnShelf: true,
    createdAt: DateTime.utc(2024),
  );
}

void main() {
  test('addItem increments quantity for same product', () {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    final n = container.read(cartProvider.notifier);
    final a = _p(1, 10);
    n.addItem(a);
    n.addItem(a);
    expect(container.read(cartProvider).items.length, 1);
    expect(container.read(cartProvider).items.first.quantity, 2);
    expect(container.read(cartProvider).totalPrice, 20);
  });

  test('removeItem and clearCart', () {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    final n = container.read(cartProvider.notifier);
    n.addItem(_p(1, 5));
    n.addItem(_p(2, 3));
    n.removeItem(1);
    expect(container.read(cartProvider).items.length, 1);
    n.clearCart();
    expect(container.read(cartProvider).items, isEmpty);
    expect(container.read(cartProvider).totalPrice, 0);
  });

  test('updateQuantity removes line when qty < 1', () {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    final n = container.read(cartProvider.notifier);
    n.addItem(_p(1, 5));
    n.updateQuantity(1, 0);
    expect(container.read(cartProvider).items, isEmpty);
  });

  test('updateQuantity changes quantity', () {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    final n = container.read(cartProvider.notifier);
    n.addItem(_p(1, 4));
    n.updateQuantity(1, 3);
    expect(container.read(cartProvider).items.first.quantity, 3);
    expect(container.read(cartProvider).totalPrice, 12);
  });
}
