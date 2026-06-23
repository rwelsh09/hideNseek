# Fix using pure bash variable expansion rather than echoing inside bash backticks
sed -i 's/git ls-remote --heads origin | awk -F'\''refs\/heads\/'\'' '\''{print \$2}'\'' > active_branches.txt/git ls-remote --heads origin | awk -F'\''refs\/heads\/'\'' '\''{print \$2}'\'' | tr -d '\''\\r'\'' > active_branches.txt/' .github/workflows/deploy.yml
