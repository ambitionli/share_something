import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_zh.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('zh')
  ];

  /// No description provided for @appName.
  ///
  /// In zh, this message translates to:
  /// **'分享好物'**
  String get appName;

  /// No description provided for @login.
  ///
  /// In zh, this message translates to:
  /// **'登录'**
  String get login;

  /// No description provided for @register.
  ///
  /// In zh, this message translates to:
  /// **'注册'**
  String get register;

  /// No description provided for @phone.
  ///
  /// In zh, this message translates to:
  /// **'手机号'**
  String get phone;

  /// No description provided for @password.
  ///
  /// In zh, this message translates to:
  /// **'密码'**
  String get password;

  /// No description provided for @confirmPassword.
  ///
  /// In zh, this message translates to:
  /// **'确认密码'**
  String get confirmPassword;

  /// No description provided for @nickname.
  ///
  /// In zh, this message translates to:
  /// **'昵称'**
  String get nickname;

  /// No description provided for @loginSuccess.
  ///
  /// In zh, this message translates to:
  /// **'登录成功'**
  String get loginSuccess;

  /// No description provided for @registerSuccess.
  ///
  /// In zh, this message translates to:
  /// **'注册成功'**
  String get registerSuccess;

  /// No description provided for @phoneRequired.
  ///
  /// In zh, this message translates to:
  /// **'请输入手机号'**
  String get phoneRequired;

  /// No description provided for @passwordRequired.
  ///
  /// In zh, this message translates to:
  /// **'请输入密码'**
  String get passwordRequired;

  /// No description provided for @phoneInvalid.
  ///
  /// In zh, this message translates to:
  /// **'手机号格式不正确'**
  String get phoneInvalid;

  /// No description provided for @passwordTooShort.
  ///
  /// In zh, this message translates to:
  /// **'密码不能少于6位'**
  String get passwordTooShort;

  /// No description provided for @noAccount.
  ///
  /// In zh, this message translates to:
  /// **'没有账号？去注册'**
  String get noAccount;

  /// No description provided for @hasAccount.
  ///
  /// In zh, this message translates to:
  /// **'已有账号？去登录'**
  String get hasAccount;

  /// No description provided for @home.
  ///
  /// In zh, this message translates to:
  /// **'首页'**
  String get home;

  /// No description provided for @products.
  ///
  /// In zh, this message translates to:
  /// **'商品'**
  String get products;

  /// No description provided for @cart.
  ///
  /// In zh, this message translates to:
  /// **'购物车'**
  String get cart;

  /// No description provided for @mine.
  ///
  /// In zh, this message translates to:
  /// **'我的'**
  String get mine;

  /// No description provided for @companyInfo.
  ///
  /// In zh, this message translates to:
  /// **'公司简介'**
  String get companyInfo;

  /// No description provided for @latestNews.
  ///
  /// In zh, this message translates to:
  /// **'最新动态'**
  String get latestNews;

  /// No description provided for @viewAll.
  ///
  /// In zh, this message translates to:
  /// **'查看全部'**
  String get viewAll;

  /// No description provided for @productDetail.
  ///
  /// In zh, this message translates to:
  /// **'商品详情'**
  String get productDetail;

  /// No description provided for @price.
  ///
  /// In zh, this message translates to:
  /// **'价格'**
  String get price;

  /// No description provided for @stock.
  ///
  /// In zh, this message translates to:
  /// **'库存'**
  String get stock;

  /// No description provided for @addToCart.
  ///
  /// In zh, this message translates to:
  /// **'加入购物车'**
  String get addToCart;

  /// No description provided for @buyNow.
  ///
  /// In zh, this message translates to:
  /// **'立即购买'**
  String get buyNow;

  /// No description provided for @soldOut.
  ///
  /// In zh, this message translates to:
  /// **'已售罄'**
  String get soldOut;

  /// No description provided for @cartEmpty.
  ///
  /// In zh, this message translates to:
  /// **'购物车是空的'**
  String get cartEmpty;

  /// No description provided for @cartTotal.
  ///
  /// In zh, this message translates to:
  /// **'合计'**
  String get cartTotal;

  /// No description provided for @checkout.
  ///
  /// In zh, this message translates to:
  /// **'去结算'**
  String get checkout;

  /// No description provided for @quantity.
  ///
  /// In zh, this message translates to:
  /// **'数量'**
  String get quantity;

  /// No description provided for @delete.
  ///
  /// In zh, this message translates to:
  /// **'删除'**
  String get delete;

  /// No description provided for @myOrders.
  ///
  /// In zh, this message translates to:
  /// **'我的订单'**
  String get myOrders;

  /// No description provided for @orderHistory.
  ///
  /// In zh, this message translates to:
  /// **'历史订单'**
  String get orderHistory;

  /// No description provided for @settings.
  ///
  /// In zh, this message translates to:
  /// **'设置'**
  String get settings;

  /// No description provided for @logout.
  ///
  /// In zh, this message translates to:
  /// **'退出登录'**
  String get logout;

  /// No description provided for @logoutConfirm.
  ///
  /// In zh, this message translates to:
  /// **'确定要退出登录吗？'**
  String get logoutConfirm;

  /// No description provided for @confirm.
  ///
  /// In zh, this message translates to:
  /// **'确定'**
  String get confirm;

  /// No description provided for @cancel.
  ///
  /// In zh, this message translates to:
  /// **'取消'**
  String get cancel;

  /// No description provided for @language.
  ///
  /// In zh, this message translates to:
  /// **'语言'**
  String get language;

  /// No description provided for @chinese.
  ///
  /// In zh, this message translates to:
  /// **'中文'**
  String get chinese;

  /// No description provided for @english.
  ///
  /// In zh, this message translates to:
  /// **'English'**
  String get english;

  /// No description provided for @loading.
  ///
  /// In zh, this message translates to:
  /// **'加载中...'**
  String get loading;

  /// No description provided for @networkError.
  ///
  /// In zh, this message translates to:
  /// **'网络错误'**
  String get networkError;

  /// No description provided for @retry.
  ///
  /// In zh, this message translates to:
  /// **'重试'**
  String get retry;

  /// No description provided for @noData.
  ///
  /// In zh, this message translates to:
  /// **'暂无数据'**
  String get noData;

  /// No description provided for @searchProducts.
  ///
  /// In zh, this message translates to:
  /// **'搜索商品'**
  String get searchProducts;

  /// No description provided for @orderStatusPending.
  ///
  /// In zh, this message translates to:
  /// **'待付款'**
  String get orderStatusPending;

  /// No description provided for @orderStatusPaid.
  ///
  /// In zh, this message translates to:
  /// **'已付款'**
  String get orderStatusPaid;

  /// No description provided for @orderStatusShipped.
  ///
  /// In zh, this message translates to:
  /// **'已发货'**
  String get orderStatusShipped;

  /// No description provided for @orderStatusCompleted.
  ///
  /// In zh, this message translates to:
  /// **'已完成'**
  String get orderStatusCompleted;

  /// No description provided for @orderStatusCancelled.
  ///
  /// In zh, this message translates to:
  /// **'已取消'**
  String get orderStatusCancelled;

  /// No description provided for @orderTotalLabel.
  ///
  /// In zh, this message translates to:
  /// **'合计'**
  String get orderTotalLabel;

  /// No description provided for @orderPlacedAt.
  ///
  /// In zh, this message translates to:
  /// **'下单时间'**
  String get orderPlacedAt;

  /// No description provided for @orderItemsHeader.
  ///
  /// In zh, this message translates to:
  /// **'商品明细'**
  String get orderItemsHeader;

  /// No description provided for @orderExpress.
  ///
  /// In zh, this message translates to:
  /// **'快递公司'**
  String get orderExpress;

  /// No description provided for @orderTrackingNo.
  ///
  /// In zh, this message translates to:
  /// **'物流单号'**
  String get orderTrackingNo;

  /// No description provided for @orderNumberPrefix.
  ///
  /// In zh, this message translates to:
  /// **'订单 '**
  String get orderNumberPrefix;

  /// No description provided for @pay.
  ///
  /// In zh, this message translates to:
  /// **'去支付'**
  String get pay;

  /// No description provided for @confirmReceipt.
  ///
  /// In zh, this message translates to:
  /// **'确认收货'**
  String get confirmReceipt;

  /// No description provided for @orderLineItem.
  ///
  /// In zh, this message translates to:
  /// **'商品 #{productId} × {quantity}，单价 {unitPrice}'**
  String orderLineItem(int productId, int quantity, String unitPrice);

  /// No description provided for @adminPanel.
  ///
  /// In zh, this message translates to:
  /// **'管理后台'**
  String get adminPanel;

  /// No description provided for @manageProducts.
  ///
  /// In zh, this message translates to:
  /// **'商品管理'**
  String get manageProducts;

  /// No description provided for @manageOrders.
  ///
  /// In zh, this message translates to:
  /// **'订单管理'**
  String get manageOrders;

  /// No description provided for @ship.
  ///
  /// In zh, this message translates to:
  /// **'发货'**
  String get ship;

  /// No description provided for @expressCompany.
  ///
  /// In zh, this message translates to:
  /// **'快递公司'**
  String get expressCompany;

  /// No description provided for @trackingNumber.
  ///
  /// In zh, this message translates to:
  /// **'物流单号'**
  String get trackingNumber;

  /// No description provided for @productName.
  ///
  /// In zh, this message translates to:
  /// **'商品名称'**
  String get productName;

  /// No description provided for @productPrice.
  ///
  /// In zh, this message translates to:
  /// **'价格'**
  String get productPrice;

  /// No description provided for @productStock.
  ///
  /// In zh, this message translates to:
  /// **'库存'**
  String get productStock;

  /// No description provided for @productDescription.
  ///
  /// In zh, this message translates to:
  /// **'描述'**
  String get productDescription;

  /// No description provided for @editProduct.
  ///
  /// In zh, this message translates to:
  /// **'编辑商品'**
  String get editProduct;

  /// No description provided for @addProduct.
  ///
  /// In zh, this message translates to:
  /// **'新增商品'**
  String get addProduct;

  /// No description provided for @deleteConfirm.
  ///
  /// In zh, this message translates to:
  /// **'确定删除此项？'**
  String get deleteConfirm;

  /// No description provided for @save.
  ///
  /// In zh, this message translates to:
  /// **'保存'**
  String get save;

  /// No description provided for @adminAccessDenied.
  ///
  /// In zh, this message translates to:
  /// **'需要管理员权限'**
  String get adminAccessDenied;

  /// No description provided for @adminHubTitle.
  ///
  /// In zh, this message translates to:
  /// **'管理后台'**
  String get adminHubTitle;

  /// No description provided for @adminStatsOrders.
  ///
  /// In zh, this message translates to:
  /// **'订单总数'**
  String get adminStatsOrders;

  /// No description provided for @adminStatsProducts.
  ///
  /// In zh, this message translates to:
  /// **'商品总数'**
  String get adminStatsProducts;

  /// No description provided for @onShelf.
  ///
  /// In zh, this message translates to:
  /// **'上架'**
  String get onShelf;

  /// No description provided for @serverError.
  ///
  /// In zh, this message translates to:
  /// **'服务器错误'**
  String get serverError;

  /// No description provided for @adminOrdersTitle.
  ///
  /// In zh, this message translates to:
  /// **'全部订单'**
  String get adminOrdersTitle;

  /// No description provided for @adminProductsTitle.
  ///
  /// In zh, this message translates to:
  /// **'商品管理'**
  String get adminProductsTitle;

  /// No description provided for @fieldRequired.
  ///
  /// In zh, this message translates to:
  /// **'此项为必填'**
  String get fieldRequired;

  /// No description provided for @invalidNumber.
  ///
  /// In zh, this message translates to:
  /// **'数字格式不正确'**
  String get invalidNumber;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'zh'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'zh':
      return AppLocalizationsZh();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
