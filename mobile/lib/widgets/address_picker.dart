import 'package:flutter/material.dart';

/// Simplified China province/city/district data (top provinces with major cities).
/// In production, load full data from a JSON asset or API.
final Map<String, Map<String, List<String>>> _regionData = {
  '北京市': {'北京市': ['东城区','西城区','朝阳区','丰台区','石景山区','海淀区','门头沟区','房山区','通州区','顺义区','昌平区','大兴区']},
  '上海市': {'上海市': ['黄浦区','徐汇区','长宁区','静安区','普陀区','虹口区','杨浦区','闵行区','宝山区','嘉定区','浦东新区','松江区']},
  '广东省': {
    '广州市': ['天河区','海珠区','荔湾区','越秀区','白云区','黄埔区','番禺区','花都区','南沙区','从化区','增城区'],
    '深圳市': ['福田区','罗湖区','南山区','盐田区','宝安区','龙岗区','龙华区','坪山区','光明区'],
    '东莞市': ['莞城街道','南城街道','东城街道','万江街道','松山湖'],
    '佛山市': ['禅城区','南海区','顺德区','三水区','高明区'],
  },
  '浙江省': {
    '杭州市': ['上城区','下城区','江干区','拱墅区','西湖区','滨江区','萧山区','余杭区','临平区','钱塘区'],
    '宁波市': ['海曙区','江北区','北仑区','镇海区','鄞州区'],
    '温州市': ['鹿城区','龙湾区','瓯海区','洞头区'],
  },
  '江苏省': {
    '南京市': ['玄武区','秦淮区','建邺区','鼓楼区','浦口区','栖霞区','雨花台区','江宁区'],
    '苏州市': ['姑苏区','虎丘区','吴中区','相城区','吴江区','昆山市'],
    '无锡市': ['锡山区','惠山区','滨湖区','梁溪区','新吴区'],
  },
  '四川省': {
    '成都市': ['锦江区','青羊区','金牛区','武侯区','成华区','龙泉驿区','青白江区','新都区','温江区','双流区','郫都区','天府新区'],
  },
  '湖北省': {
    '武汉市': ['江岸区','江汉区','硚口区','汉阳区','武昌区','青山区','洪山区','东西湖区','蔡甸区','江夏区'],
  },
  '湖南省': {
    '长沙市': ['芙蓉区','天心区','岳麓区','开福区','雨花区','望城区','长沙县'],
  },
  '山东省': {
    '济南市': ['历下区','市中区','槐荫区','天桥区','历城区','长清区'],
    '青岛市': ['市南区','市北区','黄岛区','崂山区','李沧区','城阳区'],
  },
  '福建省': {
    '福州市': ['鼓楼区','台江区','仓山区','马尾区','晋安区','长乐区'],
    '厦门市': ['思明区','湖里区','集美区','海沧区','同安区','翔安区'],
  },
  '河南省': {
    '郑州市': ['中原区','二七区','管城区','金水区','上街区','惠济区','中牟县','巩义市','荥阳市','新密市'],
  },
  '陕西省': {
    '西安市': ['新城区','碑林区','莲湖区','灞桥区','未央区','雁塔区','阎良区','临潼区','长安区','高陵区'],
  },
};

class AddressResult {
  final String name;
  final String phone;
  final String province;
  final String city;
  final String district;
  final String detail;

  const AddressResult({
    required this.name,
    required this.phone,
    required this.province,
    required this.city,
    required this.district,
    required this.detail,
  });

  Map<String, dynamic> toJson() => {
    'name': name,
    'phone': phone,
    'province': province,
    'city': city,
    'district': district,
    'detail': detail,
  };
}

class AddressPickerPage extends StatefulWidget {
  const AddressPickerPage({super.key});

  @override
  State<AddressPickerPage> createState() => _AddressPickerPageState();
}

class _AddressPickerPageState extends State<AddressPickerPage> {
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _detailCtrl = TextEditingController();
  final _pasteCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  String? _province;
  String? _city;
  String? _district;

  List<String> get _provinces => _regionData.keys.toList();
  List<String> get _cities => _province != null ? (_regionData[_province]?.keys.toList() ?? []) : [];
  List<String> get _districts => (_province != null && _city != null) ? (_regionData[_province]?[_city] ?? []) : [];

  bool get _isZh => Localizations.localeOf(context).languageCode == 'zh';

