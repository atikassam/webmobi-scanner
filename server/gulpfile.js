// Require gulp task runner
const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

const _BUILD_PATH_ = __dirname+'/dist';

// Now lets create a task which will transpile
// our typescript files to targeted js file

gulp.task('default', () => {
	return tsProject.src()
			.pipe(tsProject())
			.js.pipe(gulp.dest(_BUILD_PATH_));
})

gulp.task('copy-public', () => {
    return gulp.src('./src/public/**/*')
        .pipe(gulp.dest(_BUILD_PATH_+'/public'))
})

gulp.task('build', ['copy-public', 'default']);

