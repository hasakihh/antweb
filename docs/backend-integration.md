# 后端接入清单

这份文档记录前端已经预留、但仍需要后端支持的功能。地图页面已有明确的前端类型契约，后端应与 `lib/map/types.ts` 保持一致；其他尚未形成类型契约的接口字段继续标记为“待确认”。

## 统一约定

- 成功响应：返回业务数据，并保留可判断的 HTTP 状态码。
- 失败响应：返回 `{ "error": "可展示的错误信息" }`，具体错误码待后端确认。
- 加载、空数据和失败都需要有可展示状态。
- 需要登录的接口要明确会话方式、过期行为和权限范围。

## 已有读取入口

| 功能 | 当前前端入口 | 当前数据来源 | 后端状态 |
| --- | --- | --- | --- |
| 环境观测 | `/api/environment/observations` | mock repository | 待接数据库 |
| 天气预报 | `/api/weather/forecast` | mock weather provider | 待接天气数据源 |
| 地图快照 | `MapRepository.getSnapshot()` | mock map repository | 待实现 API adapter |

### 环境观测

- 用途：读取监测点的温度、相对湿度、气压、设备编号和记录时间。
- 请求参数：当前无；设备、地点和时间范围待确认。
- 返回数据：环境快照、最新记录、温湿度变化值。
- 需要确认：分页、时间范围、设备筛选、权限和缓存策略。

### 天气预报

- 用途：按监测地点读取天气预报。
- 当前请求参数：地点和 3、7、15 日范围。
- 返回数据：地点、更新时间、数据来源和每日天气信息。
- 需要确认：天气供应商、限流、超时、坐标格式、缓存和错误码。

## 地图页面接口

地图页面当前通过 `lib/map/map-repository.ts` 获取数据。接入后端时应新增 API adapter，并继续实现同一份 `MapRepository` 接口；组件、mock repository 和 `lib/map/types.ts` 中的领域类型不应因数据来源变化而修改。

### 获取地图快照

`GET /api/map/snapshot`

一次返回当前视口所需的设备、风险发生点、风险栅格、概览和预警数据。

#### 查询参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `south` | number | 否 | 视口南边界，纬度范围 `-90..90` |
| `west` | number | 否 | 视口西边界，经度范围 `-180..180` |
| `north` | number | 否 | 视口北边界，纬度范围 `-90..90` |
| `east` | number | 否 | 视口东边界，经度范围 `-180..180` |
| `from` | string | 否 | 查询起始时间，ISO 8601，包含时区偏移 |
| `to` | string | 否 | 查询结束时间，ISO 8601，包含时区偏移 |
| `deviceIds` | string | 否 | 逗号分隔的设备 ID；最终编码方式待后端确认 |

视口边界应成组提供。未提供边界时返回默认地图中心附近的数据，默认范围和最大跨度待后端确认。时间范围、设备筛选、视口裁剪优先级及最大结果数量也待后端确认。

#### 成功响应

HTTP `200`，响应体为 `MapSnapshot`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `updatedAt` | string | 快照更新时间，ISO 8601，包含时区偏移 |
| `center` | `{ latitude, longitude }` | 推荐地图中心 |
| `devices` | `DeviceLocation[]` | 设备及其最新位置；无有效坐标时仍返回设备 |
| `occurrences` | `RiskOccurrence[]` | 风险发生点 |
| `grids` | `RiskGrid[]` | 固定经纬度网格的风险聚合结果 |
| `overview` | `MapOverview` | 风险概览汇总 |
| `alerts` | `RiskAlert[]` | 重点复查和预警列表 |

`DeviceLocation`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 设备 ID |
| `name` | string | 设备名称 |
| `status` | `"online" \| "offline"` | 当前在线状态 |
| `coordinate` | `MapCoordinate \| null` | 当前有效坐标；缺失或无效时必须为 `null` |
| `trend` | `DeviceTrendPoint[]` | 数量趋势；无数据时返回空数组 |

`MapCoordinate`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `latitude` | number | 纬度，范围 `-90..90` |
| `longitude` | number | 经度，范围 `-180..180` |
| `source` | `"gps" \| "manual"` | 坐标来源 |
| `locatedAt` | string | 定位时间，ISO 8601，包含时区偏移 |

`DeviceTrendPoint` 包含字符串标签 `label` 和数量 `count`；无趋势数据时设备的 `trend` 返回空数组。

`RiskOccurrence`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 风险点 ID |
| `source` | string | 数据来源或监测点名称 |
| `coordinate` | `{ latitude, longitude }` | 风险发生位置 |
| `detectionCount` | number | 检测数量 |
| `riskLevel` | `"low" \| "medium" \| "high" \| "review"` | 风险等级 |
| `detectedAt` | string | 检测时间，ISO 8601，包含时区偏移 |

`RiskGrid`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 稳定且唯一的栅格编号 |
| `bounds` | `{ south, west, north, east }` | 栅格经纬度边界 |
| `center` | `{ latitude, longitude }` | 栅格中心 |
| `detectionCount` | number | 检测次数 |
| `positiveCount` | number | 阳性次数 |
| `riskScore` | number | 风险分数 |
| `latestDetectedAt` | string | 最近检测时间，ISO 8601，包含时区偏移 |
| `trend` | `"rising" \| "stable" \| "falling"` | 风险趋势 |
| `riskLevel` | `"low" \| "medium" \| "high" \| "review"` | 风险等级 |
| `needsAlert` | boolean | 是否需要进入预警列表 |

