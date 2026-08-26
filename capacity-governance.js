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
  {time:'08:18',title:'我把服务器信号合并成了集群结论',body:'GreatDB 不是集群整体容量不足，而是节点负载倾斜并叠加单节点磁盘增长。建议先校验归档策略，再评估增加 2 个节点。',tone:'analysis'},
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
  {time:'08:18',type:'analysis',status:'已归因',title:'将服务器信号合并成集群结论',body:'结论不是“全量扩容”，而是先检查归档策略和节点权重；若 3 天后增速未回落，再增加 2 个节点并重平衡。',facts:['负载倾斜','先治理','后扩容']},
  {time:'08:42',type:'action',status:'待评审',title:'生成治理任务 CAP-1842',body:'治理建议已写入任务列表，变更单 ACT-CHUG-20260826-0002 处于评审中，Agent 会持续轮询状态。',facts:['CAP-1842','变更评审','陈哲']},
  {time:'09:10',type:'follow',status:'观察中',title:'Redis 缩容进入效果观察',body:'缩减 1 个节点后，CPU 峰值由 18% 升至 31%，仍处于安全区间；需覆盖完整 7 天和周末批处理窗口。',facts:['18% → 31%','0 告警','第 3/7 天']}
];

const state={page:'home',selectedSystemId:'payment',agentOpen:false,agentTab:'log',work:0,progress:36,simNodes:5,simLoad:20,simKind:'shrink'};
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
    {label:'AGENT',items:[['home','首页',icons.home,''],['overview','治理总览',icons.overview,'']]},
    {label:'KNOWLEDGE',items:[['knowledge','知识库',icons.knowledge,''],['peer','同类对标',icons.peer,'']]},
    {label:'DEVICES',items:[['system','系统洞察',icons.system,'3'],['admission','容量准入',icons.admission,'']]},
    {label:'OBSERVABILITY',items:[['simulate','方案模拟',icons.simulate,''],['tasks','治理闭环',icons.tasks,'3']]}
  ];
  return groups.map(g=>`<div class="nav-group"><div class="nav-label">${g.label}</div>${g.items.map(([id,label,icon,count])=>`<button class="nav-item ${state.page===id?'active':''}" data-page="${id}">${icon}<span>${label}</span>${count?`<em>${count}</em>`:''}</button>`).join('')}</div>`).join('');
}

function header(kicker,title,subtitle,actions=''){
  return `<section class="page-toolbar"><div><span>${kicker}</span><strong>${title}</strong><small>${subtitle}</small></div><div class="toolbar-actions">${actions}</div></section>`;
}

