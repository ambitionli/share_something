// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Chinese (`zh`).
class AppLocalizationsZh extends AppLocalizations {
  AppLocalizationsZh([String locale = 'zh']) : super(locale);

  @override
  String get appName => '分享好物';

  @override
  String get login => '登录';

  @override
  String get register => '注册';

  @override
  String get phone => '手机号';

  @override
  String get password => '密码';

  @override
  String get confirmPassword => '确认密码';

  @override
  String get nickname => '昵称';

  @override
  String get loginSuccess => '登录成功';

  @override
  String get registerSuccess => '注册成功';

  @override
  String get phoneRequired => '请输入手机号';

  @override
  String get passwordRequired => '请输入密码';

  @override
  String get phoneInvalid => '手机号格式不正确';

  @override
  String get passwordTooShort => '密码不能少于6位';

  @override
  String get noAccount => '没有账号？去注册';

  @override
  String get hasAccount => '已有账号？去登录';

  @override
  String get home => '首页';

  @override
  String get products => '商品';

  @override
  String get cart => '购物车';

  @override
  String get mine => '我的';

  @override
  String get companyInfo => '公司简介';

  @override
  String get latestNews => '最新动态';

  @override
  String get viewAll => '查看全部';

  @override
  String get productDetail => '商品详情';

  @override
  String get price => '价格';

  @override
  String get stock => '库存';

  @override
  String get addToCart => '加入购物车';

  @override
  String get buyNow => '立即购买';

  @override
  String get soldOut => '已售罄';

  @override
  String get cartEmpty => '购物车是空的';

  @override
  String get cartTotal => '合计';

  @override
  String get checkout => '去结算';

  @override
  String get quantity => '数量';

  @override
  String get delete => '删除';

  @override
  String get myOrders => '我的订单';

  @override
  String get orderHistory => '历史订单';

  @override
  String get settings => '设置';

  @override
  String get logout => '退出登录';

  @override
  String get logoutConfirm => '确定要退出登录吗？';

  @override
  String get confirm => '确定';

  @override
  String get cancel => '取消';

  @override
  String get language => '语言';

  @override
  String get chinese => '中文';

  @override
  String get english => 'English';

  @override
  String get loading => '加载中...';

  @override
  String get networkError => '网络错误';

  @override
  String get retry => '重试';

  @override
  String get noData => '暂无数据';

  @override
  String get searchProducts => '搜索商品';
}