`MapOverview` 包含 `detectionTotal`、`positiveTotal`、`highRiskAreaCount` 和 `missingLocationCount`。`RiskAlert` 包含 `id`、`title`、`riskScore`、`positiveCount` 和 `gridId`；其中 `gridId` 必须能关联到同一快照中的 `RiskGrid.id`。

这些字段名称、可空性和枚举值以 `lib/map/types.ts` 为最终依据。若后端内部命名不同，应在 API adapter 中完成转换，不把后端 DTO 直接传入地图组件。

#### 空数据约定

- 无设备、风险点、栅格或预警时，对应字段返回空数组，不返回 `null`。
- 没有有效坐标的设备仍需返回，且 `coordinate` 为 `null`，用于显示“待补位置”。
- 无趋势数据时 `trend` 返回空数组。
- 完全没有地图数据时仍返回完整 `MapSnapshot` 结构；概览数值为 `0`，`center` 使用后端约定的默认中心。

### 更新设备坐标

`PATCH /api/map/devices/{deviceId}/coordinate`

用于在设备列表中人工补充或修正设备经纬度。

请求体：

```json
{
  "latitude": 23.1291,
  "longitude": 113.2644,
  "source": "manual"
}
```

校验规则：

- `latitude` 必须是有限数值，范围 `-90..90`。
- `longitude` 必须是有限数值，范围 `-180..180`。
- 前端人工编辑时 `source` 固定为 `"manual"`；若后端也承载 GPS 写入，是否允许 `"gps"` 待后端确认。
- 设备不存在时返回 `404`；坐标不合法时返回 `400` 或 `422`，最终状态码待后端确认。

成功响应为 HTTP `200`，响应体为更新后的完整 `DeviceLocation`。后端负责生成新的 `locatedAt`；前端不应以客户端时间作为权威定位时间。

### 可选拆分读取接口

当地图数据量增大、各图层需要独立刷新时，可将快照拆分为以下读取接口，但返回字段仍须复用 `lib/map/types.ts`：

| 接口 | 返回类型 | 用途 |
| --- | --- | --- |
| `GET /api/map/devices` | `DeviceLocation[]` | 设备列表及最新位置 |
| `GET /api/map/occurrences` | `RiskOccurrence[]` | 当前视口风险发生点 |
| `GET /api/map/grids` | `RiskGrid[]` | 当前视口风险栅格 |
| `GET /api/map/devices/{deviceId}/trend` | `DeviceTrendPoint[]` | 按时间范围读取设备数量趋势 |

拆分前需确认独立请求之间的一致性、更新时间戳、并发刷新和缓存失效策略。在此之前，前端默认使用单一快照接口。

### 地图接口待确认事项

- **鉴权与权限**：地图读取权限、坐标编辑权限、设备范围隔离及审计字段。
- **分页与视口裁剪**：设备列表是否分页、视口最大跨度、单次风险点/栅格数量上限及超限提示。
- **坐标系统**：业务坐标统一使用 WGS84、GCJ-02 或其他坐标系；前端地图瓦片与业务坐标的转换责任必须明确。
- **时间与时区**：统一使用 UTC 还是业务时区存储；接口必须返回带 `Z` 或明确偏移量的 ISO 8601 时间。
- **错误响应**：当前最低兼容格式为 `{ "error": "可展示的错误信息" }`；业务错误码、字段级校验详情和追踪 ID 待确认。
- **缓存策略**：快照缓存时长、`ETag`/`Last-Modified`、客户端轮询频率和坐标更新后的缓存失效方式。
- **风险计算**：栅格尺寸、汇总时间窗、风险分数公式、等级阈值、趋势规则和预警触发/解除规则。

## 待新增读取入口

| 功能 | 前端需要的能力 | 待确认内容 |
| --- | --- | --- |
| Dashboard 概览 | 温湿度、诱集数量、风险摘要、趋势 | 汇总口径、设备范围、时间范围 |
| 风险预测 | 预测数量、置信区间、风险概率、影响因子 | 模型版本、训练截止时间、空结果规则 |
| AI 会话 | 发送消息、读取回复、会话清空、失败重试 | 会话 ID、流式或一次性响应、附件限制 |
| 实时监控 | 设备状态、开始/关闭推流、当前帧 | 视频协议、设备权限、断线重连 |
| 图片检测 | 上传图片、开始识别、获取识别结果 | 文件大小、格式、任务 ID、轮询方式 |
| 检测审核 | 保存人工修正、提交审核、查询记录 | 审核角色、状态流转、审计字段 |
| 登录认证 | 登录、会话检查、退出登录、密码重置 | token/cookie 方案、过期时间、权限模型 |

## 接口落地前检查

- [ ] 后端确认请求和响应字段。
- [ ] 后端确认错误码和错误信息格式。
- [ ] 后端确认鉴权方式和权限。
- [ ] 后端确认分页、排序、时间和时区规则。
- [ ] 前端 adapter 与 mock adapter 都能通过同一份数据契约。
- [ ] 地图 API adapter 实现 `MapRepository`，并保留无坐标设备和空数组语义。
- [ ] 地图坐标系与高德瓦片的坐标转换责任已经确认。
