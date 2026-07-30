export const githubRepo = {
  owner: 'WinstonDeMoura',
  repo: 'gittraining',
  branch: 'main',
  path: 'src/data/sandboxProject.js',
}

export function githubFileUrl({ owner, repo, branch, path }) {
  return `https://github.com/${owner}/${repo}/blob/${branch}/${path}`
}

export function githubCommitsApiUrl({ owner, repo, branch, path }) {
  return `https://api.github.com/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}&sha=${branch}&per_page=1`
}

export function githubRawUrl({ owner, repo, branch, path }) {
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
}
