const icons = {
  overview: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  agent: '<svg viewBox="0 0 24 24"><path d="M12 3v3M5.6 5.6l2.1 2.1M3 12h3m-.4 6.4 2.1-2.1M12 21v-3m6.4.4-2.1-2.1M21 12h-3m.4-6.4-2.1 2.1"/><circle cx="12" cy="12" r="4"/></svg>',
  tasks: '<svg viewBox="0 0 24 24"><path d="M9 5h11M9 12h11M9 19h11"/><path d="m3 5 1.5 1.5L7 4m-4 8 1.5 1.5L7 11m-4 8 1.5 1.5L7 18"/></svg>',
  report: '<svg viewBox="0 0 24 24"><path d="M5 3h10l4 4v14H5z"/><path d="M14 3v5h5M8 12h8M8 16h8"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="m3 17 5-5 4 3 7-9"/><path d="M15 6h4v4"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="m8 5 11 7-11 7z"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>',
};

const systems = [
  { id:'payment', code:'PAY', name:'统一支付系统', owner:'金融科技 · 核心交易域', health:74, status:'risk', statusText:'高风险', cpu:72.8, memory:68.4, disk:84.6, components:8, instances:46, risks:3, color:'#216d91', bg:'#e3f0f6' },
  { id:'customer', code:'CRM', name:'客户中心系统', owner:'零售业务 · 客户域', health:91, status:'healthy', statusText:'健康', cpu:42.2, memory:51.6, disk:48.3, components:6, instances:32, risks:0, color:'#3c7e6b', bg:'#e4f1ec' },
  { id:'data', code:'DMP', name:'数据中台', owner:'数据平台 · 数据域', health:83, status:'attention', statusText:'需关注', cpu:59.4, memory:74.1, disk:63.8, components:11, instances:68, risks:2, color:'#7e6629', bg:'#f5edda' },
  { id:'channel', code:'CHN', name:'渠道接入平台', owner:'渠道科技 · 接入域', health:88, status:'healthy', statusText:'健康', cpu:46.8, memory:55.2, disk:44.7, components:7, instances:39, risks:1, color:'#536ba1', bg:'#e9edf8' },
  { id:'risk', code:'RSK', name:'实时风控系统', owner:'风险管理 · 风控域', health:79, status:'attention', statusText:'需关注', cpu:66.1, memory:71.5, disk:58.4, components:9, instances:51, risks:2, color:'#8c573e', bg:'#f6e9e2' },
  { id:'ledger', code:'ACT', name:'核心账务系统', owner:'金融科技 · 账务域', health:94, status:'healthy', statusText:'健康', cpu:38.6, memory:47.9, disk:52.1, components:12, instances:72, risks:0, color:'#477885', bg:'#e3eff1' },
];

const components = [
  { id:'greatdb', name:'GreatDB', desc:'核心交易数据库集群', status:'risk', statusText:'高风险', cpu:68.3, memory:73.8, disk:87.6, instances:6, abnormal:1 },
  { id:'mysql', name:'MySQL', desc:'业务配置与流水数据库', status:'attention', statusText:'需关注', cpu:56.9, memory:77.2, disk:69.4, instances:8, abnormal:2 },
  { id:'redis', name:'Redis', desc:'交易缓存与会话集群', status:'attention', statusText:'需关注', cpu:18.4, memory:22.7, disk:41.6, instances:10, abnormal:2 },
  { id:'java', name:'Java 应用', desc:'订单、支付与清结算服务', status:'healthy', statusText:'健康', cpu:51.8, memory:62.1, disk:48.5, instances:14, abnormal:0 },
  { id:'nginx', name:'Nginx', desc:'统一接入与流量转发', status:'healthy', statusText:'健康', cpu:34.2, memory:29.8, disk:38.4, instances:4, abnormal:0 },
  { id:'haproxy', name:'HAProxy', desc:'数据库访问负载均衡', status:'healthy', statusText:'健康', cpu:31.6, memory:37.9, disk:43.3, instances:4, abnormal:0 },
];

const instances = [
  { host:'bjd-dsi-greatdb-010-kzx', ip:'25.129.5.110', role:'master', status:'risk', cpu:[55.56,81.70,33.33], memory:[54.46,76.70,32.67], disk:[61.60,87.60,35.11] },
  { host:'bjd-dsi-greatdb-011-kzx', ip:'25.129.5.111', role:'slave', status:'attention', cpu:[31.81,44.80,14.31], memory:[54.98,74.80,26.39], disk:[51.75,76.10,32.08] },
  { host:'bjd-dsi-greatdb-012-kzx', ip:'25.129.5.112', role:'slave', status:'risk', cpu:[55.43,74.90,27.71], memory:[50.92,67.00,26.48], disk:[46.29,65.20,24.07] },
  { host:'bja-dsi-greatdb-010-kzx', ip:'25.129.2.110', role:'master', status:'healthy', cpu:[13.64,22.00,6.14], memory:[23.10,35.00,11.09], disk:[25.84,38.00,13.44] },
  { host:'bja-dsi-greatdb-011-kzx', ip:'25.129.2.111', role:'slave', status:'healthy', cpu:[22.82,35.10,11.41], memory:[31.58,46.10,16.42], disk:[32.02,45.10,18.25] },
];

