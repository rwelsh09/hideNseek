sed -i -e "s/if \[ -d \"gh-pages-dir\/\$branch\" \]; then/if \[ -d \"gh-pages-dir\/\$branch\" \] || \[ -d \"gh-pages-dir\/\${branch}\" \]; then/" .github/workflows/deploy.yml
