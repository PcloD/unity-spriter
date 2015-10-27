import gulp  from 'gulp';
import toml  from 'gulp-toml';
import rename from 'gulp-rename';
import insert from 'gulp-insert';
import shell from 'gulp-shell';
import run from 'run-sequence';
import unity from 'gulp-unity';
import p from 'path';

var config = {
  cs: p.join(__dirname, 'Assets', 'packages'),
  toml: p.join(__dirname, 'Assets', 'packages'),
  json: p.join(__dirname, 'Assets', 'build')
};

gulp.task('default', function(callback) {
  run('data', 'code', callback);
});

// Compile and run tests
gulp.task('code', function(callback) {
  run('tests', callback);
});

// Run unity tests
gulp.task('tests', function() {
  return gulp.src('./package.json')
    .pipe(unity({
      method: 'N.TestRunner.Run',
      args: ['--filterTests=Air'],
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

// Run unity tests
gulp.task('dev', function() {
  return gulp.src('./package.json')
    .pipe(unity({
      method: 'N.TestRunner.Run',
      args: ['--filterTests=Combat'],
      debug: (v) => {
        unity.debug(v, [
          { pattern: /\! Test.*/, color: 'red' },
          { pattern: /\- Test.*/, color: 'green' },
          { pattern: /test_.*/, color: 'red', context: true },
          { pattern: /.*DEBUG.*/, color: 'yellow', context: 0 },
          { pattern: /.*ERROR.*/, color: 'red', context: 0 },
        ])
      }
    }));
});

// Run unity tests
gulp.task('n', function() {
  return gulp.src('./package.json')
    .pipe(unity({
      method: 'N.TestRunner.Run',
      args: ['--filterTests=N.'],
      debug: (v) => {
        unity.debug(v, [
          { pattern: /\! Test.*/, color: 'red' },
          { pattern: /\- Test.*/, color: 'green' },
          { pattern: /test_.*/, color: 'red', context: true },
          { pattern: /.*DEBUG.*/, color: 'yellow', context: 0 },
          { pattern: /.*ERROR.*/, color: 'red', context: 0 },
        ])
      }
    }));
});

// Build files
gulp.task('data', function(callback) {
  run('toml', 'manifest', callback);
});

// TOML -> JSON
gulp.task('toml', function() {
  return gulp.src(config.toml + '/**/*.toml')
    .pipe(insert.transform((contents, file) => {
      var parts = file.path.split(p.sep);
      var name = parts[parts.length - 1];
      name = name.split(".")[0];
      return "id = \"" + name + "\"\n" + contents;
    }))
    .pipe(toml())
    .pipe(rename((path) => {
      var parts = path.dirname.split(p.sep);
      var new_parts = [parts[0], 'Resources', parts[0]];
      for (var i = 2; i < parts.length; ++i) {
        new_parts.push(parts[i]);
      }
      path.dirname = p.join.apply(p, new_parts);
    }))
    .pipe(gulp.dest(config.json));
});

// Rebuild a new valid manifest file
gulp.task('manifest', function() {
  return gulp.src('./package.json')
    .pipe(unity({
      method: 'N.Package.Data.ManifestBuilder.Run',
      debug: (v) => {
        unity.debug(v, [
          { pattern: /System.Exception/, color: 'red', context: true }
        ])
      }
    }));
});

// Watch for data changes
gulp.task('watch', function() {
  gulp.watch("./Assets/packages/*/src/**/*.toml", ['default']);
  gulp.watch("./Assets/packages/*/src/**/*.cs", ['tests']);
});

// Live changes for when unity is running
gulp.task('live', function() {
  gulp.watch("./Assets/packages/*/src/**/*.toml", ['toml']);
});
