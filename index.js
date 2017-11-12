#!/usr/bin/env node

var osLocale = require('os-locale');
var co = require('co');
var joinPath = require('path.join');
var fs = require('fs');
var marked = require('marked');
var TerminalRenderer = require('marked-terminal');

marked.setOptions({
    renderer: new TerminalRenderer()
});

function get_locale() {
    return new Promise(function(resolve, reject){
        if (process.env.HOME) {
            var config_path = joinPath(process.env.HOME, '.man2-docs', 'config.json');
            var default_locale = require(config_path).default_locale;
            if (!default_locale) {
                osLocale().then(function(locale) {
                    resolve(locale);
                });
            } else {
                resolve(default_locale);
            }
        } else {
            resolve(undefined);
        }
    });
}

function get_manual(file_path) {
    return new Promise(function(resolve, reject){
        fs.readFile(file_path, 'utf8', function (err,data) {
            if (err) {
                resolve(false);
            } else {
                console.log(marked(data));
                resolve(true);
            }
        });
    });
}

function show_manual(locale, cmd) {
    var backup_locale = locale.split('_')[0];
    var file_path_1 = joinPath(process.env.HOME, '.man2-docs', locale, cmd+'.md');
    var file_path_2;
    if (backup_locale && locale!=backup_locale) {
        file_path_2 = joinPath(process.env.HOME, '.man2-docs', backup_locale, cmd+'.md');
    }

    get_manual(file_path_1).then(function(result){
        if (!result && !!file_path_2) {
            get_manual(file_path_2).then(function(result){
                if (!result) {
                    console.log('can not find the command usage file(s) in: \n\n\t%s\n\t%s\n', file_path_1, file_path_2);
                }
            });
        }
    });

}

function show_help() {
    console.log(marked(`

This tool is designed to get the usage of commands quickly. 

For example:

    $ man2 ls

Pre-Condition:

    $ git clone https://github.com/letiantian/man2-docs.git ~/.man2-docs
    
    `));
}


//// main ////

console.log('');
if (process.argv.length == 2) {
    show_help();
} else {
    var cmd = process.argv.slice(2).join(' ');
    // console.log(cmd)
    get_locale().then(function(locale){
        show_manual(locale, cmd);
    });
    
}
