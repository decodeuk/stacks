'use strict';

/**
 * Livereload and connect variables
 */
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
  port: LIVERELOAD_PORT
});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};


/**
 * Grunt module
 */
module.exports = function(grunt) {

	/**
		* Dynamically load npm tasks
	*/
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


	grunt.initConfig({

		/**
			* Read text from package.json and assign to pkg var
		*/
		pkg: grunt.file.readJSON('package.json'),


		/**
			* Set project info
		*/
		project: {
			src: 'src',
			styleguide: 'styleguide',

			scssDir: '<%= project.src %>/stacks',
			scssFile: 'stacks.scss',
			scss: '<%= project.scssDir %>/<%= project.scssFile %>',

			cssFile: 'stacks.css',
			cssFileMin: 'stacks.prefix.css',
			css: '<%= project.styleguide %>/public/<%= project.cssFile %>',
			cssMin: '<%= project.styleguide %>/public/<%= project.cssFileMin %>',
		},


		/**
			* Project banner
			* Dynamically appended to CSS/JS files
			* Inherits text from package.json
		*/
		tag: {
			banner: '/*!\n' +
				' * <%= pkg.name %>\n' +
				' * <%= pkg.title %>\n' +
				' * <%= pkg.url %>\n' +
				' * @author <%= pkg.author %>\n' +
				' * @version <%= pkg.version %>\n' +
				' * Copyright <%= pkg.copyright %>. <%= pkg.license %> licensed.\n' +
				' */\n'
		},



		/**
			* Connect port/livereload
			* https://github.com/gruntjs/grunt-contrib-connect
			* Starts a local webserver and injects
			* livereload snippet
		*/
		connect: {
			options: {
				port: 9000,
				hostname: '*'
			},
			livereload: {
				options: {
					middleware: function (connect) {
						return [lrSnippet, mountFolder(connect, 'styleguide')];
					}
				}
			}
		},



		/**
			* Clean files and folders
			* https://github.com/gruntjs/grunt-contrib-clean
			* Remove generated files for clean deploy
		*/
		clean: {
			styleguide: [ '<%= project.styleguide %>' ]
		},



		/**
			* Compile Sass/SCSS files
			* https://github.com/gruntjs/grunt-contrib-sass
			* Compiles all Sass/SCSS files and appends project banner
		*/
		sass: {
			dev: {
				options: {
					style: 'expanded'
				},
				files: {
					'<%= project.css %>': '<%= project.scss %>',
				}
			}
		},


		/**
			* Autoprefixer
			* Adds vendor prefixes if need automatcily
			* https://github.com/nDmitry/grunt-autoprefixer
		*/
		autoprefixer: {
			options: {
				browsers: [
					'last 2 version',
					'safari 6',
					'ie 9',
					'opera 12.1',
					'ios 6',
					'android 4'
				]
			},
			dist: {
				files: {
					'<%= project.cssMin %>': ['<%= project.css %>']
				}
			}
		},

		'copy-part-of-file': {
			simple_replace_scripts: {
				options: {
					sourceFileStartPattern: '// VARIABLES START ->',
					sourceFileEndPattern: '// VARIABLES END <-',
					destinationFileStartPattern: '// ------------------------------------------------------------------------->',
					destinationFileEndPattern: '// <------------------------------------------------------------------------'
				},
				files: {
					'src/stacks/_setupStacks.scss': ['<%= project.scssDir %>/base/_buttons.scss','<%= project.scssDir %>/base/_clearfix.scss','<%= project.scssDir %>/base/_formfields.scss','<%= project.scssDir %>/base/_input.scss','<%= project.scssDir %>/base/_lists.scss','<%= project.scssDir %>/base/_sizing.scss','<%= project.scssDir %>/base/_type.scss',]
				}
			}
		},


		/**
			* Opens the web server in the browser
			* https://github.com/jsoverson/grunt-open
		*/
		open: {
			server: {
				path: 'http://localhost:<%= connect.options.port %>',
				app: 'Google Chrome'
			}
		},


		/**
			* Generates a KSS living styleguide
			* https://github.com/t32k/grunt-kss
		*/
		kss: {
			options: {
				css: '<%= project.cssMin %>',
				template: 'src/styleguide'
			},
			dist: {
				files: {
					'<%= project.styleguide %>': ['<%= project.scssDir %>/']
				}
			}
		},


		/**
			* Runs tasks against changed watched files
			* https://github.com/gruntjs/grunt-contrib-watch
			* Watching development files and run concat/compile tasks
			* Livereload the browser once complete
		*/
		watch: {
			sass: {
				files: '<%= project.scssDir %>/**/*.scss',
				tasks: ['kss', 'sass', 'autoprefixer']
			},
			livereload: {
				options: {
					livereload: LIVERELOAD_PORT
				},
				files: [
					'<%= project.styleguide %>/**/*.html',
					'<%= project.styleguide %>/**/*.css',
				]
			}
		}

	});

	/**
		* Default task
		* Run `grunt` on the command line
	*/
	grunt.registerTask('default', [
		'connect:livereload',
		'watch'
	]);


	/**
		* Default task
		* Run `grunt` on the command line
	*/
	grunt.registerTask('build', [
		'clean',
		'kss',
		'sass',
		'autoprefixer',
		// 'copy-part-of-file'
	]);

};