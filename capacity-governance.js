const icons={
  overview:'<svg viewBox="0 0 24 24"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg>',
  system:'<svg viewBox="0 0 24 24"><path d="M4 5h16v5H4zM4 14h16v5H4zM8 7.5h.01M8 16.5h.01"/></svg>',
  peer:'<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20c0-4 2-7 5-7s5 3 5 7M14 14c3 0 5 2 5 6"/></svg>',
  simulate:'<svg viewBox="0 0 24 24"><path d="M4 18V9m5 9V5m5 13v-7m5 7V3"/></svg>',
  admission:'<svg viewBox="0 0 24 24"><path d="M12 3 4 7v5c0 5 3 8 8 9 5-1 8-4 8-9V7z"/><path d="m8 12 3 3 5-6"/></svg>',
  tasks:'<svg viewBox="0 0 24 24"><path d="M8 5h12M8 12h12M8 19h12M3 5h1M3 12h1M3 19h1"/></svg>',
  knowledge:'<svg viewBox="0 0 24 24"><path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></svg>',
  home:'<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h14v-9.5"/><path d="M10 20v-6h4v6"/></svg>'
};

const systems=[
  {id:'payment',code:'PAY',name:'统一支付系统',domain:'核心交易域',risk:82,waste:18,skew:64,priority:94,level:'P1',hint:'6 天后触达磁盘风险线'},
  {id:'data',code:'DMP',name:'数据中台',domain:'数据平台域',risk:61,waste:35,skew:72,priority:78,level:'P2',hint:'MySQL 内存偏离基线 21%'},
  {id:'risk',code:'RSK',name:'实时风控系统',domain:'风险管理域',risk:58,waste:22,skew:49,priority:67,level:'P2',hint:'CPU 30 日持续增长'},
  {id:'channel',code:'CHN',name:'渠道接入平台',domain:'渠道接入域',risk:24,waste:71,skew:31,priority:55,level:'P3',hint:'Nginx 存在降配空间'},
  {id:'customer',code:'CRM',name:'客户中心系统',domain:'零售业务域',risk:19,waste:48,skew:22,priority:38,level:'P3',hint:'整体容量稳定'},
  {id:'ledger',code:'ACT',name:'核心账务系统',domain:'核心账务域',risk:21,waste:16,skew:19,priority:32,level:'P3',hint:'整体容量稳定'}
];

const managedSystemIds=new Set(['payment','risk','channel']);
const managedSystems=systems.filter(s=>managedSystemIds.has(s.id));

const systemDetails={
  payment:{
    component:'GreatDB 磁盘',subject:'bjd-dsi-greatdb-010-kzx / 30 DAYS',
    notes:{risk:'6 天后磁盘触达 90%',waste:'整体不存在明显冗余',skew:'节点极差 49.6%',priority:'P1 · 本周需要决策'},
    stats:[['昨日平均','61.6%'],['昨日峰值','87.6%'],['偏离基线','+18.4%'],['预计达 90%','6 天']],
    nodes:[['greatdb-010',87.6,'var(--red)'],['greatdb-011',76.1,'var(--amber)'],['greatdb-012',65.2,'var(--mint)'],['greatdb-013',42.7,'var(--cyan)'],['greatdb-014',38.0,'var(--cyan)'],['greatdb-015',45.1,'var(--cyan)']],
    spread:'MAX−MIN 49.6%',cause:'不是集群整体容量不足',
    body:'6 个节点中仅 1 个进入高水位，另有 2 个节点低于 45%。优先检查分片、归档和节点权重，不建议直接全量扩容。',
    decision:'先修复归档策略；若 3 天后增速未回落，再增加 2 个节点并重平衡。'
  },
  risk:{
    component:'风控计算集群 CPU',subject:'rsk-score-worker / 30 DAYS',
    notes:{risk:'30 日持续增长',waste:'低峰仍有回收空间',skew:'批处理节点偏高',priority:'P2 · 观察后决策'},
    stats:[['昨日平均','52.4%'],['昨日峰值','74.2%'],['偏离基线','+11.7%'],['预计达 80%','14 天']],
    nodes:[['rsk-calc-01',74.2,'var(--amber)'],['rsk-calc-02',69.8,'var(--amber)'],['rsk-calc-03',58.6,'var(--mint)'],['rsk-calc-04',46.9,'var(--cyan)'],['rsk-calc-05',51.3,'var(--mint)'],['rsk-calc-06',43.5,'var(--cyan)']],
    spread:'MAX−MIN 30.7%',cause:'增长来自批处理窗口叠加',
    body:'CPU 增长集中在夜间风控重算窗口，在线流量水位仍稳定。建议先拆分批处理权重并观察峰值是否回落。',
    decision:'先调低批处理并发并错峰执行；若 7 天后 CPU P95 仍高于 70%，再评估增加 2 个计算节点。'
  },
  channel:{
    component:'Nginx 入口规格',subject:'chn-ingress-nginx / 30 DAYS',
    notes:{risk:'容量风险较低',waste:'规格高于同类中位数',skew:'节点分布稳定',priority:'P3 · 可排期降配'},
    stats:[['昨日平均','18.9%'],['昨日峰值','31.4%'],['同类规格','2.1×'],['预计可回收','16C']],
    nodes:[['chn-nginx-01',31.4,'var(--cyan)'],['chn-nginx-02',28.6,'var(--cyan)'],['chn-nginx-03',25.2,'var(--mint)'],['chn-nginx-04',22.8,'var(--mint)'],['chn-nginx-05',26.1,'var(--mint)'],['chn-nginx-06',24.7,'var(--mint)']],
    spread:'MAX−MIN 8.6%',cause:'风险低但资源规格偏大',
    body:'Nginx 节点利用率长期低位且节点分布稳定，主要问题不是风险，而是单实例规格高于同类系统中位数。',
    decision:'先灰度 2 台由 16C32G 降至 8C16G，观察 7 天无异常后再完成整组降配。'
  }
};

const tasks=[
  {id:'CAP-1842',title:'GreatDB 磁盘容量风险处置',owner:'陈哲',stage:2,status:'变更评审',workOrder:'ACT-CHUG-20260826-0002',workStatus:'评审中',action:'查看证据'},
  {id:'CAP-1839',title:'Redis 低利用实例缩容验证',owner:'王璐',stage:3,status:'观察第 3/7 天',workOrder:'ACT-CHUG-20260826-0003',workStatus:'实施完成',action:'效果验证'},
  {id:'CAP-1831',title:'Nginx 节点规格降配',owner:'李琦',stage:1,status:'方案待提单',workOrder:'',workStatus:'',action:'查看方案'}
];

const messages=[
  {time:'08:00',title:'我开始今天的容量值守了',body:'三个接口的数据已获取并完成完整性检查。本轮聚焦你负责的 3 个系统、18 个组件和 142 个实例。',tone:'normal'},
  {time:'08:07',title:'我发现 GreatDB 的磁盘行为异常',body:'它不只是超过 85% 固定阈值，同时也明显偏离自己的 30 日动态基线。按近 7 日速度，预计 6 天后进入 90% 风险区间。',tone:'risk'},
  {time:'08:30',title:'杨帆 · 我收到了，先不动',body:'收到 GreatDB 的告警提示，先别建单。这一轮让我手动看一下趋势和归因，确认不是归档抖动。',tone:'user'},
  {time:'08:18',title:'我把服务器信号合并成了集群结论',body:'GreatDB 不是集群整体容量不足，而是节点负载倾斜并叠加单节点磁盘增长。建议先校验归档策略，再评估增加 2 个节点。',tone:'analysis'},
  {time:'09:10',title:'杨帆 · 先用证据说服我',body:'把 greatdb-010 的 30 日趋势、近 7 日斜率以及同类系统基线拉出来对比一下，再决定要不要扩容。',tone:'user'},
  {time:'09:10',title:'Redis 缩容正在观察期',body:'缩减 1 个节点后，CPU 峰值由 18% 升至 31%，仍处安全范围。我会观察满 7 天后再决定是否继续。',tone:'follow'}
];

const autonomousJobs=[
  {phase:'关联 GreatDB 30 日趋势',scope:'统一支付 / GreatDB',target:'bjd-dsi-greatdb-010-kzx',kind:'趋势预测',signal:'磁盘峰值 87.6%，连续 7 日上升',next:'生成容量风险证据'},
  {phase:'计算同类组件资源效率',scope:'渠道接入 / Nginx',target:'同类入口规格样本',kind:'资源对标',signal:'规格高于同类中位数 2.1×',next:'标记可降配实例'},
  {phase:'轮询 CAP-1842 评审状态',scope:'治理任务',target:'ACT-CHUG-20260826-0002',kind:'工单跟进',signal:'负责人已提交扩容窗口',next:'同步变更状态'},
  {phase:'验证 Redis 缩容后水位',scope:'统一支付 / Redis',target:'CAP-1839 观察期',kind:'效果验证',signal:'CPU 峰值 31%，无新增告警',next:'写入跟进记录'}
];

const collabRecords=[
  {time:'08:00',type:'collect',status:'已完成',title:'取数与完整性检查完成',body:'已拉取你负责范围内 3 个生产系统、18 个组件、142 个实例的昨日容量快照，并过滤掉 2 条采集延迟数据。',facts:['3 系统','18 组件','142 实例']},
  {time:'08:07',type:'risk',status:'高风险',title:'GreatDB 单节点磁盘进入处置队列',body:'greatdb-010 磁盘峰值 87.6%，近 7 日持续增长；同时 CPU / MEM 未同步升高，优先判断为归档或分片倾斜问题。',facts:['87.6%','+18.4%','6 天']},
  {time:'08:18',type:'analysis',status:'已归因',title:'将服务器信号合并成集群结论',body:'结论不是"全量扩容"，而是先检查归档策略和节点权重；若 3 天后增速未回落，再增加 2 个节点并重平衡。',facts:['负载倾斜','先治理','后扩容']},
  {time:'08:42',type:'action',status:'待评审',title:'生成治理任务 CAP-1842',body:'治理建议已写入任务列表，变更单 ACT-CHUG-20260826-0002 处于评审中，Agent 会持续轮询状态。',facts:['CAP-1842','变更评审','陈哲']},
  {time:'09:10',type:'follow',status:'观察中',title:'Redis 缩容进入效果观察',body:'缩减 1 个节点后，CPU 峰值由 18% 升至 31%，仍处于安全区间；需覆盖完整 7 天和周末批处理窗口。',facts:['18% → 31%','0 告警','第 3/7 天']}
];


const state={page:'overview',selectedSystemId:'payment',agentOpen:false,agentTab:'log',work:0,progress:36,simNodes:5,simLoad:20,simTarget:'redis',simType:'物理机',simSpec:'8C32G'};
const main=document.querySelector('#main');
const nav=document.querySelector('#nav');
const crumb=document.querySelector('#crumb');
const workline=document.querySelector('#workline');
const drawer=document.querySelector('#agent-drawer');
const drawerContent=document.querySelector('#drawer-content');
const modal=document.querySelector('#evidence-modal');
const modalCard=document.querySelector('.modal-card');
const modalContent=document.querySelector('#modal-content');
const scrim=document.querySelector('#scrim');
const agentInput=document.querySelector('#agent-input');

function navHTML(){
  const groups=[
    {label:'AGENT',items:[['overview','治理总览',icons.overview,'']]},
    {label:'KNOWLEDGE',items:[['knowledge','知识库',icons.knowledge,''],['peer','同类对标',icons.peer,'']]},
    {label:'DEVICES',items:[['system','系统洞察',icons.system,'3'],['admission','容量准入',icons.admission,'']]},
    {label:'OBSERVABILITY',items:[['simulate','方案模拟',icons.simulate,''],['tasks','治理闭环',icons.tasks,'3']]}
  ];
  return groups.flatMap(g=>g.items).map(([id,label,icon,count])=>`<button class="nav-item ${state.page===id?'active':''}" data-page="${id}">${icon}<span>${label}</span>${count?`<em>${count}</em>`:''}</button>`).join('');
}

function header(kicker,title,subtitle,actions=''){
  return `<section class="page-toolbar"><div><span>${kicker}</span><strong>${title}</strong><small>${subtitle}</small></div><div class="toolbar-actions">${actions}</div></section>`;
}

function render(){
  nav.innerHTML=navHTML();
  const names={overview:'我的容量治理',system:'统一支付系统 / 系统洞察',peer:'同类系统 / 资源对标',simulate:'容量方案 / 方案模拟',admission:'增量资源 / 容量准入',knowledge:'容量治理 / 知识库',tasks:'治理任务 / 效果验证'};
  crumb.textContent=names[state.page];
  ({overview:renderOverview,system:renderSystem,peer:renderPeer,simulate:renderSimulator,admission:renderAdmission,knowledge:renderKnowledge,tasks:renderTasks}[state.page]||renderOverview)();
  main.focus({preventScroll:true});
}

