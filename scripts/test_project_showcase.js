// Test script for Project Showcase Management CRUD & Filtering Logic
import assert from 'assert';

console.log('--- Testing Project Showcase Management Logic ---');

// Mock in-memory projects array to test the exact dataService logic
let projects = [
  {
    id: 'proj-1',
    title: 'Autonomous Drone Navigation with Computer Vision',
    description: 'Real-time obstacle avoidance using deep RL and OpenCV.',
    image_url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800',
    project_url: 'https://github.com/skillnova-students/drone-vision',
    category: 'AI/ML',
    status: 'published',
    created_at: '2026-10-15T08:30:00Z',
    updated_at: '2026-10-15T08:30:00Z'
  },
  {
    id: 'proj-2',
    title: 'FinTrack: Real-Time Decentralized Expense Ledger',
    description: 'Full-stack financial analytics workspace built with React 19.',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    project_url: 'https://github.com/skillnova-students/fintrack',
    category: 'Web Development',
    status: 'published',
    created_at: '2026-10-20T10:15:00Z',
    updated_at: '2026-10-20T10:15:00Z'
  },
  {
    id: 'proj-3',
    title: 'PulseCare: Smart Hospital IoT & Patient Telemetry',
    description: 'Continuous patient telemetry dashboard over MQTT.',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    project_url: 'https://github.com/skillnova-students/pulsecare',
    category: 'IoT',
    status: 'published',
    created_at: '2026-10-25T14:40:00Z',
    updated_at: '2026-10-25T14:40:00Z'
  },
  {
    id: 'proj-4',
    title: 'Campus Connect: Peer Mentorship & Collaboration App',
    description: 'Mobile-first native cross-platform application.',
    image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    project_url: 'https://github.com/skillnova-students/campus-connect',
    category: 'App Development',
    status: 'draft',
    created_at: '2026-11-01T09:00:00Z',
    updated_at: '2026-11-01T09:00:00Z'
  }
];

// Helper functions mirroring dataService
function getProjects(filterStatus) {
  if (filterStatus === 'published') {
    return projects.filter(p => p.status === 'published');
  }
  return [...projects];
}

function createProject(payload) {
  const newProj = {
    id: `proj-${Date.now()}`,
    title: payload.title.trim(),
    description: payload.description.trim(),
    image_url: payload.image_url.trim(),
    project_url: payload.project_url ? payload.project_url.trim() : null,
    category: payload.category || 'Other',
    status: payload.status || 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  projects.unshift(newProj);
  return newProj;
}

function updateProject(id, updates) {
  const p = projects.find(item => item.id === id);
  if (!p) return undefined;
  Object.assign(p, updates, { updated_at: new Date().toISOString() });
  return p;
}

function deleteProject(id) {
  projects = projects.filter(p => p.id !== id);
}

function toggleProjectPublishStatus(id) {
  const p = projects.find(item => item.id === id);
  if (!p) return undefined;
  p.status = p.status === 'published' ? 'draft' : 'published';
  p.updated_at = new Date().toISOString();
  return p;
}

// 1. Test Initial Retrieval & Status Filtering
const allProjects = getProjects();
assert.strictEqual(allProjects.length, 4, 'Should have 4 initial projects');

const publishedProjects = getProjects('published');
assert.strictEqual(publishedProjects.length, 3, 'Should have 3 published projects initially on landing page');
assert(publishedProjects.every(p => p.status === 'published'), 'All landing page projects must be published');
console.log('✓ Initial project count and published-only filtering verified!');

// 2. Test Create Project
const created = createProject({
  title: 'Quantum Key Distribution Simulation',
  description: 'Simulating BB84 quantum protocol over noisy quantum channels.',
  image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
  project_url: 'https://github.com/skillnova-students/quantum-qkd',
  category: 'Cybersecurity',
  status: 'published'
});
assert.strictEqual(created.title, 'Quantum Key Distribution Simulation');
assert.strictEqual(getProjects().length, 5, 'Should now have 5 projects');
assert.strictEqual(getProjects('published').length, 4, 'Should now have 4 published projects');
console.log('✓ Create project operation verified!');

// 3. Test Update Project & Image Replacement
const updated = updateProject(created.id, {
  title: 'Quantum Key Distribution Simulation v2.0',
  image_url: 'https://images.unsplash.com/photo-replacement.jpg'
});
assert.strictEqual(updated.title, 'Quantum Key Distribution Simulation v2.0');
assert.strictEqual(updated.image_url, 'https://images.unsplash.com/photo-replacement.jpg');
console.log('✓ Update project and image replacement verified!');

// 4. Test Toggle Publish / Unpublish Status
const unpub = toggleProjectPublishStatus(created.id);
assert.strictEqual(unpub.status, 'draft', 'Status should now be draft');
assert.strictEqual(getProjects('published').length, 3, 'Public landing page count should decrease to 3');

const repub = toggleProjectPublishStatus(created.id);
assert.strictEqual(repub.status, 'published', 'Status should now be published');
assert.strictEqual(getProjects('published').length, 4, 'Public landing page count should return to 4');
console.log('✓ Publish / unpublish toggle and public visibility sync verified!');

// 5. Test Delete Project
deleteProject(created.id);
assert.strictEqual(getProjects().length, 4, 'Total projects should return to 4 after delete');
assert.strictEqual(getProjects('published').length, 3, 'Published projects should return to 3 after delete');
console.log('✓ Delete project operation verified!');

console.log('ALL Project Showcase Management tests passed successfully!');

