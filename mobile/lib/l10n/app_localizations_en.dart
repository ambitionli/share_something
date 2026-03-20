// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'ShareSomething';

  @override
  String get login => 'Login';

  @override
  String get register => 'Register';

  @override
  String get phone => 'Phone';

  @override
  String get password => 'Password';

  @override
  String get confirmPassword => 'Confirm Password';

  @override
  String get nickname => 'Nickname';

  @override
  String get loginSuccess => 'Login successful';

  @override
  String get registerSuccess => 'Registration successful';

  @override
  String get phoneRequired => 'Please enter phone number';

  @override
  String get passwordRequired => 'Please enter password';

  @override
  String get phoneInvalid => 'Invalid phone number format';

  @override
  String get passwordTooShort => 'Password must be at least 6 characters';

  @override
  String get noAccount => 'No account? Register';

  @override
  String get hasAccount => 'Have an account? Login';

  @override
  String get home => 'Home';

  @override
  String get products => 'Products';

  @override
  String get cart => 'Cart';

  @override
  String get mine => 'Me';

  @override
  String get companyInfo => 'About Us';

  @override
  String get latestNews => 'Latest News';

  @override
  String get viewAll => 'View All';

  @override
  String get productDetail => 'Product Detail';

  @override
  String get price => 'Price';

  @override
  String get stock => 'Stock';

  @override
  String get addToCart => 'Add to Cart';

  @override
  String get buyNow => 'Buy Now';

  @override
  String get soldOut => 'Sold Out';

  @override
  String get cartEmpty => 'Cart is empty';

  @override
  String get cartTotal => 'Total';

  @override
  String get checkout => 'Checkout';

  @override
  String get quantity => 'Quantity';

  @override
  String get delete => 'Delete';

  @override
  String get myOrders => 'My Orders';

  @override
  String get orderHistory => 'Order History';

  @override
  String get settings => 'Settings';

  @override
  String get logout => 'Logout';

  @override
  String get logoutConfirm => 'Are you sure you want to logout?';

  @override
  String get confirm => 'Confirm';

  @override
  String get cancel => 'Cancel';

  @override
  String get language => 'Language';

  @override
  String get chinese => '中文';

  @override
  String get english => 'English';

  @override
  String get loading => 'Loading...';

  @override
  String get networkError => 'Network Error';

  @override
  String get retry => 'Retry';

  @override
  String get noData => 'No Data';

  @override
  String get searchProducts => 'Search products';

  @override
  String get orderStatusPending => 'Pending payment';

  @override
  String get orderStatusPaid => 'Paid';

  @override
  String get orderStatusShipped => 'Shipped';

  @override
  String get orderStatusCompleted => 'Completed';

  @override
  String get orderStatusCancelled => 'Cancelled';

  @override
  String get orderTotalLabel => 'Total';

  @override
  String get orderPlacedAt => 'Placed at';

  @override
  String get orderItemsHeader => 'Items';

  @override
  String get orderExpress => 'Carrier';

  @override
  String get orderTrackingNo => 'Tracking';

  @override
  String get orderNumberPrefix => 'Order #';

  @override
  String get pay => 'Pay';

  @override
  String get confirmReceipt => 'Confirm receipt';

  @override
  String orderLineItem(int productId, int quantity, String unitPrice) {
    return 'Product #$productId × $quantity @ $unitPrice';
  }

  @override
  String get adminPanel => 'Admin Panel';

  @override
  String get manageProducts => 'Product management';

  @override
  String get manageOrders => 'Order management';

  @override
  String get ship => 'Ship';

  @override
  String get expressCompany => 'Carrier';

  @override
  String get trackingNumber => 'Tracking number';

  @override
  String get productName => 'Product name';

  @override
  String get productPrice => 'Price';

  @override
  String get productStock => 'Stock';

  @override
  String get productDescription => 'Description';

  @override
  String get editProduct => 'Edit product';

  @override
  String get addProduct => 'Add product';

  @override
  String get deleteConfirm => 'Delete this item?';

  @override
  String get save => 'Save';

  @override
  String get adminAccessDenied => 'Admin access required';

  @override
  String get adminHubTitle => 'Admin';

  @override
  String get adminStatsOrders => 'Total orders';

  @override
  String get adminStatsProducts => 'Total products';

  @override
  String get onShelf => 'On shelf';

  @override
  String get serverError => 'Server error';

  @override
  String get adminOrdersTitle => 'All orders';

  @override
  String get adminProductsTitle => 'Products';

  @override
  String get fieldRequired => 'This field is required';

  @override
  String get invalidNumber => 'Invalid number';
}