function renderOverview(){
  main.innerHTML=`
  <section class="today-brief">
    <div class="brief-copy"><span class="brief-stamp"><i></i> AI 总结与建议 · 08:32</span><h2>支付系统需要本周内完成处置决策</h2><p>Agent 已将当前 SRE 负责范围内的 <strong>142 个实例信号归并为 3 条治理建议</strong>。GreatDB 磁盘是最高风险；Redis 属于渐进缩容观察；渠道接入平台 Nginx 存在明确降配空间。</p><div class="brief-actions"><button class="btn acid" data-page="system">查看最高风险</button><button class="btn" data-open-evidence>查看判断过程</button></div></div>
    <div class="brief-data"><div class="brief-data-head"><span>治理指标概览</span><small>我负责的 3 个系统</small></div><div class="brief-numbers">
      ${briefNumber('容量风险','2','项','支付优先处置','risk')}${briefNumber('资源浪费','2','候选','Redis / Nginx','waste')}${briefNumber('负载倾斜','1','集群','先调度后扩容','balance')}${briefNumber('预计可回收','16C','/ 64GB','约 ¥6.1k / 月','save')}
    </div>
    </div>
  </section>
  <div class="grid two"><section class="panel"><div class="panel-head"><div><h2>我负责的系统治理优先级</h2><p>按容量风险、资源浪费、负载倾斜和行动必要性排序</p></div><small>${managedSystems.length} 个系统 · 按优先级排序</small></div><div class="systems">${managedSystems.map(systemRow).join('')}</div></section>
  <aside class="panel"><div class="panel-head"><div><h2>面向我的治理建议</h2><p>服务器信号已归并为负责系统内的可行动结论</p></div><small>3 NEW</small></div><div class="signal-list">
    ${signal('01','单节点增长 + 集群倾斜','GreatDB 最高节点磁盘 87.6%，节点差值 49.6%，不应仅凭集群平均值判断。','system')}
    ${signal('02','Redis 集群整体配置偏大','4 个实例连续 30 日 CPU 与内存峰值低于 25%，建议渐进缩容。','simulate')}
    ${signal('03','同类对标发现规格异常','渠道平台 Nginx 的单实例规格高于同类中位数 2 倍。','peer')}
  </div></aside></div>`;
}

function briefNumber(label,value,unit,note,cls){return `<div class="brief-number ${cls}"><span>${label}</span><strong>${value}</strong>${unit}<small>${note}</small></div>`}
function systemRow(s){return `<button class="system-row" data-page="system" data-system-id="${s.id}"><span class="system-name"><span class="system-code">${s.code}</span><span><b>${s.name}</b><small>${s.domain} · ${s.hint}</small></span></span>${scoreCell('容量风险',s.risk,'risk')}${scoreCell('资源浪费',s.waste,'waste')}${scoreCell('负载倾斜',s.skew,'skew')}${scoreCell('治理优先',s.priority,'') }<span class="priority ${s.level==='P1'?'high':''}">${s.level}</span><span class="chev">›</span></button>`}
function scoreCell(label,value,cls){return `<span class="score-cell ${cls}"><span>${label}</span><b>${value}</b></span>`}
function signal(num,title,body,page){return `<div class="signal"><span class="signal-num">${num}</span><div><b>${title}</b><p>${body}</p><button data-page="${page}">查看分析 →</button></div></div>`}

function renderSystem(){
  const system=selectedSystem(),detail=systemDetails[system.id];
  main.innerHTML=systemSwitcher(system)+`
  <section class="score-strip">${scoreCard('容量风险',system.risk,detail.notes.risk,'var(--red)')}${scoreCard('资源浪费',system.waste,detail.notes.waste,'var(--amber)')}${scoreCard('负载倾斜',system.skew,detail.notes.skew,'var(--cyan)')}${scoreCard('治理优先级',system.priority,detail.notes.priority,'var(--acid)')}</section>
  <section class="analysis-grid"><article class="panel chart-panel"><div class="chart-title"><div><h2>${detail.component} · 动态基线与容量预测</h2><p class="kicker">${detail.subject}</p></div><div class="legend"><span><i style="background:rgba(97,214,181,.25)"></i>正常区间</span><span><i style="background:var(--cyan)"></i>实际</span><span><i style="background:var(--amber)"></i>预测</span></div></div><div class="chart">${trendChart()}</div><div class="chart-cards">${detail.stats.map(([label,value])=>chartStat(label,value)).join('')}</div><div class="explain"><strong>Agent 判断：</strong>${system.name} 当前治理优先级为 ${system.priority}。${system.hint}，建议先按系统角色和节点分布定位原因，再决定扩容、降配或观察。</div></article>
  <aside class="panel"><div class="panel-head"><div><h2>集群节点分布</h2><p>识别整体不足、单节点异常或负载倾斜</p></div><small>${detail.spread}</small></div><div class="distribution">${detail.nodes.map(([host,value,color])=>`<div class="node-row"><label>${host}</label><span class="node-bar"><i style="--value:${value}%;--bar:${color}"></i></span><b>${value}%</b></div>`).join('')}</div><div class="cause-card"><small>集群级归因</small><h3>${detail.cause}</h3><p>${detail.body}</p><div class="decision"><b>建议方案</b><p>${detail.decision}</p></div></div></aside></section>`;
}

function selectedSystem(){return managedSystems.find(s=>s.id===state.selectedSystemId)||managedSystems[0]}
function systemSwitcher(system){return `<section class="system-switcher"><label for="system-select"><span>我管理的系统</span><select id="system-select" aria-label="切换我管理的系统">${managedSystems.map(s=>`<option value="${s.id}" ${s.id===system.id?'selected':''}>${s.name} · ${s.domain}</option>`).join('')}</select></label><div><button class="btn" data-page="overview">返回总览</button><button class="btn acid" data-open-agent>让 Agent 解释</button></div></section>`}
function scoreCard(label,value,note,color){return `<article class="score-card" style="--value:${value}%;--color:${color}"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`}
function chartStat(label,value){return `<div class="chart-stat"><span>${label}</span><strong>${value}</strong></div>`}
function trendChart(){
  const actual=[48,50,49,52,51,53,54,52,55,56,55,58,59,57,60,61,62,63,65,64,67,69,70,72,75,77,80,82,85,87.6];
  const predict=[87.6,88.2,88.8,89.4,90.1,90.8,91.5]; const W=720,H=220,p=24,min=35,max=95;
  const x=(i,total)=>p+i*(W-p*2)/(total-1), y=v=>H-p-(v-min)/(max-min)*(H-p*2);
  const line=actual.map((v,i)=>`${x(i,actual.length)},${y(v)}`).join(' '), pred=predict.map((v,i)=>`${x(actual.length-1+i,actual.length+predict.length-1)},${y(v)}`).join(' ');
  const upper=actual.map((_,i)=>`${x(i,actual.length)},${y(66+i*.22)}`).join(' '), lower=[...actual].reverse().map((_,ri)=>{const i=actual.length-1-ri;return `${x(i,actual.length)},${y(43+i*.18)}`}).join(' ');
  const grids=[40,50,60,70,80,90].map(v=>`<line class="chart-grid" x1="${p}" y1="${y(v)}" x2="${W-p}" y2="${y(v)}"/><text class="chart-label" x="0" y="${y(v)+3}">${v}</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="磁盘使用率偏离动态基线并预计六天后达到百分之九十">${grids}<polygon class="chart-band" points="${upper} ${lower}"/><line class="chart-limit" x1="${p}" y1="${y(90)}" x2="${W-p}" y2="${y(90)}"/><text class="chart-label" x="${W-78}" y="${y(90)-6}">风险线 90%</text><polyline class="chart-line" points="${line}"/><polyline class="chart-predict" points="${pred}"/><circle class="chart-point" cx="${x(29,actual.length)}" cy="${y(87.6)}" r="5"/><text class="chart-label" x="${p}" y="${H-3}">07-14</text><text class="chart-label" x="${W/2}" y="${H-3}">07-29</text><text class="chart-label" x="${W-70}" y="${H-3}">08-18 预测</text></svg>`;
}

function renderPeer(){
  main.innerHTML=header('同类对标','同类系统对标','用同类组件的真实资源画像回答"为什么别人 6 台，而你需要 10 台"',`<button class="btn">选择对标样本</button><button class="btn acid" data-open-agent>询问 Agent</button>`)+`
  <section class="peer-layout"><article class="panel"><div class="panel-head"><div><h2>Java 核心交易组件对标组</h2><p>相同业务等级、架构类型与日均交易量区间</p></div><small>12 个可比集群</small></div><table class="peer-table"><thead><tr><th>集群</th><th>规模</th><th>CPU P95</th><th>内存 P95</th><th>安全余量</th><th>判断</th></tr></thead><tbody>
    <tr><td>订单服务 / cluster-A</td><td>8C16G × 6</td><td>58%</td><td>63%</td><td>31%</td><td>合理</td></tr><tr><td>清结算 / cluster-B</td><td>8C16G × 8</td><td>61%</td><td>59%</td><td>29%</td><td>合理</td></tr><tr class="current"><td><strong>渠道接入 / cluster-C</strong></td><td><strong>16C32G × 10</strong></td><td>22%</td><td>31%</td><td>66%</td><td><strong>过度配置</strong></td></tr><tr><td>营销服务 / cluster-D</td><td>8C16G × 6</td><td>54%</td><td>57%</td><td>34%</td><td>合理</td></tr><tr><td>账户查询 / cluster-E</td><td>8C16G × 8</td><td>49%</td><td>62%</td><td>32%</td><td>合理</td></tr>
  </tbody></table></article><aside class="panel rank-card"><p class="kicker">同类位置</p><span class="big">2.1×</span><h2>资源规模高于同类中位数</h2><p>在交易量和可用性等级相近的 12 个集群中，渠道接入 cluster-C 的 CPU 与内存配置均位于最高 10%，但利用率处于最低 15%。</p><div class="benchmark-bars">${bench('资源规模','92%','var(--amber)')}${bench('业务负载','44%','var(--cyan)')}${bench('资源效率','21%','var(--red)')}</div><div class="decision"><b>Agent 建议</b><p>先将单节点规格由 16C32G 降至 8C16G，灰度 2 台并观察 7 天，预计每月节约 ¥12.4k。</p></div></aside></section>`;
}
function bench(label,value,color){return `<div class="bench"><div class="bench-head"><span>${label}</span><b>${value}</b></div><div class="bench-track"><i style="--value:${value};--color:${color}"></i></div></div>`}

/* ============ 方案模拟 · 三步向导（自 模拟仿真.html 迁移） ============ */
const wzApps={
  "ITSM-2026-0812-001":{
    title:"A系统进行信创改造申请资源", reason:"A系统进行信创改造申请资源，需要10台虚拟机",
    business:"支持用户信息的查询", scenario:"信创改造", system:"A系统", type:"改造",
    equip:[
      {name:"ES组件",count:"10台虚拟机",spec:"4C16G100G",comp:"es"},
      {name:"MySQL",count:"3台虚拟机",spec:"4C16G100G",comp:"mysql"}
    ]
  },
  "ITSM-2026-0813-002":{
    title:"B系统新增扩容申请资源", reason:"B系统新增业务模块，需申请8台虚拟机",
    business:"支持订单数据的查询与处理", scenario:"新增系统", system:"B系统", type:"新增",
    equip:[
      {name:"B系统-Web",count:"8台虚拟机",spec:"8C32G200G",comp:"es"}
    ]
  }
};
const wzModuleMenu=[
  {label:'ES 组件',children:[
    {label:'基础组件',children:[{label:'es-001',value:'es-001'},{label:'es-002',value:'es-002'}]},
    {label:'查询组件',children:[{label:'es-search',value:'es-search'}]}
  ]},
  {label:'HBase',children:[
    {label:'存储层',children:[{label:'hbase-001',value:'hbase-001'},{label:'hbase-002',value:'hbase-002'}]}
  ]},
  {label:'MySQL',children:[
    {label:'主库',children:[{label:'mysql-001',value:'mysql-001'},{label:'mysql-002',value:'mysql-002'}]}
  ]}
];
const wzModuleBase={
  "es-001":{cpu:64,mem:62},"es-002":{cpu:60,mem:58},
  "hbase-001":{cpu:66,mem:70},"hbase-002":{cpu:58,mem:62},
  "mysql-001":{cpu:72,mem:75},"mysql-002":{cpu:68,mem:70},
  "ES组件":{cpu:64,mem:62},
  "MySQL":{cpu:72,mem:75},
  "es-search":{cpu:55,mem:60}
};
const wzHistPeaks={"es-001":{cpu:30,mem:50,disk:60},"mysql-001":{cpu:10,mem:40,disk:50}};
const wzRecs={"es-001":{type:"虚拟机",cpu:2,mem:14,countMax:10,count:10},"mysql-001":{type:"虚拟机",cpu:2,mem:12,countMax:3,count:3}};
let wzNo='',wzApp=null,wzModules=[],wzStep=1,wzActiveMod=0,wzAdopted={},wzSimRun={},wzBusy=false;
const wzW=840,wzH=170,wzPL=34,wzPR=8,wzPTop=12,wzPB=24,wzPW=wzW-wzPL-wzPR,wzPH=wzH-wzPTop-wzPB;
const WZ_SLIDER={cpu:{min:1,max:4},mem:{min:1,max:16},disk:{min:10,max:100},count:{min:1,max:10}};

function renderSimulator(){
  const steps=['获取申请单|ITSM 申请单与模块','方案仿真|仿真参数调整','审核报告|生成完整报告'];
  main.innerHTML=`<section class="wz-stepper">${steps.map((st,i)=>{const parts=st.split('|');return `${i?'<div class="connector"></div>':''}<div class="step" data-step="${i+1}"><div class="num">${i+1}</div><div class="lbl"><b>${parts[0]}</b><small>${parts[1]}</small></div></div>`}).join('')}</section>
  <section class="wz-panel" id="step1">
    <div class="panel-head"><span class="en">第 1 步</span><span class="zh">获取 ITSM 申请单</span></div>
    <div class="hero">
      <div class="fld"><label>申请单号</label><div class="select"><select id="appSel">
        <option value="">— 请选择申请单号 —</option>
        <option value="ITSM-2026-0812-001">ITSM-2026-0812-001（A 系统信创改造）</option>
        <option value="ITSM-2026-0813-002">ITSM-2026-0813-002（B 系统新增扩容）</option>
      </select></div></div>
      <button class="btn acid" id="btnLoad">加载申请单</button>
    </div>
    <div id="appContent"></div>
    <div class="foot-actions"><button class="btn" id="btnResetApp">重置</button><div class="spacer"></div><button class="btn acid" id="btnNext1" disabled>下一步：方案仿真</button></div>
  </section>
  <section class="wz-panel" id="step2" hidden>
    <div class="panel-head"><span class="en">第 2 步</span><span class="zh">方案仿真 · 仿真参数调整</span></div>
    <div class="mod-tabs" id="modTabs"></div>
    <div class="sim-grid">
      <div class="sim-charts">
        <div class="chart-card"><div class="ch-head"><span class="t">CPU使用率</span><span class="unit">近24小时</span><div class="lg"><span class="h"><i></i>历史数据</span><span class="s"><i></i>仿真数据</span></div><span class="peak" id="peakCpu"></span></div><div class="chart2" id="chartCpu"></div></div>
        <div class="chart-card"><div class="ch-head"><span class="t">内存使用率</span><span class="unit">近24小时</span><div class="lg"><span class="h"><i></i>历史数据</span><span class="s"><i></i>仿真数据</span></div><span class="peak" id="peakMem"></span></div><div class="chart2" id="chartMem"></div></div>
        <div class="chart-card"><div class="ch-head"><span class="t">磁盘使用率</span><span class="unit">近一个月</span><div class="lg"><span class="h"><i></i>历史数据</span><span class="s"><i></i>仿真数据</span></div><span class="peak" id="peakDisk"></span></div><div class="chart2" id="chartDisk"></div></div>
        <div class="sim-loading" id="simLoading" hidden>
          <div class="spinner"></div>
          <div class="txt">AI 智能仿真模拟中…</div>
          <div class="sub">正在基于历史数据与业务参数进行容量仿真推演，请稍候…</div>
        </div>
      </div>
      <aside class="sim-params">
        <div class="param-title">仿真参数调整</div>
        <div class="fld"><label>机器类型</label><div class="select"><select id="pType">
          <option>物理机</option><option>虚拟机</option><option>容器</option></select></div></div>
        <div class="slider-block">
          <div class="slider-label"><span>机器CPU</span><span class="meta"><span id="pCpuSide"></span>　当前 <b id="pCpuVal"></b><span class="rec" id="pCpuRec"></span></span></div>
          <div class="range"><span class="rail" id="pCpuRail"></span><span class="mark" id="pCpuMark"></span><input type="range" id="pCpu" min="1" max="4" value="4"></div>
        </div>
        <div class="slider-block">
          <div class="slider-label"><span>机器内存</span><span class="meta"><span id="pMemSide"></span>　当前 <b id="pMemVal"></b><span class="rec" id="pMemRec"></span></span></div>
          <div class="range"><span class="rail" id="pMemRail"></span><span class="mark" id="pMemMark"></span><input type="range" id="pMem" min="1" max="16" value="16"></div>
        </div>
        <div class="slider-block">
          <div class="slider-label"><span>机器磁盘</span><span class="meta"><span id="pDiskSide"></span>　当前 <b id="pDiskVal"></b><span class="rec" id="pDiskRec"></span></span></div>
          <div class="range"><span class="rail" id="pDiskRail"></span><span class="mark" id="pDiskMark"></span><input type="range" id="pDisk" min="10" max="100" value="100"></div>
        </div>
        <div class="slider-block">
          <div class="slider-label"><span>机器数量</span><span class="meta"><span id="pCountSide"></span>　当前 <b id="pCountVal"></b><span class="rec" id="pCountRec"></span></span></div>
          <div class="range"><span class="rail" id="pCountRail"></span><span class="mark" id="pCountMark"></span><input type="range" id="pCount" min="1" max="10" value="10"></div>
        </div>
        <div class="risk-box r-low" id="riskBox">当前方案风险：<b>低风险</b></div>
        <div class="tip-box"><b>分析依据：</b><br>1、依据历史资源使用率与业务峰值波动，进行容量拟合；<br>2、结合系统规格与节点数量，测算目标水位。<br><span style="color:#8a7a4a;">任何方案变更均需人工审批。</span></div>
        <div class="param-actions">
          <button class="btn acid" id="btnSim">仿真</button>
          <button class="btn" id="btnSimReset">重置方案</button>
          <button class="btn acid" id="btnAdopt">采用此方案</button>
        </div>
      </aside>
    </div>
    <div class="foot-actions"><button class="btn" id="btnPrev1">上一步</button><div class="spacer"></div><button class="btn acid" id="btnNext2">下一步：生成审核报告</button></div>
  </section>
  <section class="wz-panel" id="step3" hidden>
    <div class="panel-head"><span class="en">第 3 步</span><span class="zh">生成审核报告</span></div>
    <div class="wz-report" id="report"></div>
    <div class="foot-actions"><button class="btn" id="btnPrev2">上一步</button><div class="spacer"></div><button class="btn" id="btnPrint">导出 / 打印</button><button class="btn acid" id="btnRestart">审核通过</button></div>
  </section>`;
  if(!wzApp)wzStep=1;
  wzGo(wzStep);
}

function wzGo(n){
  wzStep=n;
  ['step1','step2','step3'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.hidden=(i+1)!==n;});
  document.querySelectorAll('.wz-stepper .step').forEach(st=>{
    const d=parseInt(st.getAttribute('data-step'),10);
    st.classList.toggle('active',d===n);
    st.classList.toggle('done',d<n);
  });
  document.querySelectorAll('.wz-stepper .connector').forEach((c,i)=>c.classList.toggle('done',i<n-1));
  if(n===2)wzRenderSim();
  if(n===3)wzRenderReport();
  window.scrollTo({top:0});
}

