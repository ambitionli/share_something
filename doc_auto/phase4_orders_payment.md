# 阶段四：订单与支付 - 完成记录

> 最后更新：2026-03-20

## 后端订单 API

### 订单接口 (`/api/v1/orders`)
| 方法 | 路径 | 权限 | 功能 |
|---|---|---|---|
| POST | `/` | 买家 | 创建订单（校验库存、扣减库存、计算总价） |
| GET | `/` | 买家 | 查看我的订单列表（分页、状态筛选） |
| GET | `/all` | 管理员 | 查看所有订单 |
| GET | `/:id` | 买家/管理员 | 订单详情 |
| POST | `/:id/pay` | 买家 | 模拟支付（状态 pending -> paid） |
| POST | `/:id/ship` | 管理员 | 发货（填写快递信息，状态 paid -> shipped） |
| POST | `/:id/confirm` | 买家 | 确认收货（状态 shipped -> completed） |
| POST | `/:id/cancel` | 买家/管理员 | 取消订单（恢复库存，状态 -> cancelled） |

### 订单状态机
```
pending -> paid -> shipped -> completed
  |         |
  v         v
cancelled  cancelled
```

### 业务规则
- 下单自动校验：商品是否存在、是否上架、库存是否充足
- 下单扣减库存，取消订单恢复库存
- 状态流转严格校验（不能跳跃状态）
- 重复支付被拒绝（幂等性）
- 已发货订单不能取消

## 管理后台
- 新增「订单管理」页面，侧栏菜单可访问
- 订单列表表格：状态颜色标签、筛选、分页
- 已付款订单可填写快递信息发货

## Flutter App
- 新增 OrderService（订单 CRUD + 支付/确认/取消）
- 新增 OrderListScreen（我的订单页面）
- 个人中心「我的订单」入口已关联

## 测试
- 后端：61/61 全部通过
- 订单测试覆盖：创建(5) + 状态流转(6) + 查询(4) = 15 个
- 集成测试：完整流程 pending->paid->shipped->completed ✅
- 取消订单库存恢复 ✅
- 前端构建通过，Flutter analyze 0 issues, 18 tests passed