let tasks = [
  { id:'CAP-1842', title:'支付系统 GreatDB 磁盘容量扩容评估', owner:'陈哲', status:'following', priority:'P1', updated:'12 分钟前', source:'AI 自动创建' },
  { id:'CAP-1839', title:'Redis 长期低利用率实例缩容验证', owner:'王璐', status:'following', priority:'P2', updated:'36 分钟前', source:'AI 建议 · 人工确认' },
  { id:'CAP-1845', title:'数据中台 MySQL 内存增长趋势复核', owner:'赵辰', status:'todo', priority:'P2', updated:'5 分钟前', source:'规则触发' },
  { id:'CAP-1831', title:'渠道平台 Nginx 容量基线调整', owner:'李琦', status:'done', priority:'P3', updated:'昨天 16:40', source:'周期巡检' },
  { id:'CAP-1827', title:'核心账务系统闲置节点回收', owner:'周宁', status:'done', priority:'P2', updated:'08-05 14:20', source:'AI 自动创建' },
];

const state = { page:'overview', systemId:null, date:'2026-08-06', agentOpen:false, agentTab:'conversation', sheetOpen:false, analysisRunning:false, autonomous:true, autonomousStep:0, autonomousProgress:18, autonomousCycles:12 };
const main = document.querySelector('#main-content');
const nav = document.querySelector('#main-nav');
const breadcrumb = document.querySelector('#breadcrumb');
const drawer = document.querySelector('#agent-drawer');
const agentContent = document.querySelector('#agent-content');
const dataSheet = document.querySelector('#data-sheet');
const dataSheetContent = document.querySelector('#data-sheet-content');
const scrim = document.querySelector('#scrim');
const autonomyRail = document.querySelector('#autonomy-rail');
const agentShift = document.querySelector('#agent-shift');
const agentComposer = document.querySelector('#agent-composer');
const agentInput = document.querySelector('#agent-input');

const agentMessages = [
  { role:'agent', time:'08:00', title:'早上好，我开始今天的容量值守了', body:'我已按日程获取系统容量总览、服务器历史指标和服务器详情三个接口的数据。本轮覆盖 6 个系统、39 个组件、308 个实例。', tone:'routine' },
  { role:'agent', time:'08:07', title:'我发现一个需要优先关注的趋势', body:'统一支付系统的 GreatDB 实例 bjd-dsi-greatdb-010-kzx 磁盘连续 7 日增长。昨日峰值 87.6%，按当前速度预计 6 天后触达 90%。', tone:'risk' },
  { role:'agent', time:'08:12', title:'我做了进一步归因', body:'CPU 与内存没有同步增长，因此我暂时排除业务流量突增，更倾向于归档数据或日志清理不及时。我已经把它放到今日计划首位。', tone:'analysis' },
  { role:'agent', time:'08:18', title:'治理任务仍在持续跟进', body:'CAP-1842 已由陈哲接手，目前正在评估扩容窗口。我会每 30 分钟检查一次状态，有变化会主动告诉你。', tone:'follow' },
];

const autonomousJobs = [
  { scope:'统一支付系统 / GreatDB', target:'bjd-dsi-greatdb-010-kzx', phase:'关联 30 天磁盘趋势', kind:'分析中', progress:38, signal:'磁盘峰值 87.6%，连续 7 日上升', event:'发现高风险容量信号', message:'支付系统 GreatDB 磁盘预计 6 天内触达 90% 风险线。' },
  { scope:'统一支付系统 / Redis', target:'bjb-dsi-redis-010-kzx', phase:'对比同组件实例基线', kind:'分析中', progress:64, signal:'CPU 峰值连续 30 日低于 25%', event:'形成资源优化建议', message:'识别 4 个长期低利用实例，预计可回收 8C / 32GB。' },
  { scope:'数据中台 / MySQL', target:'bjc-dsi-mysql-012-kzx', phase:'执行异常归因分析', kind:'分析中', progress:81, signal:'内存波动偏离同组基线 21%', event:'异常归因完成', message:'内存增长与离线任务窗口高度相关，建议复核批处理并发度。' },
  { scope:'统一支付系统 / GreatDB', target:'CAP-1842', phase:'轮询 JIRA 处理状态', kind:'跟进中', progress:92, signal:'负责人陈哲已提交扩容窗口', event:'治理任务状态更新', message:'CAP-1842 已进入变更评审，Agent 将在下一轮继续查询。' },
  { scope:'核心账务系统 / 全部组件', target:'72 个服务器实例', phase:'扫描昨日容量快照', kind:'巡检中', progress:21, signal:'正在检测高低利用率与趋势偏移', event:'新一轮自主巡检开始', message:'Capacity Agent 正在扫描核心账务系统的 72 个实例。' },
];

function navMarkup(){
  const items = [
    ['overview','系统总览',icons.overview,''],
    ['agent','AI 分析',icons.agent,'3'],
    ['tasks','治理任务',icons.tasks,'5'],
    ['reports','分析报告',icons.report,''],
  ];
  return `<div class="nav-section">工作台</div>${items.map(([id,label,icon,count])=>`<button class="nav-item ${state.page===id||state.page==='system'&&id==='overview'?'active':''}" data-page="${id}"><span class="nav-icon">${icon}</span><span>${label}</span>${count?`<span class="nav-count">${count}</span>`:''}</button>`).join('')}`;
}

