module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jsdoc : {
      dist : {
        src: ['Readme.md', 'source/**/*.*'],
        options : {
          destination : 'doc',
          private: false
        }
      }
    },
    browserify: {
      main: {
        src: ['./source/main.js'],
        dest: './dist/pryv.js',
        options: {
          alias: ['./source/main.js:pryv'],
          ignore: [ './source/system/*-node.js', './source/utility/*-node.js' ]
        }
      }
    },
    watch: {
      all: {
        files: [ 'source/**/*.*', 'test/**/*.*' ],
        tasks: ['default']
      }
    },
    jshint: {
      files: [ 'gruntfile.js', 'source/**/*.js', 'test/**/*.js' ],
      options: {
        jshintrc: '.jshintrc'
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
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.registerTask('default', [ 'jshint', 'browserify', 'mochaTest', 'jsdoc' ]);
};
