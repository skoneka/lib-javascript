module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: [ 'gruntfile.js', 'source/**/*.js', 'test/**/*.js' ],
      options: {
        jshintrc: '.jshintrc'
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

    copy: {
      media : {
        files: [
          {
            expand: true,
            flatten: true,
            filter: 'isFile',
            src: 'source/media/**',
            dest: 'dist/media/'
          }
        ]
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
        src: [ 'Readme.md', 'source/**/*.*' ],
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
};