/* ---------- 第 1 步 ---------- */
function wzEquipSummary(){let s=[];for(let i=0;i<wzApp.equip.length;i++){const e=wzApp.equip[i];s.push((i+1)+'、'+e.name+' '+e.count+'，规格是 '+e.spec);}return s.join('；');}
function wzParseSpec(spec){const m=spec.match(/(\d+)C(\d+)G(\d+)G/);return m?{cpu:+m[1],mem:+m[2],disk:+m[3]}:null;}
function wzEquipMax(){
  const mx={cpu:0,mem:0,disk:0,count:0};
  if(!wzApp)return {cpu:4,mem:16,disk:100,count:10};
  for(const it of wzApp.equip){
    const sp=wzParseSpec(it.spec);
    if(sp){mx.cpu=Math.max(mx.cpu,sp.cpu);mx.mem=Math.max(mx.mem,sp.mem);mx.disk=Math.max(mx.disk,sp.disk);}
    const m=it.count.match(/^(\d+)/);
    if(m)mx.count=Math.max(mx.count,parseInt(m[1],10));
  }
  if(!mx.cpu){mx.cpu=4;mx.mem=16;mx.disk=100;}
  if(!mx.count)mx.count=10;
  return mx;
}
function wzDefaultPathFor(comp){return {es:[0,0,0],hbase:[1,0,0],mysql:[2,0,0]}[comp]||[0,0,0];}

function wzRenderDetail(){
  const a=wzApp,c=document.getElementById('appContent');
  const tag=a.type==='改造'?'信创改造':'新增系统';
  const rows=
    '<div class="ar"><span class="k">标题</span><span class="v">'+a.title+'</span></div>'+
    '<div class="ar right"><span class="k">申请场景</span><span class="v">'+a.scenario+'</span></div>'+
    '<div class="ar"><span class="k">系统名称</span><span class="v">'+a.system+'</span></div>'+
    '<div class="ar right"><span class="k">支撑业务</span><span class="v">'+a.business+'</span></div>'+
    '<div class="ar full"><span class="k">申请原因</span><span class="v">'+a.reason+'</span></div>';
  const info='<div class="sp-block"><div class="sp-title">申请单内容 <span class="tag">'+tag+'</span></div><div class="app-rows">'+rows+'</div></div>';
  let list='<div class="sp-block"><div class="sec-title">设备清单</div><div class="equip-list">';
  if(a.type==='新增'){
    a.equip.forEach((it,i)=>{
      list+='<div class="equip-item"><div class="eq-info"><span class="eq-idx">'+(i+1)+'、</span><span class="eq-name">'+it.name+'</span> <span>'+it.count+'</span>，规格是 <span class="eq-spec">'+it.spec+'</span></div></div>';
    });
    list+='</div><div class="module-note">新增系统：新增模块不涉及旧模块选择，无需配置模块。</div>';
  }else{
    a.equip.forEach((it,i)=>{
      list+='<div class="equip-item" data-idx="'+i+'">'+
        '<div class="eq-info"><span class="eq-idx">'+(i+1)+'、</span><span class="eq-name">'+it.name+'</span> <span>'+it.count+'</span>，规格是 <span class="eq-spec">'+it.spec+'</span></div>'+
        '<div class="eq-mod"><span class="mod-label">选择涉及模块</span>'+
          '<div class="cascader" data-idx="'+i+'"></div>'+
          '<a class="detail-link" data-idx="'+i+'">查看详情</a>'+
        '</div></div>';
    });
    list+='</div><div class="module-note">请选择涉及到的模块（多级菜单，逐级选择到具体实例），选中模块将用于历史数据采集与容量仿真。</div>';
  }
  list+='</div>';
  c.innerHTML=info+list;
  wzMountCascaders();
}
function wzMountCascaders(){
  document.querySelectorAll('#appContent .detail-link').forEach(ln=>{
    ln.addEventListener('click',()=>{
      const item=wzApp.equip[parseInt(ln.getAttribute('data-idx'),10)];
      toast('设备详情',item.name+'｜'+item.count+'｜规格：'+item.spec);
    });
  });
  document.querySelectorAll('#appContent .cascader').forEach(el=>{
    const idx=parseInt(el.getAttribute('data-idx'),10);
    const item=wzApp.equip[idx];
    el.innerHTML='<div class="casc-trigger"><span class="casc-path"></span><span class="casc-arrow">▾</span></div><div class="casc-panel" hidden></div>';
    wzInitCascader(el,wzModuleMenu,wzDefaultPathFor(item.comp),val=>{
      el.setAttribute('data-val',val);
      wzRebuildSelected();
    });
  });
  wzRebuildSelected();
}
function wzOptionsAt(menu,path,level){let opts=menu;for(let i=0;i<level;i++){if(!opts||path[i]==null)return [];const n=opts[path[i]];if(!n||!n.children)return [];opts=n.children;}return opts||[];}
function wzLeafAt(menu,path){let opts=menu,node=null;for(let i=0;i<path.length;i++){if(!opts||path[i]==null)return null;node=opts[path[i]];if(!node)return null;opts=node.children;}return node;}
function wzPathLabels(menu,path){const labels=[];let opts=menu;for(let i=0;i<path.length;i++){if(!opts||path[i]==null)break;const n=opts[path[i]];if(!n)break;labels.push(n.label);opts=n.children;}return labels;}
function wzInitCascader(root,menu,defaultPath,onChange){
  const path=defaultPath.slice();
  const trigger=root.querySelector('.casc-trigger'),pathEl=root.querySelector('.casc-path'),panel=root.querySelector('.casc-panel');
  function render(){
    const labels=wzPathLabels(menu,path);
    pathEl.textContent=labels.length?labels.join(' › '):'请选择模块';
    let h='';
    for(let lv=0;lv<=path.length;lv++){
      const opts=wzOptionsAt(menu,path,lv);
      if(!opts.length)break;
      const curIdx=(lv<path.length)?path[lv]:-1;
      h+='<div class="casc-col">';
      opts.forEach((node,j)=>{
        const has=node.children&&node.children.length;
        h+='<div class="casc-node'+(j===curIdx?' sel':'')+'" data-lv="'+lv+'" data-idx="'+j+'"><span>'+node.label+'</span>'+(has?'<span class="carr">›</span>':'')+'</div>';
      });
      h+='</div>';
      if(lv>=path.length||path[lv]==null||!opts[path[lv]]||!opts[path[lv]].children)break;
    }
    panel.innerHTML=h;
  }
  trigger.addEventListener('click',ev=>{
    ev.stopPropagation();
    document.querySelectorAll('#appContent .casc-panel').forEach(pp=>{if(pp!==panel)pp.hidden=true;});
    panel.hidden=!panel.hidden;if(!panel.hidden)render();
  });
  panel.addEventListener('click',e=>{
    const node=e.target.closest('.casc-node');if(!node)return;
    e.stopPropagation();
    const lv=parseInt(node.getAttribute('data-lv'),10),idx=parseInt(node.getAttribute('data-idx'),10);
    const opts=wzOptionsAt(menu,path,lv);const chosen=opts[idx];
    path=path.slice(0,lv);path.push(idx);
    if(chosen.children&&chosen.children.length){render();}
    else{render();panel.hidden=true;onChange(chosen.value||chosen.label);}
  });
  const leaf=wzLeafAt(menu,path);
  if(leaf)root.setAttribute('data-val',leaf.value||leaf.label);
  render();
}
function wzRebuildSelected(){
  wzModules=[];
  document.querySelectorAll('#appContent .cascader').forEach(el=>{
    const val=el.getAttribute('data-val');if(val)wzModules.push(val);
  });
  const b=document.getElementById('btnNext1');
  if(b&&wzApp)b.disabled=(wzApp.type==='改造'&&wzModules.length===0);
}
function wzLoadApp(){
  const no=document.getElementById('appSel').value;
  if(!no){toast('请先选择申请单号','在下拉框中挑选一条 ITSM 申请单后再点击加载。');return;}
  wzApp=wzApps[no];wzNo=no;
  wzModules=[];wzAdopted={};wzSimRun={};wzActiveMod=0;
  wzRenderDetail();wzSetupSliders();
  document.getElementById('btnNext1').disabled=false;
  toast('申请单已加载',no+' · 可选择涉及模块后进入方案仿真。');
}
function wzResetApp(){
  wzApp=null;wzNo='';wzModules=[];wzAdopted={};wzSimRun={};
  document.getElementById('appSel').value='';
  document.getElementById('appContent').innerHTML='';
  document.getElementById('btnNext1').disabled=true;
  toast('已重置','申请单选择已清空。');
}

