const { spawn } = require('child_process');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const os = require('os');
const path = require('path');

async function test() {
  const tmpDir = path.join(os.tmpdir(), 'edge-dbg-' + Date.now());
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--user-data-dir=' + tmpDir,
    'about:blank'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const tabsRes = await fetch('http://127.0.0.1:9224/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const msgId = id++;
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === msgId) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  await send('Page.enable');
  await send('DOM.enable');
  await send('Runtime.enable');

  // Navigate to domain so localStorage can be set on http://localhost:5174
  await send('Page.navigate', { url: 'http://localhost:5174/' });
  await new Promise(r => setTimeout(r, 1500));

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

  // Now navigate to student course detail
  await send('Page.navigate', { url: 'http://localhost:5174/student/courses/course-fs-101' });

  for (let i = 0; i < 20; i++) {
    const status = await send('Runtime.evaluate', {
      expression: 'document.body.innerText.includes("Verifying SkillNova")',
      returnByValue: true
    });
    if (!status.result?.value) break;
    await new Promise(r => setTimeout(r, 400));
  }

  await new Promise(r => setTimeout(r, 1000));

  const res = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          href: window.location.href,
          title: document.title,
          bodyText: document.body.innerText.slice(0, 1000)
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Result:', JSON.stringify(res.result.value, null, 2));
  ws.close();
  proc.kill();
}
test().catch(console.error);
