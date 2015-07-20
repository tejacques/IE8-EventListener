module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'src/*.js', 'tests/**/*.js'],
            options: {
                laxbreak: true
            }
        },
        watch: {
            scripts: {
                files: ['<%= jshint.files %>'],
                tasks: ['jshint', 'shell:trifle']
            }
        },
        connect: {
            server: {
                options: {
                    port: 9000,
                    hostname: '*',
                    base: '.'
                }
            }
        },
        shell: {
            trifle: {
                command: 'bash scripts/run_vm_tests.sh',
                options: {
                    stdin: false
                }
            },
            vagrantSetup: {
                command: 'bash scripts/setup_vm.sh & bash vagrant up',
                options: {
                    stdin: false
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('default', ['connect', 'watch']);
    grunt.registerTask('test', ['connect', 'shell:trifle']);
    grunt.registerTask('setup', ['shell:vagrantSetup']);
};