/* ---------- 第 2 步：仿真 ---------- */
function wzReadParams(){return {cpu:+document.getElementById('pCpu').value,mem:+document.getElementById('pMem').value,disk:+document.getElementById('pDisk').value,count:+document.getElementById('pCount').value};}
function wzMakeHourly(base,seed){
  const a=[];
  for(let i=0;i<24;i++){
    const day=Math.exp(-Math.pow(i-11,2)/22)*0.5+Math.exp(-Math.pow(i-16,2)/14)*0.45;
    const w=Math.sin(i/3+seed)*0.05+Math.sin(i/1.7+seed+1)*0.04;
    a.push(Math.max(1,Math.min(96,Math.round(base*(0.48+day+w)))));
  }
  return a;
}
function wzMakeMod(base,seed){
  const a=[];
  for(let i=0;i<31;i++){
    const w=Math.sin(i/2.6+seed)*7+Math.sin(i/1.4+2.5+seed)*4+Math.sin(i/5+0.5+seed)*5;
    a.push(Math.max(1,Math.min(96,Math.round(base+w+(i/30)*5))));
  }
  return a;
}
function wzScaleTo(arr,target){const mx=Math.max.apply(null,arr);if(!mx)return arr;return arr.map(v=>Math.max(1,Math.min(96,Math.round(v*target/mx))));}
function wzHistForIdx(idx,kind){
  const m=wzModules.length?wzModules[idx]:null;
  const b=m?wzModuleBase[m]:null;
  let arr;
  if(kind==='cpu')arr=wzMakeHourly(b?b.cpu:52,idx+1);
  else if(kind==='mem')arr=wzMakeHourly(b?b.mem:56,idx+2);
  else arr=wzMakeMod(45,idx+3);
  const pk=m?wzHistPeaks[m]:null;
  if(pk)arr=wzScaleTo(arr,pk[kind]);
  return arr;
}
function wzHistCPU(){return wzHistForIdx(wzActiveMod,'cpu');}
function wzHistMEM(){return wzHistForIdx(wzActiveMod,'mem');}
function wzHistDISK(){return wzHistForIdx(wzActiveMod,'disk');}
function wzMtypeFactor(){const t=document.getElementById('pType').value;return t==='物理机'?1:(t==='虚拟机'?1.08:1.15);}
function wzSimCurve(h,param,count,ref){const factor=(ref/param)*(WZ_SLIDER.count.max/Math.max(count,1))*wzMtypeFactor();return h.map(v=>Math.max(1,Math.min(96,Math.round(v*factor))));}
function wzSimKey(){return wzModules.length?wzModules[wzActiveMod]:'_default_';}
function wzSimOn(){return !!wzSimRun[wzSimKey()];}
function wzPt(arr){const n=arr.length,step=wzPW/(n-1),pts=[];for(let i=0;i<n;i++)pts.push({x:wzPL+i*step,y:wzPTop+(1-arr[i]/100)*wzPH});return pts;}
function wzCurve(pts){
  if(pts.length<2)return '';
  let d='M'+pts[0].x.toFixed(1)+','+pts[0].y.toFixed(1);
  for(let i=0;i<pts.length-1;i++){
    const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
    const cx=p1.x+(p2.x-p0.x)/6,cy=p1.y+(p2.y-p0.y)/6,cx2=p2.x-(p3.x-p1.x)/6,cy2=p2.y-(p3.y-p1.y)/6;
    d+='C'+cx.toFixed(1)+','+cy.toFixed(1)+' '+cx2.toFixed(1)+','+cy2.toFixed(1)+' '+p2.x.toFixed(1)+','+p2.y.toFixed(1);
  }
  return d;
}
function wzArea(pts){const p=wzCurve(pts),last=pts[pts.length-1],first=pts[0];return p+' L'+last.x.toFixed(1)+','+(wzPTop+wzPH).toFixed(1)+' L'+first.x.toFixed(1)+','+(wzPTop+wzPH).toFixed(1)+' Z';}
function wzToXUnused(){return wzPL;}
void wzToXUnused;
function wzMaxOf(a){return Math.max.apply(null,a);}
function wzDrawChart2(id,hist,sim,peakId,unit,showSim){
  const el=document.getElementById(id);if(!el)return;
  const n=hist.length,hp=wzPt(hist),sp=wzPt(sim),step=wzPW/(n-1);
  let g,s='';
  for(g=0;g<=4;g++){const gy=wzPTop+(1-g/4)*wzPH;s+='<line x1="'+wzPL+'" y1="'+gy+'" x2="'+(wzW-wzPR)+'" y2="'+gy+'" stroke="#e9edf4" stroke-width="1"/><text x="'+(wzPL-7)+'" y="'+(gy+3)+'" text-anchor="end" font-size="9" fill="#9098a7">'+(g*25)+'%</text>';}
  const ticks=unit==='hour'?[[0,'0时'],[6,'6时'],[12,'12时'],[18,'18时'],[23,'24时']]:[[0,'1日'],[7,'8日'],[14,'15日'],[21,'22日'],[30,'31日']];
  for(g=0;g<ticks.length;g++)s+='<text x="'+(wzPL+ticks[g][0]*step)+'" y="'+(wzH-6)+'" text-anchor="middle" font-size="9" fill="#9098a7">'+ticks[g][1]+'</text>';
  s+='<defs><linearGradient id="gd'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f5d91" stop-opacity="0.12"/><stop offset="1" stop-color="#2f5d91" stop-opacity="0"/></linearGradient></defs>';
  s+='<path d="'+wzArea(hp)+'" fill="rgba(47,93,145,0.05)" stroke="none"/>';
  s+='<path d="'+wzCurve(hp)+'" fill="none" stroke="#2f5d91" stroke-width="2"/>';
  if(showSim){
    s+='<path d="'+wzArea(sp)+'" fill="url(#gd'+id+')" stroke="none"/>';
    s+='<path d="'+wzCurve(sp)+'" fill="none" stroke="#8ca1bd" stroke-width="2" stroke-dasharray="5,3"/>';
  }
  el.innerHTML='<svg viewBox="0 0 '+wzW+' '+wzH+'">'+s+'</svg><div class="tip"></div>';
  const svgEl=el.querySelector('svg'),tipEl=el.querySelector('.tip');
  svgEl.addEventListener('mousemove',ev=>{
    const rect=el.getBoundingClientRect(),vx=(ev.clientX-rect.left)/rect.width*wzW;
    if(vx<wzPL||vx>wzW-wzPR){tipEl.style.opacity=0;return;}
    const i=Math.max(0,Math.min(n-1,Math.round((vx-wzPL)/wzPW*(n-1))));
    tipEl.innerHTML='<span class="date">'+(unit==='hour'?i+'时':(i+1)+'日')+'</span>'+(showSim?('历史 '+hist[i]+'% · 仿真 '+sim[i]+'%'):('历史 '+hist[i]+'%'));
    tipEl.style.left=(ev.clientX-rect.left)+'px';tipEl.style.top=(ev.clientY-rect.top-10)+'px';tipEl.style.opacity=1;
  });
  svgEl.addEventListener('mouseleave',()=>{tipEl.style.opacity=0;});
  document.getElementById(peakId).textContent=showSim?('仿真峰值 '+wzMaxOf(sim)+'%'):('历史峰值 '+wzMaxOf(hist)+'%');
  const leg=el.closest('.chart-card').querySelector('.lg .s');
  if(leg)leg.style.opacity=showSim?1:0.35;
}
function wzRenderSimCharts(){
  const p=wzReadParams();
  const on=wzSimOn();
  wzDrawChart2('chartCpu',wzHistCPU(),wzSimCurve(wzHistCPU(),p.cpu,p.count,WZ_SLIDER.cpu.max),'peakCpu','hour',on);
  wzDrawChart2('chartMem',wzHistMEM(),wzSimCurve(wzHistMEM(),p.mem,p.count,WZ_SLIDER.mem.max),'peakMem','hour',on);
  wzDrawChart2('chartDisk',wzHistDISK(),wzSimCurve(wzHistDISK(),p.disk,p.count,WZ_SLIDER.disk.max),'peakDisk','day',on);
  wzUpdateRisk();
}
function wzSetupSliders(){
  const mx=wzEquipMax();
  WZ_SLIDER.cpu.max=mx.cpu;WZ_SLIDER.mem.max=mx.mem;WZ_SLIDER.disk.max=mx.disk;
  const m=wzModules.length?wzModules[wzActiveMod]:null;
  const r0=(m&&wzRecs[m])?wzRecs[m]:{};
  WZ_SLIDER.count.max=(r0.countMax!=null)?r0.countMax:10;
  if(r0.type)document.getElementById('pType').value=r0.type;
  const pCpu=document.getElementById('pCpu'),pMem=document.getElementById('pMem'),pDisk=document.getElementById('pDisk'),pCount=document.getElementById('pCount');
  pCpu.min=WZ_SLIDER.cpu.min;pCpu.max=mx.cpu;pCpu.step=1;
  pMem.min=WZ_SLIDER.mem.min;pMem.max=mx.mem;pMem.step=1;
  pDisk.min=WZ_SLIDER.disk.min;pDisk.max=mx.disk;pDisk.step=10;
  pCount.min=WZ_SLIDER.count.min;pCount.max=WZ_SLIDER.count.max;pCount.step=1;
  const r=wzComputeRecParams();
  pCpu.value=r.cpu;pMem.value=r.mem;pDisk.value=r.disk;pCount.value=r.count;
}
function wzUpdateRail(inp,railId,min,max){const rail=document.getElementById(railId);if(rail)rail.style.width=((inp.value-min)/(max-min)*100)+'%';}
function wzComputeRecParams(){
  const peak=Math.max(wzMaxOf(wzHistCPU()),wzMaxOf(wzHistMEM()));
  const m=wzModules.length?wzModules[wzActiveMod]:null;
  const r=(m&&wzRecs[m])?wzRecs[m]:{};
  return {
    cpu:(r.cpu!=null)?r.cpu:WZ_SLIDER.cpu.max,
    mem:(r.mem!=null)?r.mem:WZ_SLIDER.mem.max,
    disk:(r.disk!=null)?r.disk:WZ_SLIDER.disk.max,
    count:(r.count!=null)?r.count:WZ_SLIDER.count.max,
    peak:peak
  };
}
function wzUpdateRisk(){
  const p=wzReadParams();
  let peaks;
  if(wzSimOn()){
    peaks=[wzMaxOf(wzSimCurve(wzHistCPU(),p.cpu,p.count,WZ_SLIDER.cpu.max)),wzMaxOf(wzSimCurve(wzHistMEM(),p.mem,p.count,WZ_SLIDER.mem.max)),wzMaxOf(wzSimCurve(wzHistDISK(),p.disk,p.count,WZ_SLIDER.disk.max))];
  }else{
    peaks=[wzMaxOf(wzHistCPU()),wzMaxOf(wzHistMEM()),wzMaxOf(wzHistDISK())];
  }
  const maxp=Math.max.apply(null,peaks);
  const el=document.getElementById('riskBox');if(!el)return;
  const lv=maxp>=85?'high':(maxp>=70?'mid':'low');
  const txt=maxp>=85?'建议增大机器规格或增加机器数量':(maxp>=70?'建议监控峰值并预留余量':'处于安全区间');
  el.className='risk-box r-'+lv;
  el.innerHTML='当前方案风险：<b>'+(lv==='high'?'高风险':(lv==='mid'?'中风险':'低风险'))+'</b>　预测峰值约 '+maxp+'%，'+txt;
}
function wzUpdateParamUI(){
  const pCpu=document.getElementById('pCpu'),pMem=document.getElementById('pMem'),pDisk=document.getElementById('pDisk'),pCount=document.getElementById('pCount');
  document.getElementById('pCpuVal').textContent=pCpu.value;
  document.getElementById('pMemVal').textContent=pMem.value;
  document.getElementById('pDiskVal').textContent=pDisk.value;
  document.getElementById('pCountVal').textContent=pCount.value;
  wzUpdateRail(pCpu,'pCpuRail',WZ_SLIDER.cpu.min,WZ_SLIDER.cpu.max);
  wzUpdateRail(pMem,'pMemRail',WZ_SLIDER.mem.min,WZ_SLIDER.mem.max);
  wzUpdateRail(pDisk,'pDiskRail',WZ_SLIDER.disk.min,WZ_SLIDER.disk.max);
  wzUpdateRail(pCount,'pCountRail',WZ_SLIDER.count.min,WZ_SLIDER.count.max);
  document.getElementById('pCpuSide').innerHTML='最低：'+WZ_SLIDER.cpu.min+'　最高：'+WZ_SLIDER.cpu.max+' 核';
  document.getElementById('pMemSide').innerHTML='最低：'+WZ_SLIDER.mem.min+'　最高：'+WZ_SLIDER.mem.max+' GB';
  document.getElementById('pDiskSide').innerHTML='最低：'+WZ_SLIDER.disk.min+'　最高：'+WZ_SLIDER.disk.max+' GB';
  document.getElementById('pCountSide').innerHTML='最低：'+WZ_SLIDER.count.min+'　最高：'+WZ_SLIDER.count.max+' 台';
  const r=wzComputeRecParams();
  document.getElementById('pCpuRec').textContent='（推荐 '+r.cpu+' 核）';
  document.getElementById('pMemRec').textContent='（推荐 '+r.mem+' GB）';
  document.getElementById('pDiskRec').textContent='（推荐 '+r.disk+' GB）';
  document.getElementById('pCountRec').textContent='（推荐 '+r.count+' 台）';
  const pct=(val,cfg)=>((val-cfg.min)/(cfg.max-cfg.min)*100)+'%';
  document.getElementById('pCpuMark').style.left=pct(+pCpu.value,WZ_SLIDER.cpu);
  document.getElementById('pMemMark').style.left=pct(+pMem.value,WZ_SLIDER.mem);
  document.getElementById('pDiskMark').style.left=pct(+pDisk.value,WZ_SLIDER.disk);
  document.getElementById('pCountMark').style.left=pct(+pCount.value,WZ_SLIDER.count);
  wzUpdateRisk();
}
function wzRenderTabs(){
  const tb=document.getElementById('modTabs');if(!tb)return;
  if(!wzModules.length){tb.innerHTML='';return;}
  const all=wzModules.every(m=>!!wzAdopted[m]);
  let h='';
  wzModules.forEach((m,i)=>{
    const ad=!!wzAdopted[m];
    h+='<div class="mod-tab'+(i===wzActiveMod?' active':'')+(ad?' adopted':'')+'" data-mod-i="'+i+'"><span class="idx">模块'+(i+1)+'</span>'+m+(ad?'<span class="ck">✓</span>':'')+'</div>';
  });
  h+=all?'<span class="tab-hint ok">全部模块已采用 ✓</span>':'<span class="tab-hint">未采用的模块为灰色标签，点右侧「采用此方案」后变蓝 ✓</span>';
  tb.innerHTML=h;
}
function wzRenderSim(){wzRenderTabs();wzSetupSliders();wzUpdateParamUI();wzRenderSimCharts();}
function wzRunSim(){
  if(wzBusy)return;
  wzBusy=true;
  const btn=document.getElementById('btnSim');
  btn.disabled=true;btn.textContent='仿真中…';
  document.getElementById('simLoading').hidden=false;
  setTimeout(()=>{
    wzSimRun[wzSimKey()]=true;
    wzRenderSimCharts();
    document.getElementById('simLoading').hidden=true;
    btn.disabled=false;btn.textContent='仿真';
    wzBusy=false;
  },1800);
}
function wzAdoptCurrent(){
  if(!wzModules.length){toast('当前无涉及模块','新增申请单无需逐模块采用，可直接进入下一步生成报告。');return;}
  wzAdopted[wzModules[wzActiveMod]]=true;
  wzRenderTabs();
  const done=wzModules.filter(m=>!!wzAdopted[m]).length;
  const all=done===wzModules.length;
  toast(all?'已采用全部方案':'已采用 '+(wzActiveMod+1)+' 号模块的方案',all?('共 '+wzModules.length+' 个模块全部采用 ✓ 可进入下一步生成报告。'):('还有 '+(wzModules.length-done)+' 个模块待采用。'));
}

