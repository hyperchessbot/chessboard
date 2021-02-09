call s\r

git add .

git commit -m "%*"

pause

git push --set-upstream origin master

git push gitlab