function setBreadcrumb(){
  if(state.page==='system'){
    const system = systems.find(s=>s.id===state.systemId);
    breadcrumb.innerHTML = `<button data-page="overview">系统总览</button><i>/</i><strong>${system.name}</strong>`;
    return;
  }
  const names={overview:'系统总览',agent:'AI 分析中心',tasks:'治理任务',reports:'分析报告'};
  breadcrumb.innerHTML=`<strong>${names[state.page]}</strong>`;
}

function pageHead(eyebrow,title,subtitle,actions=''){
  return `<div class="page-head"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="page-subtitle">${subtitle}</p></div><div class="head-actions">${actions}</div></div>`;
}

function statCard(label,value,unit,delta,accent,warn=false){
  return `<article class="stat-card" style="--accent:${accent}"><div class="stat-top"><span>${label}</span><span class="delta ${warn?'warn':''}">${delta}</span></div><div class="stat-value"><strong>${value}</strong><span>${unit}</span></div></article>`;
}

function renderOverview(){
  const actions=`<button class="button">导出昨日摘要</button><button class="button agent" data-observe-agent>${icons.spark} 查看 Agent 工作现场</button>`;
  main.innerHTML=pageHead('SRE CAPACITY GOVERNANCE','性能容量总览',`${formatDate(state.date)} · 6 个业务系统的昨日容量快照与治理状态`,actions)+`
    <section class="stats-grid">
      ${statCard('纳管业务系统','6','个','全部在线','#1769e0')}
      ${statCard('容量风险项','8','项','较前日 +2','#e45f21',true)}
      ${statCard('待治理任务','3','项','2 项跟进中','#c87813',true)}
      ${statCard('平均健康度','84.8','分','↑ 1.2','#08786e')}
    </section>
    <div class="overview-layout">
      <section class="panel">
        <div class="panel-head"><div><h2>系统容量态势</h2><small>按风险优先级排序</small></div><small>CPU / MEM / DISK 为昨日峰值</small></div>
        <div class="system-list">${systems.map(systemRow).join('')}</div>
      </section>
      <aside>
        <section class="panel agent-brief">
          <div class="panel-head"><h2>AI 今日简报</h2><small>08:32 生成</small></div>
          <div class="brief-body"><span class="brief-kicker">CAPACITY INTELLIGENCE</span><h3>发现 3 个高优先级容量信号</h3><p>已完成 6 个系统、39 个组件、308 个实例的昨日数据分析。</p>
            <div class="finding-list"><div class="finding"><b>01</b><span>支付系统 GreatDB 磁盘连续 7 日增长，存在近期容量风险。</span></div><div class="finding"><b>02</b><span>Redis 4 个实例连续 30 日低利用，建议评估资源回收。</span></div><div class="finding"><b>03</b><span>数据中台 MySQL 内存波动偏离同组基线 21%。</span></div></div>
            <button class="brief-action" data-open-agent>查看分析过程与治理建议 →</button>
          </div>
        </section>
        <section class="panel activity-panel"><div class="panel-head"><h2>Agent 自主事件流</h2><small><span class="live-mark"></span> 无需人工触发</small></div><div class="activity-list" id="agent-activity-list">
          ${activity('A','已更新 CAP-1842：SRE 陈哲正在评估扩容窗口','2 MIN')}
          ${activity('A','完成 Redis 低利用率实例趋势复核','18 MIN')}
          ${activity('S','同步昨日 308 个实例容量快照','32 MIN')}
        </div></section>
      </aside>
    </div>`;
}

function systemRow(s){
  return `<button class="system-row" data-system="${s.id}"><span class="system-name"><span class="system-avatar" style="--avatar:${s.color};--avatar-bg:${s.bg}">${s.code}</span><span><strong>${s.name}</strong><small>${s.owner} · ${s.components} 组件 / ${s.instances} 实例</small></span></span><span class="mini-metrics"><span>CPU<b>${s.cpu}%</b></span><span>MEM<b>${s.memory}%</b></span><span>DISK<b>${s.disk}%</b></span></span><span class="health-score">${s.health}<small> /100</small></span><span class="status-pill ${s.status}">${s.statusText}</span><span class="mono">${s.risks} 项风险</span><span class="chevron">›</span></button>`;
}

function activity(code,text,time){ return `<div class="activity-item"><span class="activity-dot">${code}</span><p>${text}</p><small>${time}</small></div>`; }

function renderSystem(){
  const s=systems.find(x=>x.id===state.systemId)||systems[0];
  const actions=`<button class="button" data-page="overview">返回总览</button><button class="button agent" data-observe-agent>${icons.spark} 查看自主分析</button>`;
  main.innerHTML=pageHead('SYSTEM CAPACITY VIEW',s.name,`${formatDate(state.date)} · ${s.owner} · 昨日性能容量汇总`,actions)+`
    <section class="stats-grid">
      ${statCard('系统健康度',s.health,'分','需重点关注','#e45f21',true)}
      ${statCard('组件 / 实例',`${s.components} / ${s.instances}`,'','全部纳管','#1769e0')}
      ${statCard('容量风险','3','项','1 项高风险','#cf3e3e',true)}
      ${statCard('治理任务','2','项','跟进中','#c87813',true)}
    </section>
    <section class="component-grid">${components.map(componentCard).join('')}</section>
    <section class="panel instance-panel"><div class="panel-head"><div><h2>GreatDB · 服务器实例</h2><small>昨日平均值 / 峰值 / 最小值</small></div><button class="button small" data-trend="system">查看组件趋势</button></div>
      <div class="table-wrap"><table><thead><tr><th>服务器实例</th><th>角色</th><th>CPU A/P/M</th><th>内存 A/P/M</th><th>磁盘 A/P/M</th><th>状态</th><th>数据</th></tr></thead><tbody>${instances.map(instanceRow).join('')}</tbody></table></div>
    </section>`;
}