/* ---------- 第 3 步：报告 ---------- */
function wzChartSnapURL(hist,sim,unit){
  const W2=300,H2=120,P2=28,PR2=6,PT2=8,PB2=18,PW2=W2-P2-PR2,PH2=H2-PT2-PB2;
  const n=hist.length,st=PW2/(n-1);
  const pts=arr=>arr.map((v,i)=>({x:P2+i*st,y:PT2+(1-v/100)*PH2}));
  const crv=ps=>{
    if(ps.length<2)return '';
    let d='M'+ps[0].x.toFixed(1)+','+ps[0].y.toFixed(1);
    for(let i=0;i<ps.length-1;i++){
      const p0=ps[Math.max(0,i-1)],p1=ps[i],p2=ps[i+1],p3=ps[Math.min(ps.length-1,i+2)];
      d+='C'+(p1.x+(p2.x-p0.x)/6).toFixed(1)+','+(p1.y+(p2.y-p0.y)/6).toFixed(1)+' '+(p2.x-(p3.x-p1.x)/6).toFixed(1)+','+(p2.y-(p3.y-p1.y)/6).toFixed(1)+' '+p2.x.toFixed(1)+','+p2.y.toFixed(1);
    }
    return d;
  };
  const area=ps=>{const q=crv(ps),l=ps[ps.length-1],f=ps[0];return q+' L'+l.x.toFixed(1)+','+(PT2+PH2).toFixed(1)+' L'+f.x.toFixed(1)+','+(PT2+PH2).toFixed(1)+' Z';};
  const hp=pts(hist),sp=pts(sim);
  let g,s='';
  for(g=0;g<=4;g++){const gy=PT2+(1-g/4)*PH2;s+='<line x1="'+P2+'" y1="'+gy+'" x2="'+(W2-PR2)+'" y2="'+gy+'" stroke="#e5eaf1" stroke-width="1"/><text x="'+(P2-4)+'" y="'+(gy+3)+'" text-anchor="end" font-size="7" fill="#9098a7">'+(g*25)+'%</text>';}
  const ticks=unit==='hour'?[[0,'0时'],[6,'6时'],[12,'12时'],[18,'18时'],[23,'24时']]:[[0,'1日'],[8,'8日'],[15,'15日'],[22,'22日'],[30,'31日']];
  for(g=0;g<ticks.length;g++)s+='<text x="'+(P2+ticks[g][0]*st)+'" y="'+(H2-5)+'" text-anchor="middle" font-size="7" fill="#9098a7">'+ticks[g][1]+'</text>';
  s+='<path d="'+area(hp)+'" fill="rgba(47,93,145,0.08)" stroke="none"/>';
  s+='<path d="'+crv(hp)+'" fill="none" stroke="#2f5d91" stroke-width="1.6"/>';
  s+='<path d="'+crv(sp)+'" fill="none" stroke="#8ca1bd" stroke-width="1.4" stroke-dasharray="4,3"/>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W2+' '+H2+'">'+s+'</svg>');
}
function wzRenderReport(){
  const a=wzApp,d=document.getElementById('report');
  if(!a){toast('尚未加载申请单','请回到第 1 步先加载一条 ITSM 申请单。');wzGo(1);return;}
  const pv=wzReadParams();
  const repMods=a.type==='改造'?wzModules.slice():a.equip.map(e=>e.name);
  const isNew=a.type==='新增';
  let modularow='',shotHTML='';
  repMods.forEach((m,k)=>{
    const hc=wzHistForIdx(k,'cpu'),hm=wzHistForIdx(k,'mem'),hd=wzHistForIdx(k,'disk');
    const sc=wzSimCurve(hc,pv.cpu,pv.count,WZ_SLIDER.cpu.max),sm=wzSimCurve(hm,pv.mem,pv.count,WZ_SLIDER.mem.max),sd=wzSimCurve(hd,pv.disk,pv.count,WZ_SLIDER.disk.max);
    const histCell=isNew?'<span style="color:#9098a7;">—</span>':(wzMaxOf(hc)+'% / '+wzMaxOf(hm)+'%');
    modularow+='<tr><td>'+m+'</td><td>'+histCell+'</td><td>'+wzMaxOf(sc)+'% / '+wzMaxOf(sm)+'%</td></tr>';
    shotHTML+='<div class="mod-shot"><div class="ms-title">'+m+' · 仿真结果截图</div><div class="ms-charts">'+
      '<div class="ms-item"><div class="ms-cap">CPU使用率 · 近24小时</div><img src="'+wzChartSnapURL(hc,sc,'hour')+'"></div>'+
      '<div class="ms-item"><div class="ms-cap">内存使用率 · 近24小时</div><img src="'+wzChartSnapURL(hm,sm,'hour')+'"></div>'+
      '<div class="ms-item"><div class="ms-cap">磁盘使用率 · 近一个月</div><img src="'+wzChartSnapURL(hd,sd,'day')+'"></div>'+
      '</div></div>';
  });
  const newNote=isNew?'<div class="r-note" style="margin-top:8px;">注：新增扩容不涉及历史数据，仿真依据通用标准进行仿真。</div>':'';
  const shotSec=shotHTML?('<div class="r-sec">三、模块仿真结果截图</div>'+shotHTML):'';
  const confSec=shotHTML?'<div class="r-sec">四、配置确认</div>':'<div class="r-sec">三、配置确认</div>';
  let confRow='';
  repMods.forEach(m=>{
    const r=wzRecs[m]||{};
    const c=(r.cpu!=null)?r.cpu:pv.cpu;
    const mm=(r.mem!=null)?r.mem:pv.mem;
    const dd=(r.disk!=null)?r.disk:pv.disk;
    const cc=(r.count!=null)?r.count:pv.count;
    const tt=r.type||document.getElementById('pType').value;
    confRow+='<tr><td>'+m+'</td><td>'+tt+'</td><td>'+c+' 核 / '+mm+' GB / '+dd+' GB</td><td>'+cc+' 台</td></tr>';
  });
  d.innerHTML=
    '<h3>容量方案 · 审核报告</h3>'+
    '<div class="r-meta">报告编号：AUDIT-'+a.system+'-0821　|　生成时间：2026/08/12　|　生成人：容量 Agent</div>'+
    '<div class="r-sec">一、申请单信息</div>'+
    '<div class="r-grid">'+
    '<div class="kv"><span class="k">申请单号</span><span class="v">'+wzNo+'</span></div>'+
    '<div class="kv"><span class="k">申请场景</span><span class="v">'+a.scenario+'</span></div>'+
    '<div class="kv full"><span class="k">标题</span><span class="v">'+a.title+'</span></div>'+
    '<div class="kv full"><span class="k">申请原因</span><span class="v">'+a.reason+'</span></div>'+
    '<div class="kv"><span class="k">支撑业务</span><span class="v">'+a.business+'</span></div>'+
    '<div class="kv"><span class="k">系统名称</span><span class="v">'+a.system+'</span></div>'+
    '<div class="kv full"><span class="k">设备清单</span><span class="v">'+wzEquipSummary()+'</span></div>'+
    '</div>'+
    '<div class="r-sec">二、涉及模块（历史数据源）</div>'+
    '<table class="r-table"><tr><th>模块名称</th><th>历史峰值（CPU/内存）</th><th>仿真峰值（CPU/内存）</th></tr>'+modularow+'</table>'+newNote+
    shotSec+confSec+
    '<table class="r-table"><tr><th>组件/模块</th><th>机器类型</th><th>机器规格</th><th>机器数量</th></tr>'+confRow+'</table>'+
    '<div class="r-note">结论：按当前设备清单与历史负载仿真并调整参数后，各组件所需机器规格与数量已确认（见上表），可满足业务需求并预留合理余量。</div>'+
    '<div class="r-sign"><span>申请人：杨帆</span><span>审核人：____________</span><span>审批：____________</span></div>';
}

