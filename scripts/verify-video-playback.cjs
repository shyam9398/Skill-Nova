const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputDir = path.join(__dirname, '..', 'verification_screenshots');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function run() {
  const tmpDir = path.join(os.tmpdir(), 'edge-verify-' + Date.now());
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=' + tmpDir,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-features=Translate',
    'about:blank'
  ]);

  console.log('Spawning Edge browser process...');
  await new Promise(r => setTimeout(r, 2000));

  try {
    const vRes = await fetch('http://127.0.0.1:9222/json/version');
    const versionData = await vRes.json();
    console.log('Connected to Edge:', versionData.Browser);

    const tabsRes = await fetch('http://127.0.0.1:9222/json');
    const tabs = await tabsRes.json();
    const pageTab = tabs.find(t => t.type === 'page');
    if (!pageTab) throw new Error('No page tab found');

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        callbacks.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await new Promise((resolve) => {
      ws.onopen = resolve;
    });

    console.log('CDP WebSocket opened');
    await send('Page.enable');
    await send('DOM.enable');
    await send('Runtime.enable');

    // 1. First navigate to root to set localStorage on origin
    await send('Page.navigate', { url: 'http://localhost:5174/' });
    await new Promise(r => setTimeout(r, 1500));

    // Set localStorage student credentials
    const studentUser = {
      id: 'usr-student-1',
      role: 'student',
      full_name: 'Aarav Sharma',
      email: 'student@skillnova.edu',
      username: 'student',
      status: 'active',
      assigned_courses: ['course-fs-101', 'course-ai-201', 'course-dsa-301']
    };

    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('skillnova_active_session_user', '${JSON.stringify(studentUser)}');
        localStorage.setItem('skillnova_current_user_id', 'usr-student-1');
        localStorage.removeItem('skillnova_explicit_logout');
      `
    });

    // 2. Navigate to student course detail page
    console.log('Navigating to course detail page...');
    await send('Page.navigate', { url: 'http://localhost:5174/student/courses/course-fs-101' });

    // Wait until session verification finishes and course loads
    for (let i = 0; i < 30; i++) {
      const check = await send('Runtime.evaluate', {
        expression: '({ videoCards: document.querySelectorAll(".video-item-card").length, text: document.body.innerText.slice(0, 100) })',
        returnByValue: true
      });
      const st = check.result?.value;
      if (st && st.videoCards > 0) {
        console.log(`Course page ready! Found ${st.videoCards} video cards.`);
        break;
      }
      await new Promise(r => setTimeout(r, 400));
    }

    // Viewport sizes to test
    const viewports = [
      { name: 'mobile-320px', width: 320, height: 568 },
      { name: 'mobile-375px', width: 375, height: 667 },
      { name: 'mobile-390px', width: 390, height: 844 },
      { name: 'mobile-430px', width: 430, height: 932 },
      { name: 'tablet-768px', width: 768, height: 1024 },
      { name: 'desktop-1280px', width: 1280, height: 800 }
    ];

    console.log('\n========================================================');
    console.log('PART 1: RESPONSIVE VIEWPORT TESTING (COURSE DETAIL PAGE)');
    console.log('========================================================');

    for (const vp of viewports) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 768
      });
      await new Promise(r => setTimeout(r, 800));

      const evalRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            const hasHorizontalOverflow = docWidth > winWidth;

            // Target actual video cards
            const videoCards = Array.from(document.querySelectorAll('.video-item-card'));
            const cardDistances = [];
            for (let i = 0; i < videoCards.length - 1; i++) {
              const r1 = videoCards[i].getBoundingClientRect();
              const r2 = videoCards[i+1].getBoundingClientRect();
              cardDistances.push(Math.round(r2.top - r1.bottom));
            }

            const cardStats = videoCards.map(card => {
              const cardRect = card.getBoundingClientRect();
              const heading = card.querySelector('h6, h5')?.innerText || 'Untitled';
              const w = card.querySelector('.video-wrapper');
              if (!w) return null;

              const rect = w.getBoundingClientRect();
              const iframe = w.querySelector('iframe');
              const video = w.querySelector('video');
              const innerMedia = iframe || video;
              const innerRect = innerMedia ? innerMedia.getBoundingClientRect() : null;

              // Check open in new tab icon: must be 0
              const openTabIcons = w.querySelectorAll('a[title*="new window"], a[title*="new tab"], a[aria-label*="new window"], a[aria-label*="new tab"], a[target="_blank"]');
              // Check enlarge icon: must be exactly 1
              const enlargeBtns = w.querySelectorAll('button[title*="Fullscreen"], button[title*="Enlarge"], button[aria-label*="Fullscreen"], button[aria-label*="Enlarge"]');

              return {
                heading,
                cardWidth: Math.round(cardRect.width),
                wrapperWidth: Math.round(rect.width),
                wrapperHeight: Math.round(rect.height),
                aspectRatio: (rect.width / (rect.height || 1)).toFixed(2),
                innerWidth: innerRect ? Math.round(innerRect.width) : null,
                innerHeight: innerRect ? Math.round(innerRect.height) : null,
                innerMatchesWrapper: innerRect ? (Math.abs(rect.width - innerRect.width) <= 2 && Math.abs(rect.height - innerRect.height) <= 2) : false,
                openTabIconCount: openTabIcons.length,
                enlargeBtnCount: enlargeBtns.length,
                mediaType: video ? 'html5-video' : (iframe ? 'iframe' : 'empty')
              };
            }).filter(Boolean);

            return {
              viewport: { width: winWidth, docScrollWidth: docWidth, hasHorizontalOverflow },
              videoCardsCount: videoCards.length,
              cardDistances,
              cardStats
            };
          })()
        `,
        returnByValue: true
      });

      const metrics = evalRes.result ? evalRes.result.value : evalRes.value;
      console.log(`\n[Viewport: ${vp.name} (${vp.width}x${vp.height})]`);
      console.log(`  - Doc ScrollWidth: ${metrics.viewport.docScrollWidth}px / Viewport: ${metrics.viewport.width}px`);
      console.log(`  - Horizontal Overflow: ${metrics.viewport.hasHorizontalOverflow ? 'FAIL (Overflow)' : 'PASS (Zero Overflow)'}`);
      console.log(`  - Video Item Cards Count: ${metrics.videoCardsCount}`);
      if (metrics.cardDistances.length > 0) {
        console.log(`  - Spacing between consecutive video cards: ${metrics.cardDistances.join(', ')}px (Target: >= 24px)`);
      }

      metrics.cardStats.forEach((s, idx) => {
        console.log(`  * Video Card #${idx + 1} ("${s.heading}") [${s.mediaType}]:`);
        console.log(`      Card Width: ${s.cardWidth}px | Video Box: ${s.wrapperWidth}x${s.wrapperHeight}px (Ratio: ${s.aspectRatio})`);
        console.log(`      Inner Media: ${s.innerWidth}x${s.innerHeight}px (Matches Box: ${s.innerMatchesWrapper})`);
        console.log(`      Open in new tab icon: ${s.openTabIconCount === 0 ? 'PASS (0 found - successfully removed)' : 'FAIL (' + s.openTabIconCount + ' found)'}`);
        console.log(`      Single enlarge icon at bottom: ${s.enlargeBtnCount === 1 ? 'PASS (exactly 1 found)' : 'FAIL (count: ' + s.enlargeBtnCount + ')'}`);
      });

      // Capture screenshot
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const shotPath = path.join(outputDir, `${vp.name}.png`);
      fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
      console.log(`  -> Screenshot saved: ${shotPath}`);
    }

    // 2. Test Fullscreen Enlarge Interaction on Mobile
    console.log('\n========================================================');
    console.log('PART 2: SCREEN ENLARGE BUTTON INTERACTION TEST (375px)');
    console.log('========================================================');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 1,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 500));

    const enlargeTest = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const firstCard = document.querySelector('.video-item-card');
          if (!firstCard) return { found: false };
          const enlargeBtn = firstCard.querySelector('button[title*="Fullscreen"], button[title*="Enlarge"]');
          if (!enlargeBtn) return { found: true, hasBtn: false };

          const btnRect = enlargeBtn.getBoundingClientRect();
          const cardRect = firstCard.getBoundingClientRect();

          return {
            found: true,
            hasBtn: true,
            btnTitle: enlargeBtn.title || enlargeBtn.getAttribute('aria-label'),
            btnPositionBottom: Math.round(cardRect.bottom - btnRect.bottom),
            btnPositionRight: Math.round(cardRect.right - btnRect.right)
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Enlarge Button Metrics:', enlargeTest.result?.value);

    // 3. Test Saturday Special Page
    console.log('\n========================================================');
    console.log('PART 3: SATURDAY SPECIAL VIDEO PLAYER TESTING');
    console.log('========================================================');

    await send('Page.navigate', { url: 'http://localhost:5174/student/saturday-special' });
    await new Promise(r => setTimeout(r, 2000));

    // Click "Open Session" on the first available session
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const openBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('Open Session'));
          if (openBtns.length > 0) openBtns[0].click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    const satRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.querySelector('.video-item-card') || document.querySelector('.video-wrapper');
          if (!card) return { found: false };
          const wrapper = card.classList.contains('video-wrapper') ? card : card.querySelector('.video-wrapper');
          if (!wrapper) return { found: false };

          const rect = wrapper.getBoundingClientRect();
          const iframe = wrapper.querySelector('iframe');
          const video = wrapper.querySelector('video');
          const innerMedia = iframe || video;
          const innerRect = innerMedia ? innerMedia.getBoundingClientRect() : null;
          const enlargeBtns = wrapper.querySelectorAll('button[title*="Fullscreen"], button[title*="Enlarge"]');
          const openTabIcons = wrapper.querySelectorAll('a[title*="new window"], a[title*="new tab"], a[target="_blank"]');

          return {
            found: true,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            aspectRatio: (rect.width / (rect.height || 1)).toFixed(2),
            innerMatches: innerRect ? (Math.abs(rect.width - innerRect.width) <= 2 && Math.abs(rect.height - innerRect.height) <= 2) : false,
            enlargeBtnCount: enlargeBtns.length,
            openTabCount: openTabIcons.length
          };
        })()
      `,
      returnByValue: true
    });

    const sat = satRes.result?.value;
    console.log('Saturday Special Video Results:');
    console.log(`  - Video found: ${sat?.found}`);
    console.log(`  - Dimensions: ${sat?.width}x${sat?.height}px (Ratio: ${sat?.aspectRatio})`);
    console.log(`  - Media fills container: ${sat?.innerMatches}`);
    console.log(`  - Single enlarge button: ${sat?.enlargeBtnCount === 1 ? 'PASS (exactly 1 found)' : 'FAIL'}`);
    console.log(`  - Open in new tab removed: ${sat?.openTabCount === 0 ? 'PASS (0 found)' : 'FAIL'}`);

    const satShot = await send('Page.captureScreenshot', { format: 'png' });
    const satShotPath = path.join(outputDir, 'mobile-375px-saturday-special.png');
    fs.writeFileSync(satShotPath, Buffer.from(satShot.data, 'base64'));
    console.log(`  -> Saturday Special screenshot saved: ${satShotPath}`);

    console.log('\n========================================================');
    console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
    console.log('========================================================');
    ws.close();
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    proc.kill();
  }
}

run();