function componentCard(c){
  return `<button class="component-card" data-trend="${c.id}"><div class="component-top"><div><h3>${c.name}</h3><p>${c.desc}</p></div><span class="status-pill ${c.status}">${c.statusText}</span></div><div class="metric-bars">${metricBar('CPU',c.cpu,'#287ac1')}${metricBar('内存',c.memory,'#14877c')}${metricBar('磁盘',c.disk,c.disk>80?'#d85832':'#c4822d')}</div><div class="component-foot"><span>${c.instances} 个实例</span><span>${c.abnormal?`${c.abnormal} 个异常`:'全部正常'} →</span></div></button>`;
}

function metricBar(name,value,color){ return `<div class="metric-line"><span>${name}</span><span class="bar"><i style="width:${value}%;--bar:${color}"></i></span><b>${value}%</b></div>`; }
function instanceRow(r){
  const status=r.status==='risk'?['risk','高风险']:r.status==='attention'?['attention','需关注']:['healthy','正常'];
  return `<tr><td class="host-cell"><strong>${r.host}</strong><small>${r.ip}</small></td><td>${r.role}</td><td class="mono">${r.cpu.map(v=>v.toFixed(1)).join(' / ')}</td><td class="mono">${r.memory.map(v=>v.toFixed(1)).join(' / ')}</td><td class="mono">${r.disk.map(v=>v.toFixed(1)).join(' / ')}</td><td><span class="status-pill ${status[0]}">${status[1]}</span></td><td><button class="trend-button" data-trend="${r.host}">趋势分析</button></td></tr>`;
}

function renderTasks(){
  const columns=[['todo','待处理'],['following','跟进中'],['done','已完成']];
  main.innerHTML=pageHead('GOVERNANCE LOOP','治理任务中心','从容量信号、分析建议到执行验证的完整任务闭环',`<button class="button">筛选任务</button><button class="button primary">新建治理任务</button>`)+`
  <section class="stats-grid">${statCard('全部任务',tasks.length,'项','本月 +18','#1769e0')}${statCard('待处理',tasks.filter(t=>t.status==='todo').length,'项','需分配','#e45f21',true)}${statCard('跟进中',tasks.filter(t=>t.status==='following').length,'项','JIRA 已同步','#c87813',true)}${statCard('本月完成','14','项','平均 2.4 天','#08786e')}</section>
  <section class="task-board">${columns.map(([id,label])=>`<div class="task-column"><div class="task-column-head">${label}<span>${tasks.filter(t=>t.status===id).length}</span></div>${tasks.filter(t=>t.status===id).map(taskCard).join('')}</div>`).join('')}</section>`;
}

function taskCard(t){ return `<article class="task-card"><span class="status-pill ${t.status}">${t.priority} · ${t.status==='todo'?'待处理':t.status==='following'?'跟进中':'已完成'}</span><h3>${t.title}</h3><p>${t.source}<br>JIRA：${t.id}</p><div class="task-meta"><span>负责人 ${t.owner}</span><span>${t.updated}</span></div></article>`; }

function renderAgentPage(){
  main.innerHTML=pageHead('CAPACITY INTELLIGENCE','AI 自主分析中心','Agent 持续扫描系统、组件和实例；SRE 可观察分析过程或临时接管',`<button class="button agent" data-observe-agent>${icons.play} 查看当前工作现场</button>`)+`
  <section class="report-layout"><div class="panel report-card"><div class="panel-head" style="padding:0 0 15px;min-height:0"><h2>今日重点发现</h2><span class="status-pill risk">3 项高优先级</span></div><div class="finding-list" style="margin-bottom:0">${['GreatDB 磁盘峰值 87.6%，近 7 日平均增长 1.8%/天','Redis 4 个实例连续 30 日 CPU 峰值低于 25%','数据中台 MySQL 内存波动偏离同组基线 21%'].map((x,i)=>`<button class="component-card" data-open-agent style="padding:13px"><div class="component-top"><div><p>发现 0${i+1}</p><h3>${x}</h3></div><span class="chevron">›</span></div></button>`).join('')}</div></div>
  <aside class="panel report-card"><h2>自主策略</h2><p class="page-subtitle">以下能力由 Agent 按巡检计划与异常信号自动调用</p><div class="finding-list">${['昨日异常扫描','7/30 天趋势分析','容量预测与风险评估','生成系统容量报告','同组件实例横向对比'].map((x,i)=>`<button class="button" data-observe-agent style="justify-content:flex-start">0${i+1} · ${x}</button>`).join('')}</div></aside></section>`;
}

