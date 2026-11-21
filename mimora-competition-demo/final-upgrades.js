/* MIMORA Competition Demo — final product experience layer.
   All state is synthetic, local to this browser, and intentionally non-clinical. */
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safe = (fn, fallback='') => { try { return fn(); } catch { return fallback; } };

  // State migration: preserve the previous demo journey and only add missing fields.
  state.visualMode ||= 'calm';
  state.studentRest ||= false;
  state.resumeStep ||= {};
  state.classCriteria ||= {};
  state.classTeachers ||= { 'class-1a':['mai'], 'class-1b':['lan'] };
  state.teacherDelegations ||= [];
  state.studentChapterNotes ||= {};
  state.demoNoticeSeen ||= false;
  state.permissions ||= {createClass:true,manageRoster:true,assignContent:true,viewProgress:true,delegate:true};
  state.notifications ||= [];
  state.messages ||= {minhanh:[],baoan:[]};

  const student = id => state.students.find(s=>s.id===id) || state.students[0];
  const kids = () => state.students.filter(s=>s.guardian);
  const classList = sid => state.boxes.filter(b=>b.type==='class' && b.studentIds.includes(sid));
  const classCriteriaData = b => state.classCriteria[b.id] || b.criteria || (b.id==='class-1a'
    ? ['Tôn trọng nhịp độ riêng','Mỗi bạn được quyền lựa chọn','Không so sánh hay xếp hạng','Có thể xin nghỉ hoặc nhờ hỗ trợ']
    : ['Lắng nghe và tôn trọng nhau','Học bằng trải nghiệm tích cực','Khuyến khích lựa chọn cá nhân','Cùng xây dựng cảm giác an toàn']);
  const totalSteps = 6;
  const selectedAnswer = (sid,bid,step) => state.answers?.[`${sid}:${bid}:${step}`];
  const progressCount = (sid,bid) => Math.max(0,Math.min(totalSteps,Number(state.progress?.[sid]?.[bid]||0)));
  const iconForStep = ['🌤️','🫶','🌼','🧩','🔎','💬'];
  const miniIllustration = (kind, label='') => {
    const maps={
      book:`<svg viewBox="0 0 260 170" role="img" aria-label="Bộ thẻ học tập"><ellipse cx="130" cy="150" rx="100" ry="10" fill="#9c8261" opacity=".15"/><g transform="translate(35 20) rotate(-12 48 62)"><rect width="86" height="116" rx="14" fill="#ffbfa9" stroke="#fff" stroke-width="5"/><circle cx="43" cy="42" r="22" fill="#ffe9aa"/><path d="M28 48q15 18 30 0" stroke="#9d715e" stroke-width="3" fill="none" stroke-linecap="round"/><text x="43" y="91" text-anchor="middle" fill="#765b4e" font-size="10" font-weight="700">CẢM XÚC</text></g><g transform="translate(122 15) rotate(10 45 62)"><rect width="86" height="116" rx="14" fill="#a9ddc5" stroke="#fff" stroke-width="5"/><path d="M43 22c-22 20-26 42 0 56 26-14 22-36 0-56" fill="#fff3bd"/><text x="43" y="96" text-anchor="middle" fill="#4c7462" font-size="10" font-weight="700">LỰA CHỌN</text></g><path d="M110 6q-14-16-23 0 13 12 23 0M111 6q14-16 24-1-13 12-24 1" fill="#7fb38d"/> </svg>`,
      class:`<svg viewBox="0 0 260 170" role="img" aria-label="Lớp học thân thiện"><rect x="20" y="20" width="220" height="126" rx="20" fill="#d5ecdf"/><rect x="88" y="38" width="92" height="58" rx="7" fill="#648b78"/><path d="M103 83q17-23 32-3t29-8" stroke="#f9df9a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="60" cy="91" r="17" fill="#e6b18e"/><path d="M43 91q-3-26 19-26t18 28q-20-12-37-2" fill="#6e574b"/><path d="M38 140q2-36 23-36t24 36" fill="#f1a88d"/><circle cx="198" cy="102" r="16" fill="#c88f77"/><path d="M181 102q0-24 18-24t17 25q-17-9-35-1" fill="#53463e"/><path d="M179 143q2-31 20-31t21 31" fill="#e9c66d"/><rect x="112" y="108" width="38" height="22" rx="6" fill="#e6b57d"/><path d="M131 96v12" stroke="#8a725b" stroke-width="3"/></svg>`,
      family:`<svg viewBox="0 0 260 170" role="img" aria-label="Gia đình đồng hành"><path d="M30 78 130 15l100 63v72H30Z" fill="#f5d8c4"/><path d="M18 81 130 7l112 74" fill="none" stroke="#c88772" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><rect x="105" y="93" width="52" height="57" rx="8" fill="#fff4de"/><circle cx="79" cy="89" r="20" fill="#e9b18f"/><path d="M57 89q0-32 23-32t22 32q-23-12-45 0" fill="#5c4a41"/><path d="M50 149q0-39 29-39t30 39" fill="#8eb8a0"/><circle cx="183" cy="97" r="17" fill="#d49b81"/><path d="M165 98q0-28 19-28t19 30q-20-12-38-2" fill="#635047"/><path d="M158 150q0-34 26-34t27 34" fill="#c98a85"/><path d="M126 44q-14-16-26 0 12 12 26 0m0 0q14-16 26 0-12 12-26 0" fill="#85ad85"/></svg>`,
      rest:`<svg viewBox="0 0 260 170" role="img" aria-label="Khoảng nghỉ yên bình"><circle cx="130" cy="83" r="55" fill="#f8e8b5"/><path d="M151 36a48 48 0 1 0 46 71 52 52 0 0 1-46-71" fill="#e7bb72"/><path d="M50 138q22-20 44 0t44 0 44 0 44 0" fill="none" stroke="#9bc7ad" stroke-width="7" stroke-linecap="round"/><path d="M80 63q-10-11-20 0 10 10 20 0m105-20q-9-10-18 0 9 9 18 0" fill="#fff" opacity=".8"/></svg>`
    };
    return `<div class="mimora-illustration ${kind}-illustration">${maps[kind]||maps.book}</div>`;
  };

  // Common visual helpers.
  const warmSection = (eyebrow,title,desc,art='book') => `<section class="feature-banner ${art}"><div class="feature-copy"><span class="eyebrow">${esc(eyebrow)}</span><h3>${esc(title)}</h3><p>${esc(desc)}</p></div>${miniIllustration(art)}</section>`;
  const criteriaPanel = b => `<section class="class-values-panel"><div class="class-values-top"><span class="class-values-mark">🌿</span><div><span class="eyebrow">LỜI HẸN CỦA LỚP MÌNH</span><h3>${esc(b.name)}</h3><p>${esc(b.description||'Một lớp học nơi mỗi bạn được tôn trọng theo cách riêng.')}</p></div></div><div class="class-values-grid">${classCriteriaData(b).map((x,i)=>`<div class="class-value"><span>${['♡','🌱','☀️','🫶'][i%4]}</span>${esc(x)}</div>`).join('')}</div></section>`;
  const helperNote = text => `<div class="gentle-note"><span>💛</span><p>${esc(text)}</p></div>`;
  const studentStats = s => {
    const classes=classList(s.id), defaults=state.boxes.filter(b=>b.type==='default'&&b.studentIds.includes(s.id));
    const sum=[...defaults,...classes].reduce((n,b)=>n+progressCount(s.id,b.id),0);
    return `<div class="stats-grid soft-stats">${stat('Lớp đang tham gia',classes.length,'Những người bạn đồng hành','🌿')}${stat('Bước đã khám phá',sum,'Tiến trình của riêng con','✿')}${stat('Cách hỗ trợ','3','Có thể điều chỉnh bất cứ lúc nào','♡')}${stat('Người đồng hành',s.guardian?'1':'0','Gia đình luôn ở bên con','☀️')}</div>`;
  };

  // 1) Student experience: split the two learning spaces, keep Chapter 1 inside physical-card learning only.
  window.studentHome = function(){
    const s=currentStudent(), classes=classList(s.id), def=state.boxes.find(b=>b.type==='default'&&b.studentIds.includes(s.id));
    const p=def?progressCount(s.id,def.id):0;
    return `${header(`Chào ${esc(s.name)}! 🌷`,'Hôm nay con muốn khám phá điều gì?',`<button class="btn btn-outline" data-action="switch-student">Đổi học sinh</button>`)}
      ${warmSection('KHÔNG GIAN CỦA CON','Ở đây, con luôn được là chính mình.','Con có thể học cùng bộ thẻ MIMORA hoặc gặp gỡ thầy cô, bạn bè trong lớp học.','family')}
      ${studentStats(s)}
      <div class="student-space-grid final-student-spaces">
        <button class="student-space-card physical" data-page="student-default"><span class="space-art">🃏</span><span class="space-kicker">HỌC CÙNG BỘ THẺ VẬT LÍ</span><strong>Học cùng thẻ MIMORA</strong><small>Những tấm thẻ quen thuộc mở ra hành trình khám phá bản thân.</small><span class="space-progress">${p}/6 bước đã khám phá</span><span class="space-foot">Mở hành trình <b>→</b></span></button>
        <button class="student-space-card classes" data-page="student-classes"><span class="space-art">🌿</span><span class="space-kicker">BẠN BÈ & THẦY CÔ</span><strong>Lớp học của con</strong><small>${classes.length?`Con đang tham gia ${classes.length} lớp học. Mỗi lớp có lời hẹn riêng.`:'Những lớp học nơi con có thể gặp gỡ thầy cô và bạn bè.'}</small><span class="space-progress">${classes.length} lớp đang tham gia</span><span class="space-foot">Khám phá lớp học <b>→</b></span></button>
      </div>
      <div class="student-bottom-ritual">${miniIllustration('rest')}<div><strong>Không cần học thật nhanh</strong><p>Con có thể dừng lại, chọn cách giao tiếp phù hợp hoặc nhờ người lớn hỗ trợ bất cứ lúc nào.</p></div><span class="ritual-heart">♡</span></div>`;
  };

  window.studentDefaultPage = function(){
    const s=currentStudent(), def=state.boxes.find(b=>b.type==='default'&&b.studentIds.includes(s.id))||{id:'default-'+s.id,name:'Học cùng thẻ MIMORA'};
    const n=progressCount(s.id,def.id);
    return `${header('Học cùng thẻ MIMORA','Không gian học tập gắn với bộ thẻ vật lí của gia đình.',`<button class="btn btn-outline btn-small" data-page="student-home">← Không gian của con</button>`)}
      <div class="physical-hero final-physical-hero"><div class="physical-copy"><span class="badge badge-gold">BỘ THẺ VẬT LÍ MIMORA</span><h2>Chạm vào thẻ, mở ra một cuộc trò chuyện.</h2><p>Mỗi tấm thẻ là một lời mời để con quan sát, lựa chọn và diễn đạt theo cách riêng.</p><div class="physical-facts"><span>🌼 Học theo nhịp độ riêng</span><span>♡ Có gia đình đồng hành</span></div></div>${miniIllustration('book')}</div>
      <div class="chapter-intro-row"><div><span class="eyebrow">CHƯƠNG TRÌNH CHÍNH THỨC</span><h3>Hành trình cùng bộ thẻ</h3><p>Trong bản demo, con có thể khám phá trọn vẹn Chương 1.</p></div><span class="badge badge-green">01 chương học</span></div>
      <article class="chapter-card chapter-feature"><div class="chapter-cover final-chapter-cover">${miniIllustration('book')}<div><span class="badge badge-gold">Chương 1 · Bản trải nghiệm</span><h3>Nhận diện cảm xúc và nhu cầu của bản thân</h3><p>Khám phá cảm xúc, lắng nghe cơ thể và tìm cách nói ra điều con cần.</p></div></div>
      <div class="progress-label"><span>Tiến trình của ${esc(s.name)}</span><strong>${n}/6 bước</strong></div>${progressBar(percent(n))}
      <div class="chapter-step-preview">${CHAPTER_STEPS.map((st,i)=>`<span class="${n>i?'done':''}">${i+1}. ${esc(st.short)}</span>`).join('')}</div>
      <button class="btn btn-primary" style="margin-top:18px" data-action="begin-chapter" data-box="${def.id}">${n?'Tiếp tục Chương 1':'Bắt đầu khám phá'} →</button></article>
      ${helperNote('Lớp mặc định MIMORA luôn ở bên con. Khi tham gia lớp học khác, con vẫn giữ nguyên hành trình cùng bộ thẻ này.')}`;
  };

  window.studentClassesPage = function(){
    const s=currentStudent(), classes=classList(s.id);
    const pending=state.requests.filter(r=>r.studentId===s.id&&r.status==='pending');
    return `${header('Lớp học của con','Mỗi lớp là một cộng đồng nhỏ, có lời hẹn riêng để mọi người cảm thấy an toàn và được tôn trọng.',`<button class="btn btn-outline btn-small" data-page="student-home">← Không gian của con</button>`)}
      <div class="content-stack">${classes.length?classes.map(b=>`${criteriaPanel(b)}<article class="class-learning-card final-class-card"><div class="row-main"><span class="class-avatar">🌿</span><div><strong>${esc(b.name)}</strong><small>Giáo viên đồng hành: ${esc(b.owner)} · ${b.studentIds.length} học sinh</small></div><span class="badge badge-green">Đang tham gia</span></div><p>${esc(b.description)}</p><div class="progress-label"><span>Tiến trình tham gia lớp</span><strong>${progressCount(s.id,b.id)}/6 bước</strong></div>${progressBar(percent(progressCount(s.id,b.id)))}<div class="class-actions"><span class="micro-copy">Hoạt động theo chủ đề của lớp</span><button class="btn btn-primary btn-small" data-action="open-class" data-box="${b.id}">Vào lớp →</button></div></article>`).join(''):`<div class="empty-state panel">${miniIllustration('class')}<h3>Con chưa tham gia lớp học nào</h3><p>Lớp mặc định MIMORA vẫn luôn sẵn sàng. Khi được giáo viên cho phép, lớp mới sẽ xuất hiện ở đây.</p><button class="btn btn-soft" data-page="student-default">Học cùng thẻ MIMORA</button></div>`}
      ${pending.length?`<div class="panel"><div class="panel-head"><div><h3>Lời mời tham gia lớp</h3><p>Con có thể xem thông tin lớp trước khi người lớn xác nhận tham gia.</p></div><span class="badge badge-gold">${pending.length} lời mời</span></div>${pending.map(r=>{const b=boxById(r.boxId);return `<div class="notice">🌿 ${esc(b?.name||'Lớp học mới')} · Đang chờ xác nhận từ giáo viên.</div>`;}).join('')}</div>`:''}</div>`;
  };

  window.studentClassDetailPage = function(){
    const s=currentStudent(), b=boxById(state.selectedClass)||classList(s.id)[0]; if(!b)return window.studentClassesPage();
    return `${header(b.name,'Một lớp học ấm áp, nơi mỗi bạn có một cách học riêng.',`<button class="btn btn-outline btn-small" data-page="student-classes">← Lớp học của con</button>`)}${criteriaPanel(b)}
      <article class="class-learning-card"><div class="chapter-intro-row"><div><span class="eyebrow">HÔM NAY Ở LỚP MÌNH</span><h3>Chủ đề cùng khám phá</h3><p>Chương trình học được giáo viên tổ chức cho lớp.</p></div><span class="badge badge-green">Đang diễn ra</span></div><div class="topic-card"><span>🌻</span><div><strong>Chủ đề cùng khám phá: Nhận diện tình huống và biểu đạt nhu cầu</strong><p>Giáo viên lựa chọn học liệu và tổ chức hoạt động phù hợp với tiêu chí riêng của lớp.</p></div></div><div class="progress-label"><span>Tiến trình hoạt động của lớp</span><strong>${progressCount(s.id,b.id)}/6 bước</strong></div>${progressBar(percent(progressCount(s.id,b.id)))}<button class="btn btn-primary" data-action="begin-chapter" data-box="${b.id}" style="margin-top:16px">Tiếp tục hoạt động của lớp →</button></article>`;
  };

  // One-task-at-a-time learning flow; no grading, countdown, or forced response.
  window.chapterPage = function(){
    const s=currentStudent(), b=boxById(state.selectedBox)||state.boxes.find(x=>x.type==='default'&&x.studentIds.includes(s.id));
    if(!b)return `${header('Hành trình học tập','Chưa tìm thấy không gian học tập.')}`;
    if(state.studentRest){return `${header('Một khoảng nghỉ dành cho con','Mình có thể tạm dừng và quay lại khi đã sẵn sàng.')}
      <section class="rest-screen panel">${miniIllustration('rest')}<span class="eyebrow">KHOẢNG NGHỈ NHẸ NHÀNG</span><h2>Con không cần vội đâu.</h2><p>Con có thể nghỉ một chút, uống nước, vận động nhẹ hoặc nhờ người lớn ở bên.</p><div class="rest-actions"><button class="btn btn-primary" data-action="resume-learning">Con muốn học tiếp</button><button class="btn btn-outline" data-action="return-student-home">Về không gian của con</button></div></section>`;}
    const i=Math.max(0,Math.min(5,Number(state.activeStep)||0)), step=CHAPTER_STEPS[i], ans=selectedAnswer(s.id,b.id,i), n=progressCount(s.id,b.id), isClass=b.type==='class';
    const choices=step.choices.map(([emoji,label],k)=>`<button class="learning-choice ${ans===k?'selected':''}" data-action="final-choose-answer" data-choice="${k}" data-step="${i}"><span class="choice-emoji">${emoji}</span><span>${esc(label)}</span><span class="choice-check">${ans===k?'✓':'○'}</span></button>`).join('');
    return `<div class="learning-wrap">${header(isClass?'Hoạt động cùng lớp':'Chương 1 · Nhận diện cảm xúc',isClass?'Con cùng khám phá hoạt động do giáo viên tổ chức.':'Con có thể xem, nghe, chọn hoặc nhờ người lớn hỗ trợ.',`<button class="btn btn-outline btn-small" data-action="pause-learning">⏸ Tạm nghỉ</button>`)}
      <div class="learning-context-line"><span class="badge ${b.type==='default'?'badge-gold':'badge-green'}">${b.type==='default'?'Học cùng thẻ MIMORA':esc(b.name)}</span><span>${esc(s.name)} · Bước ${i+1}/6</span></div>
      <div class="learning-progress-card"><div class="progress-label"><span>${isClass?'Tiến trình hoạt động':'Hành trình Chương 1 của con'}</span><strong>${n}/6 bước đã khám phá</strong></div>${progressBar(percent(n))}<div class="step-dots">${CHAPTER_STEPS.map((_,k)=>`<span class="${k<i?'done':k===i?'current':''}"></span>`).join('')}</div></div>
      <section class="learning-one-step">${miniIllustration(i===5?'family':i===3?'class':'book')}<div class="learning-step-kicker">BƯỚC ${i+1} · ${esc(step.title)}</div><h2>${iconForStep[i]} ${esc(step.short)}</h2><p class="learning-prompt">${esc(step.prompt)}</p><div class="learning-choice-grid">${choices}</div>
      <div class="learning-support-actions"><button class="btn btn-outline" data-action="read-aloud">🔊 Nghe hướng dẫn</button><button class="btn btn-soft" data-action="aac">💬 Con muốn nói</button><button class="btn btn-outline" data-action="toggle-large-text">A+ Chữ lớn</button></div>
      ${ans!==undefined?`<div class="learning-acknowledge"><span>🌱</span><p>Đã lưu lựa chọn của con. Không có đáp án đúng hay sai ở đây.</p></div>`:''}
      <div class="learning-step-nav"><button class="btn btn-outline" data-action="previous-step" ${i===0?'disabled':''}>← Bước trước</button><button class="btn btn-primary" data-action="next-step" ${ans===undefined?'disabled':''}>${i===5?(isClass?'Hoàn tất hoạt động':'Hoàn tất Chương 1'):'Tiếp tục'} →</button></div></section>
      <button class="quiet-link" data-action="show-step-map">${isClass?'Xem các bước hoạt động':'Xem các bước trong Chương 1'}</button>
    </div>`;
  };

  window.studentSupport = function(){
    const modes=[['calm','Dịu nhẹ','Ít màu, chuyển động tối thiểu','🌿'],['playful','Tươi vui','Màu sắc phong phú, hình minh họa','🌈'],['contrast','Tương phản cao','Nội dung rõ, dễ phân biệt','◐']];
    const pairs=[['aac','Bảng giao tiếp AAC','Giúp con chọn nhanh cách bày tỏ nhu cầu.'],['readAloud','Đọc thành tiếng','Nghe nội dung được đọc chậm rãi.'],['slowSpeech','Tốc độ đọc chậm','Giữ nhịp đọc nhẹ nhàng, dễ theo dõi.'],['largeText','Chữ lớn','Tăng kích thước chữ khi con cần.'],['reducedMotion','Giảm chuyển động','Giảm hiệu ứng chuyển động.']];
    return `${header('Cài đặt hỗ trợ','Con có thể chọn những cách hỗ trợ khiến việc học thoải mái hơn.')}
      <div class="support-personalize panel"><div><span class="eyebrow">KHÔNG GIAN PHÙ HỢP VỚI CON</span><h3>Con thích giao diện như thế nào?</h3><p>Con có thể đổi lựa chọn bất cứ lúc nào.</p></div><div class="visual-mode-grid">${modes.map(([k,t,d,ico])=>`<button class="visual-mode ${state.visualMode===k?'active':''}" data-action="set-visual-mode" data-mode="${k}"><span>${ico}</span><strong>${t}</strong><small>${d}</small></button>`).join('')}</div></div>
      <div class="panel"><div class="panel-head"><div><h3>Cách hỗ trợ khi học</h3><p>Chỉ bật những hỗ trợ con muốn sử dụng.</p></div><span class="soft-illustration">🫧</span></div>${pairs.map(([key,title,desc])=>`<div class="switch-row"><div><strong>${title}</strong><div class="micro-copy">${desc}</div></div><button class="switch ${state.support[key]?'on':''}" data-action="toggle-support" data-key="${key}" aria-label="${title}" aria-pressed="${!!state.support[key]}"></button></div>`).join('')}</div>
      ${helperNote('Những lựa chọn này giúp điều chỉnh cách hiển thị và hỗ trợ tương tác. Chúng không phải thang đo hay đánh giá năng lực của con.')}`;
  };

  // 2) Guardian experience: a family dashboard, separate child insights, and one private thread per child.
  const aiPanel = sid => {
    const s=student(sid), a=state.aiSignals[sid]||state.aiSignals.minhanh;
    const delta=a.weekly-a.previous;
    const label=delta>0?'Số lượt tham gia tăng':delta<0?'Số lượt tham gia giảm':'Nhịp tham gia tương đối ổn định';
    const enough=(a.weekly+a.previous)>=4;
    return `<section class="care-insight ${a.signal==='pause'?'care-attention':''}"><div class="care-heading"><div class="care-spark">✧</div><div><span class="eyebrow">MIMORA CARE INSIGHTS · MÔ PHỎNG</span><h3>${esc(label)}</h3></div><span class="badge ${a.signal==='pause'?'badge-gold':'badge-green'}">${enough?'Có dữ liệu tham khảo':'Dữ liệu còn hạn chế'}</span></div>
      <p>Trong 7 ngày gần đây, ${esc(s.name)} có <strong>${a.weekly} lượt tham gia</strong>; giai đoạn trước có ${a.previous} lượt. Lần hoạt động gần nhất: ${esc(a.last)}.</p>
      <div class="care-bars"><div><span>Giai đoạn trước</span><strong>${a.previous}</strong></div><div class="care-bar"><i style="width:${Math.min(100,a.previous*20)}%"></i></div><div><span>7 ngày gần đây</span><strong>${a.weekly}</strong></div><div class="care-bar current"><i style="width:${Math.min(100,a.weekly*20)}%"></i></div></div>
      <div class="care-suggestion"><strong>Gợi ý đồng hành</strong><p>${esc(a.suggestion)}</p></div>
      <div class="care-disclaimer">Đây là bản tổng hợp mô phỏng từ tần suất tham gia giả lập, không phải dự báo lâm sàng, đánh giá tâm lý hay kết luận về cảm xúc/năng lực của trẻ. ${!enough?'Dữ liệu hiện tại còn ít; nên quan sát thêm trước khi rút ra nhận định.':''}</div>
      <button class="btn btn-soft btn-small" data-action="notify-ai" data-student="${sid}">Tạo thông báo đồng hành →</button></section>`;
  };
  window.guardianOverview = function(){
    const list=kids();
    return `${header('Không gian gia đình','Một nơi ấm áp để đồng hành cùng từng hành trình của con.',`<button class="btn btn-primary" data-page="guardian-activate">＋ Kích hoạt bộ thẻ</button>`)}
      ${warmSection('GIA ĐÌNH MIMORA','Mỗi bước nhỏ của con đều đáng được lắng nghe.','Gia đình có thể học cùng bộ thẻ, kết nối với lớp học và trao đổi riêng với giáo viên.','family')}
      <div class="stats-grid">${stat('Tài khoản học sinh',list.length,'Được liên kết với gia đình','♧')}${stat('Lớp đang tham gia',list.reduce((n,s)=>n+classList(s.id).length,0),'Các lớp của con','🌿')}${stat('Chương trình vật lí','01','Chỉ có Chương 1 trong demo','🃏')}${stat('Bộ thẻ đã kích hoạt',state.activationUsed?'2 bộ':'1 bộ','Quyền lợi mô phỏng','🎁')}</div>
      <div class="guardian-child-grid">${list.map(s=>{const cl=classList(s.id),de=state.boxes.find(b=>b.type==='default'&&b.studentIds.includes(s.id));return `<article class="guardian-child-card"><div class="guardian-child-top">${avatar(s.name,s.id==='baoan'?'':'terra')}<div><h3>${esc(s.name)}</h3><small>${s.age} · Tài khoản học sinh</small></div><span class="badge badge-green">Đang hoạt động</span></div><div class="child-spaces"><span>🃏 ${de?'Lớp mặc định MIMORA':'Chưa kích hoạt thẻ'}</span><span>🌿 ${cl.length} lớp đang tham gia</span></div><div class="progress-label"><span>Tiến trình học cùng thẻ</span><strong>${de?progressCount(s.id,de.id):0}/6</strong></div>${progressBar(percent(de?progressCount(s.id,de.id):0))}<div class="guardian-child-actions"><button class="btn btn-small btn-soft" data-action="guardian-view-child" data-student="${s.id}">Xem tiến trình</button>${classList(s.id).length?`<button class="btn btn-small btn-outline" data-action="open-chat" data-student="${s.id}">Nhắn giáo viên</button>`:`<span class="micro-copy">Chưa có giáo viên phụ trách</span>`}</div></article>`;}).join('')}</div>
      <div class="guardian-insight-strip"><div><span class="eyebrow">ĐỒNG HÀNH CÙNG CON</span><h3>Gợi ý từ MIMORA Care Insights</h3><p>Thông tin mô tả để gia đình và giáo viên cùng trao đổi, không phải đánh giá trẻ.</p></div><button class="btn btn-outline" data-page="guardian-insights">Xem gợi ý →</button></div>
      <div class="two-col"><div class="panel"><div class="panel-head"><div><h3>Trao đổi với giáo viên</h3><p>Mỗi cuộc trò chuyện dành riêng cho một học sinh.</p></div><button class="btn btn-small btn-outline" data-page="guardian-messages">Mở tất cả →</button></div>${list.map(s=>`<div class="student-row"><div class="row-main">${avatar(s.name)}<div><strong>${esc(s.name)}</strong><small>Trao đổi riêng về ${esc(s.name)}</small></div></div>${classList(s.id).length?`<button class="btn btn-small btn-soft" data-action="open-chat" data-student="${s.id}">Nhắn tin</button>`:`<span class="micro-copy">Chưa có giáo viên phụ trách</span>`}</div>`).join('')}</div>
      <div class="panel"><div class="panel-head"><div><h3>Thông báo gần đây</h3><p>Những gợi ý cần người lớn xem xét.</p></div></div>${state.notifications.slice(-3).reverse().map(n=>`<div class="notification-row"><span>🔔</span><div><strong>${esc(n.title)}</strong><small>${esc(n.body)}</small></div></div>`).join('')||'<div class="empty-state"><p>Chưa có thông báo mới.</p></div>'}</div></div>`;
  };
  window.guardianInsightsPage = function(){
    const selected=student(state.selectedChild)||kids()[0];
    return `${header('MIMORA Care Insights','Tổng hợp nhịp tham gia để gợi ý khi nào gia đình và giáo viên nên trao đổi thêm.')}
      <div class="panel"><div class="panel-head"><div><h3>Chọn học sinh</h3><p>Mỗi thông tin chỉ hiển thị trong phạm vi người được theo dõi.</p></div></div><div class="student-switch">${kids().map(s=>`<button class="${selected.id===s.id?'active':''}" data-action="select-ai-child" data-student="${s.id}">${s.avatar} ${esc(s.name)}</button>`).join('')}</div></div>
      ${selected?aiPanel(selected.id):''}
      <div class="panel"><div class="panel-head"><div><h3>Thông báo đã tạo</h3><p>Phụ huynh có thể xem lại gợi ý được gửi trong bản demo.</p></div></div>${state.notifications.filter(n=>n.studentId===selected?.id).map(n=>`<div class="notification-row"><span>🔔</span><div><strong>${esc(n.title)}</strong><small>${esc(n.body)} · ${esc(n.time)}</small></div></div>`).join('')||'<div class="empty-state"><p>Chưa có thông báo cho học sinh này.</p></div>'}</div>`;
  };

  // 3) Teacher experience: criteria, scoped class actions, delegated permission story.
  window.teacherBoxes = function(){
    const manager=state.teacherMode==='manager';
    const own=manager?state.boxes.filter(b=>b.type==='class'&&b.schoolId==='school-1'):state.boxes.filter(b=>b.type==='class'&&b.owner==='Cô Mai');
    return `${header(manager?'Trường học của tôi':'Lớp học của tôi',manager?'Quản lý các lớp và thành viên giáo viên trong phạm vi trường.':'Mỗi lớp có mục tiêu và lời hẹn đồng hành riêng.',manager?'<span class="badge badge-lav">Quản lý trường</span>':'<button class="btn btn-primary" data-action="create-class">＋ Tạo lớp học</button>')}${teacherModeSwitch()}
      <div class="content-stack">${own.map(b=>`${criteriaPanel(b)}<article class="class-learning-card"><div class="row-main"><span class="class-avatar">🌿</span><div><strong>${esc(b.name)}</strong><small>${b.studentIds.length} học sinh · Phụ trách: ${esc(b.owner)}</small></div><span class="badge badge-green">Đang hoạt động</span></div><p>${esc(b.description)}</p><div class="class-actions"><button class="btn btn-small btn-soft" data-action="edit-class-criteria" data-class="${b.id}">Chỉnh tiêu chí lớp</button><button class="btn btn-small btn-outline" data-action="manage-box" data-box="${b.id}">Quản lý lớp →</button></div></article>`).join('')}
      ${manager?`<div class="panel"><div class="panel-head"><div><h3>${esc(state.school.name)}</h3><p>Trường có thể chứa nhiều lớp và giáo viên được phân quyền.</p></div><span class="badge badge-lav">Giấy phép demo</span></div>${schoolTree()}<div class="modal-actions"><button class="btn btn-primary" data-action="create-school-class">＋ Tạo lớp trong trường</button><button class="btn btn-outline" data-action="add-teacher">＋ Thêm giáo viên</button></div></div>`:''}</div>`;
  };
  window.teacherInsightsPage = function(){
    const students=state.students.filter(s=>classList(s.id).length>0);
    return `${header('Gợi ý đồng hành với học sinh','Thông tin tham khảo từ nhịp tham gia, giúp giáo viên chủ động trao đổi với gia đình.')}
      ${state.permissions.viewProgress?students.map(s=>aiPanel(s.id)).join(''):'<div class="notice rose">Tài khoản hiện chưa được cấp quyền theo dõi tiến trình học sinh.</div>'}
      <div class="care-disclaimer">Mô phỏng dựa trên dữ liệu sử dụng giả lập. Không suy đoán cảm xúc, không chẩn đoán, không dùng làm căn cứ duy nhất để đánh giá trẻ.</div>`;
  };
  window.teacherMessagesPage = window.teacherMessagesPage || (()=>'<div></div>');

  // Add care + message routes to Guardian and Teacher without adding extra login roles.
  const originalRender=window.render;
  window.render=function(){
    const guardianRoutes={'guardian-insights':window.guardianInsightsPage,'guardian-messages':window.guardianMessagesPage};
    const teacherRoutes={'teacher-insights':window.teacherInsightsPage,'teacher-messages':window.teacherMessagesPage};
    const custom=state.role==='guardian'?guardianRoutes[state.page]:state.role==='teacher'?teacherRoutes[state.page]:null;
    if(custom && typeof custom[state.page]==='function'){
      const switcher=document.getElementById('switchRole');switcher?.classList.remove('hidden');
      $('#main').innerHTML=window.shell(custom[state.page]());
      return;
    }
    originalRender();
  };

  // Student mode theme classes are applied on every render.
  const priorRender=window.render;
  window.render=function(){
    priorRender();
    document.body.classList.remove('visual-calm','visual-playful','visual-contrast','large-reading','reduce-motion-user');
    document.body.classList.add(`visual-${state.visualMode||'calm'}`);
    if(state.support?.largeText)document.body.classList.add('large-reading');
    if(state.support?.reducedMotion)document.body.classList.add('reduce-motion-user');
  };

  function goToChapter(boxId){
    state.selectedBox=boxId||state.selectedBox;
    const s=currentStudent(), stored=Number(state.resumeStep[s.id+':'+state.selectedBox]);
    state.activeStep=Number.isFinite(stored)?stored:Math.min(5,progressCount(s.id,state.selectedBox));
    state.studentRest=false;saveState();go('student-chapter');
  }
  function criteriaEditor(boxId){
    const b=boxById(boxId);if(!b)return;
    const values=classCriteriaData(b);
    openModal('Lời hẹn của lớp',`<form data-form="criteria"><input type="hidden" name="classId" value="${esc(boxId)}"><div class="field"><label>Tên lớp</label><input name="name" value="${esc(b.name)}" maxlength="60" required></div><div class="field"><label>Mô tả ngắn</label><textarea name="description" rows="2">${esc(b.description||'')}</textarea></div>${values.map((v,i)=>`<div class="field"><label>Tiêu chí ${i+1}</label><input name="criteria${i}" value="${esc(v)}" maxlength="90" required></div>`).join('')}</form><div class="care-disclaimer">Hãy viết lời hẹn tích cực, không biến tiêu chí thành điểm số hoặc tiêu chuẩn đánh giá trẻ.</div>`,`<button class="btn btn-outline" data-action="close-modal">Để sau</button><button class="btn btn-primary" data-action="save-class-criteria">Lưu lời hẹn</button>`);
  }
  function stepMap(){
    const s=currentStudent(), b=boxById(state.selectedBox);
    openModal(b?.type==='class'?'Các bước hoạt động của lớp':'Sáu bước trong Chương 1',`<div class="step-map-list">${CHAPTER_STEPS.map((st,i)=>`<button class="step-map-item" data-action="jump-final-step" data-step="${i}"><span>${i+1}</span><div><strong>${esc(st.short)}</strong><small>${esc(st.title)}</small></div><em>${progressCount(s.id,b?.id||'')>i?'Đã khám phá':'Có thể khám phá'}</em></button>`).join('')}</div>`,`<button class="btn btn-outline" data-action="close-modal">Đóng</button>`);
  }

  // Capture new actions before the original app's bubbling listener.
  document.addEventListener('click', e=>{
    const el=e.target.closest('[data-action]'); if(!el)return;
    const a=el.dataset.action;
    const handled=new Set(['begin-chapter','pause-learning','resume-learning','return-student-home','final-choose-answer','next-step','previous-step','show-step-map','jump-final-step','toggle-large-text','set-visual-mode','edit-class-criteria','save-class-criteria','dismiss-demo-note']);
    if(!handled.has(a))return;
    e.preventDefault();e.stopImmediatePropagation();
    switch(a){
      case 'begin-chapter':goToChapter(el.dataset.box);break;
      case 'pause-learning':state.resumeStep[currentStudent().id+':'+state.selectedBox]=state.activeStep;state.studentRest=true;saveState();render();break;
      case 'resume-learning':state.studentRest=false;saveState();render();break;
      case 'return-student-home':state.studentRest=false;saveState();go('student-home');break;
      case 'final-choose-answer':{
        const s=currentStudent(),b=state.selectedBox,i=Number(el.dataset.step),choice=Number(el.dataset.choice);
        state.answers[state.answers?`${s.id}:${b}:${i}`:`${s.id}:${b}:${i}`]=choice;
        state.studentChapterNotes[s.id+':'+b+':'+i]={chosenAt:new Date().toISOString()};saveState();render();break;
      }
      case 'next-step':{
        const s=currentStudent(),b=state.selectedBox,i=Number(state.activeStep||0),key=`${s.id}:${b}:${i}`;
        if(state.answers?.[key]===undefined){toast('Con có thể chọn một điều phù hợp, hoặc nhờ người lớn giúp nhé.');break;}
        state.progress[s.id] ||= {};state.progress[s.id][b]=Math.max(progressCount(s.id,b),i+1);
        if(i>=5){state.activeStep=5;state.resumeStep[s.id+':'+b]=5;saveState();render();openModal(b.type==='class'?'Con đã hoàn thành hoạt động của lớp 🌷':'Con đã khám phá Chương 1 🌷','<div class="completion-celebration">🌼</div><h3>Cảm ơn con đã cùng MIMORA khám phá.</h3><p>Con có thể quay lại bất cứ lúc nào. Không có áp lực phải làm nhanh hay làm giống bạn khác.</p>','<button class="btn btn-primary" data-action="close-modal">Hoàn tất</button>');}
        else {state.activeStep=i+1;state.resumeStep[s.id+':'+b]=i+1;saveState();render();}
        break;
      }
      case 'previous-step':state.activeStep=Math.max(0,Number(state.activeStep||0)-1);saveState();render();break;
      case 'show-step-map':stepMap();break;
      case 'jump-final-step':state.activeStep=Number(el.dataset.step);closeModal();saveState();render();break;
      case 'toggle-large-text':state.support.largeText=!state.support.largeText;saveState();render();toast(state.support.largeText?'Đã bật chữ lớn.':'Đã tắt chữ lớn.');break;
      case 'set-visual-mode':state.visualMode=el.dataset.mode;saveState();render();toast('Đã đổi cách hiển thị cho con.');break;
      case 'edit-class-criteria':criteriaEditor(el.dataset.class);break;
      case 'save-class-criteria':{
        const form=$('form[data-form="criteria"]',document);if(!form?.reportValidity())break;
        const fd=new FormData(form),id=String(fd.get('classId')),b=boxById(id);if(!b)break;
        b.name=String(fd.get('name')).trim();b.description=String(fd.get('description')||'').trim();
        state.classCriteria[id]=[0,1,2,3].map(i=>String(fd.get('criteria'+i)||'').trim());
        closeModal();saveState();render();toast('Đã lưu lời hẹn của lớp.');break;
      }
    }
  },true);

  // Ensure Chapter actions and progress are stable for existing app actions.
  const previousHandleAction=window.handleAction;
  document.addEventListener('click',e=>{
    const el=e.target.closest('[data-action]');if(!el)return;
    if(el.dataset.action==='open-chapter'){
      // The previous handler resets to step 0; the capture listener above handles the new button only.
      return;
    }
  },true);

  // Make the teacher's role-specific experience more explicit.
  const originalTeacherPermissions=window.teacherPermissions;
  if(originalTeacherPermissions){
    window.teacherPermissions=function(){
      const html=originalTeacherPermissions();
      return html.replace('Quyền quản lý','Quyền quản lý theo phạm vi').replace('các Lớp và thành viên giáo viên','các lớp và thành viên giáo viên')+
        `<div class="notice lav" style="margin-top:14px">Quyền được cấp trong từng lớp hoặc trường. Giáo viên không thể tự cấp quyền quản trị nền tảng hoặc truy cập lớp ngoài phạm vi phụ trách.</div>`;
    };
  }

  // Keep the page navigable by keyboard and retain the active role.
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && $('#modalRoot .modal-backdrop'))closeModal();});
  window.render();
})();

