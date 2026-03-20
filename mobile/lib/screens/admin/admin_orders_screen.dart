import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../services/order_service.dart';
import '../../widgets/error_widget.dart';

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

class AdminOrdersScreen extends ConsumerStatefulWidget {
  const AdminOrdersScreen({super.key});

  @override
  ConsumerState<AdminOrdersScreen> createState() => _AdminOrdersScreenState();
}

class _AdminOrdersScreenState extends ConsumerState<AdminOrdersScreen> {
  final ScrollController _scrollCtrl = ScrollController();
  final List<_Order> _orders = <_Order>[];
  int _page = 1;
  int _total = 0;
  bool _loading = false;
  bool _hasMore = true;
  Object? _loadError;
  final int _pageSize = 20;

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(_onScroll);
    Future<void>.microtask(_loadOrders);
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
      final OrderListPage result =
          await OrderService(dio).listAllOrders(page: nextPage, pageSize: _pageSize);
      if (!mounted) {
        return;
      }
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
        _loadError = null;
      });
    } catch (e, st) {
      debugPrint('AdminOrdersScreen load failed: $e\n$st');
      if (!mounted) {
        return;
      }
      setState(() {
        _loading = false;
        _loadError = e;
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

  Future<void> _showShipDialog(_Order o) async {
    final AppLocalizations l10n = AppLocalizations.of(context)!;
    final TextEditingController companyCtrl = TextEditingController();
    final TextEditingController trackingCtrl = TextEditingController();
    final GlobalKey<FormState> formKey = GlobalKey<FormState>();

    final bool? ok = await showDialog<bool>(
      context: context,
      builder: (BuildContext ctx) => AlertDialog(
        title: Text(l10n.ship),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              TextFormField(
                controller: companyCtrl,
                decoration: InputDecoration(labelText: l10n.expressCompany),
                validator: (String? v) {
                  if (v == null || v.trim().isEmpty) {
                    return l10n.fieldRequired;
                  }
                  return null;
                },
              ),
              TextFormField(
                controller: trackingCtrl,
                decoration: InputDecoration(labelText: l10n.trackingNumber),
                validator: (String? v) {
                  if (v == null || v.trim().isEmpty) {
                    return l10n.fieldRequired;
                  }
                  return null;
                },
              ),
            ],
          ),
        ),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(l10n.cancel),
          ),
          FilledButton(
            onPressed: () {
              if (formKey.currentState!.validate()) {
                Navigator.pop(ctx, true);
              }
            },
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
      await OrderService(dio).shipOrder(
        o.id,
        expressCompany: companyCtrl.text.trim(),
        trackingNumber: trackingCtrl.text.trim(),
      );
      if (!mounted) {
        return;
      }
      await _loadOrders();
    } catch (e, st) {
      debugPrint('shipOrder failed: $e\n$st');
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(localizedApiError(l10n, e))),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = AppLocalizations.of(context)!;
    final auth = ref.watch(authProvider);
    final DateFormat fmt = DateFormat.yMMMd().add_Hm();

    if (auth.user?.role != 'admin') {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.adminOrdersTitle)),
        body: Center(child: Text(l10n.adminAccessDenied)),
      );
    }

    if (_loadError != null && _orders.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.adminOrdersTitle)),
        body: RetryableErrorView(
          message: localizedApiError(l10n, _loadError!),
          onRetry: () => _loadOrders(),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(l10n.adminOrdersTitle)),
      body: _orders.isEmpty && _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => _loadOrders(),
              child: _orders.isEmpty
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: <Widget>[
                        SizedBox(height: MediaQuery.sizeOf(context).height * 0.25),
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
                        final Color c = _statusColor(o.status);
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
                                    Chip(
                                      label: Text(_statusLabel(l10n, o.status)),
                                      backgroundColor: c.withValues(alpha: 0.15),
                                      labelStyle: TextStyle(
                                        color: c,
                                        fontWeight: FontWeight.w600,
                                      ),
                                      side: BorderSide.none,
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text('${l10n.orderTotalLabel}: ${o.totalAmount}'),
                                Text('${l10n.orderPlacedAt}: ${fmt.format(o.createdAt.toLocal())}'),
                                const SizedBox(height: 8),
                                Text(l10n.orderItemsHeader,
                                    style: Theme.of(context).textTheme.labelLarge),
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
                                    (o.expressCompany != null ||
                                        o.trackingNumber != null)) ...<Widget>[
                                  const SizedBox(height: 8),
                                  Text(
                                    '${l10n.orderExpress}: ${o.expressCompany ?? '—'}',
                                  ),
                                  Text(
                                    '${l10n.orderTrackingNo}: ${o.trackingNumber ?? '—'}',
                                  ),
                                ],
                                if (o.status == 'paid') ...<Widget>[
                                  const SizedBox(height: 12),
                                  FilledButton(
                                    onPressed: () => _showShipDialog(o),
                                    child: Text(l10n.ship),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
