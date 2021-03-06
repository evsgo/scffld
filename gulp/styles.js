'use strict';

import path from 'path';
import autoprefixer from 'autoprefixer';

export default function(gulp, args, $, config, bs) {
  let dirs = config.directories;
  let entries = config.entries;
  let pp = config.cssPreprocessor;
  let src = typeof(dirs.styles) == 'string' ? dirs.styles : dirs.styles.src;
  let dest = typeof(dirs.styles) == 'string' ? dirs.styles.replace(/^_/, '') : dirs.styles.dist;
      dest = path.join(dirs.build, dest);

  //- CSS Preprocessor setup
  let useSass = (pp == 'sass');
  let fileExt = useSass ? '.+(sass|scss)' : '.less';
  let preprocessor = useSass ? $.sass : $.less;
  let ppConfig = useSass ? {
      outputStyle: 'expanded',
      precision: 10,
      includePaths: [
        path.join(dirs.source, '_modules'),
        'node_modules'
      ]
    } : { /* no config for less*/ };

  gulp.task('styles', () => {
    let autoprefixConf = {
      browsers: ['last 2 version', '> 5%', 'safari 5', 'ios 6', 'android 4']
    };

    return gulp.src( path.join(dirs.source, src, entries.css + fileExt) )
      .pipe($.plumber())
      .pipe($.debug({title:`${pp}:`}))
      .pipe($.sourcemaps.init())
      .pipe(preprocessor(ppConfig))
        .on('error', (err) => {
          $.util.log(err);
        })
      .pipe($.postcss([autoprefixer(autoprefixConf)]))
      .pipe($.if((!args.serve && !args.dev), $.cleanCss()))
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest(dest))
      .pipe(bs.stream({match: '**/*.css'}))
      .on('end', () => {
        return gulp.src(path.join(dest, '**/*.css'))
          .pipe($.if(args.debug, $.parker()));
      });
  });
}
