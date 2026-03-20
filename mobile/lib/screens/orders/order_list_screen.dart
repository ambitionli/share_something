import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../services/order_service.dart';

class _OrderLine {
  const _OrderLine({
    required this.productId,
    required this.quantity,
    required this.unitPrice,
  });

  final int productId;
  final int quantity;
  final String unitPrice;
}

class _Order {
  const _Order({
    required this.id,
    required this.status,
    required this.totalAmount,
    required this.createdAt,
    required this.items,
    this.expressCompany,
    this.trackingNumber,
  });

  final int id;
  final String status;
  final String totalAmount;
  final DateTime createdAt;
  final List<_OrderLine> items;
  final String? expressCompany;
  final String? trackingNumber;

  factory _Order.fromJson(Map<String, dynamic> json) {
    final List<dynamic> rawItems = json['items'] as List<dynamic>? ?? <dynamic>[];
    final List<_OrderLine> lines = <_OrderLine>[];
    for (final Object? e in rawItems) {
      if (e is! Map<String, dynamic>) {
        continue;
      }
      lines.add(
        _OrderLine(
          productId: e['product_id'] as int,
          quantity: e['quantity'] as int,
          unitPrice: e['unit_price'].toString(),
        ),
      );
    }
    return _Order(
      id: json['id'] as int,
      status: json['status'] as String,
      totalAmount: json['total_amount'].toString(),
      createdAt: DateTime.parse(json['created_at'] as String),
      items: lines,
      expressCompany: json['express_company'] as String?,
      trackingNumber: json['tracking_number'] as String?,
    );
  }
}

class OrderListScreen extends ConsumerStatefulWidget {
  const OrderListScreen({super.key});

  @override
  ConsumerState<OrderListScreen> createState() => _OrderListScreenState();
}

class _OrderListScreenState extends ConsumerState<OrderListScreen> {
  final ScrollController _scrollCtrl = ScrollController();
  final List<_Order> _orders = <_Order>[];
  int _page = 1;
  int _total = 0;
  bool _loading = false;
  bool _hasMore = true;
  String? _actionError;