/* ---------- 向导交互监听 ---------- */
document.addEventListener('click',e=>{
  if(!e.target.closest('#main'))return;
  // 关闭级联面板(向导还在场时)
  if(document.getElementById('appContent')&&!e.target.closest('.cascader')){
    document.querySelectorAll('#appContent .casc-panel').forEach(p=>p.hidden=true);
  }
  if(!document.querySelector('.wz-stepper'))return;
  const step=e.target.closest('.wz-stepper .step');
  if(step){
    const d=parseInt(step.getAttribute('data-step'),10);
    if(d===wzStep)return;
    if(d<wzStep){wzGo(d);return;}
    if(!wzApp){toast('请先完成第 1 步','需要先加载一条 ITSM 申请单才能进入仿真。');return;}
    if(d===2&&wzApp&&wzApp.type==='改造'&&wzModules.length===0){toast('请先选择涉及模块','在设备清单中为每个组件选择涉及模块。');return;}
    wzGo(d);return;
  }
  const modTab=e.target.closest('[data-mod-i]');
  if(modTab){
    wzActiveMod=parseInt(modTab.getAttribute('data-mod-i'),10);
    wzRenderTabs();wzSetupSliders();wzUpdateParamUI();wzRenderSimCharts();
    return;
  }
  const id=e.target.id;
  if(id==='btnLoad'){wzLoadApp();return;}
  if(id==='btnResetApp'){wzResetApp();return;}
  if(id==='btnNext1'){
    if(!wzApp)return;
    if(wzApp.type==='改造'&&wzModules.length===0){toast('请至少选择 1 个涉及模块','多级菜单逐级选到具体实例即可计入。');return;}
    wzGo(2);return;
  }
  if(id==='btnPrev1'){wzGo(1);return;}
  if(id==='btnNext2'){
    if(wzModules.length&&!wzModules.every(m=>!!wzAdopted[m])){
      const left=wzModules.filter(m=>!wzAdopted[m]);
      toast('还有模块未采用方案',left.join('、')+'。请切换到对应模块标签并点击「采用此方案」（标签变蓝 ✓）。');
      return;
    }
    const rb=document.getElementById('riskBox');
    if(rb&&rb.classList.contains('r-high'))toast('高风险提醒','当前为高风险方案，建议增大机器规格或增加机器数量后再归档。');
    wzGo(3);return;
  }
  if(id==='btnPrev2'){wzGo(2);return;}
  if(id==='btnSim'){wzRunSim();return;}
  if(id==='btnSimReset'){
    const r=wzComputeRecParams();
    document.getElementById('pCpu').value=r.cpu;
    document.getElementById('pMem').value=r.mem;
    document.getElementById('pDisk').value=r.disk;
    document.getElementById('pCount').value=r.count;
    wzUpdateParamUI();wzRenderSimCharts();
    toast('已重置为推荐参数','依据该模块历史负载重新给出规格建议。');
    return;
  }
  if(id==='btnAdopt'){wzAdoptCurrent();return;}
  if(id==='btnPrint'){window.print();return;}
  if(id==='btnRestart'){
    if(!confirm('审核通过后方案将归档，并重新开始新的容量方案，确定通过？'))return;
    wzApp=null;wzNo='';wzModules=[];wzAdopted={};wzSimRun={};
    document.getElementById('appSel').value='';
    document.getElementById('appContent').innerHTML='';
    document.getElementById('btnNext1').disabled=true;
    wzGo(1);
    toast('审核通过','方案已归档（演示环境不会触发真实生产变更）。');
    return;
  }
});
document.addEventListener('input',e=>{
  const ids=['pCpu','pMem','pDisk','pCount'];
  if(ids.includes(e.target.id)){
    const cfg=e.target.id==='pCpu'?WZ_SLIDER.cpu:(e.target.id==='pMem'?WZ_SLIDER.mem:(e.target.id==='pDisk'?WZ_SLIDER.disk:WZ_SLIDER.count));
    wzUpdateRail(e.target,e.target.id+'Rail',cfg.min,cfg.max);
    wzUpdateParamUI();wzRenderSimCharts();
  }
});
document.addEventListener('change',e=>{
  if(e.target.id==='pType'&&document.getElementById('step2')){
    wzUpdateParamUI();wzRenderSimCharts();
  }
});

function renderAdmission(){
  main.innerHTML=header('容量准入评估','增量容量准入','AI 提出资源方案，人负责关键决策；静态演示不会提交真实申请',`<button class="btn">历史评估</button><button class="btn acid" data-review>重新评估</button>`)+`
  <section class="admission-layout"><article class="panel"><div class="panel-head"><div><h2>业务资源申请</h2><p>输入业务目标，而不只是申请机器数量</p></div><small>REQ-2026-0812</small></div><div class="form-grid"><div class="field"><label>系统</label><select><option>统一支付系统</option><option>数据中台</option></select></div><div class="field"><label>组件 / 集群</label><select><option>Java 订单服务 / cluster-A</option></select></div><div class="field"><label>申请规格</label><select><option>16C32G</option><option>8C16G</option></select></div><div class="field"><label>申请数量</label><input id="request-count" type="number" value="10" min="1" /></div><div class="field full"><label>业务目标与增长预期</label><textarea rows="4">双十一订单量预计增长 40%，需要保障核心交易链路安全余量。</textarea></div><div class="field full"><button class="btn acid" data-review>让 Capacity Agent 评估</button></div></div></article>
  <aside class="panel review" id="review-result"><span class="review-badge">不建议按原申请执行</span><h2>建议新增 4 台，而不是 10 台</h2><p>Agent 综合了当前容量、90 日趋势、同类组件中位数与 30% 安全余量。原申请会造成明显过度配置。</p><div class="review-facts">${fact('当前规模','20 台')}${fact('近 30 日 CPU P95','61%')}${fact('90 日负载增速','+5.2%')}${fact('活动预计增长','+40%')}${fact('同类安全余量','28%—35%')}</div><div class="recommendation"><strong>建议方案：</strong>新增 4 台 16C32G。扩容后活动期间 CPU P95 预计约 58%，内存 P95 约 63%，风险等级低。</div><div class="brief-actions"><button class="btn acid" data-create-task>接受并生成评估单</button><button class="btn" data-open-agent>继续讨论</button></div></aside></section>`;
}
function fact(label,value){return `<div class="fact"><span>${label}</span><b>${value}</b></div>`}

function renderHome(){
  const sessions=[
    {id:1,title:'工作台 · 今日巡检',time:'刚刚',preview:'Capacity Agent 已完成 14 轮数据采集…',tag:'进行中',active:true},
    {id:2,title:'GreatDB 磁盘增长排查',time:'08:32',preview:'为什么单节点 87.6% 而集群水位稳定?…',tag:'已完成'},
    {id:3,title:'Redis 缩容观察讨论',time:'昨天',preview:'变更后 CPU 峰值 18% → 31%,暂不继续…',tag:'已完成'},
    {id:4,title:'Nginx 节点降配方案',time:'昨天',preview:'先灰度 2 台 16C32G → 8C16G,观察 7 天…',tag:'已审批'},
    {id:5,title:'容量准入 · 双十一评估',time:'08-12',preview:'不建议按原申请 10 台,建议新增 4 台…',tag:'已完成'}
  ];
  state.homeSessions=sessions;
  const quickPrompts=[
    {icon:'◎',title:'发现异常设备',desc:'z-score 离群 · 142 个实例',page:'system'},
    {icon:'∿',title:'对比本周与上周负载',desc:'容量水位变化 · 一键钻取',page:'peer'},
    {icon:'!',title:'解释告警疲劳度',desc:'哪些告警已重复 3 次以上',page:'tasks'},
    {icon:'✓',title:'一行话集群健康',desc:'按重要性级别 P1/P2/P3 汇总',page:'overview'}
  ];
  const followUps=[
    {id:'CAP-1842',title:'GreatDB 磁盘容量风险处置',owner:'陈哲',stage:2},
    {id:'CAP-1839',title:'Redis 低利用实例缩容验证',owner:'王璐',stage:3},
    {id:'CAP-1831',title:'Nginx 节点规格降配',owner:'李琦',stage:1}
  ];
  const events=[
    {time:'09:32',tone:'normal',text:'完成第 14 轮数据采集 · 18 个组件 · 142 个实例'},
    {time:'09:18',tone:'risk',text:'GreatDB 磁盘偏离基线 +18.4% · 预计 6 天触达 90%'},
    {time:'09:10',tone:'follow',text:'Redis 缩容观察第 3/7 天 · CPU 峰值 31% 在安全区间'},
    {time:'09:05',tone:'analysis',text:'合并 142 个实例信号 → 3 条治理建议'},
    {time:'08:18',tone:'normal',text:'CAP-1842 评审状态轮询 · 等待陈哲回复'},
    {time:'08:07',tone:'risk',text:'GreatDB 单节点 87.6% 与集群均值差异显著'},
    {time:'08:00',tone:'normal',text:'今日巡检开始 · 取数完成 · 进入分析'}
  ];
  state.homeFollowUps=followUps;
  state.homeEvents=events;
  const stageLabel=['发现','建议','审批','观察','验证'];
  const session=sessions[0];
  main.innerHTML=`
  <section class="home-status">
    <span class="home-status-chip live"><span class="home-dot live-dot"></span><b>4 / 4</b> 系统在线</span>
    <span class="home-status-chip warn"><span class="home-dot"></span><b>6</b> 待处理告警</span>
    <span class="home-status-chip"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v10H7l-3 3z"/></svg><b>14</b> 本周会话</span>
    <span class="home-status-chip"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19l4-10 4 6 4-8 2 12"/></svg><b>653.7k</b> tokens 今日</span>
  </section>
  <section class="home-shell home-shell-narrow">
    <section class="home-chat panel">
      <div class="panel-head"><div><h2>${session.title}</h2><p>让 Capacity Agent 帮你看数据、出方案、改计划。所有生产变更仍由你审批。</p></div>
        <div class="home-triggers">
          <button class="home-trigger" data-open-inspect><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg><span>今日巡检</span><em>3</em></button>
          <button class="home-trigger" data-open-events><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span>工作事件</span><em>7</em></button>
        </div>
      </div>
      <div class="home-chat-body">
        <div class="home-msg user"><div class="home-msg-bubble"><b>杨帆</b><small>刚刚</small><p>让我看看今天集群有没有什么异常。</p></div><div class="home-avatar">杨</div></div>
        <div class="home-msg agent"><div class="home-avatar agent"><span class="agent-eye"></span></div><div class="home-msg-bubble"><b>Capacity Agent</b><small>${new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})} · 第 14 轮</small><p>好的,我已对 <strong>4 个系统、18 个组件、142 个实例</strong>做完完整性检查。今天有 3 条值得你注意:</p><ul><li><b>P1 · GreatDB</b>:单节点磁盘 87.6%,6 天后触达 90%,节点差值 49.6%。建议先修归档,再评估增加 2 个节点。</li><li><b>P2 · 风控</b>:CPU 30 日持续增长,批处理窗口叠加;建议错峰并观察 7 天。</li><li><b>P3 · 渠道 Nginx</b>:规格高于同类中位数 2.1×,可灰度 2 台由 16C32G 降至 8C16G。</li></ul><p>需要我把 P1 整理成治理评估单,或继续追问任一条吗?</p></div></div>
      </div>
      <div class="home-quickgrid">${quickPrompts.map(p=>`<button class="home-quick" data-page="${p.page}"><span class="home-quick-icon">${p.icon}</span><div><b>${p.title}</b><small>${p.desc}</small></div></button>`).join('')}</div>
      <form class="home-composer" id="home-composer">
        <textarea rows="2" placeholder="Start anywhere… 按 ⌘+↵ 发送 / 单纯 ↵ 换行"></textarea>
        <div class="home-composer-foot"><span><span class="home-dot live-dot"></span> claude-sonnet-4-6</span><button type="button" class="btn acid">发送</button></div>
      </form>
    </section>
  </section>`;
}

