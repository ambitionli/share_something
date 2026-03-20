import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../l10n/app_localizations.dart';
import '../../models/product.dart';
import '../../providers/auth_provider.dart';
import '../../services/product_service.dart';
import '../../widgets/error_widget.dart';

class AdminProductsScreen extends ConsumerStatefulWidget {
  const AdminProductsScreen({super.key});

  @override
  ConsumerState<AdminProductsScreen> createState() =>
      _AdminProductsScreenState();
}

class _AdminProductsScreenState extends ConsumerState<AdminProductsScreen> {
  final List<Product> _items = <Product>[];
  final ScrollController _scrollCtrl = ScrollController();
  int _page = 1;
  int _total = 0;
  bool _loading = false;
  bool _hasMore = true;
  Object? _loadError;
  final int _pageSize = 50;

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(_onScroll);
    Future<void>.microtask(_loadProducts);
  }

  @override
  void dispose() {
    _scrollCtrl.removeListener(_onScroll);
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollCtrl.position.pixels >= _scrollCtrl.position.maxScrollExtent - 200 &&
        !_loading &&
        _hasMore) {
      _loadProducts(loadMore: true);
    }
  }

  Future<void> _loadProducts({bool loadMore = false}) async {
    final auth = ref.read(authProvider);
    if (auth.user?.role != 'admin') {
      return;
    }
    if (_loading) {
      return;
    }

    setState(() {
      _loading = true;
      if (!loadMore) {
        _loadError = null;
      }
    });

    final int nextPage = loadMore ? _page + 1 : 1;
    try {
      final Dio dio = ref.read(apiServiceProvider).dio;
      final ProductService service = ProductService(dio);
      final PaginatedProducts page = await service.listProducts(
        page: nextPage,
        pageSize: _pageSize,
        onShelfOnly: false,
      );
      if (!mounted) {
        return;
      }
      setState(() {
        if (loadMore) {
          _items.addAll(page.items);
        } else {
          _items
            ..clear()
            ..addAll(page.items);
        }
        _total = page.total;
        _page = nextPage;
        _hasMore = _items.length < _total;
        _loading = false;
        _loadError = null;
      });
    } catch (e, st) {
      debugPrint('AdminProductsScreen load failed: $e\n$st');
      if (!mounted) {
        return;
      }
      setState(() {
        _loading = false;
        _loadError = e;
      });
    }
  }

  Future<void> _toggleShelf(Product p, bool value) async {
    try {
      final Dio dio = ref.read(apiServiceProvider).dio;
      await ProductService(dio).updateProduct(p.id, isOnShelf: value);
      if (!mounted) {
        return;
      }
      setState(() {
        final int i = _items.indexWhere((Product x) => x.id == p.id);
        if (i >= 0) {
          _items[i] = Product(
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            images: p.images,
            stock: p.stock,
            isOnShelf: value,
            createdAt: p.createdAt,
          );
        }
      });
    } catch (e, st) {
      debugPrint('toggleShelf failed: $e\n$st');
      if (!mounted) {
        return;
      }
      final AppLocalizations l10n = AppLocalizations.of(context)!;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(localizedApiError(l10n, e))),
      );
    }
  }

  Future<void> _deleteProduct(Product p) async {
    final AppLocalizations l10n = AppLocalizations.of(context)!;
    final bool? ok = await showDialog<bool>(
      context: context,
      builder: (BuildContext ctx) => AlertDialog(
        title: Text(l10n.delete),
        content: Text(l10n.deleteConfirm),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(l10n.cancel),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(l10n.confirm),
          ),
        ],
      ),
    );
    if (ok != true || !mounted) {
      return;
    }
    try {
      final Dio dio = ref.read(apiServiceProvider).dio;
      await ProductService(dio).deleteProduct(p.id);
      if (!mounted) {
        return;
      }
      await _loadProducts();
    } catch (e, st) {
      debugPrint('deleteProduct failed: $e\n$st');
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(localizedApiError(l10n, e))),
      );
    }
  }

  void _openEditor({Product? product}) {
    final AppLocalizations l10n = AppLocalizations.of(context)!;
    final TextEditingController nameCtrl =
        TextEditingController(text: product?.name ?? '');
    final TextEditingController descCtrl =
        TextEditingController(text: product?.description ?? '');
    final TextEditingController priceCtrl = TextEditingController(
      text: product != null ? product.price.toString() : '',
    );
    final TextEditingController stockCtrl = TextEditingController(
      text: product != null ? '${product.stock}' : '0',
    );
    final GlobalKey<FormState> formKey = GlobalKey<FormState>();

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (BuildContext ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: 8,
            bottom: MediaQuery.viewInsetsOf(ctx).bottom + 16,
          ),
          child: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[
                  Text(
                    product == null ? l10n.addProduct : l10n.editProduct,
                    style: Theme.of(ctx).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: nameCtrl,
                    decoration: InputDecoration(labelText: l10n.productName),
                    validator: (String? v) {
                      if (v == null || v.trim().isEmpty) {
                        return l10n.fieldRequired;
                      }
                      return null;
                    },
                  ),
                  TextFormField(
                    controller: descCtrl,
                    decoration:
                        InputDecoration(labelText: l10n.productDescription),
                    maxLines: 3,
                  ),
                  TextFormField(
                    controller: priceCtrl,
                    decoration: InputDecoration(labelText: l10n.productPrice),
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    inputFormatters: <TextInputFormatter>[
                      FilteringTextInputFormatter.allow(RegExp(r'[0-9.]')),
                    ],
                    validator: (String? v) {
                      if (v == null || v.trim().isEmpty) {
                        return l10n.fieldRequired;
                      }
                      if (double.tryParse(v.trim()) == null) {
                        return l10n.invalidNumber;
                      }
                      return null;
                    },
                  ),
                  TextFormField(
                    controller: stockCtrl,
                    decoration: InputDecoration(labelText: l10n.productStock),
                    keyboardType: TextInputType.number,
                    inputFormatters: <TextInputFormatter>[
                      FilteringTextInputFormatter.digitsOnly,
                    ],
                    validator: (String? v) {
                      if (v == null || v.trim().isEmpty) {
                        return l10n.fieldRequired;
                      }
                      if (int.tryParse(v.trim()) == null) {
                        return l10n.invalidNumber;
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: () async {
                      if (!formKey.currentState!.validate()) {
                        return;
                      }
                      final double price =
                          double.parse(priceCtrl.text.trim());
                      final int stock = int.parse(stockCtrl.text.trim());
                      try {
                        final Dio dio = ref.read(apiServiceProvider).dio;
                        final ProductService svc = ProductService(dio);
                        if (product == null) {
                          await svc.createProduct(
                            name: nameCtrl.text.trim(),
                            description: descCtrl.text.trim(),
                            price: price,
                            stock: stock,
                            isOnShelf: true,
                          );
                        } else {
                          await svc.updateProduct(
                            product.id,
                            name: nameCtrl.text.trim(),
                            description: descCtrl.text.trim(),
                            price: price,
                            stock: stock,
                          );
                        }
                        if (ctx.mounted) {
                          Navigator.pop(ctx);
                        }
                        await _loadProducts();
                      } catch (e, st) {
                        debugPrint('save product failed: $e\n$st');
                        if (ctx.mounted) {
                          ScaffoldMessenger.of(ctx).showSnackBar(
                            SnackBar(
                              content: Text(localizedApiError(l10n, e)),
                            ),
                          );
                        }
                      }
                    },
                    child: Text(l10n.save),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = AppLocalizations.of(context)!;
    final auth = ref.watch(authProvider);

    if (auth.user?.role != 'admin') {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.adminProductsTitle)),
        body: Center(child: Text(l10n.adminAccessDenied)),
      );
    }

    if (_loadError != null && _items.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.adminProductsTitle)),
        floatingActionButton: FloatingActionButton(
          onPressed: () => _openEditor(),
          child: const Icon(Icons.add),
        ),
        body: RetryableErrorView(
          message: localizedApiError(l10n, _loadError!),
          onRetry: () => _loadProducts(),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(l10n.adminProductsTitle)),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _openEditor(),
        child: const Icon(Icons.add),
      ),
      body: _items.isEmpty && _loading
          ? const Center(child: CircularProgressIndicator())
          : _items.isEmpty
              ? RefreshIndicator(
                  onRefresh: () => _loadProducts(),
                  child: ListView(
                    controller: _scrollCtrl,
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: <Widget>[
                      SizedBox(
                        height: MediaQuery.sizeOf(context).height * 0.25,
                      ),
                      Center(child: Text(l10n.noData)),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => _loadProducts(),
                  child: ListView.builder(
                    controller: _scrollCtrl,
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(12),
                    itemCount: _items.length + (_hasMore ? 1 : 0),
                    itemBuilder: (BuildContext context, int index) {
                      if (index >= _items.length) {
                        return const Padding(
                          padding: EdgeInsets.all(16),
                          child: Center(child: CircularProgressIndicator()),
                        );
                      }
                      final Product p = _items[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: InkWell(
                          onTap: () => _openEditor(product: p),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Row(
                                  children: <Widget>[
                                    Expanded(
                                      child: Text(
                                        p.name,
                                        style: Theme.of(context)
                                            .textTheme
                                            .titleMedium,
                                      ),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.delete_outline),
                                      onPressed: () => _deleteProduct(p),
                                      tooltip: l10n.delete,
                                    ),
                                  ],
                                ),
                                Text(
                                  '${l10n.price}: ${p.price}  ·  ${l10n.stock}: ${p.stock}',
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: <Widget>[
                                    Text(l10n.onShelf),
                                    const Spacer(),
                                    Switch(
                                      value: p.isOnShelf,
                                      onChanged: (bool v) =>
                                          _toggleShelf(p, v),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
