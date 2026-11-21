/* MIMORA Competition Demo — warm UX, per-child messaging, transparent AI insights, and optional sound. */
(() => {
  const baseRender = window.render;
  const $id = (id) => document.getElementById(id);
  const escapeHtml = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // Backward-compatible demo state upgrade. All records remain synthetic and local to this browser.
  state.messages ||= {
    minhanh: [
      {from:'teacher', text:'Chào gia đình Minh Anh! Tuần này con đã làm quen với lớp và tham gia các hoạt động theo nhịp độ của mình. Nếu gia đình cần trao đổi thêm, cô luôn sẵn sàng nhé.', time:'Hôm qua · 16:20'},
      {from:'guardian', text:'Cảm ơn cô Mai. Ở nhà gia đình sẽ cùng con xem lại các thẻ học ạ.', time:'Hôm qua · 17:05'}
    ],
    baoan: [
      {from:'teacher', text:'Gia đình có thể chia sẻ thêm với cô về thời điểm Bảo An thích học cùng bộ thẻ nhất không ạ?', time:'Thứ Hai · 09:15'},
      {from:'guardian', text:'Bảo An thường thích học sau bữa tối, khi không gian yên tĩnh ạ.', time:'Thứ Hai · 10:02'}
    ]
  };
  state.chatStudent ||= 'minhanh';
  state.notifications ||= [];
  state.aiSignals ||= {
    minhanh:{weekly:3,previous:3,last:'Hôm qua',signal:'steady',headline:'Nhịp tham gia đang ổn định',detail:'Minh Anh đã có 3 lượt tham gia trong 7 ngày gần đây. Dữ liệu hiện tại chưa cho thấy thay đổi đáng kể về tần suất.',forecast:'Nếu lịch sinh hoạt hiện tại được duy trì, nhịp tham gia tuần tới có thể tiếp tục ổn định.',suggestion:'Tiếp tục duy trì những khoảng học ngắn, đều đặn và để con tự chọn hoạt động.'},
    baoan:{weekly:1,previous:3,last:'4 ngày trước',signal:'pause',headline:'Có khoảng nghỉ giữa các lần học',detail:'Bảo An có 1 lượt tham gia trong 7 ngày gần đây, ít hơn giai đoạn trước. Đây chỉ là thay đổi về tần suất sử dụng, không nói lên cảm xúc hay năng lực của con.',forecast:'Dữ liệu hiện tại gợi ý nên quan sát thêm trước khi đưa ra nhận định về nhịp tham gia tuần tới.',suggestion:'Gia đình có thể nhẹ nhàng hỏi con có muốn cùng xem lại một thẻ yêu thích không.'}
  };
  state.soundPrefs ||= {effects:false,music:false};
  // Background audio never resumes automatically after a reload.
  state.soundPrefs.music = false;
  state.selectedClass ||= 'class-1a';

  const studentBy = (id) => state.students.find(s => s.id === id) || state.students[0];
  const childList = () => state.students.filter(s => s.guardian);
  const classListFor = (sid) => state.boxes.filter(b => b.type === 'class' && b.studentIds.includes(sid));
  const classCriteria = (b) => b?.criteria || (b?.id === 'class-1a'
    ? ['Tôn trọng nhịp độ riêng','Mỗi bạn được quyền lựa chọn','Không so sánh hay xếp hạng','Có thể xin nghỉ hoặc nhờ hỗ trợ']
    : ['Lắng nghe và tôn trọng nhau','Học bằng trải nghiệm tích cực','Khuyến khích lựa chọn cá nhân','Cùng xây dựng cảm giác an toàn']);
  const classBanner = (b, compact=false) => `<div class="class-criteria-banner ${compact?'compact':''}"><div class="class-criteria-icon">🌿</div><div class="class-criteria-copy"><span class="eyebrow">${'TIÊU CHÍ CỦA LỚP'}</span><h3>${escapeHtml(b?.name || 'Lớp học MIMORA')}</h3><p>${escapeHtml(b?.description || 'Một không gian học tập ấm áp, nơi mỗi bạn được tôn trọng.')}</p><div class="criteria-chips">${classCriteria(b).map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div></div><div class="class-criteria-mark">✿</div></div>`;

  // User-facing language: no visible use of the internal word "Box".
  window.boxLabel = (type) => ({default:'Lớp mặc định MIMORA',class:'Lớp học',school:'Trường học'}[type] || 'Không gian học tập');
  window.navConfig = function(){
    if(state.role==='student') return [
      ['student-home','⌂','Tổng quan'],
      ['student-default','🃏','Học cùng thẻ vật lí','KHÔNG GIAN LÀM VIỆC'],
      ['student-classes','🌿','Lớp học của con','KHÔNG GIAN LÀM VIỆC'],
      ['student-support','♡','Cài đặt hỗ trợ']
    ];
    if(state.role==='guardian') return [
      ['guardian-overview','⌂','Tổng quan gia đình'],['guardian-activate','▣','Kích hoạt bộ thẻ'],['guardian-children','♧','Tài khoản học sinh'],['guardian-progress','◷','Tiến trình học tập'],['guardian-insights','✧','Gợi ý AI'],['guardian-messages','✉','Trao đổi với giáo viên']
    ];
    if(state.role==='teacher') return [
      ['teacher-overview','⌂','Tổng quan'],['teacher-boxes','▦','Lớp học của tôi'],['teacher-students','♧','Học sinh & thành viên'],['teacher-content','▤','Thư viện nội dung'],['teacher-chapters','✿','Chương học'],['teacher-insights','✧','Gợi ý theo dõi'],['teacher-messages','✉','Trao đổi với phụ huynh'],['teacher-permissions','⚙','Quyền quản lý']
    ];
    return [['admin-overview','⌂','Tổng quan'],['admin-content','▤','Thư viện SEL'],['admin-approval','✓','Duyệt nội dung'],['admin-boxes','▦','Hệ thống lớp & trường'],['admin-licenses','◇','Giấy phép']];
  };

  window.shell = function(content){
    const meta=roleMeta(), nav=navConfig();
    let lastGroup='';
    const navHtml=nav.map(([page,ico,label,group])=>{
      const heading=group && group!==lastGroup ? `<div class="nav-group-label">${escapeHtml(group)}</div>` : '';
      if(group)lastGroup=group;
      return `${heading}<button class="nav-item ${state.page===page?'active':''}" data-page="${page}"><span class="nav-ico">${ico}</span>${label}</button>`;
    }).join('');
    const soundHint=state.soundPrefs?.music?'<span class="sidebar-sound">♫ Nhạc nền đang bật</span>':'';
    return `<div class="app-layout"><aside class="sidebar"><div class="side-profile">${avatar(meta.name,meta.color)}<div class="profile-meta"><strong>${escapeHtml(meta.name)}</strong><span>${escapeHtml(meta.sub)}</span></div></div><div class="side-label">Không gian làm việc</div><nav class="nav-list">${navHtml}</nav><div class="sidebar-bottom">${soundHint}<button class="role-switcher" data-action="switch-role">← Quay lại chọn vai trò</button></div></aside><section class="workspace page-enter">${content}</section></div>`;
  };

  window.boxCard = function(box, studentId, action=true){
    const n=progressFor(studentId,box.id), type=box.type, icon=type==='default'?'🃏':type==='class'?'🌿':'🏫', tone=type==='default'?'default':type==='class'?'classbox':'schoolbox';
    const label=type==='default'?'Lớp mặc định MIMORA':type==='class'?'Lớp học':'Trường học';
    const actionButton=action ? (type==='default'?`<button class="btn btn-small btn-soft" data-action="go-default">Học cùng thẻ →</button>`:`<button class="btn btn-small btn-soft" data-action="open-class" data-box="${box.id}">Vào lớp →</button>`) : '';
    return `<article class="box-card ${tone} refined-card">${type==='class'?`<div class="class-card-heading"><span>TIÊU CHÍ CỦA LỚP</span><strong>${escapeHtml(box.name)}</strong><small>${classCriteria(box).slice(0,3).map(x=>'· '+escapeHtml(x)).join('　')}</small></div>`:''}<div class="box-symbol">${icon}</div><div class="tag-row"><span class="badge ${type==='default'?'badge-gold':type==='class'?'badge-green':'badge-lav'}">${label}</span>${type==='default'?'<span class="badge badge-gray">Chính thức</span>':''}</div><h3>${escapeHtml(box.name)}</h3><p>${escapeHtml(box.description)}</p>${type==='class'?`<div class="criteria-mini"><strong>Điều lớp mình cùng gìn giữ</strong><div>${classCriteria(box).slice(0,2).map(x=>`<span>• ${escapeHtml(x)}</span>`).join('')}</div></div>`:''}<div class="progress-label"><span>${type==='default'?'Tiến trình học cùng thẻ':'Tiến trình tham gia lớp'}</span><strong>${n}/6 bước</strong></div>${progressBar(percent(n))}<div class="box-meta" style="margin-top:14px"><span class="micro-copy">${type==='default'?'Xây dựng bởi MIMORA':'Phụ trách: '+escapeHtml(box.owner)}</span>${actionButton}</div></article>`;
  };

  window.studentHome = function(){
    const s=currentStudent(), boxes=studentBoxes(s.id), def=boxes.find(b=>b.type==='default'), classes=classListFor(s.id), total=boxes.reduce((sum,b)=>sum+progressFor(s.id,b.id),0);
    return `${header(`Chào ${escapeHtml(s.name)}! 🌷`,'Mỗi ngày là một khám phá nhỏ, theo nhịp độ riêng của con.',`<button class="btn btn-outline" data-action="switch-student">Đổi học sinh</button>`)}
      <div class="student-welcome-ribbon"><div><span class="eyebrow">KHÔNG GIAN CỦA CON</span><h3>Ở đây, con luôn được là chính mình.</h3><p>Con có thể học cùng bộ thẻ MIMORA hoặc tham gia những lớp học mà con yêu thích.</p></div><div class="ribbon-art"><span>🌤️</span><i>🌱</i><b>☁️</b></div></div>
      <div class="stats-grid">${stat('Không gian đang tham gia',boxes.length,'Lớp mặc định và lớp học','⌂')}${stat('Bước đã khám phá',total,'Tiến trình của riêng con','✿')}${stat('Lớp học đang tham gia',classes.length,'Những người bạn đồng hành','🌿')}${stat('Người đồng hành','1','Gia đình luôn ở bên con','♡')}</div>
      <div class="student-space-grid">
        <button class="student-space-card physical" data-page="student-default"><span class="space-art">🃏</span><span class="space-kicker">BỘ THẺ VẬT LÍ</span><strong>Học cùng thẻ MIMORA</strong><small>Những tấm thẻ quen thuộc mở ra hành trình khám phá bản thân.</small><span class="space-foot">Tiếp tục hành trình <b>→</b></span></button>
        <button class="student-space-card classes" data-page="student-classes"><span class="space-art">🌿</span><span class="space-kicker">BẠN BÈ & THẦY CÔ</span><strong>Lớp học của con</strong><small>${classes.length?`Con đang tham gia ${classes.length} lớp học. Mỗi lớp có cách đồng hành riêng.`:'Những lớp học nơi con gặp gỡ thầy cô và bạn bè.'}</small><span class="space-foot">Khám phá lớp học <b>→</b></span></button>
      </div>
      <div class="panel student-kindness"><span>💛</span><div><strong>Không cần học thật nhanh</strong><p>Con có thể dừng lại, chọn cách giao tiếp phù hợp hoặc nhờ người lớn hỗ trợ bất cứ lúc nào.</p></div></div>`;
  };

  window.studentBoxesPage = function(){ return window.studentClassesPage(); };
  window.studentClassesPage = function(){
    const s=currentStudent(), classes=classListFor(s.id);
    return `${header('Lớp học của con','Mỗi lớp là một cộng đồng nhỏ, có những điều cùng thống nhất để mọi người cảm thấy an toàn và được tôn trọng.',`<button class="btn btn-outline" data-action="switch-student">Đổi học sinh</button>`)}
      <div class="content-stack">${classes.length?classes.map(b=>`${classBanner(b)}<div class="class-learning-card"><div class="row-main"><span class="class-avatar">🌿</span><div><strong>${escapeHtml(b.name)}</strong><small>Giáo viên đồng hành: ${escapeHtml(b.owner)} · ${b.studentIds.length} bạn trong lớp</small></div></div><p>${escapeHtml(b.description)}</p><div class="progress-label"><span>Tiến trình tham gia của con</span><strong>${progressFor(s.id,b.id)}/6 bước</strong></div>${progressBar(percent(progressFor(s.id,b.id)))}<div class="class-actions"><span class="badge badge-green">Con đã được tham gia</span><button class="btn btn-primary btn-small" data-action="open-class" data-box="${b.id}">Vào không gian lớp →</button></div></div>`).join(''):`<div class="empty-state panel"><div class="big">🌱</div><h3>Chưa có lớp học nào</h3><p>Khi giáo viên cho phép con tham gia, lớp học sẽ xuất hiện tại đây. Lớp mặc định MIMORA vẫn luôn sẵn sàng.</p><button class="btn btn-soft" data-page="student-default">Học cùng thẻ MIMORA</button></div>`}</div>`;
  };

  window.studentDefaultPage = function(){
    const s=currentStudent(), def=studentBoxes(s.id).find(b=>b.type==='default') || {id:'default-'+s.id,name:'Học cùng thẻ MIMORA',description:'Lộ trình học tập chính thức từ bộ thẻ vật lí MIMORA.'};
    const n=progressFor(s.id,def.id);
    return `${header('Học cùng thẻ MIMORA','Không gian học tập được thiết kế đồng hành cùng bộ thẻ vật lí của gia đình.')}
      <div class="physical-hero"><div class="physical-copy"><span class="badge badge-gold">BỘ THẺ VẬT LÍ MIMORA</span><h2>Chạm vào thẻ, mở ra một cuộc trò chuyện.</h2><p>Mỗi tấm thẻ là một lời mời để con quan sát, lựa chọn và diễn đạt theo cách riêng.</p><div class="physical-facts"><span>🌼 Học theo nhịp độ riêng</span><span>♡ Có gia đình đồng hành</span></div></div><div class="physical-art"><div class="card-fan"><i>🌤️</i><i>🌿</i><i>💛</i></div></div></div>
      <div class="section-title-row"><div><span class="eyebrow">CHƯƠNG TRÌNH CHÍNH THỨC</span><h3>Hành trình cùng bộ thẻ</h3><p>Demo hiện mở một chương học để con trải nghiệm trọn vẹn.</p></div><span class="badge badge-green">01 chương</span></div>
      <article class="chapter-card chapter-feature"><div class="chapter-cover"><div class="chapter-art">🌱</div><div><span class="badge badge-gold">Chương duy nhất trong bản demo</span><h3>Chương 1 — Nhận diện cảm xúc và nhu cầu của bản thân</h3><p>Khám phá cảm xúc, lắng nghe cơ thể và tìm cách nói ra điều con cần.</p></div></div><div class="progress-label"><span>Tiến trình của ${escapeHtml(s.name)}</span><strong>${n}/6 bước</strong></div>${progressBar(percent(n))}<div class="chapter-step-preview">${CHAPTER_STEPS.map((st,i)=>`<span>${i+1}. ${escapeHtml(st.short)}</span>`).join('')}</div><button class="btn btn-primary" style="margin-top:17px" data-action="open-chapter" data-box="${def.id}">Bắt đầu / tiếp tục Chương 1 →</button></article>
      <div class="notice">Lớp mặc định MIMORA luôn thuộc về con sau khi bộ thẻ được kích hoạt. Con vẫn giữ nguyên không gian này khi tham gia các lớp học khác.</div>`;
  };

  window.studentClassDetailPage = function(){
    const s=currentStudent(), b=boxById(state.selectedClass)||classListFor(s.id)[0];
    if(!b)return window.studentClassesPage();
    return `${header(b.name,'Một lớp học ấm áp, nơi mỗi bạn có một cách học riêng.')}${classBanner(b)}<div class="class-learning-card"><div class="section-title-row"><div><span class="eyebrow">HÔM NAY Ở LỚP MÌNH</span><h3>Chủ đề cùng khám phá</h3></div><span class="badge badge-green">Đang diễn ra</span></div><div class="topic-card"><span>🌻</span><div><strong>Nhận diện cảm xúc và nhu cầu</strong><p>Cùng quan sát tình huống, trò chuyện và lựa chọn cách thể hiện điều mình cần.</p></div></div><div class="progress-label"><span>Tiến trình tham gia</span><strong>${progressFor(s.id,b.id)}/6 bước</strong></div>${progressBar(percent(progressFor(s.id,b.id)))}<button class="btn btn-primary" data-action="open-chapter" data-box="${b.id}" style="margin-top:16px">Tiếp tục hoạt động của lớp →</button></div>`;
  };

  // Override the physical-card learning header so the Chapter is nested under the physical-card area.
  const oldChapterPage = window.chapterPage;
  window.chapterPage = function(){
    const s=currentStudent(), box=boxById(state.selectedBox)||studentBoxes(s.id).find(b=>b.type==='default');
    const page=oldChapterPage();
    // Change breadcrumb context and avoid implying a standalone workspace Chapter menu.
    if(box?.type==='class'){return page.replace('Chương 1 — Nhận diện cảm xúc','Hoạt động cùng lớp').replace('Chương 1','Hoạt động của lớp').replace('data-page="student-boxes"','data-page="student-classes"').replace('← Các Lớp','← Lớp học của con').replace('← Các Box','← Lớp học của con');}
    return page.replace('data-page="student-boxes"','data-page="student-default"').replace('← Các Lớp','← Học cùng thẻ MIMORA').replace('← Các Box','← Học cùng thẻ MIMORA');
  };

  const aiCard = (sid, compact=false) => {
    const s=studentBy(sid), a=state.aiSignals[sid] || state.aiSignals.minhanh;
    return `<section class="ai-insight-card ${a.signal==='pause'?'attention':''}"><div class="ai-card-top"><div class="ai-spark">✧</div><div><span class="eyebrow">AI HỖ TRỢ THEO DÕI · DỮ LIỆU DEMO</span><h3>${escapeHtml(a.headline)}</h3></div><span class="badge ${a.signal==='pause'?'badge-gold':'badge-green'}">${a.signal==='pause'?'Gợi ý quan sát':'Ổn định'}</span></div><p>${escapeHtml(s.name)} có ${a.weekly} lượt tham gia trong 7 ngày gần đây (giai đoạn trước: ${a.previous} lượt). Lần gần nhất: ${escapeHtml(a.last)}.</p><div class="ai-forecast"><strong>Xu hướng tham gia tuần tới · Mô phỏng</strong><span>${escapeHtml(a.forecast||'Chưa đủ dữ liệu để đưa ra gợi ý.')}</span></div><div class="ai-suggestion"><strong>Gợi ý đồng hành</strong><span>${escapeHtml(a.suggestion)}</span></div>${compact?`<button class="btn btn-small btn-soft" data-page="${state.role==='teacher'?'teacher-insights':'guardian-insights'}">Xem phân tích minh họa →</button>`:`<button class="btn btn-small btn-outline" data-action="notify-ai" data-student="${sid}">Gửi thông báo nhắc đồng hành</button>`}</section>`;
  };

  window.guardianOverview = function(){
    const kids=childList();
    return `${header('Không gian gia đình','Một nơi ấm áp để đồng hành cùng hành trình lớn lên của con.',`<button class="btn btn-primary" data-page="guardian-activate">＋ Kích hoạt bộ thẻ</button>`)}<div class="content-stack"><div class="family-welcome"><div><span class="eyebrow">GIA ĐÌNH MIMORA</span><h3>Mỗi bước nhỏ của con đều đáng được lắng nghe.</h3><p>Phụ huynh có thể đồng hành cùng con ở nhà và kết nối với giáo viên tại lớp.</p></div><div class="family-welcome-art">🏡💛</div></div><div class="stats-grid">${stat('Tài khoản học sinh',kids.length,'Được liên kết với gia đình','♧')}${stat('Lớp đang tham gia',kids.reduce((n,s)=>n+classListFor(s.id).length,0),'Các lớp học của con','🌿')}${stat('Chương trình thẻ','01','Chương 1 trong demo','🃏')}${stat('Bộ thẻ đã kích hoạt',state.activationUsed?'2 bộ':'1 bộ','Mã trải nghiệm mô phỏng','▣')}</div><div class="panel"><div class="panel-head"><div><h3>Các con trong gia đình</h3><p>Mỗi học sinh có một không gian trò chuyện riêng với giáo viên phụ trách.</p></div><button class="btn btn-small btn-outline" data-page="guardian-children">Quản lý tài khoản →</button></div><div class="box-grid">${kids.map(s=>kidCard(s)).join('')}</div></div><div class="two-col"><div class="panel"><div class="panel-head"><div><h3>Gợi ý đồng hành từ AI</h3><p>Chỉ dựa trên nhịp độ tham gia, không suy đoán cảm xúc.</p></div><button class="btn btn-small btn-outline" data-page="guardian-insights">Xem →</button></div>${kids.map(s=>aiCard(s.id,true)).join('')}</div><div class="panel"><div class="panel-head"><div><h3>Trao đổi với giáo viên</h3><p>Mỗi cuộc trò chuyện gắn riêng với một học sinh.</p></div><button class="btn btn-small btn-outline" data-page="guardian-messages">Mở tin nhắn →</button></div>${kids.map(s=>`<div class="student-row"><div class="row-main">${avatar(s.name)}<div><strong>${escapeHtml(s.name)}</strong><small>Trao đổi riêng với giáo viên phụ trách</small></div></div><button class="btn btn-small btn-soft" data-action="open-chat" data-student="${s.id}">Nhắn tin</button></div>`).join('')}</div></div></div>`;
  };

  window.guardianInsightsPage = function(){
    const selected=studentBy(state.selectedChild)||childList()[0];
    return `${header('AI hỗ trợ theo dõi','Những gợi ý dựa trên tần suất tham gia hoạt động, giúp gia đình và giáo viên biết khi nào nên hỏi thăm nhẹ nhàng.')}
      <div class="panel"><div class="panel-head"><div><h3>Chọn học sinh</h3><p>Mỗi bản tổng hợp chỉ hiển thị cho người được quyền theo dõi học sinh.</p></div></div><div class="student-switch">${childList().map(s=>`<button class="${selected?.id===s.id?'active':''}" data-action="select-ai-child" data-student="${s.id}">${s.avatar} ${escapeHtml(s.name)}</button>`).join('')}</div></div>
      ${selected?aiCard(selected.id,false):''}<div class="notice lav">Lưu ý: Đây là mô phỏng AI dùng dữ liệu hoạt động giả lập. Hệ thống không phân tích câu trả lời, không suy đoán cảm xúc, không chẩn đoán và không kết luận tình trạng tâm lý của trẻ. Nhịp tham gia không đồng nghĩa với tiến bộ SEL.</div>
      <div class="panel"><h3>Thông báo gần đây</h3>${state.notifications.filter(n=>n.studentId===selected?.id).map(n=>`<div class="notification-row"><span>🔔</span><div><strong>${escapeHtml(n.title)}</strong><small>${escapeHtml(n.body)} · ${escapeHtml(n.time)}</small></div></div>`).join('')||'<div class="empty-state"><div class="big">🌷</div><p>Chưa có thông báo mới. Các gợi ý sẽ xuất hiện tại đây.</p></div>'}</div>`;
  };

  const chatThread = (sid) => state.messages[sid] || (state.messages[sid]=[]);
  const messagePage = (role) => {
    const allowed=role==='guardian'?childList():state.students.filter(s=>classListFor(s.id).length>0 || s.id==='minhanh');
    if(!allowed.some(s=>s.id===state.chatStudent)) state.chatStudent=allowed[0]?.id || 'minhanh';
    const active=studentBy(state.chatStudent), thread=chatThread(active.id);
    return `${header(role==='guardian'?'Trao đổi với giáo viên':'Trao đổi với phụ huynh','Mỗi học sinh có một cuộc trò chuyện riêng. Nội dung trao đổi không bị trộn lẫn giữa các trẻ.')}
      <div class="messenger-layout"><aside class="thread-list"><div class="thread-list-title"><strong>Cuộc trò chuyện</strong><span class="badge badge-green">Riêng tư theo học sinh</span></div>${allowed.map(s=>{const last=chatThread(s.id).at(-1);return `<button class="thread-person ${s.id===active.id?'active':''}" data-action="select-chat-child" data-student="${s.id}">${avatar(s.name)}<span><strong>${escapeHtml(s.name)}</strong><small>${escapeHtml(last?.text||'Bắt đầu trao đổi')}</small></span></button>`;}).join('')}</aside>
      <section class="chat-panel"><div class="chat-heading">${avatar(active.name)}<div><strong>Trao đổi về ${escapeHtml(active.name)}</strong><small>${role==='guardian'?'Cô Mai · Giáo viên phụ trách':'Phụ huynh của '+escapeHtml(active.name)}</small></div><span class="badge badge-green">Riêng học sinh này</span></div><div class="chat-messages" id="chatMessages">${thread.map(m=>`<div class="chat-line ${m.from===role?'mine':'theirs'}"><div class="chat-bubble">${escapeHtml(m.text)}</div><small>${escapeHtml(m.time)} · ${m.from==='guardian'?'Phụ huynh':'Giáo viên'}</small></div>`).join('')}</div><form class="chat-compose" data-form="thread-message"><input type="hidden" name="studentId" value="${active.id}"><input name="message" maxlength="500" placeholder="Viết lời nhắn ấm áp..." autocomplete="off" required><button class="btn btn-primary" type="submit">Gửi lời nhắn →</button></form><div class="chat-privacy">♡ Cuộc trò chuyện chỉ gắn với ${escapeHtml(active.name)}. Đây là dữ liệu mô phỏng trong bản demo.</div></section></div>`;
  };
  window.guardianMessagesPage = () => messagePage('guardian');
  window.teacherMessagesPage = () => messagePage('teacher');
  window.teacherInsightsPage = function(){
    const students=state.students.filter(s=>classListFor(s.id).length>0);
    return `${header('Gợi ý theo dõi học sinh','Thông tin hỗ trợ giáo viên chủ động trao đổi với gia đình, không thay thế quan sát chuyên môn.')}
      <div class="content-stack">${state.permissions.viewProgress?students.map(s=>aiCard(s.id,false)).join(''):'<div class="notice rose">Tài khoản hiện chưa được cấp quyền theo dõi tiến trình học sinh.</div>'}<div class="notice lav">AI demo chỉ tổng hợp nhịp độ tham gia hoạt động giả lập. Không phân tích lựa chọn, cảm xúc hoặc nội dung giao tiếp của trẻ.</div></div>`;
  };

  // Give the teacher's existing dashboards the same warm class identity and shared family communication.
  const oldTeacherOverview=window.teacherOverview;
  window.teacherOverview=function(){
    const base=oldTeacherOverview();
    const tracked=state.students.filter(s=>classListFor(s.id).length>0);
    return base.replace(/Box trường học/g,'Trường học').replace(/Box lớp/g,'Lớp học').replace(/Box/g,'Lớp') + `<div class="two-col"><div class="panel"><div class="panel-head"><div><h3>AI hỗ trợ theo dõi</h3><p>Gợi ý từ nhịp độ tham gia, không suy đoán cảm xúc.</p></div><button class="btn btn-small btn-outline" data-page="teacher-insights">Xem tất cả →</button></div>${state.permissions.viewProgress?tracked.map(s=>aiCard(s.id,true)).join(''):'<div class="notice rose">Tài khoản chưa được cấp quyền theo dõi tiến trình.</div>'}</div><div class="panel"><div class="panel-head"><div><h3>Trao đổi với gia đình</h3><p>Mỗi cuộc trò chuyện được tách riêng theo từng học sinh.</p></div><button class="btn btn-small btn-outline" data-page="teacher-messages">Mở tin nhắn →</button></div>${tracked.map(s=>`<div class="student-row"><div class="row-main">${avatar(s.name)}<div><strong>${escapeHtml(s.name)}</strong><small>Tin nhắn riêng với phụ huynh</small></div></div><button class="btn btn-small btn-soft" data-action="open-chat" data-student="${s.id}">Mở trò chuyện</button></div>`).join('')}</div></div>`;
  };
  window.teacherBoxes=function(){
    const manager=state.teacherMode==='manager';
    const own=manager?state.boxes.filter(b=>b.type==='class'&&b.schoolId==='school-1'):state.boxes.filter(b=>b.type==='class'&&b.owner==='Cô Mai');
    return `${header('Lớp học của tôi','Mỗi lớp có mục tiêu, tiêu chí đồng hành và nhóm học sinh riêng.',manager?'<span class="badge badge-lav">Quyền quản lý trường</span>':'<button class="btn btn-primary" data-action="create-class">＋ Tạo lớp học</button>')}${teacherModeSwitch()}<div class="content-stack">${own.map(b=>`${classBanner(b,true)}<div class="class-learning-card"><div class="row-main"><span class="class-avatar">🌿</span><div><strong>${escapeHtml(b.name)}</strong><small>${b.studentIds.length} học sinh · Phụ trách: ${escapeHtml(b.owner)}</small></div></div><p>${escapeHtml(b.description)}</p><div class="class-actions"><span class="badge badge-green">Chương trình đang hoạt động</span><button class="btn btn-small btn-soft" data-action="manage-box" data-box="${b.id}">Quản lý lớp →</button></div></div>`).join('')}${manager?`<div class="panel"><div class="panel-head"><div><h3>Trường MIMORA Demo</h3><p>Hai lớp đang nằm trong phạm vi trường.</p></div></div>${schoolTree()}</div>`:''}</div>`;
  };
  const oldTeacherStudents=window.teacherStudents;
  window.teacherStudents=function(){ return oldTeacherStudents().replace(/Box trường học/g,'Trường học').replace(/Box lớp/g,'Lớp học').replace(/Box/g,'Lớp'); };
  const oldTeacherChapters=window.teacherChapters;
  window.teacherChapters=function(){ return oldTeacherChapters().replace(/Box trường học/g,'Trường học').replace(/Box lớp/g,'Lớp học').replace(/Box/g,'Lớp'); };
  const oldTeacherPermissions=window.teacherPermissions;
  window.teacherPermissions=function(){ return oldTeacherPermissions().replace(/Box trường học/g,'Trường học').replace(/Box lớp/g,'Lớp học').replace(/Box/g,'Lớp'); };
  const oldAdminOverview=window.adminOverview;
  window.adminOverview=function(){ return oldAdminOverview().replace(/Box trường học/g,'Trường học').replace(/Box lớp/g,'Lớp học').replace(/Box mặc định/g,'Lớp mặc định').replace(/Box/g,'Lớp'); };
  const oldAdminBoxes=window.adminBoxes;
  window.adminBoxes=function(){ return oldAdminBoxes().replace(/Box trường học/g,'Trường học').replace(/Box lớp/g,'Lớp học').replace(/Box mặc định/g,'Lớp mặc định').replace(/Box/g,'Lớp'); };
  const oldAdminLicenses=window.adminLicenses;
  window.adminLicenses=function(){ return oldAdminLicenses().replace(/Box trường học/g,'Trường học').replace(/Box lớp/g,'Lớp học').replace(/Box mặc định/g,'Lớp mặc định').replace(/Box/g,'Lớp'); };
  const oldStudentSupport=window.studentSupport;
  window.studentSupport=function(){ return oldStudentSupport().replace(/Box trường học/g,'Trường học').replace(/Box lớp/g,'Lớp học').replace(/Box mặc định/g,'Lớp mặc định').replace(/Box/g,'Lớp'); };
  const oldGuardianChildren=window.guardianChildren;
  window.guardianChildren=function(){ return oldGuardianChildren().replace(/Box trường học/g,'Trường học').replace(/Box lớp/g,'Lớp học').replace(/Box mặc định/g,'Lớp mặc định').replace(/Box/g,'Lớp'); };
  const oldGuardianProgress=window.guardianProgress;
  window.guardianProgress=function(){ return oldGuardianProgress().replace(/Box trường học/g,'Trường học').replace(/Box lớp/g,'Lớp học').replace(/Box mặc định/g,'Lớp mặc định').replace(/Box/g,'Lớp'); };

  window.homePage = function(){
    const roles=[
      ['student','🌼','Học sinh','Một không gian học tập dịu dàng dành cho con.','#f2efe3','#9a8052'],
      ['guardian','♡','Phụ huynh','Đồng hành và kết nối với giáo viên của con.','#f6eae6','#a66f65'],
      ['teacher','✿','Giáo viên','Tổ chức lớp học và hỗ trợ từng học sinh.','#e8f0e9','#56806c'],
      ['admin','✦','Quản trị viên','Phát triển nội dung và vận hành MIMORA.','#eeecf5','#787291']
    ];
    const art=`<svg viewBox="0 0 420 270" role="img" aria-label="Minh họa gia đình và trẻ cùng khám phá bộ thẻ MIMORA" class="welcome-vector"><ellipse cx="210" cy="238" rx="162" ry="16" fill="#a8b9a0" opacity=".25"/><circle cx="326" cy="57" r="28" fill="#efd79f"/><path d="M54 204 Q105 128 165 190 T281 176 T390 197 V241 H54Z" fill="#dfe9d9"/><rect x="139" y="114" width="139" height="96" rx="20" fill="#fffaf0" stroke="#dfd6c6" stroke-width="3"/><rect x="153" y="129" width="111" height="66" rx="12" fill="#f2e7d4"/><path d="M208 130 V195" stroke="#ddcdb1" stroke-width="3"/><path d="M155 154 Q180 138 207 155 Q235 137 261 154" fill="none" stroke="#8ea991" stroke-width="4" stroke-linecap="round"/><circle cx="102" cy="113" r="31" fill="#d99b7d"/><path d="M73 111 Q78 70 113 80 Q141 91 128 121 Q112 98 92 104Z" fill="#59483d"/><path d="M65 208 Q66 146 103 145 Q144 147 147 208Z" fill="#789a89"/><circle cx="317" cy="136" r="27" fill="#e8b28c"/><path d="M291 133 Q286 94 322 105 Q345 115 341 144 Q325 123 306 127Z" fill="#56443a"/><path d="M280 221 Q280 165 317 164 Q356 165 360 221Z" fill="#c98777"/><circle cx="102" cy="115" r="3" fill="#4b4940"/><circle cx="116" cy="115" r="3" fill="#4b4940"/><path d="M103 127 Q109 133 116 126" fill="none" stroke="#8b5e51" stroke-width="2" stroke-linecap="round"/><circle cx="310" cy="138" r="3" fill="#4b4940"/><circle cx="324" cy="138" r="3" fill="#4b4940"/><path d="M311 149 Q317 155 325 148" fill="none" stroke="#8b5e51" stroke-width="2" stroke-linecap="round"/><path d="M202 87 Q210 69 218 87 Q236 90 219 99 Q214 116 205 100 Q187 96 202 87Z" fill="#d4ad65"/><path d="M61 62 Q69 45 77 62 Q94 66 79 74 Q73 90 65 76 Q48 71 61 62Z" fill="#91ad94"/><path d="M359 82 Q367 66 375 82 Q392 86 377 94 Q371 111 363 96 Q346 91 359 82Z" fill="#d39a86"/></svg>`;
    return `<div class="welcome redesigned-welcome"><section class="welcome-hero"><div class="hero-copy"><div class="eyebrow">MỘT HỆ SINH THÁI HỌC TẬP ẤM ÁP</div><h1>Cùng con hiểu mình,<br><em>tự tin lớn lên.</em></h1><p>MIMORA kết nối bộ thẻ vật lí, gia đình và nhà trường trong những không gian học tập nơi mỗi đứa trẻ được lắng nghe, tôn trọng và đồng hành theo cách riêng.</p><div class="hero-values"><span>♡ Tôn trọng nhịp độ riêng</span><span>✿ Học tập qua trải nghiệm</span><span>🌱 Gia đình cùng đồng hành</span></div></div><div class="hero-art scene-art">${art}<div class="scene-caption">Mỗi hành trình đều bắt đầu từ một điều nhỏ bé.</div></div></section><section class="role-section"><div class="section-heading"><div><div class="eyebrow">CHÀO MỪNG ĐẾN VỚI MIMORA</div><h2>Hôm nay bạn muốn bước vào đâu?</h2></div><p>Chọn không gian phù hợp với vai trò của bạn.</p></div><div class="role-grid">${roles.map(([r,ico,n,d,bg,fg])=>`<button class="role-card refined-role" data-role="${r}"><span class="role-icon" style="background:${bg};color:${fg}">${ico}</span><strong>${n}</strong><small>${d}</small><span class="role-arrow">Khám phá <b>↗</b></span></button>`).join('')}</div><div class="home-note">Bản trải nghiệm tương tác · Dữ liệu mô phỏng · Chỉ trình bày Chương 1 trong khu vực Học cùng thẻ MIMORA</div></section></div>`;
  };

  window.schoolTree = function(){
    const classes=state.boxes.filter(b=>b.type==='class'&&b.schoolId==='school-1');
    return `<div class="school-tree refined-school-tree"><div class="tree-school"><span>🏫</span><span>${escapeHtml(state.school.name)}</span><span class="badge badge-lav">Trường học</span></div><div class="tree-classes">${classes.map(b=>`<div class="tree-class expanded-tree-class"><div><strong>🌿 ${escapeHtml(b.name)}</strong><small>${b.studentIds.length} học sinh · Giáo viên: ${escapeHtml(b.owner)}</small><div class="tree-criteria">${classCriteria(b).slice(0,3).map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div></div><span class="badge badge-green">Đang hoạt động</span></div>`).join('')}</div></div>`;
  };

  // Extend page routing without changing the original role/auth flows.
  window.render=function(){
    const studentRoutes={'student-default':window.studentDefaultPage,'student-classes':window.studentClassesPage,'student-class-detail':window.studentClassDetailPage};
    const guardianRoutes={'guardian-insights':window.guardianInsightsPage,'guardian-messages':window.guardianMessagesPage};
    const teacherRoutes={'teacher-insights':window.teacherInsightsPage,'teacher-messages':window.teacherMessagesPage};
    const route=state.role==='student'?studentRoutes[state.page]:state.role==='guardian'?guardianRoutes[state.page]:state.role==='teacher'?teacherRoutes[state.page]:null;
    if(route){const topSwitch=$id('switchRole');if(topSwitch)topSwitch.classList.remove('hidden');main.innerHTML=shell(route());return;}
    baseRender();
  };

  function handleNewAction(action){
    switch(action.dataset.action){
      case 'go-default': go('student-default'); return true;
      case 'open-class': state.selectedClass=action.dataset.box; saveState(); go('student-class-detail'); return true;
      case 'open-chat': state.chatStudent=action.dataset.student; go(state.role==='teacher'?'teacher-messages':'guardian-messages'); return true;
      case 'select-chat-child': state.chatStudent=action.dataset.student; saveState(); render(); return true;
      case 'select-ai-child': state.selectedChild=action.dataset.student; saveState(); render(); return true;
      case 'notify-ai': {
        const sid=action.dataset.student, s=studentBy(sid), a=state.aiSignals[sid]||state.aiSignals.minhanh;
        state.notifications.push({studentId:sid,title:`Gợi ý đồng hành về ${s.name}`,body:a.suggestion,time:'Vừa gửi · Bản demo'});
        saveState(); toast(`Đã tạo thông báo mô phỏng cho ${s.name}.`); render(); return true;
      }
    }
    return false;
  }
  main.addEventListener('click', e=>{const action=e.target.closest('[data-action]');if(action&&handleNewAction(action)){e.preventDefault();e.stopImmediatePropagation();}},true);
  document.addEventListener('submit', e=>{
    const form=e.target.closest('form[data-form="thread-message"]'); if(!form)return;
    e.preventDefault(); e.stopImmediatePropagation();
    const fd=new FormData(form), sid=String(fd.get('studentId')), message=String(fd.get('message')||'').trim();
    if(!message)return;
    const from=state.role==='guardian'?'guardian':'teacher';
    state.messages[sid] ||= [];
    state.messages[sid].push({from,text:message,time:'Vừa xong'});
    saveState(); toast('Lời nhắn đã được thêm vào cuộc trò chuyện riêng.'); render();
  },true);

  // Rich local illustrations: original SVG artwork, shipped with the project (no remote image dependencies).
  function addIllustration(el, src, className, alt){
    if(!el || el.querySelector(`.${className}`)) return;
    const img=document.createElement('img');img.src=`assets/${src}`;img.alt=alt;img.className=className;img.loading='lazy';img.decoding='async';
    el.appendChild(img);
  }
  function decorateIllustrations(){
    document.querySelectorAll('.role-card[data-role]').forEach(card=>{
      const map={student:['role-student.svg','Minh họa học sinh khám phá cùng quyển sách'],guardian:['role-guardian.svg','Minh họa phụ huynh đồng hành cùng con'],teacher:['role-teacher.svg','Minh họa giáo viên cùng bảng học'],admin:['role-admin.svg','Minh họa quản trị viên và bảng điều khiển']};
      const item=map[card.dataset.role];if(item)addIllustration(card,item[0],'role-art-image',item[1]);
    });
    document.querySelectorAll('.student-space-card.physical .space-art').forEach(el=>{if(!el.querySelector('.space-art-image')){el.textContent='';addIllustration(el,'card-deck.svg','space-art-image','Bộ thẻ học tập MIMORA đầy màu sắc');}});
    document.querySelectorAll('.student-space-card.classes .space-art').forEach(el=>{if(!el.querySelector('.space-art-image')){el.textContent='';addIllustration(el,'classroom.svg','space-art-image','Lớp học thân thiện với học sinh');}});
    document.querySelectorAll('.physical-art').forEach(el=>{if(!el.querySelector('.physical-deck-image')){el.innerHTML='';addIllustration(el,'card-deck.svg','physical-deck-image','Bộ thẻ vật lý MIMORA');}});
    document.querySelectorAll('.chapter-art').forEach(el=>{if(!el.querySelector('.chapter-art-image')){el.textContent='';addIllustration(el,'chapter-feelings.svg','chapter-art-image','Minh họa Chương 1 về cảm xúc và nhu cầu');}});
    document.querySelectorAll('.class-criteria-icon').forEach(el=>{if(!el.querySelector('.criteria-art-image')){el.textContent='';addIllustration(el,'classroom.svg','criteria-art-image','Không gian lớp học');}});
    document.querySelectorAll('.ribbon-art').forEach(el=>{if(!el.querySelector('.ribbon-art-image')){el.querySelectorAll('span,i,b').forEach(n=>n.remove());addIllustration(el,'hero-friends.svg','ribbon-art-image','Các bạn nhỏ cùng khám phá và học tập');}});
    document.querySelectorAll('.topic-card>span').forEach(el=>{if(!el.querySelector('.topic-art-image')){el.textContent='';addIllustration(el,'child-learning.svg','topic-art-image','Học sinh đang trải nghiệm hoạt động học tập');}});
    document.querySelectorAll('.box-card .box-symbol').forEach(el=>{
      const box=el.closest('.box-card');const file=box?.classList.contains('default')?'card-deck.svg':box?.classList.contains('classbox')?'classroom.svg':'family-home.svg';
      if(!el.querySelector('.box-art-image')){el.textContent='';addIllustration(el,file,'box-art-image','Minh họa không gian học tập MIMORA');}
    });
    document.querySelectorAll('.family-welcome-art').forEach(el=>{if(!el.querySelector('.family-art-image')){el.textContent='';addIllustration(el,'family-home.svg','family-art-image','Gia đình cùng đồng hành với con');}});
  }
  const illustrationObserver=new MutationObserver(()=>requestAnimationFrame(decorateIllustrations));
  illustrationObserver.observe(main,{childList:true,subtree:true});
  decorateIllustrations();

  // Cheerful CC0 instrumental background track. User starts it manually; no autoplay.
  const bgMusic=$id('mimoraBgMusic');
  let audioCtx=null, ambientNodes=null, melodyTimer=null, melodyIndex=0, synthMaster=null;
  const ensureAudio=()=>{
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx)return null;
    if(!audioCtx)audioCtx=new Ctx();
    if(audioCtx.state==='suspended')audioCtx.resume();
    return audioCtx;
  };
  function tone(freq=640,duration=.09,volume=.028,type='sine'){
    const ctx=ensureAudio();if(!ctx)return;
    const osc=ctx.createOscillator(), gain=ctx.createGain();
    osc.type=type;osc.frequency.setValueAtTime(freq,ctx.currentTime);
    gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(volume,ctx.currentTime+.012);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
    osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+duration+.02);
  }
  function playClick(){
    if(!state.soundPrefs.effects)return;
    tone(740,.065,.018,'sine');setTimeout(()=>tone(960,.09,.012,'triangle'),55);
  }
  function startSynthFallback(){
    if(synthMaster)return;
    const ctx=ensureAudio();if(!ctx)return;
    const master=ctx.createGain();master.gain.setValueAtTime(.0001,ctx.currentTime);master.gain.exponentialRampToValueAtTime(.018,ctx.currentTime+1.8);master.connect(ctx.destination);synthMaster=master;
    const melody=[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46,523.25,587.33,659.25,783.99,698.46,659.25,587.33,523.25];
    const bass=[261.63,329.63,392,329.63];melodyIndex=0;
    const beat=()=>{
      if(!state.soundPrefs.music||!synthMaster)return;
      const now=ctx.currentTime, freq=melody[melodyIndex%melody.length];
      const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='triangle';osc.frequency.setValueAtTime(freq,now);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.24,now+.018);gain.gain.exponentialRampToValueAtTime(.0001,now+.23);osc.connect(gain);gain.connect(synthMaster);osc.start(now);osc.stop(now+.25);
      if(melodyIndex%4===0){const sub=ctx.createOscillator(),sg=ctx.createGain();sub.type='sine';sub.frequency.value=bass[Math.floor(melodyIndex/4)%bass.length]/2;sg.gain.setValueAtTime(.0001,now);sg.gain.exponentialRampToValueAtTime(.10,now+.025);sg.gain.exponentialRampToValueAtTime(.0001,now+.32);sub.connect(sg);sg.connect(synthMaster);sub.start(now);sub.stop(now+.34);}
      melodyIndex++;melodyTimer=setTimeout(beat,245);
    };
    beat();
  }
  function fallbackToCheerfulSynth(){
    if(!state.soundPrefs.music || synthMaster)return;
    toast('Không tải được nhạc trực tuyến; đang phát giai điệu vui dự phòng của MIMORA.');
    startSynthFallback();
  }
  bgMusic?.addEventListener('error',fallbackToCheerfulSynth);
  function startAmbient(){
    stopAmbient();state.soundPrefs.music=true;
    if(bgMusic){
      bgMusic.volume=.24;bgMusic.currentTime=0;
      const attempt=bgMusic.play();
      if(attempt&&typeof attempt.catch==='function')attempt.catch(fallbackToCheerfulSynth);
      return;
    }
    startSynthFallback();
  }
  function stopAmbient(){
    state.soundPrefs.music=false;
    if(bgMusic){bgMusic.pause();try{bgMusic.currentTime=0;}catch(e){}}
    if(melodyTimer){clearTimeout(melodyTimer);melodyTimer=null;}
    if(synthMaster&&audioCtx){const now=audioCtx.currentTime;synthMaster.gain.cancelScheduledValues(now);synthMaster.gain.setTargetAtTime(.0001,now,.2);synthMaster=null;}
  }
  function syncSoundButtons(){
    const fx=$id('fxToggle'),music=$id('musicToggle');
    if(fx){fx.textContent=`♪ Âm bấm: ${state.soundPrefs.effects?'Bật':'Tắt'}`;fx.classList.toggle('sound-active',state.soundPrefs.effects);fx.setAttribute('aria-pressed',String(state.soundPrefs.effects));}
    if(music){music.textContent=`♫ Nhạc vui: ${state.soundPrefs.music?'Bật':'Tắt'}`;music.classList.toggle('sound-active',state.soundPrefs.music);music.setAttribute('aria-pressed',String(state.soundPrefs.music));}
  }
  $id('fxToggle')?.addEventListener('click',()=>{state.soundPrefs.effects=!state.soundPrefs.effects;saveState();syncSoundButtons();if(state.soundPrefs.effects)tone(760,.12,.025);});
  $id('musicToggle')?.addEventListener('click',()=>{if(state.soundPrefs.music)stopAmbient();else startAmbient();saveState();syncSoundButtons();});
  document.addEventListener('click',e=>{if(e.target.closest('button')&&!e.target.closest('#fxToggle,#musicToggle'))playClick();},true);
  const originalResetDemo=window.resetDemo;
  window.resetDemo=function(){originalResetDemo();stopAmbient();state.soundPrefs={effects:false,music:false};saveState();syncSoundButtons();};
  syncSoundButtons();
  // Repaint once so the enhanced shell and student navigation are active on the first load.
  window.render();
})();
