import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/cart_item.dart';
import '../models/product.dart';

class CartState {
  final List<CartItem> items;

  const CartState({this.items = const []});

  double get totalPrice =>
      items.fold(0.0, (sum, item) => sum + item.lineTotal);

  CartState copyWith({List<CartItem>? items}) {
    return CartState(items: items ?? this.items);
  }
}

class CartNotifier extends StateNotifier<CartState> {
  CartNotifier() : super(const CartState());

  void addItem(Product product) {
    final list = [...state.items];
    final i = list.indexWhere((e) => e.product.id == product.id);
    if (i >= 0) {
      final existing = list[i];
      list[i] = existing.copyWith(quantity: existing.quantity + 1);
    } else {
      list.add(CartItem(product: product, quantity: 1));
    }
    state = CartState(items: list);
  }

  void removeItem(int productId) {
    state = CartState(
      items: state.items.where((e) => e.product.id != productId).toList(),
    );
  }

  void updateQuantity(int productId, int qty) {
    if (qty < 1) {
      removeItem(productId);
      return;
    }
    final list = [...state.items];
    final i = list.indexWhere((e) => e.product.id == productId);
    if (i < 0) {
      return;
    }
    list[i] = list[i].copyWith(quantity: qty);
    state = CartState(items: list);
  }

  void clearCart() {
    state = const CartState();
  }
}

final cartProvider =
    StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier();
});
