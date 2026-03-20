import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/locale_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final auth = ref.watch(authProvider);
    final locale = ref.watch(localeProvider);

    if (!auth.isLoggedIn) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.person_outline, size: 80, color: Colors.grey),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => context.go('/login'),
              child: Text(l10n.login),
            ),
          ],
        ),
      );
    }

    return ListView(
      children: [
        const SizedBox(height: 32),
        CircleAvatar(
          radius: 48,
          backgroundColor: Theme.of(context).colorScheme.primaryContainer,
          child: Text(
            (auth.user?.nickname ?? '?')[0].toUpperCase(),
            style: const TextStyle(fontSize: 36),
          ),
        ),
        const SizedBox(height: 16),
        Center(child: Text(auth.user?.nickname ?? '', style: Theme.of(context).textTheme.titleLarge)),
        Center(child: Text(auth.user?.phone ?? '', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey))),
        const SizedBox(height: 32),
        ListTile(
          leading: const Icon(Icons.receipt_long),
          title: Text(l10n.myOrders),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => context.push('/orders'),
        ),
        const Divider(height: 1),
        if (auth.user?.role == 'admin') ...<Widget>[
          ListTile(
            leading: const Icon(Icons.admin_panel_settings_outlined),
            title: Text(l10n.adminPanel),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/admin'),
          ),
          const Divider(height: 1),
        ],
        ListTile(
          leading: const Icon(Icons.language),
          title: Text(l10n.language),
          trailing: Text(locale.languageCode == 'zh' ? l10n.chinese : l10n.english),
          onTap: () => ref.read(localeProvider.notifier).toggleLocale(),
        ),
        const Divider(height: 1),
        const SizedBox(height: 32),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: OutlinedButton.icon(
            onPressed: () {
              showDialog(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: Text(l10n.logout),
                  content: Text(l10n.logoutConfirm),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(ctx), child: Text(l10n.cancel)),
                    FilledButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        ref.read(authProvider.notifier).logout();
                        context.go('/login');
                      },
                      child: Text(l10n.confirm),
                    ),
                  ],
                ),
              );
            },
            icon: const Icon(Icons.logout),
            label: Text(l10n.logout),
          ),
        ),
      ],
    );
  }
}