function renderReports(){
  main.innerHTML=pageHead('ANALYSIS REPORTS','性能容量分析报告','由 AI Agent 基于昨日快照与历史趋势生成的静态演示报告',`<button class="button agent" data-generate-report>${icons.spark} 生成最新报告</button>`)+`
  <section class="report-layout"><article class="panel report-card"><div style="display:flex;justify-content:space-between;gap:20px"><div><p class="eyebrow">DAILY CAPACITY REPORT · 2026-08-06</p><h2>全域系统性能容量日报</h2><p class="page-subtitle">覆盖 6 个系统、39 个组件、308 个实例</p></div><div class="report-score"><strong>84</strong></div></div><div class="finding-list" style="margin-top:24px"><div class="finding"><b>01</b><span><strong>总体判断：</strong>容量态势基本稳定，支付系统磁盘风险需要优先处理。</span></div><div class="finding"><b>02</b><span><strong>趋势预测：</strong>GreatDB 按当前增速预计 6 天内触达 90% 风险线。</span></div><div class="finding"><b>03</b><span><strong>资源优化：</strong>Redis 低利用实例预计可回收 8C / 32GB 资源。</span></div></div><div class="agent-actions"><button class="button">查看完整报告</button><button class="button">导出 PDF</button><button class="button agent" data-open-agent>让 AI 解释</button></div></article>
  <aside class="panel report-card"><h2>近期报告</h2><div class="activity-list" style="padding:6px 0">${activity('日','全域性能容量日报','今天 08:32')}${activity('周','第 32 周容量治理周报','08-04')}${activity('专','支付系统专项分析报告','08-02')}${activity('月','7 月性能容量月报','08-01')}</div></aside></section>`;
}

function render(){
  nav.innerHTML=navMarkup(); setBreadcrumb();
  if(state.page==='overview') renderOverview();
  if(state.page==='system') renderSystem();
  if(state.page==='tasks') renderTasks();
  if(state.page==='agent') renderAgentPage();
  if(state.page==='reports') renderReports();
  renderAutonomyRail();
}

function renderAutonomyRail(){
  const job=autonomousJobs[state.autonomousStep % autonomousJobs.length];
  autonomyRail.innerHTML=`<div class="autonomy-core"><span class="autonomy-orbit ${state.autonomous?'running':'paused'}"><i></i></span><div class="autonomy-copy"><span class="autonomy-label">CAPACITY AGENT · ${state.autonomous?'自主运行中':'已暂停'}</span><strong>${state.autonomous?job.phase:'等待 SRE 恢复自主分析'}</strong></div></div><div class="autonomy-target"><span>当前对象</span><strong>${job.scope}</strong><small>${job.target}</small></div><div class="autonomy-signal"><span>实时上下文</span><strong>${job.signal}</strong></div><div class="autonomy-progress"><div><span>${job.kind}</span><b>${state.autonomous?state.autonomousProgress:0}%</b></div><span class="autonomy-track"><i style="width:${state.autonomous?state.autonomousProgress:0}%"></i></span></div><div class="autonomy-stats"><span><b>${state.autonomousCycles}</b> 轮</span><span><b>308</b> 实例</span><span><b>3</b> 发现</span></div><button class="autonomy-control" data-toggle-autonomy aria-pressed="${!state.autonomous}">${state.autonomous?'暂停':'恢复'}</button><button class="autonomy-detail" data-observe-agent>查看工作记忆 →</button>`;
}

function prependAutonomousActivity(job){
  const list=document.querySelector('#agent-activity-list');
  if(!list) return;
  list.insertAdjacentHTML('afterbegin',activity('AI',`${job.event}：${job.message}`,'刚刚'));
  while(list.children.length>4) list.lastElementChild.remove();
}

function advanceAutonomousAgent(){
  if(!state.autonomous) return;
  state.autonomousProgress+=17;
  if(state.autonomousProgress<100){ renderAutonomyRail(); return; }
  const completed=autonomousJobs[state.autonomousStep % autonomousJobs.length];
  prependAutonomousActivity(completed);
  showAgentSignal(completed);
  state.autonomousStep=(state.autonomousStep+1)%autonomousJobs.length;
  state.autonomousProgress=autonomousJobs[state.autonomousStep].progress;
  if(state.autonomousStep===4) state.autonomousCycles++;
  renderAutonomyRail();
  if(state.agentOpen){agentMessages.push({role:'agent',time:'刚刚',title:completed.event,body:completed.message,tone:completed.event.includes('风险')?'risk':'follow'});renderAgentWorkspace();}
}

function showAgentSignal(job){
  const important=['发现高风险容量信号','治理任务状态更新','异常归因完成'].includes(job.event);
  if(!important) return;
  showToast(`Capacity Agent · ${job.event}`,job.message,'agent-signal');
}

function openAgent(run=false){
  state.sheetOpen=false; dataSheet.classList.remove('open'); dataSheet.setAttribute('aria-hidden','true'); dataSheet.setAttribute('inert','');
  state.agentOpen=true; drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); drawer.removeAttribute('inert'); scrim.hidden=false;
  state.agentTab='conversation'; renderAgentWorkspace();
  setTimeout(()=>drawer.querySelector('[data-close-agent]')?.focus(),50);
  if(run) startAnalysis();
}

function closeOverlays(){
  state.agentOpen=false; state.sheetOpen=false; drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); drawer.setAttribute('inert',''); dataSheet.classList.remove('open'); dataSheet.setAttribute('aria-hidden','true'); dataSheet.setAttribute('inert',''); scrim.hidden=true;
}

