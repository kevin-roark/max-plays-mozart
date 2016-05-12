build:
	browserify demo/score.js -o demo/js/build.js

watch:
	watchify demo/score.js -v -o demo/js/build.js

prod:
	browserify demo/score.js -o demo/js/build.js
	minify js/build/build.js > js/build/build.min.js
	minify css/main.css > css/main.min.css

serve:
	serve -p 3002 ./