function openHomeInspect(){
  const followups=state.homeFollowUps||[];
  const events=state.homeEvents||[];
  const stageLabel=['发现','建议','审批','观察','验证'];
  const modal=document.querySelector('#inspect-modal');
  const content=document.querySelector('#inspect-content');
  content.innerHTML=`
    <p class="kicker">今日巡检 · 容量概览</p>
    <h2 style="font:600 22px var(--display);margin:6px 0 12px">今日巡检 · Capacity Agent 当前跟进</h2>
    <p style="color:var(--muted);font-size:11px;line-height:1.7;margin:0 0 16px">所有生产变更仍由你审批。下表展示 Agent 正在持续跟进的任务,任何一行点击都能进入治理闭环页查看完整证据。</p>
    <section class="home-followups">${followups.map(t=>`<div class="home-followup"><div><b>${t.title}</b><small>${t.id} · ${t.owner}</small></div><span class="work-status">${stageLabel[t.stage]||'处理中'}</span></div>`).join('') || '<div class="empty-note">暂无跟进任务</div>'}</section>
    <p class="kicker" style="margin-top:20px">状态快照</p>
    <div class="home-snapshot">
      <div><span>系统在线</span><b class="live">4 / 4</b></div>
      <div><span>待处理告警</span><b class="warn">6</b></div>
      <div><span>本周会话</span><b>14</b></div>
      <div><span>tokens 今日</span><b>653.7k</b></div>
    </div>`;
  // 先关闭其他 overlay,再打开自己
  closeOverlays();
  modal.classList.add('open');
  modal.removeAttribute('inert');
  modal.setAttribute('aria-hidden','false');
  if(scrim)scrim.hidden=false;
}

function openHomeEvents(){
  const events=state.homeEvents||[];
  const modal=document.querySelector('#events-modal');
  const content=document.querySelector('#events-content');
  content.innerHTML=`
    <p class="kicker">工作事件流</p>
    <h2 style="font:600 22px var(--display);margin:6px 0 12px">Agent 工作事件流</h2>
    <p style="color:var(--muted);font-size:11px;line-height:1.7;margin:0 0 16px">这是 Capacity Agent 后台真实推进的进度(非动画)。每条事件表示一次取数 / 分析 / 跟进 / 验证动作。</p>
    <div class="home-events home-events-modal">${events.map(e=>`<div class="home-event"><span class="home-event-time">${e.time}</span><div class="home-event-dot ${e.tone}"></div><p>${e.text}</p></div>`).join('') || '<div class="empty-note">暂无事件</div>'}</div>`;
  closeOverlays();
  modal.classList.add('open');
  modal.removeAttribute('inert');
  modal.setAttribute('aria-hidden','false');
  if(scrim)scrim.hidden=false;
}