function renderAgentWorkspace(){
  const job=autonomousJobs[state.autonomousStep%autonomousJobs.length];
  agentShift.innerHTML=`<div class="shift-status"><span class="shift-avatar">CA</span><div><span>当前正在做</span><strong>${job.phase}</strong><small>${job.scope} · ${job.target}</small></div></div><div class="shift-next"><span>接下来</span><strong>${autonomousJobs[(state.autonomousStep+1)%autonomousJobs.length].phase}</strong></div><div class="shift-time"><span>今日值守</span><strong>08:00 — 18:00</strong><small>下次取数 明日 08:00</small></div>`;
  document.querySelectorAll('[data-agent-tab]').forEach(button=>{const active=button.dataset.agentTab===state.agentTab;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));});
  agentComposer.hidden=state.agentTab!=='conversation';
  if(state.agentTab==='conversation') renderAgentConversation();
  if(state.agentTab==='plan') renderAgentPlan();
  if(state.agentTab==='memory') renderAgentMemory();
}

function renderAgentConversation(){
  agentContent.innerHTML=`<div class="conversation-date"><span>${formatDate(state.date)} · 今日共事记录</span></div>${agentMessages.map(messageMarkup).join('')}<div class="agent-thinking" id="agent-thinking" hidden><span class="avatar">CA</span><div><i></i><i></i><i></i><small>正在结合当前分析上下文思考…</small></div></div>`;
  agentContent.scrollTop=agentContent.scrollHeight;
}

function messageMarkup(message){
  if(message.role==='user') return `<div class="agent-message user-message"><div class="message-bubble"><div class="message-meta"><strong>你</strong><span>${message.time}</span></div><p>${message.body}</p></div><span class="avatar user-avatar">杨</span></div>`;
  const actions=message.tone==='risk'?`<div class="agent-actions"><button class="button small" data-trend="agent">查看趋势证据</button><button class="button small" data-agent-prompt="请继续分析这个磁盘风险的根因。">继续深挖</button></div>`:message.tone==='follow'?`<div class="colleague-note"><span>我会继续盯着</span><strong>下次检查 08:48</strong></div>`:'';
  return `<div class="agent-message colleague-message ${message.tone||''}"><span class="avatar">CA</span><div class="message-bubble"><div class="message-meta"><strong>${message.title}</strong><span>${message.time}</span></div><p>${message.body}</p>${actions}</div></div>`;
}

function renderAgentPlan(){
  const job=autonomousJobs[state.autonomousStep%autonomousJobs.length];
  agentContent.innerHTML=`<div class="workspace-intro"><span>TODAY / ${state.autonomousCycles} 轮自主巡检</span><h3>我的今日工作计划</h3><p>计划会根据异常严重度、趋势速度和你的反馈动态调整。</p></div><div class="personal-plan">${planItem('done','08:00','获取三个接口数据并完成数据完整性检查','覆盖 6 个系统 / 308 个实例')}${planItem('active','进行中',job.phase,`${job.scope} · ${state.autonomousProgress}%`)}${planItem('queued','随后','复核 Redis 低利用实例缩容空间','预计可回收 8C / 32GB')}${planItem('watch','持续','每 30 分钟跟进 CAP-1842','等待扩容窗口评估结果')}</div><div class="pending-decision"><span>需要你决策</span><strong>GreatDB 扩容建议是否允许自动创建变更评估单？</strong><div><button class="button small agent" data-create-jira>同意并建单</button><button class="button small" data-agent-tab="conversation">先讨论</button></div></div>`;
}

function planItem(status,time,title,detail){return `<div class="plan-item ${status}"><span class="plan-state"></span><div><small>${time}</small><strong>${title}</strong><p>${detail}</p></div></div>`;}

function renderAgentMemory(){
  agentContent.innerHTML=`<div class="workspace-intro"><span>WORKING MEMORY</span><h3>我正在依据这些信息工作</h3><p>这些上下文让每天的分析保持连续，而不是一次性的问答。</p></div><div class="memory-group"><h4>长期治理规则</h4>${memoryCard('容量阈值','磁盘峰值 ≥ 85% 标记高风险；连续增长需结合趋势预测。')}${memoryCard('低利用规则','CPU 与内存连续 30 日峰值低于 25%，进入缩容候选。')}</div><div class="memory-group"><h4>你告诉我的偏好</h4>${memoryCard('系统优先级','支付系统、核心账务系统优先于一般渠道系统。')}${memoryCard('工作方式','高风险先汇报；普通异常可以自主分析并归档。')}</div><div class="memory-group"><h4>持续跟进事项</h4>${memoryCard('CAP-1842','GreatDB 磁盘扩容评估 · 陈哲 · 跟进中')}${memoryCard('CAP-1839','Redis 低利用实例缩容验证 · 王璐 · 跟进中')}</div>`;
}

function memoryCard(title,body){return `<div class="memory-card"><span></span><div><strong>${title}</strong><p>${body}</p></div></div>`;}

function submitAgentMessage(text){
  const clean=text.trim(); if(!clean)return;
  agentMessages.push({role:'user',time:'刚刚',body:clean});
  renderAgentConversation();
  const thinking=document.querySelector('#agent-thinking');thinking.hidden=false;agentContent.scrollTop=agentContent.scrollHeight;
  setTimeout(()=>{agentMessages.push(agentReply(clean));renderAgentConversation();renderAutonomyRail();},900);
}