// Keep all newly introduced local demo preferences resilient when Reset Demo is used.
(function(){
  const existingReset=window.resetDemo;
  window.resetDemo=function(){
    existingReset();
    state.visualMode='calm';state.studentRest=false;state.resumeStep={};state.classCriteria={};
    state.classTeachers={'class-1a':['mai'],'class-1b':['lan']};state.teacherDelegations=[];
    state.studentChapterNotes={};state.demoNoticeSeen=false;
    state.notifications=[];state.chatStudent='minhanh';
    state.soundPrefs={effects:false,music:false};
    saveState();window.render();
  };
})();

/* Final polish patch: role-specific relationship accuracy, privacy-first progress, and class management. */
(() => {
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const $ = (s, root=document) => root.querySelector(s);
  const kids = () => state.students.filter(s=>s.guardian);
  const student = id => state.students.find(s=>s.id===id) || state.students[0];
  const assignedChildren = () => state.students.filter(s=>state.boxes.some(b=>b.type==='class'&&b.studentIds.includes(s.id)));
  const childrenWithTeacher = () => kids().filter(s=>state.boxes.some(b=>b.type==='class'&&b.studentIds.includes(s.id)));
  const activeClassesFor = sid => state.boxes.filter(b=>b.type==='class'&&b.studentIds.includes(sid));
  const currentProgress = (sid,bid) => Math.max(0,Math.min(6,Number(state.progress?.[sid]?.[bid]||0)));
  const helperNote = text => `<div class="gentle-note"><span>💛</span><p>${esc(text)}</p></div>`;
  const classCriteriaPanel = b => {
    const vals=state.classCriteria?.[b.id] || b.criteria || (b.id==='class-1a'?['Tôn trọng nhịp độ riêng','Mỗi bạn được quyền lựa chọn','Không so sánh hay xếp hạng','Có thể xin nghỉ hoặc nhờ hỗ trợ']:['Lắng nghe và tôn trọng nhau','Học bằng trải nghiệm tích cực','Khuyến khích lựa chọn cá nhân','Cùng xây dựng cảm giác an toàn']);
    return `<section class="class-values-panel"><div class="class-values-top"><span class="class-values-mark">🌿</span><div><span class="eyebrow">LỜI HẸN CỦA LỚP MÌNH</span><h3>${esc(b.name)}</h3><p>${esc(b.description||'Một lớp học nơi mỗi bạn được tôn trọng theo cách riêng.')}</p></div></div><div class="class-values-grid">${vals.map((v,i)=>`<div class="class-value"><span>${['♡','🌱','☀️','🫶'][i%4]}</span>${esc(v)}</div>`).join('')}</div></section>`;
  };

  window.guardianChildren = function(){
    const list=kids();
    return `${header('Tài khoản học sinh','Mỗi con có một tài khoản riêng và có thể tham gia nhiều môi trường học tập mà không tạo danh tính trùng.',`<button class="btn btn-primary" data-page="guardian-activate">＋ Kích hoạt bộ thẻ</button>`)}
      <div class="content-stack">${list.map(s=>{const cs=activeClassesFor(s.id),def=state.boxes.find(b=>b.type==='default'&&b.studentIds.includes(s.id));return `<article class="guardian-child-card"><div class="guardian-child-top">${avatar(s.name,s.id==='baoan'?'':'terra')}<div><h3>${esc(s.name)}</h3><small>${esc(s.age)} · Tài khoản học sinh</small></div><span class="badge badge-green">Đang hoạt động</span></div><div class="child-spaces"><span>🃏 ${def?'Học cùng thẻ MIMORA':'Chưa kích hoạt bộ thẻ'}</span>${cs.map(b=>`<span>🌿 ${esc(b.name)} · ${esc(b.owner)}</span>`).join('')||'<span>🌱 Chưa tham gia lớp học có giáo viên</span>'}</div><div class="guardian-child-actions"><button class="btn btn-small btn-soft" data-action="guardian-view-child" data-student="${s.id}">Xem tiến trình</button>${cs.length?`<button class="btn btn-small btn-outline" data-action="open-chat" data-student="${s.id}">Trao đổi với giáo viên</button>`:'<span class="micro-copy">Chưa có giáo viên phụ trách để mở cuộc trò chuyện</span>'}</div></article>`;}).join('')}</div>`;
  };

  window.guardianProgress = function(){
    const selected=student(state.selectedChild)||kids()[0];
    if(!selected)return `${header('Tiến trình học tập','Chưa có tài khoản học sinh được liên kết.')}`;
    const spaces=state.boxes.filter(b=>(b.type==='default'||b.type==='class')&&b.studentIds.includes(selected.id));
    return `${header('Tiến trình học tập','Nhìn lại những bước con đã khám phá, không xếp hạng và không so sánh.',`<button class="btn btn-outline btn-small" data-page="guardian-children">← Các con</button>`)}
      <div class="panel"><div class="panel-head"><div><h3>Chọn học sinh</h3><p>Mỗi hồ sơ chỉ hiển thị cho phụ huynh được liên kết.</p></div></div><div class="student-switch">${kids().map(s=>`<button class="${s.id===selected.id?'active':''}" data-action="guardian-select-child" data-student="${s.id}">${s.avatar} ${esc(s.name)}</button>`).join('')}</div></div>
      <div class="guardian-child-card"><div class="guardian-child-top">${avatar(selected.name)}<div><h3>${esc(selected.name)}</h3><small>${esc(selected.age)} · Hành trình học tập</small></div><span class="badge badge-green">Đang khám phá</span></div><div class="progress-label"><span>Tổng bước đã khám phá trong các không gian</span><strong>${spaces.reduce((n,b)=>n+currentProgress(selected.id,b.id),0)} bước</strong></div></div>
      <div class="content-stack">${spaces.map(b=>{const n=currentProgress(selected.id,b.id);return `<article class="panel"><div class="row-main"><span class="class-avatar">${b.type==='default'?'🃏':'🌿'}</span><div><strong>${esc(b.name)}</strong><small>${b.type==='default'?'Chương trình chính thức MIMORA':'Giáo viên: '+esc(b.owner)}</small></div><span class="badge ${b.type==='default'?'badge-gold':'badge-green'}">${b.type==='default'?'Học cùng thẻ':'Lớp học'}</span></div><div class="chapter-intro-row" style="margin-top:14px"><div><h3>${b.type==='default'?'Chương 1 · Nhận diện cảm xúc và nhu cầu':'Hoạt động theo chủ đề của lớp'}</h3><p>${n} trên 6 bước đã được khám phá</p></div><strong>${Math.round(n/6*100)}%</strong></div>${progressBar(n/6*100)}<div class="criteria-mini"><strong>Tiến trình mô tả</strong><div><span>${n===0?'Chưa bắt đầu':n===6?'Đã khám phá đủ sáu bước':'Đang khám phá từng bước'}</span></div></div></article>`;}).join('')}
      <div class="care-disclaimer">Phụ huynh chỉ xem trạng thái và tiến trình mô tả. Câu trả lời, lựa chọn giao tiếp, nội dung trao đổi riêng và ghi chú của giáo viên không hiển thị tại đây.</div></div>`;
  };

  // Messages exist only where a Teacher is actually assigned to that child.
  const renderThread = (role, sid) => {
    const s=student(sid), threads=state.messages[sid]||(state.messages[sid]=[]), cls=activeClassesFor(sid), lastTeacher=cls[0]?.owner||'Giáo viên phụ trách';
    return `${header(role==='guardian'?'Trao đổi với giáo viên':'Trao đổi với phụ huynh','Mỗi cuộc trò chuyện được tách riêng theo từng học sinh.')}
      <div class="messenger-layout"><aside class="thread-list"><div class="thread-list-title"><strong>Cuộc trò chuyện</strong><span class="badge badge-green">Theo từng trẻ</span></div>${(role==='guardian'?childrenWithTeacher():assignedChildren()).map(k=>{const last=(state.messages[k.id]||[]).at(-1);return `<button class="thread-person ${k.id===sid?'active':''}" data-action="select-chat-child" data-student="${k.id}">${avatar(k.name)}<span><strong>${esc(k.name)}</strong><small>${esc(last?.text||'Bắt đầu trao đổi')}</small></span></button>`;}).join('')||'<div class="empty-state"><p>Chưa có học sinh được gắn với giáo viên phụ trách.</p></div>'}</aside>
      <section class="chat-panel"><div class="chat-heading">${avatar(s.name)}<div><strong>Trao đổi về ${esc(s.name)}</strong><small>${role==='guardian'?esc(lastTeacher):'Phụ huynh của '+esc(s.name)}</small></div><span class="badge badge-green">Riêng học sinh này</span></div><div class="chat-messages">${threads.map(m=>`<div class="chat-line ${m.from===role?'mine':'theirs'}"><div class="chat-bubble">${esc(m.text)}</div><small>${esc(m.time)} · ${m.from==='guardian'?'Phụ huynh':'Giáo viên'}</small></div>`).join('')}</div><form class="chat-compose" data-form="thread-message"><input type="hidden" name="studentId" value="${s.id}"><input name="message" maxlength="500" placeholder="Viết lời nhắn ấm áp..." autocomplete="off" required><button class="btn btn-primary" type="submit">Gửi lời nhắn →</button></form><div class="chat-privacy">♡ Cuộc trò chuyện chỉ gắn với ${esc(s.name)}. Tin nhắn trong bản demo được lưu trên trình duyệt này.</div></section></div>`;
  };
  window.guardianMessagesPage = function(){
    const available=childrenWithTeacher();
    if(!available.some(s=>s.id===state.chatStudent))state.chatStudent=available[0]?.id||'';
    if(!available.length)return `${header('Trao đổi với giáo viên','Cuộc trò chuyện chỉ mở khi học sinh có giáo viên phụ trách.')}${helperNote('Bảo An hiện đang học cùng bộ thẻ MIMORA và chưa tham gia lớp có giáo viên. Khi được giáo viên cho phép tham gia lớp, cuộc trò chuyện riêng sẽ xuất hiện tại đây.')}`;
    return renderThread('guardian',state.chatStudent);
  };
  window.teacherMessagesPage = function(){
    const available=assignedChildren();
    if(!available.some(s=>s.id===state.chatStudent))state.chatStudent=available[0]?.id||'';
    if(!available.length)return `${header('Trao đổi với phụ huynh','Chỉ hiển thị học sinh thuộc lớp được phân công.')}${helperNote('Chưa có học sinh trong lớp để mở cuộc trò chuyện.')}`;
    return renderThread('teacher',state.chatStudent);
  };

  // Class management modal is deliberately scoped to one class at a time.
  function classManager(id){
    const b=state.boxes.find(x=>x.id===id);if(!b)return;
    const members=b.studentIds.map(student).filter(Boolean);
    openModal('Quản lý lớp học',`${classCriteriaPanel(b)}<div class="panel" style="margin-top:12px"><div class="panel-head"><div><h3>Học sinh trong lớp</h3><p>${members.length} học sinh đang tham gia</p></div><span class="badge badge-green">Phạm vi lớp</span></div>${members.map(s=>`<div class="student-row"><div class="row-main">${avatar(s.name)}<div><strong>${esc(s.name)}</strong><small>${esc(s.age)} · Tài khoản học sinh có sẵn</small></div></div><button class="btn btn-small btn-outline" data-action="view-student-support" data-student="${s.id}">Hồ sơ hỗ trợ</button></div>`).join('')||'<div class="empty-state"><p>Lớp chưa có học sinh.</p></div>'}</div><div class="care-disclaimer">Giáo viên chỉ quản lý thành viên và tiến trình trong phạm vi lớp này. Tài khoản học sinh và Lớp mặc định MIMORA không bị thay thế.</div>`,`<button class="btn btn-outline" data-action="close-modal">Đóng</button><button class="btn btn-soft" data-action="edit-class-criteria" data-class="${b.id}">Chỉnh lời hẹn của lớp</button><button class="btn btn-primary" data-action="invite-student">＋ Mời học sinh</button>`);
  }

  // More accurate role-specific action handling.
  document.addEventListener('click', e=>{
    const el=e.target.closest('[data-action]');if(!el)return;
    const a=el.dataset.action;
    if(a==='manage-box'){
      e.preventDefault();e.stopImmediatePropagation();classManager(el.dataset.box);return;
    }
  },true);

  // Replace old internal vocabulary in all visible copy; internal variable names remain unchanged.
  function normalizeVisibleCopy(root){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{n.nodeValue=n.nodeValue.replace(/\bBox\b/g,'Lớp').replace(/\bbox\b/g,'lớp');});
    root.querySelectorAll('[title],[aria-label]').forEach(el=>['title','aria-label'].forEach(attr=>{const v=el.getAttribute(attr);if(v)el.setAttribute(attr,v.replace(/\bBox\b/g,'Lớp').replace(/\bbox\b/g,'lớp'));}));
  }
  const prior=window.render;
  window.render=function(){prior();normalizeVisibleCopy(document.getElementById('main'));normalizeVisibleCopy(document.getElementById('modalRoot'));};
  window.render();
})();
