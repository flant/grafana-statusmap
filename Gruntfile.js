'use strict';
module.exports = (grunt) => {
  require('load-grunt-tasks')(grunt);

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-notify');

  grunt.initConfig({
    notify: {
      watch: {
        options: {
          message: 'grunt watch Complete',
          title: 'flant-statusmap-panel rebuilded',
          duration: 2
        }
      }
    },

    clean: ['dist'],

    copy: {
      src_to_dist: {
        cwd: 'src',
        expand: true,
        src: ['**/*', '!**/*.js', '!**/*.ts', '!**/*.scss'],
        dest: 'dist'
      },
      root_to_dist: {
        expand: true,
        src: ['plugin.json', 'README.md', 'CHANGELOG.md'],
        dest: 'dist'
      }
    },

    watch: {
      rebuild_all: {
        files: ['src/**/*', 'plugin.json'],
        tasks: ['default', 'notify:watch'],
        options: {
          spawn: false,
          livereload: true
        }
      }
    },

    babel: {
      options: {
        sourceMap: true,
        presets: ['@babel/preset-env', '@babel/typescript'],
        plugins: ['angularjs-annotate', '@babel/plugin-transform-modules-systemjs', '@babel/plugin-transform-for-of', '@babel/plugin-proposal-class-properties', '@babel/plugin-proposal-object-rest-spread'],
      },
      d3lib: {
        files: [{
          cwd: 'src',
          expand: true,
          src: ['libs/**/*.js'],
          dest: 'dist',
          ext: '.js'
        }]
      },
      dist: {
        files: [{
          cwd: 'src',
          expand: true,
          src: ['*.ts', '**/*.ts'],
          dest: 'dist',
          ext: '.js'
        }]
      }
    },

    sass: {
      dist: {
        files: {
          'dist/css/statusmap.dark.css': 'src/css/statusmap.dark.scss',
          'dist/css/statusmap.light.css': 'src/css/statusmap.light.scss'
        }
      }
    }

  });

  grunt.registerTask('default', ['clean', 'copy:src_to_dist', 'copy:root_to_dist', 'babel', 'sass']);
  // grunt.registerTask('clean', ['clean']);
  // grunt.registerTask('watch', ['watch']);
};
