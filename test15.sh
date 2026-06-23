mkdir -p gh-pages-dir
git fetch origin gh-pages
git --work-tree=gh-pages-dir checkout origin/gh-pages -- .

git ls-remote --heads origin | awk -F'refs/heads/' '{print $2}' > active_branches.txt
sed -i 's/\r$//' active_branches.txt

while IFS= read -r branch; do
    echo "Checking [$branch]"
    if [ -d "gh-pages-dir/$branch" ]; then
        echo "Dir EXISTS: gh-pages-dir/$branch"
    else
        echo "Dir DOES NOT exist: gh-pages-dir/$branch"
    fi
done < active_branches.txt

rm -rf active_branches.txt gh-pages-dir