  void _smartParse() {
    final text = _pasteCtrl.text.trim();
    if (text.isEmpty) return;

    final phoneReg = RegExp(r'1[3-9]\d{9}');
    final phoneMatch = phoneReg.firstMatch(text);
    if (phoneMatch != null) {
      _phoneCtrl.text = phoneMatch.group(0)!;
    }

    String remaining = text.replaceAll(phoneReg, '').trim();

    for (final prov in _provinces) {
      final provShort = prov.replaceAll(RegExp(r'[省市]$'), '');
      if (remaining.contains(prov) || remaining.contains(provShort)) {
        _province = prov;
        remaining = remaining.replaceFirst(prov, '').replaceFirst(provShort, '').trim();

        for (final c in _cities) {
          final cityShort = c.replaceAll(RegExp(r'市$'), '');
          if (remaining.contains(c) || remaining.contains(cityShort)) {
            _city = c;
            remaining = remaining.replaceFirst(c, '').replaceFirst(cityShort, '').trim();

            for (final d in _districts) {
              if (remaining.contains(d)) {
                _district = d;
                remaining = remaining.replaceFirst(d, '').trim();
                break;
              }
            }
            break;
          }
        }
        break;
      }
    }

    final parts = remaining.replaceAll(RegExp(r'[,，\s]+'), ' ').trim().split(' ');
    if (parts.length >= 2 && RegExp(r'^[\u4e00-\u9fa5]{2,4}$').hasMatch(parts[0])) {
      _nameCtrl.text = parts[0];
      _detailCtrl.text = parts.sublist(1).join(' ');
    } else {
      _detailCtrl.text = remaining;
    }

    setState(() {});
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(_isZh ? '智能识别完成' : 'Address parsed'),
      duration: const Duration(seconds: 1),
    ));
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    if (_province == null || _city == null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(_isZh ? '请选择省市区' : 'Please select province/city'),
        backgroundColor: Colors.orange,
      ));
      return;
    }

    Navigator.pop(context, AddressResult(
      name: _nameCtrl.text,
      phone: _phoneCtrl.text,
      province: _province!,
      city: _city!,
      district: _district ?? '',
      detail: _detailCtrl.text,
    ));
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _detailCtrl.dispose();
    _pasteCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isZh = _isZh;

    return Scaffold(
      appBar: AppBar(title: Text(isZh ? '填写收货地址' : 'Shipping Address')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Card(
                color: Theme.of(context).colorScheme.primaryContainer.withValues(alpha: 0.3),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.auto_fix_high, size: 18),
                          const SizedBox(width: 6),
                          Text(isZh ? '智能识别' : 'Smart Paste', style: const TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _pasteCtrl,
                        maxLines: 2,
                        decoration: InputDecoration(
                          hintText: isZh ? '粘贴地址文本，自动识别姓名、手机号、地址\n例：张三 13800138000 广东省深圳市南山区科技园1号' : 'Paste address text for auto-parsing',
                          hintStyle: TextStyle(fontSize: 13, color: Colors.grey[500]),
                          border: const OutlineInputBorder(),
                          contentPadding: const EdgeInsets.all(12),
                          suffixIcon: IconButton(
                            icon: const Icon(Icons.auto_awesome),
                            onPressed: _smartParse,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              TextFormField(
                controller: _nameCtrl,
                decoration: InputDecoration(
                  labelText: isZh ? '收货人' : 'Recipient',
                  prefixIcon: const Icon(Icons.person_outline),
                  border: const OutlineInputBorder(),
                ),
                validator: (v) => (v == null || v.isEmpty) ? (isZh ? '请输入收货人' : 'Required') : null,
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _phoneCtrl,
                decoration: InputDecoration(
                  labelText: isZh ? '手机号' : 'Phone',
                  prefixIcon: const Icon(Icons.phone_outlined),
                  border: const OutlineInputBorder(),
                ),
                keyboardType: TextInputType.phone,
                validator: (v) {
                  if (v == null || v.isEmpty) return isZh ? '请输入手机号' : 'Required';
                  if (!RegExp(r'^1[3-9]\d{9}$').hasMatch(v)) return isZh ? '手机号格式不正确' : 'Invalid phone';
                  return null;
                },
              ),
              const SizedBox(height: 16),

              Text(isZh ? '所在地区' : 'Region', style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),

              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      initialValue: _province,
                      isExpanded: true,
                      decoration: InputDecoration(
                        labelText: isZh ? '省份' : 'Province',
                        border: const OutlineInputBorder(),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                      ),
                      items: _provinces.map((p) => DropdownMenuItem(value: p, child: Text(p, style: const TextStyle(fontSize: 13)))).toList(),
                      onChanged: (v) => setState(() { _province = v; _city = null; _district = null; }),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      initialValue: _city,
                      isExpanded: true,
                      decoration: InputDecoration(
                        labelText: isZh ? '城市' : 'City',
                        border: const OutlineInputBorder(),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                      ),
                      items: _cities.map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 13)))).toList(),
                      onChanged: (v) => setState(() { _city = v; _district = null; }),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              if (_districts.isNotEmpty)
                DropdownButtonFormField<String>(
                  initialValue: _district,
                  isExpanded: true,
                  decoration: InputDecoration(
                    labelText: isZh ? '区/县' : 'District',
                    border: const OutlineInputBorder(),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                  ),
                  items: _districts.map((d) => DropdownMenuItem(value: d, child: Text(d))).toList(),
                  onChanged: (v) => setState(() => _district = v),
                ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _detailCtrl,
                maxLines: 2,
                decoration: InputDecoration(
                  labelText: isZh ? '详细地址（街道、门牌号、楼层等）' : 'Detailed address',
                  prefixIcon: const Icon(Icons.location_on_outlined),
                  border: const OutlineInputBorder(),
                ),
                validator: (v) => (v == null || v.isEmpty) ? (isZh ? '请输入详细地址' : 'Required') : null,
              ),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                height: 48,
                child: FilledButton.icon(
                  onPressed: _submit,
                  icon: const Icon(Icons.check),
                  label: Text(isZh ? '确认地址' : 'Confirm Address'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
