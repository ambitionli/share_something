class User {
  final int id;
  final String phone;
  final String nickname;
  final String avatarUrl;
  final String role;

  const User({
    required this.id,
    required this.phone,
    required this.nickname,
    required this.avatarUrl,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      phone: json['phone'] as String,
      nickname: json['nickname'] as String? ?? '',
      avatarUrl: json['avatar_url'] as String? ?? '',
      role: json['role'] as String? ?? 'buyer',
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'phone': phone,
      'nickname': nickname,
      'avatar_url': avatarUrl,
      'role': role,
    };
  }
}