  @override
  void initState() {
    super.initState();
    _loadOrders();
    _scrollCtrl.addListener(_onScroll);
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
      _loadOrders(loadMore: true);
    }
  }

  Future<void> _loadOrders({bool loadMore = false}) async {
    if (_loading) {
      return;
    }
    final auth = ref.read(authProvider);
    if (!auth.isLoggedIn) {
      return;
    }

    setState(() {
      _loading = true;
      _actionError = null;
    });

    final int nextPage = loadMore ? _page + 1 : 1;
    try {
      final Dio dio = ref.read(apiServiceProvider).dio;
      final OrderService service = OrderService(dio);
      final OrderListPage result =
          await service.listMyOrders(page: nextPage, pageSize: 10);

      setState(() {
        if (loadMore) {
          _orders.addAll(
            result.items.map((Map<String, dynamic> m) => _Order.fromJson(m)),
          );
        } else {
          _orders
            ..clear()
            ..addAll(
              result.items.map((Map<String, dynamic> m) => _Order.fromJson(m)),
            );
        }
        _total = result.total;
        _page = nextPage;
        _hasMore = _orders.length < _total;
        _loading = false;
      });
    } catch (e, st) {
      debugPrint('OrderListScreen load failed: $e\n$st');
      setState(() {
        _loading = false;
        _actionError = e.toString();
      });
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'pending':
        return Colors.orange;
      case 'paid':
        return Colors.blue;
      case 'shipped':
        return Colors.cyan;
      case 'completed':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _statusLabel(AppLocalizations l10n, String status) {
    switch (status) {
      case 'pending':
        return l10n.orderStatusPending;
      case 'paid':
        return l10n.orderStatusPaid;
      case 'shipped':
        return l10n.orderStatusShipped;
      case 'completed':
        return l10n.orderStatusCompleted;
      case 'cancelled':
        return l10n.orderStatusCancelled;
      default:
        return status;
    }
  }

  Future<void> _pay(int id) async {
    setState(() => _actionError = null);
    try {
      final Dio dio = ref.read(apiServiceProvider).dio;
      await OrderService(dio).payOrder(id);
      if (!mounted) {
        return;
      }
      await _loadOrders();
    } catch (e, st) {
      debugPrint('payOrder failed: $e\n$st');
      if (!mounted) {
        return;
      }
      setState(() => _actionError = e.toString());
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${AppLocalizations.of(context)!.networkError}: $e')),
      );
    }
  }

  Future<void> _confirm(int id) async {
    setState(() => _actionError = null);
    try {
      final Dio dio = ref.read(apiServiceProvider).dio;
      await OrderService(dio).confirmReceipt(id);
      if (!mounted) {
        return;
      }
      await _loadOrders();
    } catch (e, st) {
      debugPrint('confirmReceipt failed: $e\n$st');
      if (!mounted) {
        return;
      }
      setState(() => _actionError = e.toString());
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${AppLocalizations.of(context)!.networkError}: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = AppLocalizations.of(context)!;
    final auth = ref.watch(authProvider);
    final DateFormat fmt = DateFormat.yMMMd().add_Hm();

    if (!auth.isLoggedIn) {
      return Center(
        child: Text(l10n.login),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(l10n.myOrders)),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          if (_actionError != null)
            Material(
              color: Theme.of(context).colorScheme.errorContainer,
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: Text(
                  _actionError!,
                  style: TextStyle(color: Theme.of(context).colorScheme.onErrorContainer),
                ),
              ),
            ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => _loadOrders(),
              child: _orders.isEmpty && !_loading
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: <Widget>[
                        SizedBox(
                          height: MediaQuery.sizeOf(context).height * 0.3,
                        ),
                        Center(child: Text(l10n.noData)),
                      ],
                    )
                  : ListView.builder(
                      controller: _scrollCtrl,
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(12),
                      itemCount: _orders.length + (_hasMore ? 1 : 0),
                      itemBuilder: (BuildContext context, int index) {
                        if (index >= _orders.length) {
                          return const Padding(
                            padding: EdgeInsets.all(16),
                            child: Center(child: CircularProgressIndicator()),
                          );
                        }
                        final _Order o = _orders[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Row(
                                  children: <Widget>[
                                    Expanded(
                                      child: Text(
                                        '${l10n.orderNumberPrefix}${o.id}',
                                        style: Theme.of(context).textTheme.titleMedium,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: _statusColor(o.status).withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        _statusLabel(l10n, o.status),
                                        style: TextStyle(
                                          color: _statusColor(o.status),
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text('${l10n.orderTotalLabel}: ${o.totalAmount}'),
                                Text('${l10n.orderPlacedAt}: ${fmt.format(o.createdAt.toLocal())}'),
                                const SizedBox(height: 8),
                                Text(l10n.orderItemsHeader, style: Theme.of(context).textTheme.labelLarge),
                                ...o.items.map(
                                  (_OrderLine line) => Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text(
                                      l10n.orderLineItem(
                                        line.productId,
                                        line.quantity,
                                        line.unitPrice,
                                      ),
                                    ),
                                  ),
                                ),
                                if (o.status == 'shipped' &&
                                    (o.expressCompany != null || o.trackingNumber != null)) ...<Widget>[
                                  const SizedBox(height: 8),
                                  Text(
                                    '${l10n.orderExpress}: ${o.expressCompany ?? '—'}',
                                  ),
                                  Text(
                                    '${l10n.orderTrackingNo}: ${o.trackingNumber ?? '—'}',
                                  ),
                                ],
                                const SizedBox(height: 12),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: <Widget>[
                                    if (o.status == 'pending')
                                      FilledButton(
                                        onPressed: () => _pay(o.id),
                                        child: Text(l10n.pay),
                                      ),
                                    if (o.status == 'shipped')
                                      OutlinedButton(
                                        onPressed: () => _confirm(o.id),
                                        child: Text(l10n.confirmReceipt),
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
          ),
        ],
      ),
    );
  }
}