function agentReply(text){
  const priority=/优先|先重点|往后排/.test(text);
  const redis=/Redis|redis/.test(text);
  const why=/为什么|依据|解释/.test(text);
  if(priority){state.autonomousStep=0;state.autonomousProgress=46;return {role:'agent',time:'刚刚',title:'收到，我已经调整今天的优先级',body:'我会先完成支付系统 GreatDB 的磁盘趋势与根因分析，暂停切换到其他系统。完成后我再继续 Redis 和数据中台的任务，并主动汇报结果。',tone:'analysis'};}
  if(redis){state.autonomousStep=1;state.autonomousProgress=35;return {role:'agent',time:'刚刚',title:'已加入当前工作队列',body:'我现在开始横向对比 Redis 各实例最近 30 天的 CPU、内存峰值与角色差异。我会重点区分长期低利用和主从角色导致的正常差异。',tone:'analysis'};}
  if(why)return {role:'agent',time:'刚刚',title:'我的判断主要基于三条证据',body:'第一，昨日磁盘峰值达到 87.6%；第二，近 7 日平均每天增长 1.8%；第三，CPU 与内存没有同步增长。因此我判断它不是整体业务负载升高，更可能是数据或日志持续堆积。',tone:'risk'};
  return {role:'agent',time:'刚刚',title:'明白，我会带着这个问题继续分析',body:'我已将你的问题写入当前工作上下文。接下来我会优先验证相关指标和趋势，并在有结论或需要你决策时主动汇报。',tone:'analysis'};
}

function analysisSteps(active){
  const steps=['读取昨日容量快照','关联 30 天历史趋势','识别异常与容量风险','匹配治理规则与架构关系','生成分析结论'];
  return steps.map((x,i)=>`<div class="analysis-step ${i<active?'done':i===active?'active':''}"><span class="step-dot"></span><span>${x}</span><small>${i<active?'完成':i===active?'分析中':'等待'}</small></div>`).join('');
}

function startAnalysis(){
  if(state.analysisRunning) return; state.analysisRunning=true; let step=0;
  const progress=document.querySelector('#analysis-progress');
  const timer=setInterval(()=>{ step++; if(progress) progress.innerHTML=`<div class="analysis-steps">${analysisSteps(step)}</div>${step<5?'<div class="typing"><i></i><i></i><i></i></div>':''}`; if(step>=5){clearInterval(timer);state.analysisRunning=false;showToast('分析完成','已生成支付系统容量分析结论与治理建议。');}},520);
}

function createJira(button){
  if(button){button.disabled=true;button.textContent='正在创建…';}
  setTimeout(()=>{ const id='CAP-1848'; if(!tasks.some(t=>t.id===id))tasks.unshift({id,title:'GreatDB 磁盘容量风险处置',owner:'陈哲',status:'following',priority:'P1',updated:'刚刚',source:'AI 建议 · 人工确认'}); if(button)button.textContent=`已创建 ${id}`; agentMessages.push({role:'agent',time:'刚刚',title:'我已经创建治理任务并开始跟进',body:`${id} 已分配给 SRE 陈哲，当前状态为跟进中。我会每 30 分钟检查一次，有变化会主动告诉你。`,tone:'follow'});showToast('JIRA 已创建',`${id} 已分配给 SRE 陈哲，Agent 将持续跟进状态。`);if(state.agentOpen){state.agentTab='conversation';renderAgentWorkspace();}},900);
}

function openTrend(source){
  state.agentOpen=false; drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); drawer.setAttribute('inert','');
  state.sheetOpen=true; scrim.hidden=false; dataSheet.classList.add('open'); dataSheet.setAttribute('aria-hidden','false'); dataSheet.removeAttribute('inert');
  const host=source&&source.includes('-kzx')?source:'bjd-dsi-greatdb-010-kzx';
  dataSheetContent.innerHTML=`<div class="sheet-head"><div><h2>性能趋势与异常依据</h2><p>${host} · 最近 30 天 · 日粒度</p></div><button class="icon-button close-button" data-close-sheet aria-label="关闭趋势面板"></button></div><div class="sheet-body"><div class="chart-card"><div class="chart-head"><strong>磁盘使用率趋势</strong><div class="chart-legend"><span style="--legend:#1769e0">实际值</span><span style="--legend:#e45f21">预测值</span></div></div><div class="chart-wrap">${lineChart()}</div><div class="sheet-summary"><div class="summary-cell"><span>昨日平均值</span><strong>61.6%</strong></div><div class="summary-cell"><span>昨日峰值</span><strong>87.6%</strong></div><div class="summary-cell"><span>7 日增速</span><strong>+1.8%/d</strong></div><div class="summary-cell"><span>预计达 90%</span><strong>6 天</strong></div></div></div><div class="insight-box"><strong>AI 异常解释：</strong>近 7 日数据盘使用率呈单调上升，增速显著高于过去 30 日基线；同期 CPU 与内存无明显上升，优先判断为数据归档或日志清理不及时，而非业务流量增长。</div><div class="agent-actions"><button class="button">查看原始接口数据</button><button class="button agent" data-open-agent>继续让 AI 分析</button></div></div>`;
  setTimeout(()=>dataSheet.querySelector('[data-close-sheet]')?.focus(),50);
}

