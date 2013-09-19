
module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      main: {
        src: ['./src/main.js'],
        dest: './dist/pryv.js',
        options: {
          alias: ['./src/main.js:pryv'],
          ignore: ['./src/system/*-node.js', './src/utility/*-node.js']
        }
      }
    },
    watch: {
      all: {
        files: ['src/**/*.*', 'tests/**/*.*'],
        tasks: ['default']
      }
    },
    jshint: {
      files: ['gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          require: ['./src/main.js']
        },
        src: ['tests/**/*.test.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');


  // Default task.
  grunt.registerTask('default', ['jshint', 'browserify', 'mochaTest']);
};