function render(){
  nav.innerHTML=navHTML();
  const names={home:'首页 · 与 Capacity Agent 对话',overview:'我的容量治理',system:'统一支付系统 / 系统洞察',peer:'同类系统 / 资源对标',simulate:'容量方案 / What-if 模拟',admission:'增量资源 / 容量准入',knowledge:'容量治理 / 知识库',tasks:'治理任务 / 效果验证'};
  crumb.textContent=names[state.page];
  ({home:renderHome,overview:renderOverview,system:renderSystem,peer:renderPeer,simulate:renderSimulator,admission:renderAdmission,knowledge:renderKnowledge,tasks:renderTasks}[state.page]||renderHome)();
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
  <aside class="panel"><div class="panel-head"><div><h2>集群节点分布</h2><p>识别整体不足、单节点异常或负载倾斜</p></div><small>${detail.spread}</small></div><div class="distribution">${detail.nodes.map(([host,value,color])=>`<div class="node-row"><label>${host}</label><span class="node-bar"><i style="--value:${value}%;--bar:${color}"></i></span><b>${value}%</b></div>`).join('')}</div><div class="cause-card"><small>CLUSTER-LEVEL ATTRIBUTION</small><h3>${detail.cause}</h3><p>${detail.body}</p><div class="decision"><b>建议方案</b><p>${detail.decision}</p></div></div></aside></section>`;
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
  main.innerHTML=header('PEER BENCHMARK','同类系统对标','用同类组件的真实资源画像回答“为什么别人 6 台，而你需要 10 台”',`<button class="btn">选择对标样本</button><button class="btn acid" data-open-agent>询问 Agent</button>`)+`
  <section class="peer-layout"><article class="panel"><div class="panel-head"><div><h2>Java 核心交易组件对标组</h2><p>相同业务等级、架构类型与日均交易量区间</p></div><small>12 个可比集群</small></div><table class="peer-table"><thead><tr><th>集群</th><th>规模</th><th>CPU P95</th><th>内存 P95</th><th>安全余量</th><th>判断</th></tr></thead><tbody>
    <tr><td>订单服务 / cluster-A</td><td>8C16G × 6</td><td>58%</td><td>63%</td><td>31%</td><td>合理</td></tr><tr><td>清结算 / cluster-B</td><td>8C16G × 8</td><td>61%</td><td>59%</td><td>29%</td><td>合理</td></tr><tr class="current"><td><strong>渠道接入 / cluster-C</strong></td><td><strong>16C32G × 10</strong></td><td>22%</td><td>31%</td><td>66%</td><td><strong>过度配置</strong></td></tr><tr><td>营销服务 / cluster-D</td><td>8C16G × 6</td><td>54%</td><td>57%</td><td>34%</td><td>合理</td></tr><tr><td>账户查询 / cluster-E</td><td>8C16G × 8</td><td>49%</td><td>62%</td><td>32%</td><td>合理</td></tr>
  </tbody></table></article><aside class="panel rank-card"><p class="kicker">PEER POSITION</p><span class="big">2.1×</span><h2>资源规模高于同类中位数</h2><p>在交易量和可用性等级相近的 12 个集群中，渠道接入 cluster-C 的 CPU 与内存配置均位于最高 10%，但利用率处于最低 15%。</p><div class="benchmark-bars">${bench('资源规模','92%','var(--amber)')}${bench('业务负载','44%','var(--cyan)')}${bench('资源效率','21%','var(--red)')}</div><div class="decision"><b>Agent 建议</b><p>先将单节点规格由 16C32G 降至 8C16G，灰度 2 台并观察 7 天，预计每月节约 ¥12.4k。</p></div></aside></section>`;
}
function bench(label,value,color){return `<div class="bench"><div class="bench-head"><span>${label}</span><b>${value}</b></div><div class="bench-track"><i style="--value:${value};--color:${color}"></i></div></div>`}

function renderSimulator(){
  const newNodes=state.simNodes, current=6, shrink=newNodes<current, cpu=Math.round(18*current/newNodes), mem=Math.round(23*current/newNodes), saving=(current-newNodes)*2150;
  main.innerHTML=header('WHAT-IF LAB','扩缩容方案模拟','在创建治理任务前，先看到容量水位、余量、成本和风险如何变化',`<button class="btn" data-reset-sim>重置方案</button><button class="btn acid" data-create-task>采用此方案</button>`)+`
  <section class="sim-layout"><article class="panel controls"><p class="kicker">SCENARIO CONTROLS</p><div class="control"><label><span>分析对象</span><b>统一支付 / Redis 集群</b></label><div class="choice-row"><button class="choice active">Redis</button><button class="choice">GreatDB</button><button class="choice">Java 应用</button></div></div><div class="control"><label><span>目标节点数</span><b id="node-value">${newNodes} 台</b></label><input id="node-range" type="range" min="3" max="10" value="${newNodes}" /></div><div class="control"><label><span>预估业务增长</span><b id="load-value">+${state.simLoad}%</b></label><input id="load-range" type="range" min="0" max="80" step="5" value="${state.simLoad}" /></div><div class="control"><label><span>节点规格</span><b>8C / 32GB</b></label><div class="choice-row"><button class="choice">4C16G</button><button class="choice active">8C32G</button><button class="choice">16C64G</button></div></div><div class="guardrail">安全约束：核心系统至少保留 4 个节点；缩容后 CPU P95 不高于 65%，内存 P95 不高于 70%；任何方案都需要人工审批。</div></article>
  <aside class="panel sim-result"><p class="kicker">SIMULATION RESULT</p><h2>${shrink?'建议渐进缩容':'扩容后容量充足'}</h2><div class="before-after"><div class="state-card"><small>当前</small><strong>6 台</strong><span>CPU 18% · MEM 23%</span></div><div class="arrow">→</div><div class="state-card"><small>方案</small><strong>${newNodes} 台</strong><span>CPU ${cpu}% · MEM ${mem}%</span></div></div><div class="forecast"><div><span>业务增长后 CPU</span><b>${Math.round(cpu*(1+state.simLoad/100))}%</b></div><div><span>安全余量</span><b>${Math.max(0,100-Math.round(cpu*(1+state.simLoad/100))-25)}%</b></div><div><span>${saving>=0?'月度节约':'月度新增'}</span><b>¥${Math.abs(saving).toLocaleString()}</b></div></div><div class="decision"><b>置信度 88%</b><p>${shrink?`建议先从 6 台缩至 ${Math.max(5,newNodes)} 台，观察 7 天后再决定是否继续。即便业务增长 ${state.simLoad}%，预测水位仍在安全区间。`:`新增节点后短期容量风险较低，但相对同类集群存在资源冗余。`}</p></div><button class="btn acid" style="width:100%;margin-top:17px" data-create-task>生成治理评估单</button></aside></section>`;
}

function renderAdmission(){
  main.innerHTML=header('AI CAPACITY REVIEWER','增量容量准入','AI 提出资源方案，人负责关键决策；静态演示不会提交真实申请',`<button class="btn">历史评估</button><button class="btn acid" data-review>重新评估</button>`)+`
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
    <p class="kicker">TODAY · CAPACITY INSPECT</p>
    <h2 style="font:600 22px var(--display);margin:6px 0 12px">今日巡检 · Capacity Agent 当前跟进</h2>
    <p style="color:var(--muted);font-size:11px;line-height:1.7;margin:0 0 16px">所有生产变更仍由你审批。下表展示 Agent 正在持续跟进的任务,任何一行点击都能进入治理闭环页查看完整证据。</p>
    <section class="home-followups">${followups.map(t=>`<div class="home-followup"><div><b>${t.title}</b><small>${t.id} · ${t.owner}</small></div><span class="work-status">${stageLabel[t.stage]||'处理中'}</span></div>`).join('') || '<div class="empty-note">暂无跟进任务</div>'}</section>
    <p class="kicker" style="margin-top:20px">STATUS SNAPSHOT</p>
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
    <p class="kicker">LIVE · AGENT WORK EVENTS</p>
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
  <section class="panel verification task-verification"><p class="kicker">EFFECT VERIFICATION / CAP-1839</p><h2>Redis 缩容观察 · 第 3/7 天</h2><p style="color:var(--muted);font-size:11px">Agent 每天取数后自动比较变更前基线与变更后水位，并决定继续观察、回滚或进入下一步。</p><div class="verify-hero"><div class="verify-card"><span>变更前 CPU 峰值</span><strong>18%</strong></div><div class="verify-card"><span>变更后 CPU 峰值</span><strong class="verify-good">31%</strong></div><div class="verify-card"><span>内存峰值变化</span><strong class="verify-good">23% → 36%</strong></div><div class="verify-card"><span>异常 / 告警</span><strong class="verify-good">0 / 0</strong></div></div><div class="decision"><b>Agent 当前结论</b><p>效果符合预期，暂不继续缩容。待观察满 7 天且覆盖周末批处理窗口后，再评估由 5 台缩至 4 台。</p></div></section>`;
}
function taskRow(t){const stages=['发现','建议','审批','观察','验证'];return `<tr><td><span class="ticket-no">${t.id}</span></td><td><span class="task-title"><b>${t.title}</b></span></td><td>${t.owner}</td><td><span class="status-pill">${t.status}</span></td><td>${t.workOrder?`<span class="work-order-no">${t.workOrder}</span>`:'<span class="empty-cell"></span>'}</td><td>${t.workOrder?`<span class="work-status ${t.workStatus==='实施完成'?'done':''}">${t.workStatus}</span>`:`<button class="btn small" data-create-workorder="${t.id}">去提单</button>`}</td><td><span class="stage-badge">${stages[t.stage]||'处理中'}</span></td><td><span class="table-actions"><button class="btn small" ${t.id==='CAP-1839'?'data-verify':''}>${t.action}</button><button class="btn small" data-open-followup="${t.id}">查看Agent跟进记录</button></span></td></tr>`}

function renderWorkline(){
  const job=autonomousJobs[state.work%autonomousJobs.length];
  workline.innerHTML=`
    <div class="work-core"><span class="work-orbit"><i></i></span><div><span>CAPACITY AGENT · 自主运行中</span><b>${job.phase}</b></div></div>
    <div class="work-target"><span>当前对象</span><b>${job.scope}</b><small>${job.target}</small></div>
    <div class="work-signal"><span>实时上下文</span><b>${job.signal}</b></div>
    <div class="work-progress-block"><div><span>${job.kind}</span><b>${state.progress}%</b></div><span class="work-progress"><i style="width:${state.progress}%"></i></span></div>
    <div class="work-stats"><span><b>14</b> 轮</span><span><b>142</b> 实例</span><span><b>3</b> 建议</span></div>
    <button class="work-detail" data-open-agent>观察工作现场 →</button>`;
  const mini=document.querySelector('#agent-mini-status');
  const pet=document.querySelector('#agent-float');
  mini.textContent=`${job.phase} · ${state.progress}%`;
  pet.classList.remove('speaking');
  void pet.offsetWidth;
  pet.classList.add('speaking');
}

function renderDrawer(){
  document.querySelectorAll('[data-agent-tab]').forEach(b=>b.classList.toggle('active',b.dataset.agentTab===state.agentTab));
  if(state.agentTab==='log') drawerContent.innerHTML=renderCollabLog();
  if(state.agentTab==='plan') drawerContent.innerHTML=`<p class="kicker">TODAY / AUTONOMOUS PLAN</p><div class="plan-list">${plan('08:00','三个接口取数与完整性检查','已完成 3 系统 / 142 实例')}${plan('进行中','GreatDB 容量风险复核','动态基线 + 集群归因',true)}${plan('随后','同类组件资源效率扫描','12 个可比集群')}${plan('14:00','生成容量准入评估摘要','2 项待人工决策')}${plan('持续','轮询治理任务与效果验证','CAP-1842 / CAP-1839')}</div>`;
  if(state.agentTab==='memory') drawerContent.innerHTML=`<p class="kicker">DECISION CONTEXT</p>${memory('算法负责“算”','动态基线、趋势预测、节点离散度与方案水位由静态模拟的时序分析层提供。')}${memory('AI 负责“判断”','结合系统等级、架构角色、历史行为、同类基准和治理办法解释结论。')}${memory('Agent 负责“做”','安排计划、创建治理单、轮询状态，并在变更后验证效果。')}${memory('长期安全约束','核心集群至少 4 个节点；关键生产变更必须由 SRE 人工审批。')}`;
}
function renderCollabLog(){
  const job=autonomousJobs[state.work%autonomousJobs.length];
  const activeIndex=state.work%collabRecords.length;
  const userRecords=messages.filter(m=>m.tone==='user').map((m,i)=>({time:m.time,type:'user',status:'已接收',title:m.title,body:m.body,facts:['SRE 反馈','写入上下文'],user:true,offset:collabRecords.length+i}));
  return `<section class="collab-workbench">
    <div class="collab-date"><span>2026-08-12 · 今日共事记录</span></div>
    <div class="collab-shift">
      <div class="shift-main"><span class="shift-avatar">CA</span><div><small>当前正在做</small><strong>${job.phase}</strong><p>${job.scope} · ${job.target}</p></div></div>
      <div class="shift-card"><small>任务类型</small><b>${job.kind}</b><p>${job.next}</p></div>
      <div class="shift-card"><small>实时进度</small><b>${state.progress}%</b><span class="shift-track"><i style="width:${state.progress}%"></i></span></div>
    </div>
    <div class="collab-stream">
      ${collabRecords.map((item,i)=>collabRecordHTML(item,i,i===activeIndex)).join('')}
      ${userRecords.map((item,i)=>collabRecordHTML(item,item.offset,true)).join('')}
    </div>
    <div class="agent-thinking live">
      <span class="msg-avatar">CA</span>
      <div><i></i><i></i><i></i><small>正在把新的分析结果写入共事记录…</small></div>
    </div>
  </section>`;
}
function collabRecordHTML(item,i,active=false){
  return `<article class="collab-record ${item.type} ${active?'active':''} ${item.user?'user-note':''}" style="--i:${i}">
    <time>${item.time}</time>
    <div class="record-node"></div>
    <div class="record-card">
      <div class="record-head"><span>${item.status}</span><b>${item.title}</b></div>
      <p>${item.body}</p>
      <div class="record-facts">${item.facts.map(x=>`<em>${x}</em>`).join('')}</div>
      ${item.type==='risk'?'<div class="message-actions"><button class="btn small" data-page="system">查看趋势证据</button><button class="btn small" data-open-evidence>判断过程</button></div>':''}
    </div>
  </article>`;
}
function messageHTML(m,i){const user=m.tone==='user';return `<article class="message ${user?'user':''}"><span class="msg-avatar">${user?'YOU':'CA'}</span><div class="message-body"><small>${m.time} · ${m.tone.toUpperCase()}</small><h3>${m.title}</h3><p>${m.body}</p>${i===1?'<div class="message-actions"><button class="btn small" data-page="system">查看趋势证据</button><button class="btn small" data-open-evidence>判断过程</button></div>':''}</div></article>`}
function plan(time,title,note,active=false){return `<div class="plan-item ${active?'active':''}"><time>${time}</time><div><b>${title}</b><small>${note}</small></div></div>`}
function memory(label,title){return `<div class="memory-card"><small>WORKING MEMORY</small><b>${label}</b><p>${title}</p></div>`}

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
function openEvidence(){modalCard.classList.remove('followup-card');modalContent.innerHTML=`<div class="evidence-head"><small>HOW I REACHED THIS CONCLUSION</small><h2>这不是一句“AI 觉得有风险”</h2><p>Capacity Agent 把计算、判断与行动分开呈现，SRE 可以检查每一层证据。</p></div><div class="evidence-steps"><div class="evidence-step"><span>01 / CALCULATE</span><h3>算法负责算</h3><p>关联 30 日历史，计算动态基线、7 日斜率、节点极差和预计触达阈值时间。</p></div><div class="evidence-step"><span>02 / REASON</span><h3>AI 负责判断</h3><p>结合主备角色、系统等级和治理规则，判断是整体不足、单节点异常还是负载倾斜。</p></div><div class="evidence-step"><span>03 / ACT</span><h3>Agent 负责做</h3><p>生成建议、等待关键审批、创建 JIRA、轮询状态并验证变更后的容量效果。</p></div></div><div class="explain" style="margin-top:18px"><strong>本次结论：</strong>GreatDB 风险置信度 91%。证据包括峰值 87.6%、偏离基线 18.4%、连续 7 日增长和节点极差 49.6%。</div>`;modal.classList.add('open');modal.removeAttribute('inert');modal.setAttribute('aria-hidden','false');scrim.hidden=false}
function openFollowup(taskId){
  const task=tasks.find(t=>t.id===taskId)||tasks[1];
  const events=[
    ['08-09 22:00 · 已缩减 1 个节点','JIRA 变更完成，Agent 自动进入观察期。'],
    ['08-10 08:15 · 首日验证正常','CPU P95 29%，无新增告警。'],
    ['今天 08:20 · 第三日验证正常','业务流量较基线 +7%，容量水位仍安全。'],
    ['下一步 · 08-16 自动复核','覆盖完整观察窗口后生成最终结论。']
  ];
  modalCard.classList.add('followup-card');
  modalContent.innerHTML=`<div class="follow-dialog"><header class="follow-hero"><div><small>AGENT FOLLOW-UP / ${task.id}</small><h2>${task.title}</h2><p>${task.workOrder?`Agent 正在跟进 ${task.workOrder}，当前变更状态为 ${task.workStatus}。`:'当前治理任务尚未提单，Agent 会在提单后继续自动轮询状态。'}</p></div><span class="follow-status ${task.workStatus==='实施完成'?'done':''}">${task.workStatus||'待提单'}</span></header><div class="follow-summary"><div><span>治理工单</span><b>${task.id}</b></div><div><span>变更单</span><b>${task.workOrder||'尚未创建'}</b></div><div><span>当前阶段</span><b>${task.status}</b></div></div><div class="dialog-timeline">${events.map(([title,body],i)=>`<div class="timeline-item" style="--i:${i}"><span class="timeline-dot">${String(i+1).padStart(2,'0')}</span><div><b>${title}</b><p>${body}</p></div></div>`).join('')}</div></div>`;
  modal.classList.add('open');modal.removeAttribute('inert');modal.setAttribute('aria-hidden','false');scrim.hidden=false;
}
function toast(title,body){const el=document.createElement('div');el.className='toast';el.innerHTML=`<b>${title}</b><span>${body}</span>`;document.querySelector('#toasts').append(el);setTimeout(()=>el.remove(),3800)}

document.addEventListener('click',e=>{
  const page=e.target.closest('[data-page]');if(page){if(page.dataset.systemId)state.selectedSystemId=page.dataset.systemId;state.page=page.dataset.page;closeOverlays();render();return}
  if(e.target.closest('[data-open-agent]')){openAgent();return}
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
  if(e.target.closest('[data-create-task]')){toast('已生成静态演示任务','CAP-1848 已进入”待 SRE 审批”，不会触发真实生产变更。');return}
  if(e.target.closest('[data-create-workorder]')){toast('已准备治理工单','演示环境不会真实提单，请在生产流程中完成变更单创建。');return}
  if(e.target.closest('[data-review]')){toast('Capacity Agent 已完成评估','已结合历史趋势、同类对标与安全余量，建议新增 4 台。');return}
  if(e.target.closest('[data-reset-sim]')){state.simNodes=5;state.simLoad=20;renderSimulator();return}
  if(e.target.closest('[data-verify]')){toast('效果验证正常','Redis 缩容后连续 3 天处于安全水位，将继续观察至第 7 天。');return}
});

document.addEventListener('input',e=>{
  if(e.target.id==='system-select'){state.selectedSystemId=e.target.value;render()}
  if(e.target.id==='node-range'){state.simNodes=Number(e.target.value);renderSimulator()}
  if(e.target.id==='load-range'){state.simLoad=Number(e.target.value);renderSimulator()}
});

document.addEventListener('change',e=>{if(e.target.id==='system-select'){state.selectedSystemId=e.target.value;render()}});
document.querySelector('#agent-form').addEventListener('submit',e=>{e.preventDefault();const text=agentInput.value.trim();if(!text)return;messages.push({time:'刚刚',title:'收到，我已经调整工作上下文',body:`你的要求“${text}”已进入当前计划。我会先验证相关数据和安全约束，再主动汇报结论。`,tone:'user'});agentInput.value='';state.agentTab='log';renderDrawer();drawerContent.scrollTop=drawerContent.scrollHeight;toast('分析方向已更新','Agent 会继续自主工作，并在有结论时主动通知你。')});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeOverlays()});

render();renderWorkline();
setInterval(()=>{state.progress+=7;if(state.progress>100){state.progress=12;state.work++;if(state.work%2===0)toast('Capacity Agent 主动更新','完成一项容量分析，新的治理结论已写入工作记录。')}renderWorkline();if(state.agentOpen&&state.agentTab==='log')renderDrawer()},2400);
setTimeout(()=>toast('今日容量巡检已完成','Agent 正在持续跟进 3 项治理任务，无需人工触发。'),800);