function lineChart(){
  const actual=[44,46,45,48,49,51,50,53,55,54,57,59,58,60,61,63,62,65,67,66,69,72,74,77,79,81,84,87.6];
  const forecast=[87.6,88.2,88.8,89.3,89.8,90.4,91.1];
  const W=860,H=230,pad=28,min=35,max=100;
  const point=(v,i,total)=>`${pad+i*(W-pad*2)/(total-1)},${H-pad-(v-min)*(H-pad*2)/(max-min)}`;
  const a=actual.map((v,i)=>point(v,i,34)); const f=forecast.map((v,i)=>point(v,i+27,34));
  const grid=[40,60,80,90].map(v=>{const y=H-pad-(v-min)*(H-pad*2)/(max-min);return `<line class="chart-grid" x1="${pad}" y1="${y}" x2="${W-pad}" y2="${y}"/><text class="chart-label" x="0" y="${y+3}">${v}%</text>`}).join('');
  const thresholdY=H-pad-(90-min)*(H-pad*2)/(max-min);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="磁盘使用率在最近七天持续上升，预测六天后超过百分之九十"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#1769e0"/><stop offset="1" stop-color="#1769e0" stop-opacity="0"/></linearGradient></defs>${grid}<line class="chart-threshold" x1="${pad}" y1="${thresholdY}" x2="${W-pad}" y2="${thresholdY}"/><text class="chart-label" x="${W-110}" y="${thresholdY-6}">风险线 90%</text><path class="chart-area" fill="url(#area)" d="M${a.join(' L')} L${a[a.length-1].split(',')[0]},${H-pad} L${pad},${H-pad}Z"/><path class="chart-line" stroke="#1769e0" d="M${a.join(' L')}"/><path class="chart-line" stroke="#e45f21" stroke-dasharray="6 5" d="M${f.join(' L')}"/><circle class="chart-anomaly" cx="${a[a.length-1].split(',')[0]}" cy="${a[a.length-1].split(',')[1]}" r="4"/><text class="chart-label" x="${pad}" y="${H-5}">07-08</text><text class="chart-label" x="${W/2}" y="${H-5}">07-23</text><text class="chart-label" x="${W-60}" y="${H-5}">08-12 预测</text></svg>`;
}

function showToast(title,message,type=''){ 
  const region=document.querySelector('#toast-region'); const toast=document.createElement('div'); toast.className=`toast ${type}`; toast.innerHTML=`<div><h3>${title}</h3><p>${message}</p></div><button aria-label="关闭通知">×</button>`; region.appendChild(toast); toast.querySelector('button').onclick=()=>toast.remove(); setTimeout(()=>toast.remove(),7000);
}

function formatDate(value){ const d=new Date(`${value}T00:00:00`); return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`; }

document.addEventListener('click',e=>{
  const page=e.target.closest('[data-page]');
  if(page){ state.page=page.dataset.page; state.systemId=null; closeOverlays(); render(); window.scrollTo({top:0,behavior:'smooth'}); return; }
  const system=e.target.closest('[data-system]');
  if(system){state.page='system';state.systemId=system.dataset.system;render();window.scrollTo({top:0,behavior:'smooth'});return;}
  if(e.target.closest('[data-observe-agent]')){openAgent(false);return;}
  if(e.target.closest('[data-open-agent]')){openAgent(true);return;}
  if(e.target.closest('[data-close-agent]')||e.target.closest('[data-close-sheet]')||e.target===scrim){closeOverlays();return;}
  const trend=e.target.closest('[data-trend]'); if(trend){openTrend(trend.dataset.trend);return;}
  const jira=e.target.closest('[data-create-jira]'); if(jira){createJira(jira);return;}
  const agentTab=e.target.closest('[data-agent-tab]');if(agentTab){state.agentTab=agentTab.dataset.agentTab;renderAgentWorkspace();return;}
  const prompt=e.target.closest('[data-agent-prompt]');if(prompt){state.agentTab='conversation';renderAgentWorkspace();submitAgentMessage(prompt.dataset.agentPrompt);return;}
  if(e.target.closest('[data-toggle-autonomy]')){state.autonomous=!state.autonomous;renderAutonomyRail();showToast(state.autonomous?'自主分析已恢复':'自主分析已暂停',state.autonomous?'Capacity Agent 将继续扫描、分析并跟进容量治理任务。':'当前分析上下文已保留，可随时恢复。');return;}
  if(e.target.closest('[data-generate-report]')){showToast('正在生成报告','Agent 正在汇总昨日快照与历史趋势，演示报告将在 2 秒后完成。');setTimeout(()=>showToast('报告已生成','2026-08-06 全域性能容量日报已更新。'),2000);}
});

document.querySelector('#date-picker').addEventListener('change',e=>{state.date=e.target.value;render();showToast('数据日期已切换',`已加载 ${formatDate(state.date)} 的静态容量快照。`);});
document.querySelector('#notification-btn').addEventListener('click',()=>showToast('3 条未读动态','1 项高风险容量信号，2 个治理任务状态已更新。'));
agentComposer.addEventListener('submit',event=>{event.preventDefault();const text=agentInput.value;agentInput.value='';submitAgentMessage(text);});
document.addEventListener('keydown',e=>{if(e.key==='Escape') closeOverlays();});

render();
setTimeout(()=>showToast('Capacity Agent 已自主启动','正在扫描 6 个系统、39 个组件和 308 个服务器实例，无需人工触发。','agent-signal'),900);
setInterval(advanceAutonomousAgent,1800);
