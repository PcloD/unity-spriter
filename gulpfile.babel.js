import gulp  from 'gulp';
import rename from 'gulp-rename';
import insert from 'gulp-insert';
import shell from 'gulp-shell';
import run from 'run-sequence';
import unity from 'gulp-unity';
import p from 'path';

var config = {
  spriter: p.join(__dirname, 'SpriterDotNet', 'SpriterDotNet'),
  assets: p.join(__dirname, 'Assets', 'SpriterDotNetCore'),
};

gulp.task('default', function(callback) {
  run('deploy', 'test', callback);
});

// Copy source into assets folder
gulp.task('deploy', function() {
  return gulp.src(`${config.spriter}/**/*.cs`)
    .pipe(gulp.dest(config.assets));
});

// Run unity tests
gulp.task('test', function() {
  return gulp.src('./package.json')
    .pipe(unity({
      method: 'N.TestRunner.Run',
      args: ['--filterTests=Spriter'],
      debug: (v) => {
        unity.debug(v, [
          { pattern: /.*DEBUG.*/, color: 'yellow', context: 0 },
          { pattern: /.*ERROR.*/, color: 'red', context: 0 },
          { pattern: /\! Test.*/, color: 'red' },
          { pattern: /\- Test.*/, color: 'green' },
        ])
      }
    }));
});
