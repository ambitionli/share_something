import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../services/admin_service.dart';
import '../../widgets/error_widget.dart';

class AdminHubScreen extends ConsumerStatefulWidget {
  const AdminHubScreen({super.key});

  @override
  ConsumerState<AdminHubScreen> createState() => _AdminHubScreenState();
}

class _AdminHubScreenState extends ConsumerState<AdminHubScreen> {
  bool _loading = true;
  Object? _error;
  int _totalOrders = 0;
  int _totalProducts = 0;

  @override
  void initState() {
    super.initState();
    Future<void>.microtask(_load);
  }

  Future<void> _load() async {
    final auth = ref.read(authProvider);
    if (auth.user?.role != 'admin') {
      setState(() {
        _loading = false;
        _error = null;
      });
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final dio = ref.read(apiServiceProvider).dio;
      final AdminDashboardStats stats = await AdminService(dio).getStats();
      if (!mounted) {
        return;
      }
      setState(() {
        _totalOrders = stats.totalOrders;
        _totalProducts = stats.totalProducts;
        _loading = false;
        _error = null;
      });
    } catch (e, st) {
      debugPrint('AdminHubScreen stats failed: $e\n$st');
      if (!mounted) {
        return;
      }
      setState(() {
        _loading = false;
        _error = e;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = AppLocalizations.of(context)!;
    final auth = ref.watch(authProvider);

    if (auth.user?.role != 'admin') {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.adminHubTitle)),
        body: Center(child: Text(l10n.adminAccessDenied)),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(l10n.adminHubTitle)),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? RetryableErrorView(
                  message: localizedApiError(l10n, _error!),
                  onRetry: _load,
                )
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: <Widget>[
                    Row(
                      children: <Widget>[
                        Expanded(
                          child: _StatCard(
                            label: l10n.adminStatsOrders,
                            value: '$_totalOrders',
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _StatCard(
                            label: l10n.adminStatsProducts,
                            value: '$_totalProducts',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    _HubTile(
                      icon: Icons.inventory_2_outlined,
                      title: l10n.manageProducts,
                      subtitle: l10n.adminProductsTitle,
                      onTap: () => context.push('/admin/products'),
                    ),
                    const SizedBox(height: 12),
                    _HubTile(
                      icon: Icons.receipt_long_outlined,
                      title: l10n.manageOrders,
                      subtitle: l10n.adminOrdersTitle,
                      onTap: () => context.push('/admin/orders'),
                    ),
                  ],
                ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(label, style: Theme.of(context).textTheme.labelMedium),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HubTile extends StatelessWidget {
  const _HubTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icon, size: 32),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
