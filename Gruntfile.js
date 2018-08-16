module.exports = (grunt) => {
  require('load-grunt-tasks')(grunt);

  grunt.loadNpmTasks('grunt-execute');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.initConfig({

    clean: ['dist'],

    copy: {
      src_to_dist: {
        cwd: 'src',
        expand: true,
        src: ['**/*', '!**/*.js', '!**/*.scss'],
        dest: 'dist'
      },
      pluginDef: {
        expand: true,
        src: ['plugin.json', 'README.md'],
        dest: 'dist'
      }
    },

    watch: {
      rebuild_all: {
        files: ['src/**/*', 'plugin.json'],
        tasks: ['default'],
        options: {
          spawn: false,
          livereload: true
        }
      }
    },

    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015'],
        plugins: ['transform-es2015-modules-systemjs', 'transform-es2015-for-of', 'transform-class-properties', 'transform-object-rest-spread'],
      },
      dist: {
        files: [{
          cwd: 'src',
          expand: true,
          src: ['*.js', '**/*.js'],
          dest: 'dist',
          ext: '.js'
        }]
      }
    },

    sass: {
      dist: {
        files: {
          'dist/css/status-heatmap.css': 'src/css/status-heatmap.scss'
        }
      }
    }

  });

  grunt.registerTask('default', ['clean', 'copy:src_to_dist', 'copy:pluginDef', 'babel', 'sass']);
  // grunt.registerTask('clean', ['clean']);
  // grunt.registerTask('watch', ['watch']);
};
