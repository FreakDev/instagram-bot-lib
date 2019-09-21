/**
 * InstagramBot.js
 * =====================
 * Instagram Bot made with love and nodejs
 *
 * @author:     Patryk Rzucidlo [@ptkdev] <support@ptkdev.io> (https://ptkdev.it)
 * @file:       bot.js
 * @version:    0.8.1
 *
 * @license:    Code and contributions have 'GNU General Public License v3'
 *              This program is free software: you can redistribute it and/or modify
 *              it under the terms of the GNU General Public License as published by
 *              the Free Software Foundation, either version 3 of the License, or
 *              (at your option) any later version.
 *              This program is distributed in the hope that it will be useful,
 *              but WITHOUT ANY WARRANTY; without even the implied warranty of
 *              MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *              GNU General Public License for more details.
 *              You should have received a copy of the GNU General Public License
 *              along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @link        Homepage:     https://instagram.bot.ptkdev.io
 *              GitHub Repo:  https://github.com/social-manager-tools/instagram-bot.js
 */
module.exports = function(config) {
    this.config = config;
    this.start = async function() {
        var bot = null;
        let config = this.config;
        const puppeteer = require("puppeteer");
        const readline = require('readline');
        const LOG = require("./modules/logger/types");
        let browser = null;

        /**
         * Init
         * =====================
         * Set config options, check updates and integrity of bot
         *
         */
        let check = require("./modules/common/utils")(bot, config);
        if(config.ui === true){
            config = check.fixui(config);
        }
        config = check.default_config(config);
        if (config.executable_path === "" || config.executable_path === false) {
            browser = await puppeteer.launch({
                headless: config.chrome_headless,
                args: config.chrome_options
            });
        } else {
            browser = await puppeteer.launch({
                headless: config.chrome_headless,
                args: config.chrome_options,
                executablePath: config.executable_path
            });
        }
        bot = await browser.newPage();

        /**
         * Import libs
         * =====================
         * Modules of bot from folder ./modules
         *
         */
        let routes = require("./routes/strategies");
        if (config.extend_strategies) {
            Object.assign(routes, require(config.extend_strategies));
        }
        let utils = require("./modules/common/utils")(bot, config);
        let Log = require("./modules/logger/Log");
        let log = new Log("switch_mode", config);

        /**
         * Switch Mode
         * =====================
         * Switch social algorithms, change algorithm from config.js
         *
         */
        async function launch() {
            let strategy = routes[config.bot_mode];
            if (strategy !== undefined) {
                await strategy(bot, config, utils).start();
            } else {
                log(LOG.ERROR, "switch_mode", `mode ${strategy} not exist!`);
            }
        }

        async function login () {
            return new Promise(function (resolve) {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                bot.goto("https://www.instagram.com/accounts/login/");
        
                rl.question("Login to instagram, then press enter here", () => {              
                    rl.close();
                    resolve();
                });    
            });
        }

        await login();

        launch();
    };
};
