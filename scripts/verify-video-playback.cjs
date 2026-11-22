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
    'http://localhost:5174/'
  ]);

  console.log('Spawning Edge process...');
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

    // 1. First navigate to root to set localStorage
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

    // 2. Navigate directly to student course detail page
    console.log('Navigating to course detail page...');
    await send('Page.navigate', { url: 'http://localhost:5174/student/courses/course-fs-101' });

    // Wait until .video-wrapper or .video-container is loaded
    for (let i = 0; i < 25; i++) {
      const check = await send('Runtime.evaluate', {
        expression: '({ videos: document.querySelectorAll(".video-wrapper, .video-container").length, href: window.location.href, text: document.body.innerText.slice(0, 100) })',
        returnByValue: true
      });
      const st = check.result?.value;
      if (st && st.videos > 0) {
        console.log(`Course page ready! Found ${st.videos} videos.`);
        break;
      }
      await new Promise(r => setTimeout(r, 300));
    }

    const pageCheck = await send('Runtime.evaluate', {
      expression: '({ href: window.location.href, title: document.title, text: document.body.innerText.slice(0, 300) })',
      returnByValue: true
    });
    console.log('Current page status:', pageCheck.result?.value);

    // Viewport sizes to test
    const viewports = [
      { name: 'mobile-320px', width: 320, height: 568 },
      { name: 'mobile-375px', width: 375, height: 667 },
      { name: 'mobile-390px', width: 390, height: 844 },
      { name: 'mobile-430px', width: 430, height: 932 },
      { name: 'tablet-768px', width: 768, height: 1024 },
      { name: 'desktop-1280px', width: 1280, height: 800 }
    ];

    console.log('\n--- TESTING ALL VIEWPORT SIZES ---');

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

            // Video elements & wrappers
            const wrappers = Array.from(document.querySelectorAll('.video-wrapper, .video-container'));
            const wrapperStats = wrappers.map(w => {
              const rect = w.getBoundingClientRect();
              const iframe = w.querySelector('iframe');
              const video = w.querySelector('video');
              const innerMedia = iframe || video;
              const innerRect = innerMedia ? innerMedia.getBoundingClientRect() : null;

              // Check for open-in-new-tab icon
              const openTabIcon = w.querySelector('a[title*="new window"], a[title*="new tab"], a[aria-label*="new window"], a[aria-label*="new tab"]');
              // Check for enlarge icon
              const enlargeBtn = w.querySelector('button[title*="Fullscreen"], button[title*="Enlarge"]');

              return {
                wrapperWidth: Math.round(rect.width),
                wrapperHeight: Math.round(rect.height),
                aspectRatio: (rect.width / (rect.height || 1)).toFixed(2),
                innerWidth: innerRect ? Math.round(innerRect.width) : null,
                innerHeight: innerRect ? Math.round(innerRect.height) : null,
                innerMatchesWrapper: innerRect ? (Math.abs(rect.width - innerRect.width) <= 2 && Math.abs(rect.height - innerRect.height) <= 2) : false,
                hasOpenTabIcon: Boolean(openTabIcon),
                hasEnlargeBtn: Boolean(enlargeBtn),
                mediaType: video ? 'html5-video' : (iframe ? 'iframe' : 'empty')
              };
            });

            // Multiple videos list & spacing
            const videoCards = Array.from(document.querySelectorAll('.video-item-card'));
            const cardDistances = [];
            for (let i = 0; i < videoCards.length - 1; i++) {
              const r1 = videoCards[i].getBoundingClientRect();
              const r2 = videoCards[i+1].getBoundingClientRect();
              cardDistances.push(Math.round(r2.top - r1.bottom));
            }

            return {
              viewport: { width: winWidth, docScrollWidth: docWidth, hasHorizontalOverflow },
              videoCount: wrappers.length,
              videoCardsCount: videoCards.length,
              cardDistances,
              wrapperStats
            };
          })()
        `,
        returnByValue: true
      });

      const metrics = evalRes.result ? evalRes.result.value : evalRes.value;
      console.log(`\n[Viewport: ${vp.name} (${vp.width}x${vp.height})]`);
      console.log(`- Document width: ${metrics.viewport.docScrollWidth}px / Viewport: ${metrics.viewport.width}px (Overflow: ${metrics.viewport.hasHorizontalOverflow})`);
      console.log(`- Video containers detected: ${metrics.videoCount}`);
      console.log(`- Video item cards: ${metrics.videoCardsCount}`);
      if (metrics.cardDistances.length > 0) {
        console.log(`- Spacing between consecutive video cards: ${metrics.cardDistances.join(', ')}px (Target >= 24px)`);
      }

      metrics.wrapperStats.forEach((s, idx) => {
        console.log(`  Video #${idx + 1} (${s.mediaType}):`);
        console.log(`    - Outer Box: ${s.wrapperWidth}x${s.wrapperHeight}px (Ratio: ${s.aspectRatio})`);
        console.log(`    - Inner Media: ${s.innerWidth}x${s.innerHeight}px`);
        console.log(`    - Media fills wrapper 100%: ${s.innerMatchesWrapper}`);
        console.log(`    - Open tab icon removed: ${!s.hasOpenTabIcon}`);
        console.log(`    - Single bottom enlarge icon present: ${s.hasEnlargeBtn}`);
      });

      // Capture screenshot
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const shotPath = path.join(outputDir, `${vp.name}.png`);
      fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
      console.log(`  -> Saved screenshot: ${shotPath}`);
    }

    // 3. Test actual HTML5 video playback
    console.log('\n--- TESTING ACTUAL HTML5 VIDEO PLAYBACK ON MOBILE (375px) ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 1,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 500));

    // Select module 2 (which has the HTML5 video)
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          // Find dropdown or buttons to switch to module 2 or select module
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Module 2'));
          if (btn) btn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    // Trigger video playback
    const playResult = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          const video = document.querySelector('video');
          if (!video) return { found: false };

          const playBtn = document.querySelector('button[aria-label="Play Video"], button[aria-label="Play"], button[title="Play"]');
          if (playBtn) playBtn.click();
          else video.play();

          await new Promise(r => setTimeout(r, 1500));

          return {
            found: true,
            src: video.src,
            paused: video.paused,
            currentTime: video.currentTime,
            duration: video.duration,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            offsetWidth: video.offsetWidth,
            offsetHeight: video.offsetHeight
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Playback verification result:', playResult.result ? playResult.result.value : playResult.value);

    const playShot = await send('Page.captureScreenshot', { format: 'png' });
    const playShotPath = path.join(outputDir, 'mobile-375px-video-playing.png');
    fs.writeFileSync(playShotPath, Buffer.from(playShot.data, 'base64'));
    console.log(`-> Saved playback screenshot: ${playShotPath}`);

    console.log('\nALL VERIFICATIONS COMPLETE!');
    ws.close();
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    proc.kill();
  }
}

run();