function renderKnowledge(){
  const kbStages=[
    {key:'risk',name:'异常发现',count:71,active:true},
    {key:'suggest',name:'处置建议',count:12},
    {key:'admit',name:'容量准入',count:5},
    {key:'verify',name:'效果验证',count:8}
  ];
  const stageLabel={risk:'发现异常',suggest:'生成建议',verify:'观察验证',admit:'容量准入'};
  const stageClass={risk:'risk',suggest:'suggest',verify:'verify',admit:'admit'};
  const knowledge=[
    {title:'负载均衡健康检查抖动 / 后端节点被踢出',stages:['suggest'],count:23,path:'diagnostics/load-balancer-health-flapping.md'},
    {title:'DNS 解析失败与解析缓慢',stages:['risk'],count:14,path:'diagnostics/dns-resolution-failure.md'},
    {title:'文件句柄耗尽（Too Many Open Files）',stages:['risk','suggest'],count:9,path:'diagnostics/fd-exhaustion.md'},
    {title:'进程 / 容器被 OOM Killer 终止',stages:['risk'],count:31,path:'diagnostics/oom-killed.md'},
    {title:'Kubernetes 节点 NotReady',stages:['risk'],count:12,path:'diagnostics/k8s-node-notready.md'},
    {title:'Tempo 链路缺失 / 追踪断链',stages:['risk','verify'],count:7,path:'diagnostics/tempo-missing-spans.md'},
    {title:'HTTP 5xx 错误率突增',stages:['risk'],count:41,path:'diagnostics/error-rate-5xx.md'},
    {title:'非对称路由与 rp_filter 丢包',stages:['risk','suggest'],count:6,path:'diagnostics/asymmetric-routing-rpfilter.md'},
    {title:'IRQ 亲和性失衡（中断被钉在单核）',stages:['risk'],count:4,path:'diagnostics/irq-affinity-imbalance.md'},
    {title:'NFS 卡死与陈旧文件句柄',stages:['risk'],count:5,path:'diagnostics/nfs-stale-handle.md'},
    {title:'K8s Pod 卡在 Pending / CrashLoopBackOff',stages:['risk','suggest'],count:18,path:'diagnostics/k8s-pod-stuck.md'},
    {title:'页缓存压力与回收停顿',stages:['risk','verify'],count:11,path:'diagnostics/page-cache-pressure.md'}
  ];
  main.innerHTML=`
  <section class="kb-layout">
    <aside class="kb-tree panel">
      <div class="panel-head"><div><h2>治理知识</h2><p>按治理闭环阶段分类</p></div></div>
      <div class="kb-tree-body">
        <div class="kb-section">
          <div class="kb-section-head"><span class="kb-folder">治理知识</span><i aria-hidden="true">▾</i></div>
          <div class="kb-section-items">
            ${kbStages.map(s=>`<div class="kb-item ${s.active?'active':''}"><span class="kb-chev">·</span><span>${s.name}</span><em>${s.count}</em></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="kb-tree-footer">本周被引用 <b>217</b> 次 · 命中 <b>31</b> 个治理任务</div>
    </aside>
    <section class="kb-list panel">
      <div class="panel-head"><div><h2>诊断手册</h2><p>已发布的诊断手册、异常规则与处置经验 · 是 Agent 在治理闭环中的判断依据</p></div></div>
      <div class="kb-meta-impact"><span>已发布 <b>96</b> 条</span><i></i><span>本周被 Agent 引用 <b class="kb-meta-ref">217</b> 次</span><i></i><span>命中 <b class="kb-meta-hit">31</b> 个治理任务</span></div>
      <div class="kb-search kb-search-bar"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.5-3.5"/></svg><input placeholder="搜索「诊断」(与 query_knowledge 工具同源)" /><button class="btn small">Search</button></div>
      <div class="kb-cards">${knowledge.map(k=>`<article class="kb-card">
        <div class="kb-card-head">
          <div class="kb-card-main">
            <h3>${k.title}</h3>
            <div class="kb-card-tags">${k.stages.map(s=>`<span class="kb-tag kb-tag-stage ${stageClass[s]}">${stageLabel[s]}</span>`).join('')}</div>
          </div>
          <span class="kb-ref-count" title="本周被 Agent 引用次数">× ${k.count}</span>
        </div>
        <div class="kb-card-path">${k.path}</div>
      </article>`).join('')}</div>
    </section>
  </section>`;
}

function renderTasks(){
  main.innerHTML=`
  <section class="panel governance-table-panel"><div class="panel-head"><div><h2>正在治理的事项</h2><p>按工单号、治理任务、当前状态、变更单和 Agent 跟进动作查看</p></div><small>3 ACTIVE</small></div><div class="governance-table-wrap"><table class="governance-table"><thead><tr><th>工单号</th><th>治理任务</th><th>负责人</th><th>当前状态</th><th>变更单号</th><th>变更状态</th><th>治理阶段</th><th>操作</th></tr></thead><tbody>${tasks.map(taskRow).join('')}</tbody></table></div></section>
  <section class="panel verification task-verification"><p class="kicker">效果验证 · CAP-1839</p><h2>Redis 缩容观察 · 第 3/7 天</h2><p style="color:var(--muted);font-size:11px">Agent 每天取数后自动比较变更前基线与变更后水位，并决定继续观察、回滚或进入下一步。</p><div class="verify-hero"><div class="verify-card"><span>变更前 CPU 峰值</span><strong>18%</strong></div><div class="verify-card"><span>变更后 CPU 峰值</span><strong class="verify-good">31%</strong></div><div class="verify-card"><span>内存峰值变化</span><strong class="verify-good">23% → 36%</strong></div><div class="verify-card"><span>异常 / 告警</span><strong class="verify-good">0 / 0</strong></div></div><div class="decision"><b>Agent 当前结论</b><p>效果符合预期，暂不继续缩容。待观察满 7 天且覆盖周末批处理窗口后，再评估由 5 台缩至 4 台。</p></div></section>`;
}
function taskRow(t){const stages=['发现','建议','审批','观察','验证'];return `<tr><td><span class="ticket-no">${t.id}</span></td><td><span class="task-title"><b>${t.title}</b></span></td><td>${t.owner}</td><td><span class="status-pill">${t.status}</span></td><td>${t.workOrder?`<span class="work-order-no">${t.workOrder}</span>`:'<span class="empty-cell"></span>'}</td><td>${t.workOrder?`<span class="work-status ${t.workStatus==='实施完成'?'done':''}">${t.workStatus}</span>`:`<button class="btn small" data-create-workorder="${t.id}">去提单</button>`}</td><td><span class="stage-badge">${stages[t.stage]||'处理中'}</span></td><td><span class="table-actions"><button class="btn small" ${t.id==='CAP-1839'?'data-verify':''}>${t.action}</button><button class="btn small" data-open-followup="${t.id}">查看Agent跟进记录</button></span></td></tr>`}

function renderWorkline(){
  const job=activeWorkJob();
  workline.innerHTML=`
    <div class="work-core"><span class="work-orbit"><i></i></span><div><span>Capacity Agent · 自主运行中</span><b>${job.phase}</b></div></div>
    <div class="work-target"><span>当前对象</span><b>${job.scope}</b><small>${job.target}</small></div>
    <div class="work-signal"><span>实时上下文</span><b>${job.signal}</b></div>
    <div class="work-progress-block"><div><span>${job.kind}</span><b>${state.progress}%</b></div><span class="work-progress"><i style="width:${state.progress}%"></i></span></div>
    <div class="work-stats"><span><b>14</b> 轮</span><span><b>142</b> 实例</span><span><b>3</b> 建议</span></div>
    <button class="work-detail" data-open-agent>观察工作现场 →</button>`;
  const mini=document.querySelector('#agent-mini-status');
  const pet=document.querySelector('#agent-float');
  mini.textContent=`${job.phase} · ${state.progress}%`;
  if(pet.classList.contains('collapsed'))return;
  if(pet._lastPhase===job.phase)return;
  pet._lastPhase=job.phase;
  pet.classList.remove('speaking');
  void pet.offsetWidth;
  pet.classList.add('speaking');
  clearTimeout(pet._talkTimer);
  pet._talkTimer=setTimeout(()=>pet.classList.remove('speaking'),5200);
}
function activeWorkJob(){
  if(state.page==='simulate'&&wzApp){
    const stage=wzStep===3?'生成审核报告':(wzStep===2?'仿真参数调整':'申请单解析');
    return {phase:'容量方案 · '+stage,scope:wzApp.system+' / 方案模拟',target:wzNo,kind:'方案模拟',signal:(wzModules.length?wzModules.join(' / '):'未选择模块')+' · '+(Object.keys(wzAdopted).length)+'/'+(wzModules.length||0)+' 模块已采用',next:wzStep===3?'生成审核报告':'调整参数并仿真'};
  }
  return autonomousJobs[state.work%autonomousJobs.length];
}

function renderDrawer(){
  document.querySelectorAll('[data-agent-tab]').forEach(b=>b.classList.toggle('active',b.dataset.agentTab===state.agentTab));
  const form=document.querySelector('.agent-form');
  if(form) form.hidden=state.agentTab!=='log';
  if(state.agentTab==='log') drawerContent.innerHTML=renderCollabLog();
  if(state.agentTab==='plan') drawerContent.innerHTML=`<p class="kicker">今日工作计划</p><div class="plan-timeline">${planItem({time:'08:00',status:'done',title:'三个接口取数与完整性检查',desc:'已完成 3 系统 / 142 实例',progress:100})}${planItem({time:'进行中',status:'doing',title:'GreatDB 容量风险复核',desc:'动态基线 + 集群归因',progress:47})}${planItem({time:'随后',status:'next',title:'同类组件资源效率扫描',desc:'12 个可比集群',progress:0})}${planItem({time:'14:00',status:'next',title:'生成容量准入评估摘要',desc:'2 项待人工决策',progress:0})}${planItem({time:'持续',status:'ongoing',title:'轮询治理任务与效果验证',desc:'CAP-1842 / CAP-1839',progress:0})}</div>`;
}
function renderCollabLog(){
  const job=autonomousJobs[state.work%autonomousJobs.length];
  const activeIndex=state.work%collabRecords.length;
  const agentRecords=collabRecords.map((item,i)=>({
    time:item.time,kind:item.type,status:item.status,title:item.title,body:item.body,facts:item.facts,role:'agent',i,active:i===activeIndex
  }));
  const userRecords=messages.filter(m=>m.tone==='user').map((m,i)=>({
    time:m.time,kind:'user',status:'已接收',title:m.title,body:m.body,role:'user',i:collabRecords.length+i
  }));
  // 在 agent 列表里穿插一条 user 记录,模拟「我和 agent 共事」的来回感
  const merged=[];
  const insertAt=[1,3,5];
  agentRecords.forEach((rec,idx)=>{
    merged.push(rec);
    if(insertAt.includes(idx)){
      const ur=userRecords.shift();
      if(ur) merged.push(ur);
    }
  });
  while(userRecords.length) merged.push(userRecords.shift());
  return `<section class="collab-workbench">
    <div class="collab-date"><span>2026-08-12 · 今日共事记录</span></div>
    <div class="collab-shift">
      <div class="shift-main"><span class="shift-avatar">CA</span><div><small>当前正在做</small><strong>${job.phase}</strong><p>${job.scope} · ${job.target}</p></div></div>
      <div class="shift-card"><small>任务类型</small><b>${job.kind}</b><p>${job.next}</p></div>
      <div class="shift-card"><small>实时进度</small><b>${state.progress}%</b><span class="shift-track"><i style="width:${state.progress}%"></i></span></div>
    </div>
    <div class="collab-stream">
      ${merged.map((m,i)=>collabBubbleHTML(m,i)).join('')}
    </div>
    <div class="agent-thinking live">
      <span class="msg-avatar">CA</span>
      <div><i></i><i></i><i></i><small>正在把新的分析结果写入共事记录…</small></div>
    </div>
  </section>`;
}
function collabBubbleHTML(m,i){
  const user=m.role==='user';
  const tone=m.kind||'';
  return `<article class="message ${user?'user':''} ${tone}" style="--i:${i}">
    <span class="msg-avatar">${user?'YOU':'CA'}</span>
    <div class="message-body">
      <small>${m.time} · ${m.status}</small>
      <h3>${m.title}</h3>
      <p>${m.body}</p>
      ${m.facts?`<div class="record-facts">${m.facts.map(x=>`<em>${x}</em>`).join('')}</div>`:''}
      ${!user && m.kind==='risk'?'<div class="message-actions"><button class="btn small" data-page="system">查看趋势证据</button><button class="btn small" data-open-evidence>判断过程</button></div>':''}
    </div>
  </article>`;
}
function messageHTML(m,i){const user=m.tone==='user';return `<article class="message ${user?'user':''}"><span class="msg-avatar">${user?'YOU':'CA'}</span><div class="message-body"><small>${m.time} · ${m.tone.toUpperCase()}</small><h3>${m.title}</h3><p>${m.body}</p>${i===1?'<div class="message-actions"><button class="btn small" data-page="system">查看趋势证据</button><button class="btn small" data-open-evidence>判断过程</button></div>':''}</div></article>`}
function planItem(o){return `<div class="plan-row ${o.status}" style="--p:${o.progress||0}">
  <div class="plan-time">${o.time}</div>
  <div class="plan-node"></div>
  <div class="plan-card">
    <div class="plan-card-head"><span class="plan-status">${statusLabel(o.status)}</span><b>${o.title}</b></div>
    <p>${o.desc}</p>
    <div class="plan-bar"><i style="width:${o.progress||0}%"></i></div>
  </div>
</div>`}
function statusLabel(s){return {done:'已完成',doing:'进行中',next:'待完成',ongoing:'持续跟进'}[s]||s}

function openAgent(){state.agentOpen=true;drawer.classList.add('open');drawer.removeAttribute('inert');drawer.setAttribute('aria-hidden','false');scrim.hidden=false;renderDrawer()}
function closeOverlays(){
  state.agentOpen=false;
  if(drawer){drawer.classList.remove('open');drawer.setAttribute('inert','');drawer.setAttribute('aria-hidden','true')}
  if(modal){modal.classList.remove('open');modal.setAttribute('inert','');modal.setAttribute('aria-hidden','true')}
  const inspect=document.querySelector('#inspect-modal');
  const events=document.querySelector('#events-modal');
  if(inspect){inspect.classList.remove('open');inspect.setAttribute('inert','');inspect.setAttribute('aria-hidden','true')}
  if(events){events.classList.remove('open');events.setAttribute('inert','');events.setAttribute('aria-hidden','true')}
  if(scrim)scrim.hidden=true;
}
function openEvidence(){modalCard.classList.remove('followup-card');modalContent.innerHTML=`<div class="evidence-head"><small>本次结论如何得出</small><h2>这不是一句"AI 觉得有风险"</h2><p>Capacity Agent 把计算、判断与行动分开呈现，SRE 可以检查每一层证据。</p></div><div class="evidence-steps"><div class="evidence-step"><span>第一步 · 算法算</span><h3>算法负责算</h3><p>关联 30 日历史，计算动态基线、7 日斜率、节点极差和预计触达阈值时间。</p></div><div class="evidence-step"><span>第二步 · AI 判断</span><h3>AI 负责判断</h3><p>结合主备角色、系统等级和治理规则，判断是整体不足、单节点异常还是负载倾斜。</p></div><div class="evidence-step"><span>第三步 · Agent 做</span><h3>Agent 负责做</h3><p>生成建议、等待关键审批、创建 JIRA、轮询状态并验证变更后的容量效果。</p></div></div><div class="explain" style="margin-top:18px"><strong>本次结论：</strong>GreatDB 风险置信度 91%。证据包括峰值 87.6%、偏离基线 18.4%、连续 7 日增长和节点极差 49.6%。</div>`;modal.classList.add('open');modal.removeAttribute('inert');modal.setAttribute('aria-hidden','false');scrim.hidden=false}
function openFollowup(taskId){
  const task=tasks.find(t=>t.id===taskId)||tasks[1];
  const events=[
    ['08-09 22:00 · 已缩减 1 个节点','JIRA 变更完成，Agent 自动进入观察期。'],
    ['08-10 08:15 · 首日验证正常','CPU P95 29%，无新增告警。'],
    ['今天 08:20 · 第三日验证正常','业务流量较基线 +7%，容量水位仍安全。'],
    ['下一步 · 08-16 自动复核','覆盖完整观察窗口后生成最终结论。']
  ];
  modalCard.classList.add('followup-card');
  modalContent.innerHTML=`<div class="follow-dialog"><header class="follow-hero"><div><small>Agent 跟进 · ${task.id}</small><h2>${task.title}</h2><p>${task.workOrder?`Agent 正在跟进 ${task.workOrder}，当前变更状态为 ${task.workStatus}。`:'当前治理任务尚未提单，Agent 会在提单后继续自动轮询状态。'}</p></div><span class="follow-status ${task.workStatus==='实施完成'?'done':''}">${task.workStatus||'待提单'}</span></header><div class="follow-summary"><div><span>治理工单</span><b>${task.id}</b></div><div><span>变更单</span><b>${task.workOrder||'尚未创建'}</b></div><div><span>当前阶段</span><b>${task.status}</b></div></div><div class="dialog-timeline">${events.map(([title,body],i)=>`<div class="timeline-item" style="--i:${i}"><span class="timeline-dot">${String(i+1).padStart(2,'0')}</span><div><b>${title}</b><p>${body}</p></div></div>`).join('')}</div></div>`;
  modal.classList.add('open');modal.removeAttribute('inert');modal.setAttribute('aria-hidden','false');scrim.hidden=false;
}
function toast(title,body){const el=document.createElement('div');el.className='toast';el.innerHTML=`<b>${title}</b><span>${body}</span>`;document.querySelector('#toasts').append(el);setTimeout(()=>el.remove(),3800)}

document.addEventListener('click',e=>{
  const page=e.target.closest('[data-page]');if(page){if(page.dataset.systemId)state.selectedSystemId=page.dataset.systemId;state.page=page.dataset.page;closeOverlays();render();renderWorkline();return}
  const collapseBtn=e.target.closest('[data-agent-collapse]');
  if(collapseBtn){
    e.stopPropagation();
    const pet=document.querySelector('#agent-float');
    pet.classList.add('collapsed');
    try{localStorage.setItem('cap-agent-collapsed','1')}catch(_){}
    toast('机器人已收起','点击右下角 CA 圆钮可随时恢复完整机器人。');
    return;
  }
  if(e.target.closest('[data-open-agent]')){
    const pet=document.querySelector('#agent-float');
    if(pet.classList.contains('collapsed')){pet.classList.remove('collapsed');try{localStorage.removeItem('cap-agent-collapsed')}catch(_){}return}
    openAgent();return;
  }
  if(e.target.closest('[data-close-agent]')||e.target.closest('[data-close-modal]')||e.target.closest('[data-close-inspect]')||e.target.closest('[data-close-events]')||e.target===scrim){closeOverlays();return}
  if(e.target.closest('[data-open-evidence]')){openEvidence();return}
  if(e.target.closest('[data-open-inspect]')){openHomeInspect();return}
  if(e.target.closest('[data-open-events]')){openHomeEvents();return}
  const session=e.target.closest('[data-session]');if(session){document.querySelectorAll('.side-session').forEach(b=>b.classList.toggle('current',b===session));toast('会话已切换',`已加载「${session.querySelector('.side-session-body b').textContent}」的历史上下文`);return}
  const toggle=e.target.closest('#side-session-toggle');if(toggle){
    const isOpen=toggle.classList.toggle('open');
    const allSessions=[...document.querySelectorAll('.side-session')];
    const extras=allSessions.slice(3);
    extras.forEach(b=>b.hidden=!isOpen);
    toggle.textContent=isOpen?`Hide ${extras.length} more`:`Show ${extras.length} more`;
    return;
  }
  const follow=e.target.closest('[data-open-followup]');if(follow){openFollowup(follow.dataset.openFollowup);return}
  const tab=e.target.closest('[data-agent-tab]');if(tab){state.agentTab=tab.dataset.agentTab;renderDrawer();return}
  const prompt=e.target.closest('[data-prompt]');if(prompt){agentInput.value=prompt.dataset.prompt;agentInput.focus();return}
  if(e.target.closest('[data-create-task]')){toast('已生成静态演示任务','CAP-1848 已进入"待 SRE 审批"，不会触发真实生产变更。');return}
  if(e.target.closest('[data-create-workorder]')){toast('已准备治理工单','演示环境不会真实提单，请在生产流程中完成变更单创建。');return}
  if(e.target.closest('[data-review]')){toast('Capacity Agent 已完成评估','已结合历史趋势、同类对标与安全余量，建议新增 4 台。');return}
  if(e.target.closest('[data-verify]')){toast('效果验证正常','Redis 缩容后连续 3 天处于安全水位，将继续观察至第 7 天。');return}
});

document.addEventListener('input',e=>{
  if(e.target.id==='system-select'){state.selectedSystemId=e.target.value;render()}
});

document.addEventListener('change',e=>{
  if(e.target.id==='system-select'){state.selectedSystemId=e.target.value;render()}
});
document.querySelector('#agent-form').addEventListener('submit',e=>{e.preventDefault();const text=agentInput.value.trim();if(!text)return;messages.push({time:'刚刚',title:'收到，我已经调整工作上下文',body:`你的要求"${text}"已进入当前计划。我会先验证相关数据和安全约束，再主动汇报结论。`,tone:'user'});agentInput.value='';state.agentTab='log';renderDrawer();drawerContent.scrollTop=drawerContent.scrollHeight;toast('分析方向已更新','Agent 会继续自主工作，并在有结论时主动通知你。')});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeOverlays()});

render();renderWorkline();
try{if(localStorage.getItem('cap-agent-collapsed')==='1')document.querySelector('#agent-float')?.classList.add('collapsed')}catch(_){}
setInterval(()=>{state.progress+=7;if(state.progress>100){state.progress=12;state.work++;if(state.work%2===0)toast('Capacity Agent 主动更新','完成一项容量分析，新的治理结论已写入工作记录。')}renderWorkline();if(state.agentOpen&&state.agentTab==='log')renderDrawer()},2400);
setTimeout(()=>toast('今日容量巡检已完成','Agent 正在持续跟进 3 项治理任务，无需人工触发。'),800);
