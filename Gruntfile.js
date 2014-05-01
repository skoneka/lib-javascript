var package = require('./package.json'),
    distRoot = './dist/',
    currentDistPath = distRoot + package.version + '/',
    latestDistPath = distRoot + 'latest/';

module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-env');

  grunt.initConfig({
    pkg: package,

    jshint: {
      files: [ 'gruntfile.js', 'source/**/*.js', 'test/**/*.js' ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    browserify: {
      dist: {
        src: ['./source/main.js'],
        dest: currentDistPath + 'pryv.js',
        options: {
          alias: ['./source/main.js:pryv'],
          ignore: [ './source/system/*-node.js', './source/utility/*-node.js' ],
          bundleOptions: {
            standalone: 'pryv'
          }
        }
      }
    },

    copy: {
      assetsToDist: {
        files: [
          {
            expand: true,
            flatten: true,
            filter: 'isFile',
            src: 'source/assets/**',
            dest: currentDistPath + 'assets/'
          }
        ]
      },
      updateLatestDist: {
        files: [
          {
            expand: true,
            cwd: currentDistPath,
            src: '**',
            dest: latestDistPath
          }
        ]
      }
    },
    env : {
      record: {
        REPLAY : 'record'
      }
    },
    mochaTest: {
      test: {
        src: ['test/**/*.test.js'],
        options: {
          require: [ './test/blanket', './source/main.js' ],
          reporter: 'spec'
        }
      },
      coverage: {
        src: ['test/**/*.test.js'],
        options: {
          quiet: true,
          reporter: 'html-cov',
          captureFile: 'test/coverage.html'
        }
      }
    },

    jsdoc : {
      dist : {
        src: [ 'README.md', 'source/**/*.*' ],
        options : {
          destination : 'doc',
          private: false,
          plugins: ['plugins/markdown'],
          markdown: {parser: 'evilstreak'}
        }
      }
    },

    watch: {
      all: {
        files: [ 'source/**/*.*', 'test/**/*.*' ],
        tasks: ['test']
      }
    }
  });

  grunt.registerTask('default', [ 'jshint', 'browserify', 'copy', 'mochaTest', 'jsdoc' ]);
  grunt.registerTask('test', [ 'jshint', 'browserify', 'copy', 'mochaTest' ]);
  grunt.registerTask('record', [ 'jshint', 'browserify', 'copy', 'env:record', 'mochaTest' ]);
};
