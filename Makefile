build:
	browserify js/score.js -o js/build.js

watch:
	watchify js/score.js -v -o js/build.js

prod:
	browserify js/score.js -o js/build.js
	minify js/build.js > js/build.min.js
	minify css/main.css > css/main.min.css

serve:
	serve -p 3002 ./
